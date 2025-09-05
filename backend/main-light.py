import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

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

class SimpleKnowledgeBase:
    """Base de connaissances simplifiée sans FAISS."""
    
    def __init__(self, docs_dir: str = "./docs/knowledge"):
        self.docs_dir = Path(docs_dir)
        self.documents = []
        self.knowledge_text = ""
        
    def load_documents(self):
        """Charge les documents texte de base."""
        try:
            if not self.docs_dir.exists():
                logger.warning(f"Dossier {self.docs_dir} introuvable")
                return
                
            # Charger tous les fichiers texte
            for file_path in self.docs_dir.glob("*.txt"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        self.documents.append({
                            "filename": file_path.name,
                            "content": content[:5000]  # Limiter la taille
                        })
                        logger.info(f"Document chargé: {file_path.name}")
                except Exception as e:
                    logger.error(f"Erreur lecture {file_path}: {e}")
            
            # Créer un texte de connaissance consolidé
            self.knowledge_text = "\n\n".join([
                f"=== {doc['filename']} ===\n{doc['content']}" 
                for doc in self.documents
            ])
            
            logger.info(f"Base de connaissances chargée: {len(self.documents)} documents")
            
        except Exception as e:
            logger.error(f"Erreur chargement documents: {e}")
    
    def get_relevant_context(self, query: str, max_length: int = 3000) -> str:
        """Retourne un contexte pertinent (version simplifiée sans recherche vectorielle)."""
        if not self.knowledge_text:
            return ""
        
        # Recherche simple par mots-clés
        query_words = query.lower().split()
        
        # Diviser le texte en chunks
        chunks = self.knowledge_text.split("\n\n")
        relevant_chunks = []
        
        for chunk in chunks:
            chunk_lower = chunk.lower()
            score = sum(1 for word in query_words if word in chunk_lower)
            if score > 0:
                relevant_chunks.append((score, chunk))
        
        # Trier par pertinence et prendre les meilleurs
        relevant_chunks.sort(key=lambda x: x[0], reverse=True)
        
        context = ""
        for _, chunk in relevant_chunks[:3]:  # Top 3 chunks
            if len(context + chunk) < max_length:
                context += chunk + "\n\n"
            else:
                break
        
        return context.strip()

class AISimulator:
    """Simulateur d'investissement simplifié avec Gemini AI."""
    
    def __init__(self):
        self.knowledge_base = SimpleKnowledgeBase()
        
        # Configuration Gemini API
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.gemini_model = None
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-pro')
            logger.info("Gemini API configurée")
        else:
            logger.warning("GEMINI_API_KEY non trouvée - mode basique activé")
    
    def initialize(self):
        """Initialise le simulateur."""
        self.knowledge_base.load_documents()
    
    def build_prompt(self, goal: str, initial_amount: float, monthly_amount: float, 
                    risk_profile: str, context: str = "") -> str:
        """Construit le prompt pour Gemini."""
        
        base_prompt = f"""
Tu es un conseiller financier expert. Analyse cette demande d'investissement et fournis des conseils personnalisés.

PROFIL INVESTISSEUR:
- Objectif: {goal}
- Capital initial: {initial_amount}€
- Versement mensuel: {monthly_amount}€
- Profil de risque: {risk_profile}

CONTEXTE EXPERT:
{context if context else "Utilise tes connaissances générales en investissement"}

INSTRUCTIONS:
1. Propose une stratégie d'allocation adaptée au profil de risque
2. Suggère des types d'investissements concrets
3. Donne une estimation de rendement réaliste
4. Mentionne les risques principaux
5. Propose un calendrier de révision

Réponds en français, sois précis et pratique.
        """
        
        return base_prompt.strip()
    
    def generate_fallback_response(self, goal: str, initial_amount: float, 
                                 monthly_amount: float, risk_profile: str) -> str:
        """Génère une réponse basique sans IA."""
        
        risk_allocations = {
            "Prudent": {"actions": 30, "obligations": 60, "liquidités": 10},
            "Modéré": {"actions": 60, "obligations": 30, "liquidités": 10},
            "Dynamique": {"actions": 80, "obligations": 15, "liquidités": 5}
        }
        
        allocation = risk_allocations.get(risk_profile, risk_allocations["Modéré"])
        annual_savings = monthly_amount * 12
        
        return f"""
## Stratégie d'investissement pour: {goal}

### Allocation recommandée (profil {risk_profile}):
- **Actions**: {allocation['actions']}% 
- **Obligations**: {allocation['obligations']}%
- **Liquidités**: {allocation['liquidités']}%

### Projection financière:
- Capital initial: {initial_amount:,.0f}€
- Épargne annuelle: {annual_savings:,.0f}€
- Rendement estimé: 4-6% par an (selon allocation)

### Recommandations:
1. **Diversification**: Répartir sur plusieurs supports
2. **Régularité**: Maintenir les versements mensuels
3. **Révision**: Réévaluer la stratégie annuellement
4. **Horizon**: Investir sur le long terme (5+ ans)

### Prochaines étapes:
- Ouvrir un PEA ou assurance-vie
- Commencer par des ETF diversifiés
- Suivre l'évolution trimestriellement
        """
    
    async def simulate(self, request: SimulationRequest) -> SimulationResponse:
        """Génère une simulation d'investissement."""
        try:
            # Obtenir le contexte pertinent
            context = self.knowledge_base.get_relevant_context(
                f"{request.goal} {request.risk_profile} investissement"
            )
            
            response_text = ""
            confidence_score = 0.7  # Score de base
            
            # Essayer Gemini AI si disponible
            if self.gemini_model:
                try:
                    prompt = self.build_prompt(
                        request.goal, request.initial_amount, 
                        request.monthly_amount, request.risk_profile, context
                    )
                    
                    response = self.gemini_model.generate_content(prompt)
                    response_text = response.text
                    confidence_score = 0.9  # Score élevé avec IA
                    
                    logger.info("Réponse générée avec Gemini AI")
                    
                except Exception as e:
                    logger.error(f"Erreur Gemini API: {e}")
                    response_text = self.generate_fallback_response(
                        request.goal, request.initial_amount,
                        request.monthly_amount, request.risk_profile
                    )
            else:
                # Mode basique sans IA
                response_text = self.generate_fallback_response(
                    request.goal, request.initial_amount,
                    request.monthly_amount, request.risk_profile
                )
                confidence_score = 0.6
            
            # Sources simplifiées
            sources = []
            if context:
                sources = [
                    {
                        "file": "Documentation interne",
                        "page": 1,
                        "relevance_score": 0.8,
                        "excerpt": context[:200] + "..."
                    }
                ]
            
            return SimulationResponse(
                response=response_text,
                sources=sources,
                confidence_score=confidence_score
            )
            
        except Exception as e:
            logger.error(f"Erreur simulation: {e}")
            raise HTTPException(status_code=500, detail="Erreur lors de la simulation")

# Initialisation de l'application FastAPI
app = FastAPI(
    title="RAM Advisor AI Service (Version Allégée)",
    description="Service d'IA simplifié pour la simulation d'investissement",
    version="1.0.0-light"
)

# Configuration CORS pour le déploiement cloud
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ramadvisor.netlify.app",
        "https://ramadvisor.fr", 
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5500",  # Live Server
        "*"  # Temporaire pour les tests
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
    logger.info("🚀 Démarrage du service RAM Advisor AI (Version Allégée)")
    try:
        simulator.initialize()
        logger.info("✅ Service initialisé avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'initialisation: {e}")

@app.get("/")
async def root():
    """Point d'entrée de l'API."""
    return {
        "message": "RAM Advisor AI Service (Version Allégée)",
        "status": "active",
        "version": "1.0.0-light",
        "features": ["Gemini AI", "Base de connaissances simplifiée"]
    }

@app.get("/health")
async def health_check():
    """Vérification de l'état du service."""
    return {
        "status": "healthy",
        "knowledge_base_loaded": len(simulator.knowledge_base.documents) > 0,
        "total_documents": len(simulator.knowledge_base.documents),
        "gemini_configured": simulator.gemini_model is not None
    }

@app.post("/simulate", response_model=SimulationResponse)
async def simulate_investment(request: SimulationRequest):
    """Génère une simulation d'investissement personnalisée."""
    logger.info(f"Nouvelle requête de simulation: {request.goal}")
    
    try:
        result = await simulator.simulate(request)
        logger.info("Simulation générée avec succès")
        return result
        
    except Exception as e:
        logger.error(f"Erreur simulation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
