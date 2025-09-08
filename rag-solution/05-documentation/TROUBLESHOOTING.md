# 🚨 Guide de dépannage - Solution RAG Frontend

## 🎯 Problèmes courants et solutions

---

## 🚫 Erreurs d'initialisation

### ❌ "Failed to load JSON files"

**Symptômes**:
```
Error: Failed to load knowledge_embeddings.json
Network request failed
```

**Causes possibles**:
1. Fichiers JSON manquants
2. Chemin incorrect vers les assets
3. Problème CORS
4. Serveur local non démarré

**Solutions**:

1. **Vérifier la présence des fichiers**:
```bash
# Dans le dossier de votre site
ls -la data/
# Doit contenir:
# - knowledge_embeddings.json
# - search_index.json  
# - embedding_config.json
```

2. **Corriger les chemins**:
```javascript
// Dans vector-search.js, vérifier les URLs
const config = await this.loadJSON('./data/embedding_config.json');
// Ajuster selon votre structure de dossiers
```

3. **Résoudre les problèmes CORS**:
```javascript
// Pour tests locaux, utiliser un serveur HTTP
python -m http.server 8000
# Ou avec Node.js
npx serve .
```

4. **Mode de débogage**:
```javascript
// Activer les logs détaillés
enableDebugMode(true);
await search.initialize();
```

### ❌ "Invalid JSON format"

**Symptômes**:
```
SyntaxError: Unexpected token in JSON
```

**Causes possibles**:
1. Fichier JSON corrompu
2. Encodage incorrect
3. Génération interrompue

**Solutions**:

1. **Valider le JSON**:
```bash
# Tester la validité du JSON
python -c "import json; json.load(open('data/knowledge_embeddings.json'))"
```

2. **Régénérer les embeddings**:
```bash
cd rag-solution/01-scripts
python generate_static_embeddings.py
```

3. **Vérifier l'encodage**:
```python
# Dans generate_static_embeddings.py
with open('knowledge_embeddings.json', 'w', encoding='utf-8') as f:
    json.dump(embeddings_data, f, ensure_ascii=False, indent=2)
```

---

## 🔍 Problèmes de recherche

### ❌ "No search results found"

**Symptômes**:
- Recherche retourne un tableau vide
- Score toujours à 0
- Aucun matching

**Solutions**:

1. **Vérifier la requête**:
```javascript
// Debug de la requête
console.log("Query:", query);
console.log("Query words:", query.toLowerCase().split(/\s+/));

// Tester avec des termes simples
const results = await search.intelligentSearch("investissement");
```

2. **Examiner les données**:
```javascript
// Vérifier le contenu des chunks
const stats = search.getStats();
console.log("Total chunks:", stats.totalChunks);

// Inspecter un chunk
console.log("Sample chunk:", search.chunks[0]);
```

3. **Ajuster les paramètres**:
```javascript
// Réduire le score minimum
const results = await search.intelligentSearch("votre requête", {
    minScore: 0.01,  // Plus permissif
    maxResults: 10
});
```

### ❌ "Irrelevant search results"

**Symptômes**:
- Résultats non pertinents
- Scores incohérents
- Mauvais classement

**Solutions**:

1. **Améliorer les mots-clés**:
```javascript
// Ajouter des termes spécialisés dans isImportantTerm()
function isImportantTerm(word) {
    const importantTerms = [
        'investissement', 'portefeuille', 'diversification',
        'risque', 'rendement', 'pea', 'assurance-vie',
        // Ajouter vos termes métier
    ];
    return importantTerms.includes(word.toLowerCase());
}
```

2. **Optimiser le scoring**:
```javascript
// Ajuster les poids dans calculateKeywordScore()
if (text.toLowerCase().includes(word)) {
    score += 2;  // Augmenter le poids du match exact
}
if (keywords.includes(word)) {
    score += 1;  // Bonus pour mots-clés
}
```

3. **Utiliser la recherche hybride**:
```javascript
// Activer la recherche sémantique (si API disponible)
const results = await search.intelligentSearch(query, {
    useSemanticSearch: true
});
```

---

## 💾 Problèmes de performance

### ❌ "Search too slow"

**Symptômes**:
- Temps de recherche > 500ms
- Interface qui rame
- Browser qui freeze

**Solutions**:

1. **Optimiser le chargement**:
```javascript
// Chargement lazy des gros fichiers
let embeddings = null;
async function loadEmbeddingsLazy() {
    if (!embeddings) {
        embeddings = await loadJSON('knowledge_embeddings.json');
    }
    return embeddings;
}
```

2. **Implémenter un cache**:
```javascript
// Cache des recherches
const searchCache = new Map();

async function cachedSearch(query) {
    if (searchCache.has(query)) {
        return searchCache.get(query);
    }
    
    const results = await search.intelligentSearch(query);
    searchCache.set(query, results);
    return results;
}
```

