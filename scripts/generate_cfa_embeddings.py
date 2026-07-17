#!/usr/bin/env python3
"""
Script de génération d'embeddings pour les cours CFA Private Wealth Management (Courses 1 à 5)
Adapté pour RAMAdvisor - Génère des embeddings statiques pour Netlify Functions

USAGE:
    python generate_cfa_embeddings.py

    Traite par défaut les 5 PDFs "Course 1..5" de docs/knowledge/.
    Après génération, relancer scripts/enrich_cfa_with_french.py pour produire
    la version enrichie français utilisée par ultra-optimized-cfa-search.js.

SORTIE:
    - cfa_knowledge_embeddings.json : Embeddings + métadonnées des cours CFA
    - cfa_embedding_config.json : Configuration du modèle
    - cfa_search_index.json : Index de recherche rapide

OBJECTIF:
    Intégrer la connaissance professionnelle de gestion privée du CFA
    dans le système de recommandations d'investissement
"""

import os
# Évite le conflit protobuf/TensorFlow local : PyTorch suffit pour sentence-transformers
os.environ.setdefault("USE_TF", "0")

import sys
# Console Windows en cp1252 : forcer UTF-8 pour les emojis des messages
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging
from dataclasses import dataclass, asdict

import numpy as np
from sentence_transformers import SentenceTransformer
import PyPDF2

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class CFAKnowledgeChunk:
    """Représente un fragment de connaissance CFA avec métadonnées."""
    text: str
    source_file: str = "course.pdf"
    page_number: Optional[int] = None
    chunk_index: int = 0
    topic_category: Optional[str] = None  # Ex: "Asset Allocation", "Risk Management"
    relevance_keywords: List[str] = None
    embedding: Optional[List[float]] = None
    
    def __post_init__(self):
        if self.relevance_keywords is None:
            self.relevance_keywords = []

# Les 5 cours de la base de connaissances (docs/knowledge/)
DEFAULT_COURSE_PDFS = [
    "Course 1 Foundations of Private Wealth Management Reading Packet.pdf",
    "Course 2 Wealth Planning and Client Engagement Reading Packet.pdf",
    "Course 3 Investment and Risk Management for High-Net-Worth Clients Reading Packet.pdf",
    "Course 4 Topics in Wealth Advisory and Wealth Management Strategies.pdf",
    "Course 5 Practical Skills in Private Wealth Management Reading Packet.pdf",
]

