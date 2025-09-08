# 🏗️ Architecture Technique - Solution RAG Sans Backend

## 🎯 Vue d'ensemble

Cette solution implémente un système RAG (Retrieval-Augmented Generation) **entièrement côté client**, éliminant le besoin d'un backend pour la recherche vectorielle et les recommandations d'investissement.

## 🔧 Architecture générale

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURE RAG                         │
└─────────────────────────────────────────────────────────────────┘

Phase 1: GÉNÉRATION (Une fois, en local)
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PDF Source    │───▶│  Script Python  │───▶│   Embeddings    │
│   (docs/...)    │    │  Sentence Trans │    │   Statiques     │
│                 │    │  + PyPDF2      │    │   (JSON)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘

Phase 2: DÉPLOIEMENT (Frontend uniquement)
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Utilisateur    │◀───│   Frontend      │◀───│  JSON Assets    │
│  (Navigateur)   │    │  JavaScript     │    │  (Statiques)    │
│                 │    │  + Recherche    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🏛️ Composants principaux

### 1. Générateur d'embeddings (Python)
**Fichier**: `generate_static_embeddings.py`

#### Responsabilités:
- Extraction de texte depuis PDF (PyPDF2)
- Chunking intelligent avec chevauchement
- Génération d'embeddings (Sentence Transformers)
- Normalisation pour similarité cosinus
- Export JSON optimisé pour le web

#### Modèle utilisé:
```python
sentence-transformers/all-MiniLM-L6-v2
- Dimensions: 384
- Taille: ~90MB
- Performance: Excellent compromis vitesse/qualité
- Multilingue: Support français
```

#### Pipeline de traitement:
```
PDF → Pages → Chunks → Embeddings → JSON
 ↓      ↓       ↓         ↓          ↓
1-N   Text   300-500   384-dim    Assets
pages extract  chars   vectors    web
```

### 2. Module de recherche vectorielle (JavaScript)
**Fichier**: `vector-search.js`

#### Architecture interne:
```javascript
class ClientVectorSearch {
    constructor()     // Initialisation
    initialize()      // Chargement données async
    loadJSON()        // Fetch des assets
    keywordSearch()   // Recherche par mots-clés
    intelligentSearch() // Recherche hybride
    cosineSimilarity() // Calcul de similarité
    getStats()        // Métadonnées système
}
```

#### Méthodes de recherche:
1. **Recherche par mots-clés** (principal)
   - Matching exact et variantes
   - Scoring avec bonus pour termes importants
   - Support des inflexions françaises

2. **Recherche hybride** (extensible)
   - Combinaison sémantique + mots-clés
   - Pondération configurable
   - Prêt pour intégration API embeddings

### 3. Système de recommandations (JavaScript)
**Fichiers**: `script-modifications.js` + `integration-functions.js`

#### Pipeline de génération:
```
Paramètres utilisateur → Recherche contexte → Calculs financiers
        ↓                       ↓                    ↓
   Profil risque         Sources pertinentes    Projections
   Objectif              Insights extraits      Allocations
   Montants              Recommandations        Stratégies
```

#### Moteur de calculs:
```javascript
// Croissance composée avec versements réguliers
function calculateCompoundGrowth(initial, monthly, rate, months) {
    let value = initial;
    for (let i = 0; i < months; i++) {
        value = (value + monthly) * (1 + rate);
    }
    return { value, gains: value - totalInvested };
}
```

## 📊 Format des données

### Structure des embeddings
```json
{
  "id": 0,
  "text": "Contenu du chunk (300-500 chars)",
  "source_file": "course.pdf", 
  "page_number": 1,
  "chunk_index": 0,
  "embedding": [0.1, 0.2, ..., 0.384] // Vecteur normalisé
}
```

### Index de recherche optimisé
```json
{
  "chunks": [{
    "id": 0,
    "text_preview": "Aperçu 100 chars...",
    "keywords": ["investissement", "risque"],
    "page": 1
  }]
}
```

### Configuration système
```json
{
  "model_name": "sentence-transformers/all-MiniLM-L6-v2",
  "embedding_dim": 384,
  "total_chunks": 25,
  "source_file": "course.pdf",
  "generated_at": "2025-09-08T10:00:00.000Z"
}
```

## 🔍 Algorithmes de recherche

### Scoring par mots-clés
```javascript
function calculateKeywordScore(queryWords, text, keywords) {
    let score = 0;
    for (const word of queryWords) {
        if (text.includes(word)) {
            score += 1;                          // Match exact
            if (keywords.includes(word)) score += 0.5;  // Bonus mot-clé
            if (isImportantTerm(word)) score += 0.3;    // Bonus domaine
        }
        // Variantes et inflexions
        getWordVariants(word).forEach(variant => {
            if (text.includes(variant)) score += 0.5;
        });
    }
    return Math.min(1, score / queryWords.length);
}
```

