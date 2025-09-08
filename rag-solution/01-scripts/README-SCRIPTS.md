# 📝 Scripts de Génération d'Embeddings

## 🎯 Objectif
Ces scripts génèrent des embeddings statiques à partir d'un fichier PDF pour une utilisation côté client sans backend.

## 📁 Fichiers

### `generate_static_embeddings.py`
**Script principal** qui :
- Extrait le texte d'un PDF
- Divise en chunks intelligents
- Génère les embeddings avec Sentence Transformers
- Sauvegarde en JSON pour le frontend

**Configuration importante :**
```python
knowledge_file="../docs/knowledge/course.pdf"  # ← MODIFIER
output_dir="../frontend/data"                   # ← MODIFIER
model_name="sentence-transformers/all-MiniLM-L6-v2"
```

### `requirements.txt`
Dépendances Python nécessaires :
- `sentence-transformers` : Génération d'embeddings
- `PyPDF2` : Extraction de texte PDF
- `numpy` : Calculs vectoriels

### `generate_embeddings.bat`
Script Windows automatique qui :
- Vérifie Python
- Installe les dépendances
- Lance la génération
- Affiche le résultat

## 🚀 Utilisation

### Méthode rapide (Windows)
```bash
./generate_embeddings.bat
```

### Méthode manuelle
```bash
pip install -r requirements.txt
python generate_static_embeddings.py
```

## 📤 Sortie

Le script génère 3 fichiers JSON :

### `knowledge_embeddings.json` (2-5MB)
```json
[
  {
    "id": 0,
    "text": "Contenu du chunk...",
    "source_file": "course.pdf",
    "page_number": 1,
    "chunk_index": 0,
    "embedding": [0.1, 0.2, 0.3, ...]
  }
]
```

### `embedding_config.json`
```json
{
  "model_name": "sentence-transformers/all-MiniLM-L6-v2",
  "embedding_dim": 384,
  "total_chunks": 25,
  "source_file": "course.pdf",
  "generated_at": "2025-09-08T10:00:00"
}
```

### `search_index.json`
```json
{
  "chunks": [
    {
      "id": 0,
      "text_preview": "Aperçu du texte...",
      "keywords": ["investissement", "risque"],
      "page": 1
    }
  ]
}
```

## ⚙️ Paramètres ajustables

### Taille des chunks
```python
chunks = self.chunk_text(text, chunk_size=400, overlap=50)
```

### Modèle d'embedding
```python
# Rapide et léger (recommandé)
"sentence-transformers/all-MiniLM-L6-v2"

# Plus précis mais plus lourd
"sentence-transformers/all-mpnet-base-v2"
```

### Mots-clés d'investissement
Modifiez la liste dans `_extract_keywords()` :
```python
investment_terms = [
    'investissement', 'portefeuille', 'risque',
    # Ajoutez vos termes spécifiques
]
```

## 🔧 Adaptation

### Pour d'autres types de documents
```python
# Ajoutez le support DOCX, TXT, etc.
def extract_text_from_docx(self, file_path: Path):
    # Implémentation...
```

### Pour plusieurs fichiers
```python
# Modifiez process_document() pour traiter un répertoire
for file_path in self.knowledge_dir.iterdir():
    if file_path.suffix.lower() == '.pdf':
        # Traiter chaque fichier
```

## 🐛 Dépannage

### Erreur "Fichier non trouvé"
- Vérifiez le chemin dans `knowledge_file`
- Assurez-vous que le PDF existe

### Erreur d'installation
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Problème de mémoire
- Réduisez `batch_size` de 16 à 8
- Utilisez un modèle plus petit

### Erreur PyPDF2
```bash
pip install PyPDF2==3.0.1
# ou
pip install pypdf
```

## 📊 Performance

### Temps de génération
- **Petit PDF (10 pages)** : ~30 secondes
- **PDF moyen (50 pages)** : ~2 minutes  
- **Gros PDF (200 pages)** : ~10 minutes

### Taille des fichiers
- **Embeddings** : ~100KB par page de PDF
- **Configuration** : <1KB
- **Index** : ~10KB par page

## ✅ Validation

Après génération, vérifiez :
1. Les 3 fichiers JSON sont créés
2. Le test de recherche affiche des résultats
3. La taille des fichiers est raisonnable
4. Aucune erreur dans les logs