class CFAEmbeddingGenerator:
    """Générateur d'embeddings spécialisé pour la connaissance CFA."""

    def __init__(self,
                 pdf_paths: Optional[List[str]] = None,
                 output_dir: str = None,
                 model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialise le générateur d'embeddings CFA.

        Args:
            pdf_paths: Liste de chemins vers les PDFs des cours (défaut: Courses 1 à 5)
            output_dir: Répertoire de sortie pour Netlify Functions
            model_name: Modèle Sentence Transformers optimisé
        """
        base_dir = Path(__file__).resolve().parent.parent
        knowledge_dir = base_dir / "docs" / "knowledge"
        if pdf_paths is None:
            self.pdf_paths = [knowledge_dir / name for name in DEFAULT_COURSE_PDFS]
        else:
            self.pdf_paths = [Path(p) for p in pdf_paths]
        self.output_dir = Path(output_dir) if output_dir else base_dir / "netlify" / "functions" / "cfa_data"
        self.model_name = model_name
        
        # Créer le répertoire de sortie
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Charger le modèle d'embeddings
        logger.info(f"Chargement du modèle d'embeddings: {model_name}")
        self.embedding_model = SentenceTransformer(model_name)
        self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
        
        self.chunks: List[CFAKnowledgeChunk] = []
        
        # Mots-clés pour catégoriser les sujets CFA
        self.topic_keywords = {
            "Asset Allocation": ["asset allocation", "portfolio", "diversification", "strategic allocation", "tactical allocation"],
            "Risk Management": ["risk", "volatility", "downside", "var", "risk tolerance", "risk capacity"],
            "Investment Strategy": ["strategy", "investment", "approach", "methodology", "framework"],
            "Client Management": ["client", "advisor", "relationship", "communication", "objectives"],
            "Performance": ["performance", "return", "benchmark", "measurement", "evaluation"],
            "Tax Planning": ["tax", "taxation", "tax-efficient", "after-tax", "tax planning"],
            "Estate Planning": ["estate", "inheritance", "succession", "wealth transfer", "legacy"],
            "Alternative Investments": ["alternative", "hedge fund", "private equity", "real estate", "commodities"]
        }
    
    def extract_text_from_pdf(self, pdf_path: Path) -> List[Dict[str, Any]]:
        """Extrait le texte d'un PDF CFA avec optimisations pour le contenu académique."""
        text_chunks = []
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
                logger.info(f"Traitement de {pdf_path.name}: {total_pages} pages")

                for page_num, page in enumerate(pdf_reader.pages, 1):
                    text = page.extract_text()
                    if text.strip():
                        # Nettoyage spécialisé pour contenu académique
                        text = self.clean_academic_text(text)
                        if len(text) > 100:  # Filtrer les pages avec peu de contenu
                            text_chunks.append({
                                'text': text,
                                'page_number': page_num
                            })

        except Exception as e:
            logger.error(f"Erreur lors de l'extraction PDF {pdf_path}: {e}")

        logger.info(f"Extraction terminée ({pdf_path.name}): {len(text_chunks)} pages valides")
        return text_chunks
    
    def clean_academic_text(self, text: str) -> str:
        """Nettoie le texte académique pour optimiser la qualité des embeddings."""
        # Supprimer les caractères de mise en page
        text = re.sub(r'\s+', ' ', text)
        
        # Supprimer les numéros de page et headers/footers typiques
        text = re.sub(r'Page \d+', '', text)
        text = re.sub(r'Chapter \d+', '', text)
        text = re.sub(r'CFA Institute', '', text)
        
        # Nettoyer les références de formules mathématiques isolées
        text = re.sub(r'\b[A-Z]\s*=\s*[A-Z]\s*[+\-\*/]\s*[A-Z]\b', '', text)
        
        # Conserver la structure des phrases
        text = re.sub(r'([.!?])\s*([A-Z])', r'\1 \2', text)
        
        return text.strip()
    
    def categorize_chunk(self, text: str) -> Optional[str]:
        """Catégorise un chunk selon les sujets CFA principaux."""
        text_lower = text.lower()
        
        # Compter les occurrences de mots-clés par catégorie
        category_scores = {}
        for category, keywords in self.topic_keywords.items():
            score = sum(text_lower.count(keyword) for keyword in keywords)
            if score > 0:
                category_scores[category] = score
        
        # Retourner la catégorie avec le score le plus élevé
        if category_scores:
            return max(category_scores, key=category_scores.get)
        return None
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extrait les mots-clés pertinents pour la recherche."""
        # Mots-clés financiers importants
        financial_terms = {
            "portfolio", "diversification", "allocation", "risk", "return", "volatility",
            "equity", "bond", "asset", "investment", "strategy", "client", "advisor",
            "wealth", "management", "planning", "tax", "estate", "performance",
            "benchmark", "correlation", "sharpe", "alpha", "beta", "hedge"
        }
        
        text_lower = text.lower()
        found_keywords = []
        
        for term in financial_terms:
            if term in text_lower:
                found_keywords.append(term)
        
        return found_keywords[:10]  # Limiter à 10 mots-clés par chunk
    
    def chunk_text_smart(self, text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
        """
        Divise intelligemment le texte académique en chunks avec contexte.
        
        Args:
            text: Texte à diviser
            chunk_size: Taille cible d'un chunk
            overlap: Chevauchement entre chunks
        """
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        sentences = re.split(r'[.!?]+', text)
        
        current_chunk = ""
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # Si ajouter cette phrase dépasse la taille, finaliser le chunk
            if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                # Garder un overlap en conservant les dernières phrases
                overlap_text = '. '.join(current_chunk.split('. ')[-2:])
                current_chunk = overlap_text + ". " + sentence
            else:
                current_chunk += ". " + sentence if current_chunk else sentence
        
        # Ajouter le dernier chunk
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        # Filtrer les chunks trop courts
        return [chunk for chunk in chunks if len(chunk) > 100]
    
    def process_cfa_document(self) -> int:
        """Traite les documents CFA (Courses 1 à 5) et crée les chunks enrichis."""
        chunk_counter = 0

        for pdf_path in self.pdf_paths:
            if not pdf_path.exists():
                logger.warning(f"Fichier PDF CFA non trouvé (ignoré): {pdf_path}")
                continue

            text_data = self.extract_text_from_pdf(pdf_path)
            if not text_data:
                logger.warning(f"Aucun texte extrait de {pdf_path.name} (ignoré)")
                continue

            # Traiter chaque page
            for page_data in text_data:
                text = page_data['text']
                page_num = page_data['page_number']

                # Diviser en chunks intelligents (900 caractères : bon compromis
                # contexte RAG / taille des fichiers d'embeddings pour Netlify)
                chunks = self.chunk_text_smart(text, chunk_size=900, overlap=150)

                for chunk_text in chunks:
                    # Créer le chunk enrichi, en gardant la trace du cours source
                    chunk = CFAKnowledgeChunk(
                        text=chunk_text,
                        source_file=pdf_path.name,
                        page_number=page_num,
                        chunk_index=chunk_counter,
                        topic_category=self.categorize_chunk(chunk_text),
                        relevance_keywords=self.extract_keywords(chunk_text)
                    )
                    self.chunks.append(chunk)
                    chunk_counter += 1

            logger.info(f"{pdf_path.name}: cumul {len(self.chunks)} chunks")

        logger.info(f"Documents CFA traités: {len(self.chunks)} chunks créés au total")
        return len(self.chunks)
    
    def generate_embeddings(self):
        """Génère les embeddings pour tous les chunks CFA."""
        if not self.chunks:
            logger.warning("Aucun chunk CFA à traiter")
            return
        
        logger.info("Génération des embeddings CFA...")
        texts = [chunk.text for chunk in self.chunks]
        
        # Générer les embeddings par batch
        batch_size = 8  # Plus petit pour éviter les timeouts
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_num = i // batch_size + 1
            total_batches = (len(texts) - 1) // batch_size + 1
            logger.info(f"Traitement batch {batch_num}/{total_batches}")
            
            batch_embeddings = self.embedding_model.encode(
                batch, 
                convert_to_tensor=False,
                normalize_embeddings=True
            )
            embeddings.extend(batch_embeddings)
        
        # Assigner les embeddings aux chunks (arrondis à 5 décimales :
        # réduit fortement la taille des JSON sans perte de pertinence)
        for chunk, embedding in zip(self.chunks, embeddings):
            chunk.embedding = [round(float(x), 5) for x in embedding]
        
        logger.info(f"Embeddings CFA générés pour {len(self.chunks)} chunks")
    
    def save_cfa_data(self):
        """Sauvegarde les données CFA pour Netlify Functions."""
        logger.info("Sauvegarde des données CFA...")
        
        # 1. Fichier principal des embeddings
        embeddings_data = []
        for chunk in self.chunks:
            chunk_dict = asdict(chunk)
            embeddings_data.append(chunk_dict)
        
        embeddings_file = self.output_dir / "cfa_knowledge_embeddings.json"
        with open(embeddings_file, 'w', encoding='utf-8') as f:
            # JSON compact : indispensable pour rester sous les limites Netlify
            json.dump(embeddings_data, f, ensure_ascii=False, separators=(',', ':'))
        logger.info(f"Embeddings sauvegardés: {embeddings_file} ({len(embeddings_data)} chunks)")
        
        # 2. Configuration du modèle
        config_data = {
            "model_name": self.model_name,
            "embedding_dim": self.embedding_dim,
            "total_chunks": len(self.chunks),
            "source_files": [p.name for p in self.pdf_paths],
            "generated_at": str(Path(__file__).stat().st_mtime),
            "categories": list(self.topic_keywords.keys())
        }
        
        config_file = self.output_dir / "cfa_embedding_config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2)
        logger.info(f"Configuration sauvegardée: {config_file}")
        
        # 3. Index de recherche rapide (mots-clés)
        search_index = {}
        for chunk in self.chunks:
            for keyword in chunk.relevance_keywords:
                if keyword not in search_index:
                    search_index[keyword] = []
                search_index[keyword].append(chunk.chunk_index)
        
        index_file = self.output_dir / "cfa_search_index.json"
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(search_index, f, indent=2)
        logger.info(f"Index de recherche sauvegardé: {index_file}")
        
        # 4. Statistiques
        stats = {
            "total_chunks": len(self.chunks),
            "categories_distribution": {},
            "average_chunk_length": sum(len(chunk.text) for chunk in self.chunks) / len(self.chunks),
            "total_keywords": len(search_index)
        }
        
        for chunk in self.chunks:
            cat = chunk.topic_category or "Uncategorized"
            stats["categories_distribution"][cat] = stats["categories_distribution"].get(cat, 0) + 1
        
        stats_file = self.output_dir / "cfa_stats.json"
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2)
        logger.info(f"Statistiques sauvegardées: {stats_file}")
        
        return {
            "embeddings_file": str(embeddings_file),
            "config_file": str(config_file), 
            "index_file": str(index_file),
            "stats_file": str(stats_file)
        }
    
    def run_complete_pipeline(self) -> Dict[str, Any]:
        """Exécute le pipeline complet de génération des embeddings CFA."""
        logger.info("🚀 Démarrage du pipeline CFA RAG")
        
        # Étape 1: Traitement du document
        chunks_created = self.process_cfa_document()
        if chunks_created == 0:
            raise RuntimeError("Aucun chunk créé - arrêt du pipeline")
        
        # Étape 2: Génération des embeddings
        self.generate_embeddings()
        
        # Étape 3: Sauvegarde
        file_paths = self.save_cfa_data()
        
        logger.info("✅ Pipeline CFA RAG terminé avec succès")
        return {
            "chunks_processed": chunks_created,
            "embedding_dimension": self.embedding_dim,
            "files_created": file_paths
        }

def main():
    """Point d'entrée principal."""
    try:
        generator = CFAEmbeddingGenerator()
        results = generator.run_complete_pipeline()
        
        print("\n" + "="*60)
        print("🎓 GÉNÉRATION EMBEDDINGS CFA - RÉSULTATS")
        print("="*60)
        print(f"✅ Chunks traités: {results['chunks_processed']}")
        print(f"✅ Dimension embeddings: {results['embedding_dimension']}")
        print(f"✅ Fichiers créés:")
        for purpose, filepath in results['files_created'].items():
            print(f"   - {purpose}: {filepath}")
        print("\n🔗 Prêt pour intégration dans Netlify Functions!")
        
    except Exception as e:
        logger.error(f"❌ Erreur dans le pipeline: {e}")
        raise

if __name__ == "__main__":
    main()
