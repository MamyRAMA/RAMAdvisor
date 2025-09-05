import os
import json
import re
from pathlib import Path
from typing import List, Dict, Any
import logging
from dataclasses import dataclass

import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from docx import Document
import PyPDF2

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DocumentChunk:
    """Représente un fragment de document avec ses métadonnées."""
    text: str
    source_file: str
    page_number: int = None
    chunk_index: int = 0
    char_start: int = 0
    char_end: int = 0

class DocumentProcessor:
    """Traite et indexe les documents de connaissance."""
    
    def __init__(self, 
                 knowledge_dir: str = "../docs/knowledge",
                 index_dir: str = "./indexes",
                 model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.knowledge_dir = Path(knowledge_dir)
        self.index_dir = Path(index_dir)
        self.model_name = model_name
        
        # Créer le répertoire d'index
        self.index_dir.mkdir(exist_ok=True)
        
        # Charger le modèle d'embeddings
        logger.info(f"Chargement du modèle d'embeddings: {model_name}")
        self.embedding_model = SentenceTransformer(model_name)
        self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
        
        # Initialiser l'index FAISS
        self.index = faiss.IndexFlatIP(self.embedding_dim)  # Inner Product (cosine similarity)
        self.chunks: List[DocumentChunk] = []
    
    def extract_text_from_pdf(self, file_path: Path) -> List[Dict[str, Any]]:
        """Extrait le texte d'un fichier PDF."""
        text_chunks = []
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    text = page.extract_text()
                    if text.strip():
                        text_chunks.append({
                            'text': text,
                            'page_number': page_num
                        })
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction PDF {file_path}: {e}")
        return text_chunks
    
    def extract_text_from_docx(self, file_path: Path) -> List[Dict[str, Any]]:
        """Extrait le texte d'un fichier DOCX."""
        text_chunks = []
        try:
            doc = Document(file_path)
            full_text = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    full_text.append(paragraph.text)
            
            if full_text:
                text_chunks.append({
                    'text': '\n'.join(full_text),
                    'page_number': 1
                })
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction DOCX {file_path}: {e}")
        return text_chunks
    
    def extract_text_from_txt(self, file_path: Path) -> List[Dict[str, Any]]:
        """Extrait le texte d'un fichier TXT."""
        text_chunks = []
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
                if text.strip():
                    text_chunks.append({
                        'text': text,
                        'page_number': 1
                    })
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction TXT {file_path}: {e}")
        return text_chunks
    
    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Divise le texte en chunks avec chevauchement."""
        # Nettoyer le texte
        text = re.sub(r'\s+', ' ', text).strip()
        
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = min(start + chunk_size, len(text))
            
            # Essayer de couper sur une phrase ou un mot
            if end < len(text):
                # Chercher la fin d'une phrase
                sentence_end = text.rfind('.', start, end)
                if sentence_end > start + chunk_size // 2:
                    end = sentence_end + 1
                else:
                    # Chercher un espace
                    space_pos = text.rfind(' ', start, end)
                    if space_pos > start + chunk_size // 2:
                        end = space_pos
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = max(start + chunk_size - overlap, end)
        
        return chunks
    
    def process_documents(self) -> int:
        """Traite tous les documents du répertoire de connaissance."""
        logger.info(f"Traitement des documents dans: {self.knowledge_dir}")
        
        supported_extensions = {'.pdf', '.docx', '.txt'}
        processed_count = 0
        
        for file_path in self.knowledge_dir.iterdir():
            if file_path.suffix.lower() not in supported_extensions:
                continue
                
            logger.info(f"Traitement: {file_path.name}")
            
            # Extraire le texte selon le type de fichier
            if file_path.suffix.lower() == '.pdf':
                text_data = self.extract_text_from_pdf(file_path)
            elif file_path.suffix.lower() == '.docx':
                text_data = self.extract_text_from_docx(file_path)
            elif file_path.suffix.lower() == '.txt':
                text_data = self.extract_text_from_txt(file_path)
            else:
                continue
            
            # Traiter chaque page/section
            for page_data in text_data:
                text = page_data['text']
                page_num = page_data['page_number']
                
                # Diviser en chunks
                chunks = self.chunk_text(text)
                
                for i, chunk_text in enumerate(chunks):
                    chunk = DocumentChunk(
                        text=chunk_text,
                        source_file=file_path.name,
                        page_number=page_num,
                        chunk_index=i,
                        char_start=0,  # Pourrait être calculé plus précisément
                        char_end=len(chunk_text)
                    )
                    self.chunks.append(chunk)
            
            processed_count += 1
        
        logger.info(f"Documents traités: {processed_count}, Chunks créés: {len(self.chunks)}")
        return len(self.chunks)
    
    def build_index(self):
        """Construit l'index FAISS avec les embeddings."""
        if not self.chunks:
            logger.warning("Aucun chunk à indexer")
            return
        
        logger.info("Génération des embeddings...")
        texts = [chunk.text for chunk in self.chunks]
        
        # Générer les embeddings par batch pour l'efficacité
        batch_size = 32
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = self.embedding_model.encode(batch, convert_to_tensor=False)
            embeddings.extend(batch_embeddings)
        
        # Normaliser pour la similarité cosinus
        embeddings = np.array(embeddings, dtype=np.float32)
        faiss.normalize_L2(embeddings)
        
        # Ajouter à l'index FAISS
        self.index.add(embeddings)
        
        logger.info(f"Index construit avec {self.index.ntotal} vecteurs")
    
    def save_index(self):
        """Sauvegarde l'index et les métadonnées."""
        # Sauvegarder l'index FAISS
        index_path = self.index_dir / "faiss_index.bin"
        faiss.write_index(self.index, str(index_path))
        
        # Sauvegarder les métadonnées des chunks
        metadata_path = self.index_dir / "chunks_metadata.json"
        chunks_data = []
        for chunk in self.chunks:
            chunks_data.append({
                'text': chunk.text,
                'source_file': chunk.source_file,
                'page_number': chunk.page_number,
                'chunk_index': chunk.chunk_index,
                'char_start': chunk.char_start,
                'char_end': chunk.char_end
            })
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(chunks_data, f, ensure_ascii=False, indent=2)
        
        # Sauvegarder la configuration
        config_path = self.index_dir / "config.json"
        config = {
            'model_name': self.model_name,
            'embedding_dim': self.embedding_dim,
            'total_chunks': len(self.chunks),
            'knowledge_dir': str(self.knowledge_dir)
        }
        
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)
        
        logger.info(f"Index sauvegardé dans: {self.index_dir}")
    
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Recherche les chunks les plus pertinents pour une requête."""
        if self.index.ntotal == 0:
            return []
        
        # Générer l'embedding de la requête
        query_embedding = self.embedding_model.encode([query], convert_to_tensor=False)
        query_embedding = np.array(query_embedding, dtype=np.float32)
        faiss.normalize_L2(query_embedding)
        
        # Rechercher dans l'index
        scores, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0 and idx < len(self.chunks):
                chunk = self.chunks[idx]
                results.append({
                    'text': chunk.text,
                    'source_file': chunk.source_file,
                    'page_number': chunk.page_number,
                    'chunk_index': chunk.chunk_index,
                    'score': float(score)
                })
        
        return results

def main():
    """Fonction principale pour l'ingestion des documents."""
    print("🚀 Début de l'ingestion des documents de connaissance")
    
    processor = DocumentProcessor()
    
    # Vérifier que le répertoire de connaissance existe
    if not processor.knowledge_dir.exists():
        print(f"❌ Répertoire de connaissance non trouvé: {processor.knowledge_dir}")
        return
    
    # Traiter les documents
    chunk_count = processor.process_documents()
    if chunk_count == 0:
        print("❌ Aucun document traité")
        return
    
    # Construire l'index
    processor.build_index()
    
    # Sauvegarder
    processor.save_index()
    
    print(f"✅ Ingestion terminée: {chunk_count} chunks indexés")
    
    # Test de recherche
    print("\n🔍 Test de recherche:")
    test_queries = [
        "investissement long terme",
        "profil de risque",
        "allocation portefeuille"
    ]
    
    for query in test_queries:
        results = processor.search(query, top_k=2)
        print(f"\nRequête: '{query}'")
        for i, result in enumerate(results, 1):
            print(f"  {i}. Score: {result['score']:.3f} | {result['source_file']} (page {result['page_number']})")
            print(f"     {result['text'][:100]}...")

if __name__ == "__main__":
    main()
