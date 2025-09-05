import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

import numpy as np
try:
    from sentence_transformers import SentenceTransformer
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    logging.warning("FAISS et sentence-transformers non disponibles - mode simple activé")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimulationRequest(BaseModel):
    """Modèle pour les requêtes de simulation."""
    goal: str
    initial_amount: float
    monthly_amount: float
    risk_profile: str
    
class SimulationResponse(BaseModel):
    """Modèle pour les réponses de simulation."""
    response: str
    sources: List[Dict[str, Any]]
    confidence_score: float

class KnowledgeBase:
    """Système de base de connaissances avec recherche vectorielle."""
    
    def __init__(self, index_dir: str = "./indexes"):
        self.index_dir = Path(index_dir)
        self.embedding_model = None
        self.index = None
        self.chunks_metadata = []
        self.config = {}
        
    def load_index(self):
        """Charge l'index FAISS et les métadonnées."""
        try:
            # Charger la configuration
            config_path = self.index_dir / "config.json"
            if not config_path.exists():
                raise FileNotFoundError("Index non trouvé. Veuillez d'abord exécuter l'ingestion.")
            
            with open(config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            
            # Charger le modèle d'embeddings
            model_name = self.config['model_name']
            logger.info(f"Chargement du modèle: {model_name}")
            self.embedding_model = SentenceTransformer(model_name)
            
            # Charger l'index FAISS
            index_path = self.index_dir / "faiss_index.bin"
            self.index = faiss.read_index(str(index_path))
            logger.info(f"Index FAISS chargé: {self.index.ntotal} vecteurs")
            
            # Charger les métadonnées
            metadata_path = self.index_dir / "chunks_metadata.json"
            with open(metadata_path, 'r', encoding='utf-8') as f:
                self.chunks_metadata = json.load(f)
            
            logger.info(f"Base de connaissances chargée: {len(self.chunks_metadata)} chunks")
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement de l'index: {e}")
            raise HTTPException(status_code=500, detail="Erreur lors du chargement de la base de connaissances")
    
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Recherche les documents les plus pertinents."""
        if not self.embedding_model or not self.index:
            return []
        
        # Générer l'embedding de la requête
        query_embedding = self.embedding_model.encode([query], convert_to_tensor=False)
        query_embedding = np.array(query_embedding, dtype=np.float32)
        faiss.normalize_L2(query_embedding)
        
        # Rechercher dans l'index
        scores, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0 and idx < len(self.chunks_metadata):
                chunk = self.chunks_metadata[idx]
                results.append({
                    **chunk,
                    'score': float(score)
                })
        
        return results

class AISimulator:
    """Simulateur d'investissement basé sur l'IA avec RAG."""
    
    def __init__(self):
        self.knowledge_base = KnowledgeBase()
        
        # Configuration Gemini API (Google Cloud)
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.gemini_model = None
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-pro')
            logger.info("Gemini API configurée")
    
    def initialize(self):
        """Initialise le simulateur."""
        self.knowledge_base.load_index()
    
    def build_context_prompt(self, 
                           goal: str, 
                           initial_amount: float, 
                           monthly_amount: float, 
                           risk_profile: str,
                           relevant_docs: List[Dict[str, Any]]) -> str:
        """Construit le prompt contextualisé avec les documents pertinents."""
        
        # Construire le contexte à partir des documents
        context_sections = []
        for i, doc in enumerate(relevant_docs, 1):
            context_sections.append(
                f"[SOURCE {i}: {doc['source_file']}, page {doc['page_number']}]\n"
                f"{doc['text']}\n"
            )
        
        context = "\n".join(context_sections)
        
        # Prompt système
        system_prompt = """Tu es un assistant expert en conseil financier pour RAM Advisor. 

INSTRUCTIONS IMPORTANTES:
- Utilise UNIQUEMENT les informations fournies dans les sources ci-dessous
- Fournis une simulation éducative et personnalisée basée sur les paramètres utilisateur
- Inclus des références aux sources utilisées [SOURCE X]
- Reste dans un cadre éducatif, pas de conseil financier personnel
- Réponds en français, de manière claire et structurée
- Utilise du HTML simple pour la mise en forme (paragraphes, listes)

SOURCES DISPONIBLES:
{context}

PARAMÈTRES DE SIMULATION:
- Objectif: {goal}
- Apport initial: {initial_amount}€
- Versement mensuel: {monthly_amount}€
- Profil de risque: {risk_profile}

Génère une réponse structurée incluant:
1. Une analyse du profil et de l'objectif
2. Une stratégie d'investissement recommandée basée sur les sources
3. Une projection approximative sur 10-20 ans
4. Les risques et considérations importantes
5. Les prochaines étapes suggérées

Termine par une clause de non-responsabilité indiquant qu'il s'agit d'une simulation éducative."""
        
        return system_prompt.format(
            context=context,
            goal=goal,
            initial_amount=initial_amount,
            monthly_amount=monthly_amount,
            risk_profile=risk_profile
        )
    
    def generate_fallback_response(self,
                                 goal: str,
                                 initial_amount: float,
                                 monthly_amount: float,
                                 risk_profile: str) -> str:
        """Génère une réponse de base sans IA externe."""
        
        # Calcul simple de projection
        annual_return = 0.05 if risk_profile == "Prudent" else 0.07 if risk_profile == "Équilibré" else 0.09
        years = 20
        
        # Calcul approximatif
        monthly_return = annual_return / 12
        total_months = years * 12
        future_value = initial_amount
        
        for _ in range(total_months):
            future_value = (future_value + monthly_amount) * (1 + monthly_return)
        
        total_invested = initial_amount + (monthly_amount * total_months)
        gains = future_value - total_invested
        
        return f"""
        <div class="simulation-result">
            <h3>📊 Simulation pour votre projet: {goal}</h3>
            
            <p><strong>Votre profil:</strong> {risk_profile}</p>
            <p><strong>Investissement initial:</strong> {initial_amount:,.0f}€</p>
            <p><strong>Versements mensuels:</strong> {monthly_amount:,.0f}€</p>
            
            <h4>🎯 Projection sur {years} ans</h4>
            <ul>
                <li><strong>Total investi:</strong> {total_invested:,.0f}€</li>
                <li><strong>Valeur estimée:</strong> {future_value:,.0f}€</li>
                <li><strong>Gains potentiels:</strong> {gains:,.0f}€</li>
                <li><strong>Rendement annuel moyen estimé:</strong> {annual_return*100:.1f}%</li>
            </ul>
            
            <h4>⚠️ Points importants</h4>
            <ul>
                <li>Cette simulation est basée sur des hypothèses de rendement historiques</li>
                <li>Les marchés financiers comportent des risques de perte</li>
                <li>Les performances passées ne garantissent pas les résultats futurs</li>
                <li>Une diversification appropriée est essentielle</li>
            </ul>
            
            <p><em>Cette simulation est fournie à titre éducatif uniquement et ne constitue pas un conseil financier personnalisé.</em></p>
        </div>
        """
    
    async def simulate(self, request: SimulationRequest) -> SimulationResponse:
        """Effectue une simulation d'investissement avec RAG."""
        
        # Construire la requête de recherche
        search_query = f"{request.goal} investissement {request.risk_profile} portefeuille allocation stratégie"
        
        # Rechercher les documents pertinents
        relevant_docs = self.knowledge_base.search(search_query, top_k=6)
        
        # Calculer le score de confiance basé sur la pertinence des documents
        confidence_score = 0.5  # Score de base
        if relevant_docs:
            avg_score = sum(doc['score'] for doc in relevant_docs) / len(relevant_docs)
            confidence_score = min(0.95, max(0.3, avg_score))
        
        response_text = ""
        
        # Essayer d'utiliser Gemini API si disponible
        if self.gemini_model and relevant_docs:
            try:
                prompt = self.build_context_prompt(
                    request.goal,
                    request.initial_amount,
                    request.monthly_amount,
                    request.risk_profile,
                    relevant_docs
                )
                
                response = self.gemini_model.generate_content(prompt)
                response_text = response.text
                confidence_score = min(0.95, confidence_score + 0.2)  # Bonus pour l'IA
                
            except Exception as e:
                logger.error(f"Erreur Gemini API: {e}")
                response_text = self.generate_fallback_response(
                    request.goal,
                    request.initial_amount,
                    request.monthly_amount,
                    request.risk_profile
                )
        else:
            # Utiliser la réponse de fallback
            response_text = self.generate_fallback_response(
                request.goal,
                request.initial_amount,
                request.monthly_amount,
                request.risk_profile
            )
        
        # Préparer les sources pour la réponse
        sources = []
        for doc in relevant_docs[:3]:  # Limiter à 3 sources principales
            sources.append({
                'file': doc['source_file'],
                'page': doc['page_number'],
                'excerpt': doc['text'][:200] + "..." if len(doc['text']) > 200 else doc['text'],
                'relevance_score': doc['score']
            })
        
        return SimulationResponse(
            response=response_text,
            sources=sources,
            confidence_score=confidence_score
        )

# Initialisation de l'application FastAPI
app = FastAPI(
    title="RAM Advisor AI Service",
    description="Service d'IA pour la simulation d'investissement avec base de connaissances",
    version="1.0.0"
)

# Configuration CORS pour le déploiement cloud
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ramadvisor.netlify.app",
        "https://ramadvisor.fr", 
        "http://localhost:3000",  # Pour le développement local
        "http://localhost:8080",  # Pour les tests
        "*"  # Temporaire - à restreindre en production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Instance globale du simulateur
simulator = AISimulator()

@app.on_event("startup")
async def startup_event():
    """Initialise le service au démarrage."""
    logger.info("🚀 Démarrage du service RAM Advisor AI")
    try:
        simulator.initialize()
        logger.info("✅ Service initialisé avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'initialisation: {e}")

@app.get("/")
async def root():
    """Point d'entrée de l'API."""
    return {
        "message": "RAM Advisor AI Service",
        "status": "active",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Vérification de l'état du service."""
    return {
        "status": "healthy",
        "knowledge_base_loaded": simulator.knowledge_base.index is not None,
        "total_documents": len(simulator.knowledge_base.chunks_metadata)
    }

@app.post("/simulate", response_model=SimulationResponse)
async def simulate_investment(request: SimulationRequest):
    """Endpoint principal pour la simulation d'investissement."""
    try:
        logger.info(f"Nouvelle simulation: {request.goal[:50]}...")
        result = await simulator.simulate(request)
        logger.info(f"Simulation terminée avec confiance: {result.confidence_score:.2f}")
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la simulation: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la simulation")

@app.get("/search")
async def search_knowledge(query: str, top_k: int = 5):
    """Endpoint pour rechercher dans la base de connaissances."""
    try:
        results = simulator.knowledge_base.search(query, top_k)
        return {
            "query": query,
            "results": results,
            "total_found": len(results)
        }
    except Exception as e:
        logger.error(f"Erreur lors de la recherche: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la recherche")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
