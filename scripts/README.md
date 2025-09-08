# 🚀 RAM Advisor - Solution Embedding Statique

Cette solution permet d'utiliser un système RAG (Retrieval-Augmented Generation) **sans backend**, en pré-calculant les embeddings et en effectuant la recherche vectorielle côté client.

## 📋 Avantages

✅ **Aucun backend requis** - Compatible 100% Netlify  
✅ **Recherche rapide** - Embeddings pré-calculés  
✅ **Pas de coûts** - Pas de serveur à maintenir  
✅ **Contrôle total** - Données stockées localement  
✅ **Évolutif** - Facilement extensible à d'autres documents  

## 🛠️ Installation et Utilisation

### Étape 1 : Génération des Embeddings

1. **Assurez-vous d'avoir le fichier source** :
   ```
   docs/knowledge/course.pdf
   ```

2. **Exécutez le script de génération** :
   ```bash
   cd scripts
   ./generate_embeddings.bat
   ```
   
   Ou manuellement :
   ```bash
   cd scripts
   pip install -r requirements.txt
   python generate_static_embeddings.py
   ```

3. **Vérifiez que les fichiers sont générés** dans `frontend/data/` :
   - `knowledge_embeddings.json` (~2-5MB)
   - `embedding_config.json` 
   - `search_index.json`

### Étape 2 : Déploiement

1. **Copiez le dossier frontend** vers votre hébergement Netlify
2. **Les fichiers de données** seront automatiquement servis comme assets statiques
3. **Le système fonctionne** immédiatement sans configuration

## 🧠 Comment ça marche

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   course.pdf    │───▶│  Script Python  │───▶│   Embeddings    │
│  (docs/know...)  │    │   (une fois)    │    │    statiques    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◀───│  Vector Search  │◀───│   JSON Files    │
│   (Netlify)     │    │   JavaScript    │    │  (frontend/data) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Processus de recherche
1. **Requête utilisateur** → Mots-clés extraits
2. **Recherche hybride** → Mots-clés + contexte sémantique 
3. **Scoring intelligent** → Pertinence calculée
4. **Recommandations** → Basées sur le contenu trouvé

## 📁 Structure des fichiers

```
frontend/
├── data/
│   ├── knowledge_embeddings.json    # Embeddings + métadonnées
│   ├── embedding_config.json        # Configuration
│   └── search_index.json           # Index de recherche rapide
├── js/
│   ├── vector-search.js            # Module de recherche vectorielle
│   └── script.js                   # Script principal (modifié)
└── index.html                      # HTML principal (modifié)

scripts/
├── generate_static_embeddings.py   # Script de génération
├── requirements.txt                # Dépendances Python
└── generate_embeddings.bat        # Script d'exécution Windows
```

## 🔧 Personnalisation

### Modifier les sources de connaissances
Pour utiliser d'autres documents, modifiez le chemin dans `generate_static_embeddings.py` :
```python
knowledge_file: str = "../docs/knowledge/votre_fichier.pdf"
```

### Ajuster les paramètres de recherche
Dans `vector-search.js`, vous pouvez modifier :
- `topK` : nombre de résultats retournés
- `minScore` : score minimum de pertinence
- Mots-clés importants dans `isImportantTerm()`

### Changer le modèle d'embedding
Dans le script de génération :
```python
model_name: str = "sentence-transformers/all-MiniLM-L6-v2"  # Rapide, léger
# model_name: str = "sentence-transformers/all-mpnet-base-v2"  # Plus précis
```

## 🚀 Migration vers cette solution

Si vous venez du système avec backend :

1. **Supprimez les appels API** au backend RAG
2. **Générez les embeddings** avec ce script
3. **Déployez** uniquement le frontend
4. **Testez** la recherche vectorielle locale

## 📊 Performance

- **Taille des fichiers** : ~2-5 MB pour un PDF de cours
- **Temps de chargement** : ~1-2 secondes au premier accès
- **Recherche** : Instantanée après chargement
- **Compatible** : Tous navigateurs modernes

## 🔍 Debug et Tests

Pour tester la recherche vectorielle :
```javascript
// Dans la console du navigateur
vectorSearch.intelligentSearch("investissement long terme").then(console.log);
vectorSearch.getStats(); // Statistiques de la base
```

## ⚠️ Limitations

- **Mise à jour manuelle** : Regénérer les embeddings si le contenu change
- **Taille limitée** : Convient pour quelques documents (~10-50 pages)
- **Recherche simple** : Pas d'IA générative intégrée (mais extensible)

## 🎯 Prochaines améliorations possibles

1. **Multi-documents** : Support de plusieurs PDFs
2. **Recherche sémantique avancée** : Utilisation d'APIs d'embedding en ligne
3. **Cache intelligent** : Stockage local des recherches fréquentes
4. **Interface de gestion** : Pour mettre à jour les connaissances

---

**✨ Profitez de votre système RAG sans backend !**