3. **Limiter les résultats**:
```javascript
// Paramètres plus restrictifs
const results = await search.intelligentSearch(query, {
    maxResults: 3,     // Moins de résultats
    minScore: 0.3      // Score plus élevé
});
```

### ❌ "High memory usage"

**Symptômes**:
- RAM > 100MB pour la page
- Ralentissements du navigateur
- Plantages sur mobile

**Solutions**:

1. **Compression des données**:
```python
# Dans generate_static_embeddings.py
# Réduire la précision des embeddings
embedding = embedding.astype('float16')  # Au lieu de float32
```

2. **Chunking plus agressif**:
```python
# Réduire la taille des chunks
chunk_size = 200  # Au lieu de 300-500
overlap = 20      # Au lieu de 50
```

3. **Nettoyage mémoire**:
```javascript
// Nettoyer périodiquement
setInterval(() => {
    if (searchCache.size > 50) {
        searchCache.clear();
    }
}, 300000); // 5 minutes
```

---

## 🔧 Problèmes d'intégration

### ❌ "Functions not defined"

**Symptômes**:
```
ReferenceError: generateSmartResponse is not defined
```

**Solutions**:

1. **Vérifier l'ordre de chargement**:
```html
<!-- Ordre correct -->
<script src="js/vector-search.js"></script>
<script src="js/integration-functions.js"></script>
<script src="js/script-modifications.js"></script>
<script src="js/script.js"></script>
```

2. **Attendre l'initialisation**:
```javascript
// Attendre que tout soit prêt
document.addEventListener('DOMContentLoaded', async () => {
    await initializeVectorSearch();
    // Puis utiliser les fonctions
});
```

3. **Vérifier la portée**:
```javascript
// S'assurer que les fonctions sont globales
window.generateSmartResponse = generateSmartResponse;
```

### ❌ "DOM elements not found"

**Symptômes**:
```
TypeError: Cannot read property 'addEventListener' of null
```

**Solutions**:

1. **Vérifier les sélecteurs**:
```javascript
// Debug des éléments DOM
console.log("Button:", document.getElementById('simulate-btn'));
console.log("Form:", document.querySelector('#simulation-form'));

// Ajouter des vérifications
const button = document.getElementById('simulate-btn');
if (button) {
    button.addEventListener('click', handleSimulation);
} else {
    console.warn("Simulate button not found");
}
```

2. **Utiliser des sélecteurs robustes**:
```javascript
// Au lieu de IDs spécifiques
const form = document.querySelector('form[data-simulation]');
const results = document.querySelector('.simulation-results');
```

---

## 📱 Problèmes de compatibilité

### ❌ "Not working on mobile"

**Symptômes**:
- Fonctionnalité limitée sur mobile
- Erreurs spécifiques iOS/Android
- Performance dégradée

**Solutions**:

1. **Réduire la charge**:
```javascript
// Détecter mobile et adapter
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    // Version allégée
    const results = await search.keywordSearch(query, {
        maxResults: 3
    });
} else {
    // Version complète
    const results = await search.intelligentSearch(query);
}
```

2. **Optimisation touch**:
```javascript
// Gérer les événements touch
if ('ontouchstart' in window) {
    // Interface tactile
    button.addEventListener('touchstart', handleSimulation);
} else {
    // Interface souris
    button.addEventListener('click', handleSimulation);
}
```

### ❌ "Not working in older browsers"

**Symptômes**:
- Erreurs sur IE/vieux Safari
- Fonctionnalités ES6+ non supportées

**Solutions**:

1. **Polyfills**:
```javascript
// Polyfill pour fetch
if (!window.fetch) {
    // Utiliser XMLHttpRequest
    window.fetch = function(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = () => resolve({
                json: () => JSON.parse(xhr.responseText)
            });
            xhr.onerror = reject;
            xhr.send();
        });
    };
}
```

2. **Transpilation**:
```javascript
// Éviter les arrow functions, async/await en mode compat
function initializeVectorSearch() {
    return new Promise(function(resolve, reject) {
        // Code compatible ES5
    });
}
```

---

## 🔍 Outils de diagnostic

### Debug avancé

```javascript
// Mode debug complet
window.RAG_DEBUG = {
    enabled: true,
    logLevel: 'verbose',
    measurements: {
        searchTimes: [],
        memoryUsage: [],
        cacheHits: 0,
        cacheMisses: 0
    }
};

// Logger personnalisé
function debugLog(level, message, data = null) {
    if (window.RAG_DEBUG?.enabled) {
        console.log(`[RAG-${level.toUpperCase()}] ${message}`, data);
        
        // Stocker pour analyse
        if (!window.RAG_DEBUG.logs) window.RAG_DEBUG.logs = [];
        window.RAG_DEBUG.logs.push({
            timestamp: Date.now(),
            level,
            message,
            data
        });
    }
}

// Mesure de performance
function measureFunction(fn, name) {
    return async function(...args) {
        const start = performance.now();
        const result = await fn.apply(this, args);
        const duration = performance.now() - start;
        
        debugLog('perf', `${name} took ${duration.toFixed(2)}ms`);
        window.RAG_DEBUG.measurements.searchTimes.push(duration);
        
        return result;
    };
}

// Wrapper les fonctions importantes
const originalSearch = ClientVectorSearch.prototype.intelligentSearch;
ClientVectorSearch.prototype.intelligentSearch = measureFunction(originalSearch, 'intelligentSearch');
```

