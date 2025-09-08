#!/usr/bin/env python3
"""
Script de génération d'embeddings statiques pour RAMAdvisor
Génère des embeddings pré-calculés pour une utilisation côté client sans backend
"""

import os
import json
import re
from pathlib import Path
from typing import List, Dict, Any
import logging
from dataclasses import dataclass

import numpy as np
from sentence_transformers import SentenceTransformer
import PyPDF2

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class DocumentChunk:
    """Représente un fragment de document avec ses métadonnées."""
    text: str
    source_file: str
    page_number: int = None
    chunk_index: int = 0
    embedding: List[float] = None

class StaticEmbeddingGenerator:
    """Générateur d'embeddings statiques pour déploiement frontend-only."""
    
    def __init__(self, 
                 knowledge_file: str = "../docs/knowledge/course.pdf",
                 output_dir: str = "../frontend/data",
                 model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.knowledge_file = Path(knowledge_file)
        self.output_dir = Path(output_dir)
        self.model_name = model_name
        
        # Créer le répertoire de sortie
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Charger le modèle d'embeddings
        logger.info(f"Chargement du modèle d'embeddings: {model_name}")
        self.embedding_model = SentenceTransformer(model_name)
        self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
        
        self.chunks: List[DocumentChunk] = []
    
    def extract_text_from_pdf(self, file_path: Path) -> List[Dict[str, Any]]:
        """Extrait le texte d'un fichier PDF."""
        text_chunks = []
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                logger.info(f"Traitement PDF: {len(pdf_reader.pages)} pages")
                
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    text = page.extract_text()
                    if text.strip():
                        # Nettoyer le texte
                        text = re.sub(r'\s+', ' ', text).strip()
                        text_chunks.append({
                            'text': text,
                            'page_number': page_num
                        })
                        logger.info(f"Page {page_num}: {len(text)} caractères extraits")
                        
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction PDF {file_path}: {e}")
        return text_chunks
    
    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Divise le texte en chunks avec chevauchement."""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = min(start + chunk_size, len(text))
            
            # Essayer de couper sur une phrase
            if end < len(text):
                sentence_end = text.rfind('.', start, end)
                if sentence_end > start + chunk_size // 2:
                    end = sentence_end + 1
                else:
                    # Chercher un espace
                    space_pos = text.rfind(' ', start, end)
                    if space_pos > start + chunk_size // 2:
                        end = space_pos
            
            chunk = text[start:end].strip()
            if chunk and len(chunk) > 50:  # Ignorer les chunks trop courts
                chunks.append(chunk)
            
            start = max(start + chunk_size - overlap, end)
        
        return chunks
    
    def process_document(self) -> int:
        """Traite le document PDF."""
        logger.info(f"Traitement du document: {self.knowledge_file}")
        
        if not self.knowledge_file.exists():
            logger.error(f"Fichier non trouvé: {self.knowledge_file}")
            return 0
        
        # Extraire le texte du PDF
        text_data = self.extract_text_from_pdf(self.knowledge_file)
        
        if not text_data:
            logger.error("Aucun texte extrait du PDF")
            return 0
        
        # Traiter chaque page
        for page_data in text_data:
            text = page_data['text']
            page_num = page_data['page_number']
            
            # Diviser en chunks
            chunks = self.chunk_text(text, chunk_size=400, overlap=50)
            
            for i, chunk_text in enumerate(chunks):
                chunk = DocumentChunk(
                    text=chunk_text,
                    source_file=self.knowledge_file.name,
                    page_number=page_num,
                    chunk_index=i
                )
                self.chunks.append(chunk)
        
        logger.info(f"Document traité: {len(self.chunks)} chunks créés")
        return len(self.chunks)
    
    def generate_embeddings(self):
        """Génère les embeddings pour tous les chunks."""
        if not self.chunks:
            logger.warning("Aucun chunk à traiter")
            return
        
        logger.info("Génération des embeddings...")
        texts = [chunk.text for chunk in self.chunks]
        
        # Générer les embeddings par batch
        batch_size = 16
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            logger.info(f"Traitement batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}")
            
            batch_embeddings = self.embedding_model.encode(
                batch, 
                convert_to_tensor=False,
                normalize_embeddings=True  # Normalisation pour similarité cosinus
            )
            embeddings.extend(batch_embeddings)
        
        # Assigner les embeddings aux chunks
        for chunk, embedding in zip(self.chunks, embeddings):
            chunk.embedding = embedding.tolist()  # Convertir en liste pour JSON
        
        logger.info(f"Embeddings générés pour {len(self.chunks)} chunks")
    
    def save_static_data(self):
        """Sauvegarde les données statiques pour le frontend."""
        
        # Préparer les données pour le frontend
        chunks_data = []
        for chunk in self.chunks:
            chunks_data.append({
                'id': len(chunks_data),
                'text': chunk.text,
                'source_file': chunk.source_file,
                'page_number': chunk.page_number,
                'chunk_index': chunk.chunk_index,
                'embedding': chunk.embedding
            })
        
        # Sauvegarder les chunks avec embeddings
        embeddings_file = self.output_dir / "knowledge_embeddings.json"
        with open(embeddings_file, 'w', encoding='utf-8') as f:
            json.dump(chunks_data, f, ensure_ascii=False, indent=2)
        
        # Sauvegarder la configuration
        config_data = {
            'model_name': self.model_name,
            'embedding_dim': self.embedding_dim,
            'total_chunks': len(self.chunks),
            'source_file': self.knowledge_file.name,
            'generated_at': self._get_timestamp()
        }
        
        config_file = self.output_dir / "embedding_config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2)
        
        # Créer un index simplifié pour la recherche rapide
        search_index = {
            'chunks': [
                {
                    'id': i,
                    'text_preview': chunk.text[:100] + "..." if len(chunk.text) > 100 else chunk.text,
                    'keywords': self._extract_keywords(chunk.text),
                    'page': chunk.page_number
                }
                for i, chunk in enumerate(self.chunks)
            ]
        }
        
        index_file = self.output_dir / "search_index.json"
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(search_index, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Données statiques sauvegardées dans: {self.output_dir}")
        logger.info(f"- Embeddings: {embeddings_file} ({len(chunks_data)} chunks)")
        logger.info(f"- Configuration: {config_file}")
        logger.info(f"- Index de recherche: {index_file}")
        
        # Afficher la taille des fichiers
        self._log_file_sizes()
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extrait des mots-clés simples du texte."""
        # Mots-clés liés à l'investissement
        keywords = []
        investment_terms = [
            'investissement', 'portefeuille', 'risque', 'rendement', 'action', 'obligation',
            'diversification', 'allocation', 'épargne', 'placement', 'capital', 'profit',
            'perte', 'volatilité', 'dividende', 'plus-value', 'market', 'bourse',
            'prudent', 'équilibré', 'dynamique', 'agressif', 'conservateur'
        ]
        
        text_lower = text.lower()
        for term in investment_terms:
            if term in text_lower:
                keywords.append(term)
        
        return list(set(keywords))  # Supprimer les doublons
    
    def _get_timestamp(self) -> str:
        """Retourne un timestamp formaté."""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def _log_file_sizes(self):
        """Affiche la taille des fichiers générés."""
        files_to_check = [
            "knowledge_embeddings.json",
            "embedding_config.json", 
            "search_index.json"
        ]
        
        for filename in files_to_check:
            file_path = self.output_dir / filename
            if file_path.exists():
                size_mb = file_path.stat().st_size / (1024 * 1024)
                logger.info(f"  {filename}: {size_mb:.2f} MB")
    
    def test_search(self, query: str = "investissement long terme") -> List[Dict]:
        """Test la recherche avec une requête exemple."""
        if not self.chunks:
            return []
        
        logger.info(f"Test de recherche pour: '{query}'")
        
        # Générer l'embedding de la requête
        query_embedding = self.embedding_model.encode([query], normalize_embeddings=True)[0]
        
        # Calculer les similarités
        similarities = []
        for i, chunk in enumerate(self.chunks):
            chunk_embedding = np.array(chunk.embedding)
            similarity = np.dot(query_embedding, chunk_embedding)
            similarities.append({
                'id': i,
                'similarity': float(similarity),
                'text_preview': chunk.text[:150] + "...",
                'page': chunk.page_number
            })
        
        # Trier par similarité
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        
        # Afficher les meilleurs résultats
        logger.info("Top 3 résultats:")
        for i, result in enumerate(similarities[:3], 1):
            logger.info(f"  {i}. Score: {result['similarity']:.3f} | Page {result['page']}")
            logger.info(f"     {result['text_preview']}")
        
        return similarities[:5]

def main():
    """Fonction principale."""
    print("🚀 Génération des embeddings statiques pour RAMAdvisor")
    print("=" * 60)
    
    generator = StaticEmbeddingGenerator()
    
    # Vérifier que le fichier source existe
    if not generator.knowledge_file.exists():
        print(f"❌ Fichier source non trouvé: {generator.knowledge_file}")
        print("Assurez-vous que le fichier course.pdf est dans docs/knowledge/")
        return
    
    try:
        # Traiter le document
        chunk_count = generator.process_document()
        if chunk_count == 0:
            print("❌ Aucun chunk généré")
            return
        
        # Générer les embeddings
        generator.generate_embeddings()
        
        # Sauvegarder les données statiques
        generator.save_static_data()
        
        # Test de recherche
        print("\n🔍 Test de recherche:")
        generator.test_search("stratégie investissement risque")
        
        print(f"\n✅ Génération terminée avec succès!")
        print(f"📁 Fichiers générés dans: {generator.output_dir}")
        print("\n📋 Prochaines étapes:")
        print("1. Copiez les fichiers générés dans votre frontend")
        print("2. Intégrez le module de recherche vectorielle")
        print("3. Testez la recherche dans votre application")
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la génération: {e}")
        raise

if __name__ == "__main__":
    main()