### Similarité cosinus (prêt pour usage)
```javascript
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
}
```

## 💾 Gestion des données

### Chargement asynchrone
```javascript
async initialize() {
    const [config, embeddings, searchIndex] = await Promise.all([
        this.loadJSON('embedding_config.json'),
        this.loadJSON('knowledge_embeddings.json'),  // 2-5MB
        this.loadJSON('search_index.json')           // ~50KB
    ]);
    // Traitement...
}
```

### Optimisations mémoire
- **Lazy loading**: Chargement uniquement si nécessaire
- **JSON streaming**: Traitement par chunks (extensible)
- **Cache intelligent**: Mise en cache des recherches fréquentes
- **Compression**: Gzip automatique via CDN

## 🚀 Performance

### Métriques de référence
| Métrique | Valeur | Notes |
|----------|--------|-------|
| Chargement initial | 1-3s | Dépend taille JSON |
| Première recherche | <100ms | Après chargement |
| Recherches suivantes | <10ms | Cache en mémoire |
| Mémoire utilisée | 5-15MB | Proportionnel aux données |

### Optimisations implémentées
1. **Normalisation pré-calculée** des embeddings
2. **Index de mots-clés** pour recherche rapide  
3. **Chunking intelligent** pour minimiser la taille
4. **Batch processing** lors de la génération

### Monitoring recommandé
```javascript
// Métriques de performance
const metrics = {
    initTime: performance.now() - startTime,
    searchCount: 0,
    avgSearchTime: 0,
    cacheHitRate: 0.85
};
```

## 🔒 Sécurité et limitations

### Avantages sécurité
- ✅ **Pas de backend**: Aucun serveur à sécuriser
- ✅ **Données statiques**: Pas de requêtes dynamiques
- ✅ **CORS-friendly**: Compatible tous hébergeurs
- ✅ **Offline capable**: Fonctionne sans réseau après chargement

### Limitations acceptées
- ❌ **Données publiques**: JSON visible côté client
- ❌ **Mise à jour manuelle**: Régénération nécessaire
- ❌ **Taille limitée**: ~50MB max recommandé
- ❌ **Recherche simple**: Pas d'IA générative intégrée

### Mitigations
```javascript
// Obfuscation légère des données sensibles
const obfuscatedData = btoa(JSON.stringify(sensitiveConfig));

// Validation côté client
function validateInput(query) {
    return query.length < 200 && /^[a-zA-ZÀ-ÿ0-9\s]+$/.test(query);
}
```

## 🔧 Extensibilité

### Points d'extension identifiés
1. **Multi-sources**: Support de plusieurs PDFs
2. **API hybride**: Recherche locale + API externe
3. **ML côté client**: TensorFlow.js pour embeddings
4. **Personnalisation**: Profils utilisateur persistants

### Architecture modulaire
```javascript
// Interface extensible
class SearchProvider {
    async search(query, options) { /* ... */ }
}

class LocalVectorSearch extends SearchProvider { /* Implémentation actuelle */ }
class APIVectorSearch extends SearchProvider { /* Extension future */ }
class HybridSearch extends SearchProvider { /* Combinaison */ }
```

### Hooks d'intégration
```javascript
// Events personnalisés pour intégration
window.dispatchEvent(new CustomEvent('ragSearchComplete', {
    detail: { query, results, performance }
}));

// Middleware de traitement
const middleware = [
    preprocessQuery,
    searchKnowledge,
    postprocessResults,
    cacheResults
];
```

## 📈 Évolution technique

### Version actuelle (1.0)
- Recherche par mots-clés avancée
- Recommandations basées sur contexte
- Mode fallback intégré

### Roadmap technique

#### Version 1.1 (Court terme)
- Cache persistant (localStorage)
- Recherche fuzzy améliorée
- Compression des embeddings

#### Version 1.2 (Moyen terme)
- Support multi-documents
- Interface de gestion des connaissances
- Analytics intégrées

#### Version 2.0 (Long terme)
- Embeddings sémantiques vrais (API)
- IA générative optionnelle
- Personnalisation adaptive

## 🧪 Tests et qualité

### Suite de tests recommandée
```javascript
// Tests unitaires
describe('VectorSearch', () => {
    test('Initialization', async () => {
        const search = new ClientVectorSearch();
        expect(await search.initialize()).toBe(true);
    });
    
    test('Keyword matching', () => {
        const score = calculateKeywordScore(['test'], 'test content', []);
        expect(score).toBeGreaterThan(0);
    });
});
```

### Validation en production
- **Monitoring** des temps de réponse
- **A/B testing** des recommandations
- **Feedback utilisateur** sur pertinence
- **Analytics** d'usage et performance