### Health check

```javascript
// Vérification de santé du système
async function healthCheck() {
    const report = {
        timestamp: new Date().toISOString(),
        status: 'unknown',
        checks: {}
    };
    
    try {
        // Test 1: Initialisation
        const search = new ClientVectorSearch();
        const initialized = await search.initialize();
        report.checks.initialization = initialized ? 'pass' : 'fail';
        
        // Test 2: Recherche de base
        const results = await search.intelligentSearch('test');
        report.checks.basicSearch = results.length > 0 ? 'pass' : 'fail';
        
        // Test 3: Performance
        const start = performance.now();
        await search.intelligentSearch('investissement');
        const duration = performance.now() - start;
        report.checks.performance = duration < 100 ? 'pass' : 'warn';
        
        // Test 4: Mémoire
        const memory = performance.memory?.usedJSHeapSize || 0;
        report.checks.memory = memory < 50 * 1024 * 1024 ? 'pass' : 'warn'; // 50MB
        
        // Statut global
        const failures = Object.values(report.checks).filter(status => status === 'fail').length;
        report.status = failures === 0 ? 'healthy' : 'degraded';
        
    } catch (error) {
        report.status = 'error';
        report.error = error.message;
    }
    
    return report;
}

// Utilisation
healthCheck().then(report => {
    console.log('🏥 Health Check Report:', report);
    
    if (report.status !== 'healthy') {
        console.warn('⚠️ System issues detected');
    }
});
```

### Monitoring en production

```javascript
// Monitoring automatique
class RAGMonitor {
    constructor() {
        this.metrics = {
            searches: 0,
            errors: 0,
            avgResponseTime: 0,
            totalResponseTime: 0
        };
        
        // Reporter périodique
        setInterval(() => this.report(), 60000); // 1 minute
    }
    
    recordSearch(duration, error = null) {
        this.metrics.searches++;
        this.metrics.totalResponseTime += duration;
        this.metrics.avgResponseTime = this.metrics.totalResponseTime / this.metrics.searches;
        
        if (error) {
            this.metrics.errors++;
            console.error('RAG Search Error:', error);
        }
    }
    
    report() {
        const errorRate = this.metrics.errors / this.metrics.searches;
        
        console.log('📊 RAG Metrics:', {
            searches: this.metrics.searches,
            avgResponseTime: this.metrics.avgResponseTime.toFixed(2) + 'ms',
            errorRate: (errorRate * 100).toFixed(2) + '%'
        });
        
        // Alertes
        if (errorRate > 0.05) {
            console.warn('🚨 High error rate detected:', errorRate);
        }
        
        if (this.metrics.avgResponseTime > 200) {
            console.warn('🐌 Slow response time:', this.metrics.avgResponseTime);
        }
    }
}

// Initialiser le monitoring
const monitor = new RAGMonitor();

// Wrapper pour monitoring automatique
const originalIntelligentSearch = ClientVectorSearch.prototype.intelligentSearch;
ClientVectorSearch.prototype.intelligentSearch = async function(...args) {
    const start = performance.now();
    try {
        const result = await originalIntelligentSearch.apply(this, args);
        monitor.recordSearch(performance.now() - start);
        return result;
    } catch (error) {
        monitor.recordSearch(performance.now() - start, error);
        throw error;
    }
};
```

---

## 📞 Support et ressources

### Contacts
- **Documentation**: Voir `README-AGENT.md` pour la vue d'ensemble
- **API**: Consulter `API-REFERENCE.md` pour les détails techniques
- **Architecture**: Lire `ARCHITECTURE.md` pour la compréhension système

### Logs utiles
```javascript
// Activer tous les logs de debug
localStorage.setItem('RAG_DEBUG', 'true');
localStorage.setItem('RAG_LOG_LEVEL', 'verbose');

// Exporter les logs pour analyse
const logs = window.RAG_DEBUG?.logs || [];
const exportData = JSON.stringify(logs, null, 2);
console.log('Export logs:', exportData);
```

### Check-list de dépannage

- [ ] Fichiers JSON présents et valides
- [ ] Serveur HTTP pour éviter CORS
- [ ] Scripts chargés dans le bon ordre
- [ ] Elements DOM disponibles
- [ ] Initialisation réussie
- [ ] Requêtes de test fonctionnelles
- [ ] Performance acceptable (< 200ms)
- [ ] Pas d'erreurs console
- [ ] Compatibilité navigateur OK
- [ ] Version mobile testée
