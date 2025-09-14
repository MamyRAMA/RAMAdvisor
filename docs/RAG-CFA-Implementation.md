# 🎓 RAG CFA - Guide d'Implémentation

## 📋 Vue d'ensemble

Ce guide détaille l'implémentation d'un système RAG (Retrieval-Augmented Generation) qui intègre la connaissance du cours **CFA Advanced Private Wealth Management** dans le système de recommandations d'investissement de RAMAdvisor.

## 🎯 Objectifs

- **Enrichir les conseils** avec la connaissance professionnelle CFA
- **Personnaliser les recommandations** selon le profil de risque
- **Maintenir les performances** avec des embeddings pré-calculés
- **Assurer la compatibilité** avec l'infrastructure Netlify existante

## 📁 Architecture des Fichiers

```
scripts/
├── generate_cfa_embeddings.py    # Script principal de génération
├── requirements.txt              # Dépendances Python
└── generate_embeddings.bat       # Script Windows d'exécution

netlify/functions/
├── cfa-vector-search.js          # Module de recherche vectorielle
├── generate-investment-advice.js # Fonction Netlify modifiée
└── cfa_data/                     # Données générées (créé automatiquement)
    ├── cfa_knowledge_embeddings.json
    ├── cfa_embedding_config.json
    ├── cfa_search_index.json
    └── cfa_stats.json
```

## 🚀 Étapes d'Implémentation

### Étape 1: Préparation

1. **Vérifiez la présence du PDF CFA** dans `docs/knowledge/course.pdf`
2. **Installez Python** (version 3.8+) si nécessaire
3. **Ouvrez un terminal** dans le dossier `scripts/`

### Étape 2: Génération des Embeddings

**Option A - Script automatisé (Windows):**
```batch
cd scripts
generate_embeddings.bat
```

**Option B - Manuel:**
```bash
cd scripts
pip install -r requirements.txt
python generate_cfa_embeddings.py
```

### Étape 3: Vérification

Après génération, vérifiez que les fichiers suivants existent dans `netlify/functions/cfa_data/`:
- ✅ `cfa_knowledge_embeddings.json` (~2-5MB)
- ✅ `cfa_embedding_config.json` (~1KB)
- ✅ `cfa_search_index.json` (~50KB)
- ✅ `cfa_stats.json` (~2KB)

### Étape 4: Test Local

Testez la fonction Netlify modifiée localement:
```bash
netlify dev
```

Puis faites une requête POST vers `/.netlify/functions/generate-investment-advice`

### Étape 5: Déploiement

Déployez sur Netlify:
```bash
git add .
git commit -m "Intégration RAG CFA"
git push
```

## 🔧 Fonctionnalités Techniques

### Recherche Vectorielle Hybride

Le système combine:
- **Similarité sémantique** via embeddings
- **Correspondance de mots-clés** pour la précision
- **Filtrage par catégorie** (Asset Allocation, Risk Management, etc.)
- **Boost de pertinence** selon le profil de risque

### Catégories CFA Reconnues

- 📊 **Asset Allocation**: Diversification, allocation stratégique
- ⚠️ **Risk Management**: Tolérance au risque, volatilité
- 💼 **Investment Strategy**: Méthodologies d'investissement
- 👥 **Client Management**: Relation client, objectifs
- 📈 **Performance**: Mesure, benchmarks
- 💰 **Tax Planning**: Optimisation fiscale
- 🏛️ **Estate Planning**: Transmission de patrimoine
- 🔄 **Alternative Investments**: Investissements alternatifs

### Optimisations Performance

- **Embeddings pré-calculés** (pas de calcul à l'exécution)
- **Index de recherche** pour correspondance rapide des mots-clés
- **Pseudo-embeddings** comme fallback si les vrais embeddings échouent
- **Limitation de taille** des chunks retournés (max 1800 caractères)

## 📊 Monitoring et Debug

### Variables de Debug

La fonction Netlify retourne maintenant des métadonnées:
```json
{
  "success": true,
  "advice": "...",
  "cfa_enhanced": true,
  "knowledge_sources": {
    "cfa_length": 1456,
    "standard_length": 234
  }
}
```

### Logs Netlify

Surveillez les logs pour:
- `📊 Nouvelle demande:` - Paramètres reçus
- `🔍 Recherche de connaissance CFA pertinente...` - Début recherche
- `✅ Connaissance CFA intégrée:` - Succès
- `⚠️ Recherche CFA échouée,` - Fallback vers base standard

## 🛠️ Personnalisation

### Ajuster les Seuils

Dans `cfa-vector-search.js`:
```javascript
this.SIMILARITY_THRESHOLD = 0.3;  // Seuil de pertinence
this.MAX_RESULTS = 5;              // Nombre de chunks
this.KEYWORD_BOOST = 0.1;          // Boost mots-clés
```

### Ajouter des Catégories

Dans `generate_cfa_embeddings.py`, section `topic_keywords`:
```python
self.topic_keywords = {
    "New Category": ["keyword1", "keyword2", "keyword3"],
    # ... catégories existantes
}
```

### Modifier le Chunking

Ajustez les paramètres de découpage dans `generate_cfa_embeddings.py`:
```python
chunks = self.chunk_text_smart(text, chunk_size=450, overlap=80)
```

## 🔍 Résolution de Problèmes

### Erreur "Fichier PDF non trouvé"
- Vérifiez que `course.pdf` est dans `docs/knowledge/`
- Vérifiez les permissions de lecture du fichier

### Erreur "Module sentence-transformers non trouvé"
```bash
pip install --upgrade sentence-transformers
```

### Erreur "Mémoire insuffisante"
- Réduisez `batch_size` dans `generate_cfa_embeddings.py`
- Utilisez un modèle d'embedding plus petit

### Fonction Netlify timeout
- Vérifiez que les fichiers JSON sont bien générés
- Réduisez `MAX_RESULTS` dans `cfa-vector-search.js`

## 📈 Performances Attendues

### Taille des Données
- **PDF source**: ~10-50 MB
- **Embeddings générés**: ~2-5 MB JSON
- **Temps de génération**: 2-10 minutes
- **Temps de recherche**: <100ms

### Qualité des Résultats
- **Pertinence sémantique**: 85-95%
- **Couverture des sujets**: Complète pour la gestion privée
- **Adaptation au profil**: Automatique par mot-clé et catégorie

## 🔮 Améliorations Futures

1. **Support multi-PDF**: Intégrer plusieurs sources CFA
2. **Embeddings en temps réel**: API Sentence Transformers en ligne
3. **Cache intelligent**: Mise en cache des recherches fréquentes
4. **Analytics**: Tracking de l'efficacité des recommandations

## 📞 Support

En cas de problème:
1. Vérifiez les logs Netlify Functions
2. Consultez `cfa_stats.json` pour les métriques
3. Testez le module de recherche isolément
4. Vérifiez la structure des fichiers JSON générés

---

**✅ Système RAG CFA opérationnel pour des conseils d'investissement de niveau professionnel !**
