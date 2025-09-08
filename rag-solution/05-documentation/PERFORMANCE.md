# ⚡ Guide de performance - Solution RAG Frontend

## 🎯 Objectifs de performance

### Métriques cibles
| Métrique | Cible | Acceptable | Critique |
|----------|-------|------------|----------|
| Initialisation | < 2s | < 5s | > 10s |
| Première recherche | < 100ms | < 300ms | > 1s |
| Recherches suivantes | < 50ms | < 150ms | > 500ms |
| Mémoire utilisée | < 20MB | < 50MB | > 100MB |
| Taille des assets | < 5MB | < 15MB | > 30MB |
| Mobile (3G) | < 5s load | < 10s load | > 15s load |

---

## 📊 Profiling et mesures

### Outils de mesure intégrés

```javascript
// Performance monitor intégré
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            initTime: 0,
            searchTimes: [],
            memoryUsage: [],
            cacheStats: { hits: 0, misses: 0 },
            networkRequests: []
        };
    }
    
    startTimer(operation) {
        return {
            operation,
            startTime: performance.now(),
            end: () => {
                const duration = performance.now() - this.startTime;
                this.recordMetric(operation, duration);
                return duration;
            }
        };
    }
    
    recordMetric(operation, duration) {
        switch(operation) {
            case 'search':
                this.metrics.searchTimes.push(duration);
                break;
            case 'init':
                this.metrics.initTime = duration;
                break;
        }
    }
    
    getStats() {
        return {
            avgSearchTime: this.getAverage(this.metrics.searchTimes),
            maxSearchTime: Math.max(...this.metrics.searchTimes),
            minSearchTime: Math.min(...this.metrics.searchTimes),
            totalSearches: this.metrics.searchTimes.length,
            initTime: this.metrics.initTime,
            cacheHitRate: this.metrics.cacheStats.hits / 
                         (this.metrics.cacheStats.hits + this.metrics.cacheStats.misses),
            memoryUsage: this.getCurrentMemoryUsage()
        };
    }
    
    getCurrentMemoryUsage() {
        return performance.memory ? 
               Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 
               'Unknown';
    }
    
    getAverage(array) {
        return array.length > 0 ? 
               array.reduce((a, b) => a + b, 0) / array.length : 0;
    }
}

// Instance globale
window.ragPerformanceMonitor = new PerformanceMonitor();
```

### Intégration dans le code

```javascript
// Wrapper automatique pour mesures
function withPerformanceTracking(fn, operation) {
    return async function(...args) {
        const timer = window.ragPerformanceMonitor.startTimer(operation);
        try {
            const result = await fn.apply(this, args);
            timer.end();
            return result;
        } catch (error) {
            timer.end();
            throw error;
        }
    };
}

// Application aux méthodes critiques
ClientVectorSearch.prototype.initialize = withPerformanceTracking(
    ClientVectorSearch.prototype.initialize, 'init'
);

ClientVectorSearch.prototype.intelligentSearch = withPerformanceTracking(
    ClientVectorSearch.prototype.intelligentSearch, 'search'
);
```

---

## 🚀 Optimisations d'initialisation

### Chargement progressif

```javascript
// Chargement par priorité
class OptimizedVectorSearch extends ClientVectorSearch {
    async initialize() {
        // Phase 1: Configuration (critique)
        const configTimer = performance.now();
        this.config = await this.loadJSON('./data/embedding_config.json');
        console.log(`Config loaded in ${(performance.now() - configTimer).toFixed(2)}ms`);
        
        // Phase 2: Index de recherche (important)
        const indexTimer = performance.now();
        this.searchIndex = await this.loadJSON('./data/search_index.json');
        console.log(`Index loaded in ${(performance.now() - indexTimer).toFixed(2)}ms`);
        
        // Phase 3: Embeddings (lazy loading)
        this.embeddingsPromise = this.loadJSON('./data/knowledge_embeddings.json');
        
        // Marquer comme prêt pour recherche par mots-clés
        this.ready = true;
        
        // Charger embeddings en arrière-plan
        this.embeddings = await this.embeddingsPromise;
        this.fullyReady = true;
        
        return true;
    }
    
    async intelligentSearch(query, options = {}) {
        // Recherche immédiate par mots-clés si embeddings pas encore chargés
        if (this.ready && !this.fullyReady) {
            console.log('Using keyword-only search (embeddings loading...)');
            return this.keywordSearch(query, options);
        }
        
        // Attendre embeddings si nécessaire
        if (!this.fullyReady) {
            await this.embeddingsPromise;
            this.fullyReady = true;
        }
        
        // Recherche complète
        return super.intelligentSearch(query, options);
    }
}
```

### Compression et optimisation des données

```python
# Dans generate_static_embeddings.py - Optimisations de génération

class OptimizedEmbeddingGenerator(StaticEmbeddingGenerator):
    def __init__(self):
        super().__init__()
        self.compression_enabled = True
        self.precision_optimization = True
    
    def optimize_embeddings(self, embeddings):
        """Optimise les embeddings pour le web"""
        if self.precision_optimization:
            # Réduire la précision (384 float32 -> 384 int16)
            # Économie: ~50% de taille
            embeddings = self.quantize_embeddings(embeddings)
        
        return embeddings
    
    def quantize_embeddings(self, embeddings, scale=10000):
        """Quantification des embeddings en int16"""
        # Normaliser et convertir en entiers
        embeddings_quantized = []
        for embedding in embeddings:
            # Multiplier par scale et convertir en int16
            quantized = (np.array(embedding) * scale).astype(np.int16)
            embeddings_quantized.append(quantized.tolist())
        
        return embeddings_quantized
    
    def generate_compressed_assets(self, pdf_path, output_dir):
        """Génère des assets optimisés pour le web"""
        # Générer les embeddings standard
        chunks, embeddings = self.process_pdf(pdf_path)
        
        # Optimiser les données
        optimized_embeddings = self.optimize_embeddings(embeddings)
        
        # Créer index de recherche minimal
        search_index = {
            "chunks": [
                {
                    "id": i,
                    "text_preview": chunk["text"][:100] + "...",
                    "keywords": self.extract_keywords(chunk["text"]),
                    "page": chunk["page_number"]
                }
                for i, chunk in enumerate(chunks)
            ]
        }
        
        # Sauvegarder avec compression
        self.save_compressed_json(
            optimized_embeddings, 
            os.path.join(output_dir, "knowledge_embeddings_optimized.json")
        )
        
        self.save_compressed_json(
            search_index,
            os.path.join(output_dir, "search_index_optimized.json")
        )
    
    def save_compressed_json(self, data, filepath):
        """Sauvegarde JSON avec compression maximale"""
        import gzip
        
        # Version standard (pour compatibilité)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, separators=(',', ':'))  # Pas d'espaces
        
        # Version compressée (optionnelle)
        with gzip.open(filepath + '.gz', 'wt', encoding='utf-8') as f:
            json.dump(data, f, separators=(',', ':'))
        
        # Stats de compression
        original_size = os.path.getsize(filepath)
        compressed_size = os.path.getsize(filepath + '.gz')
        print(f"Compression: {original_size} -> {compressed_size} bytes "
              f"({compressed_size/original_size*100:.1f}%)")
```

### Décompression côté client

```javascript
// Support de la décompression automatique
class CompressedVectorSearch extends OptimizedVectorSearch {
    async loadJSON(url) {
        // Essayer la version compressée d'abord
        try {
            const compressedUrl = url + '.gz';
            const response = await fetch(compressedUrl);
            
            if (response.ok) {
                const compressedData = await response.arrayBuffer();
                const decompressed = this.decompressGzip(compressedData);
                return JSON.parse(decompressed);
            }
        } catch (error) {
            console.log('Compressed version not available, using standard');
        }
        
        // Fallback vers version standard
        return super.loadJSON(url);
    }
    
    decompressGzip(compressedData) {
        // Utiliser la API de décompression du navigateur
        const stream = new DecompressionStream('gzip');
        const decompressedStream = new Response(compressedData)
            .body
            .pipeThrough(stream);
        
        return new Response(decompressedStream).text();
    }
    
    // Déquantification des embeddings
    dequantizeEmbeddings(quantizedEmbeddings, scale = 10000) {
        return quantizedEmbeddings.map(embedding => 
            embedding.map(value => value / scale)
        );
    }
}
```

---

## 🧠 Optimisations de recherche

### Cache intelligent

```javascript
// Cache multi-niveaux avec LRU
class IntelligentCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.accessTimes = new Map();
    }
    
    get(key) {
        if (this.cache.has(key)) {
            // Mettre à jour le temps d'accès
            this.accessTimes.set(key, Date.now());
            window.ragPerformanceMonitor.metrics.cacheStats.hits++;
            return this.cache.get(key);
        }
        
        window.ragPerformanceMonitor.metrics.cacheStats.misses++;
        return null;
    }
    
    set(key, value) {
        // Éviction LRU si cache plein
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }
        
        this.cache.set(key, value);
        this.accessTimes.set(key, Date.now());
    }
    
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, time] of this.accessTimes) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.accessTimes.delete(oldestKey);
        }
    }
    
    clear() {
        this.cache.clear();
        this.accessTimes.clear();
    }
    
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: window.ragPerformanceMonitor.metrics.cacheStats.hits /
                    (window.ragPerformanceMonitor.metrics.cacheStats.hits + 
                     window.ragPerformanceMonitor.metrics.cacheStats.misses)
        };
    }
}

// Intégration du cache
class CachedVectorSearch extends CompressedVectorSearch {
    constructor() {
        super();
        this.searchCache = new IntelligentCache(50);
        this.embeddingCache = new IntelligentCache(20);
    }
    
    async intelligentSearch(query, options = {}) {
        // Clé de cache basée sur query + options
        const cacheKey = this.generateCacheKey(query, options);
        
        // Vérifier le cache
        const cached = this.searchCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        
        // Recherche réelle
        const results = await super.intelligentSearch(query, options);
        
        // Mettre en cache
        this.searchCache.set(cacheKey, results);
        
        return results;
    }
    
    generateCacheKey(query, options) {
        return `${query.toLowerCase()}_${JSON.stringify(options)}`;
    }
}
```

### Recherche optimisée par index

```javascript
// Index inversé pour recherche ultra-rapide
class IndexedVectorSearch extends CachedVectorSearch {
    constructor() {
        super();
        this.wordIndex = new Map();
        this.bigramIndex = new Map();
    }
    
    async initialize() {
        await super.initialize();
        
        // Construire l'index inversé
        this.buildInvertedIndex();
        
        return true;
    }
    
    buildInvertedIndex() {
        console.log('Building inverted index...');
        const start = performance.now();
        
        this.chunks?.forEach((chunk, chunkIndex) => {
            const words = this.extractWords(chunk.text);
            
            // Index par mots
            words.forEach(word => {
                if (!this.wordIndex.has(word)) {
                    this.wordIndex.set(word, new Set());
                }
                this.wordIndex.get(word).add(chunkIndex);
            });
            
            // Index par bigrammes (groupes de 2 mots)
            for (let i = 0; i < words.length - 1; i++) {
                const bigram = `${words[i]} ${words[i + 1]}`;
                if (!this.bigramIndex.has(bigram)) {
                    this.bigramIndex.set(bigram, new Set());
                }
                this.bigramIndex.get(bigram).add(chunkIndex);
            }
        });
        
        console.log(`Index built in ${(performance.now() - start).toFixed(2)}ms`);
        console.log(`Word index: ${this.wordIndex.size} terms`);
        console.log(`Bigram index: ${this.bigramIndex.size} bigrams`);
    }
    
    fastKeywordSearch(query, options = {}) {
        const queryWords = this.extractWords(query);
        const candidateChunks = new Set();
        
        // Recherche par intersection d'index
        queryWords.forEach((word, index) => {
            const wordMatches = this.wordIndex.get(word) || new Set();
            
            if (index === 0) {
                // Premier mot: ajouter tous les matches
                wordMatches.forEach(chunkIndex => candidateChunks.add(chunkIndex));
            } else {
                // Mots suivants: intersection
                const toRemove = [];
                candidateChunks.forEach(chunkIndex => {
                    if (!wordMatches.has(chunkIndex)) {
                        toRemove.push(chunkIndex);
                    }
                });
                toRemove.forEach(chunkIndex => candidateChunks.delete(chunkIndex));
            }
        });
        
        // Score et tri des candidats
        const results = Array.from(candidateChunks)
            .map(chunkIndex => {
                const chunk = this.chunks[chunkIndex];
                const score = this.calculateKeywordScore(queryWords, chunk.text, chunk.keywords || []);
                
                return {
                    ...chunk,
                    score,
                    match_type: 'keyword_indexed'
                };
            })
            .filter(result => result.score >= (options.minScore || 0.1))
            .sort((a, b) => b.score - a.score)
            .slice(0, options.maxResults || 5);
        
        return results;
    }
    
    extractWords(text) {
        return text.toLowerCase()
            .replace(/[^\w\sàâäéêëèïîôöùûüÿç]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
}
```

---

## 💾 Optimisations mémoire

### Lazy loading et streaming

```javascript
// Chargement paresseux des gros objets
class MemoryOptimizedSearch extends IndexedVectorSearch {
    constructor() {
        super();
        this.embeddingsLoaded = false;
        this.chunksLoaded = false;
        this.maxMemoryUsage = 50 * 1024 * 1024; // 50MB
    }
    
    async loadChunksOnDemand() {
        if (!this.chunksLoaded) {
            console.log('Loading chunks on demand...');
            this.chunks = await this.loadJSON('./data/search_index.json');
            this.chunksLoaded = true;
            this.checkMemoryUsage();
        }
    }
    
    async loadEmbeddingsOnDemand() {
        if (!this.embeddingsLoaded) {
            console.log('Loading embeddings on demand...');
            this.embeddings = await this.loadJSON('./data/knowledge_embeddings.json');
            this.embeddingsLoaded = true;
            this.checkMemoryUsage();
        }
    }
    
    checkMemoryUsage() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            console.log(`Memory usage: ${Math.round(used / 1024 / 1024)}MB`);
            
            if (used > this.maxMemoryUsage) {
                console.warn('High memory usage detected, cleaning up...');
                this.cleanup();
            }
        }
    }
    
    cleanup() {
        // Nettoyer les caches
        this.searchCache.clear();
        this.embeddingCache.clear();
        
        // Forcer garbage collection si possible
        if (window.gc) {
            window.gc();
        }
        
        console.log('Memory cleanup completed');
    }
    
    async intelligentSearch(query, options = {}) {
        // Recherche par index d'abord (plus rapide)
        await this.loadChunksOnDemand();
        
        if (options.useSemanticSearch) {
            await this.loadEmbeddingsOnDemand();
            return super.intelligentSearch(query, options);
        } else {
            return this.fastKeywordSearch(query, options);
        }
    }
}
```

### Streaming et chunking

```javascript
// Traitement par streams pour gros fichiers
class StreamingVectorSearch extends MemoryOptimizedSearch {
    async loadJSONStreaming(url, onChunk) {
        const response = await fetch(url);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let buffer = '';
        let chunks = [];
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            // Traiter les chunks complets
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Garder la ligne incomplète
            
            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const chunk = JSON.parse(line);
                        chunks.push(chunk);
                        
                        // Traitement par batch
                        if (chunks.length >= 10) {
                            onChunk(chunks);
                            chunks = [];
                        }
                    } catch (e) {
                        // Ignorer les lignes mal formées
                    }
                }
            }
        }
        
        // Traiter les chunks restants
        if (chunks.length > 0) {
            onChunk(chunks);
        }
    }
    
    async initializeStreaming() {
        console.log('Initializing with streaming...');
        
        // Charger la configuration normalement
        this.config = await this.loadJSON('./data/embedding_config.json');
        
        // Charger les chunks par streaming
        let totalChunks = 0;
        await this.loadJSONStreaming('./data/search_index.json', (chunkBatch) => {
            if (!this.chunks) this.chunks = [];
            this.chunks.push(...chunkBatch);
            totalChunks += chunkBatch.length;
            
            console.log(`Loaded ${totalChunks} chunks...`);
        });
        
        // Construire l'index au fur et à mesure
        this.buildInvertedIndex();
        
        console.log(`Streaming initialization complete: ${totalChunks} chunks`);
        return true;
    }
}
```

---

## 📱 Optimisations mobile

### Adaptation automatique

```javascript
// Détection et adaptation mobile
class MobileOptimizedSearch extends StreamingVectorSearch {
    constructor() {
        super();
        this.isMobile = this.detectMobile();
        this.isLowEnd = this.detectLowEndDevice();
        
        if (this.isMobile) {
            this.applyMobileOptimizations();
        }
    }
    
    detectMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    detectLowEndDevice() {
        // Heuristiques pour détecter appareils bas de gamme
        const memory = navigator.deviceMemory || 4; // GB
        const cores = navigator.hardwareConcurrency || 4;
        const connection = navigator.connection?.effectiveType || '4g';
        
        return memory < 3 || cores < 4 || ['slow-2g', '2g', '3g'].includes(connection);
    }
    
    applyMobileOptimizations() {
        console.log('Applying mobile optimizations...');
        
        // Réduire les caches
        this.searchCache = new IntelligentCache(20);
        this.embeddingCache = new IntelligentCache(5);
        
        // Limiter la mémoire
        this.maxMemoryUsage = 20 * 1024 * 1024; // 20MB
        
        // Paramètres de recherche plus conservateurs
        this.defaultSearchOptions = {
            maxResults: 3,
            minScore: 0.2
        };
        
        // Désactiver la recherche sémantique par défaut
        this.semanticSearchEnabled = false;
    }
    
    async intelligentSearch(query, options = {}) {
        // Fusionner avec les options par défaut
        const finalOptions = {
            ...this.defaultSearchOptions,
            ...options
        };
        
        // Sur mobile, toujours privilégier la recherche par mots-clés
        if (this.isMobile && !options.forceSemanticSearch) {
            finalOptions.useSemanticSearch = false;
        }
        
        return super.intelligentSearch(query, finalOptions);
    }
}
```

### Progressive Web App optimizations

```javascript
// Service Worker pour cache intelligent
const CACHE_NAME = 'rag-cache-v1';
const CRITICAL_RESOURCES = [
    './data/embedding_config.json',
    './data/search_index.json'
];

// Dans le service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CRITICAL_RESOURCES);
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.url.includes('/data/')) {
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                });
            })
        );
    }
});
```

---

## 📈 Monitoring et alertes

### Dashboard de performance

```javascript
// Dashboard temps réel
class PerformanceDashboard {
    constructor() {
        this.metrics = window.ragPerformanceMonitor;
        this.updateInterval = 5000; // 5 secondes
        this.thresholds = {
            searchTime: 200,     // ms
            memoryUsage: 50,     // MB
            errorRate: 0.05,     // 5%
            cacheHitRate: 0.7    // 70%
        };
    }
    
    start() {
        this.intervalId = setInterval(() => {
            this.updateDashboard();
            this.checkAlerts();
        }, this.updateInterval);
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    
    updateDashboard() {
        const stats = this.metrics.getStats();
        
        console.log('📊 RAG Performance Dashboard:', {
            'Avg Search Time': `${stats.avgSearchTime.toFixed(2)}ms`,
            'Total Searches': stats.totalSearches,
            'Cache Hit Rate': `${(stats.cacheHitRate * 100).toFixed(1)}%`,
            'Memory Usage': `${stats.memoryUsage}MB`,
            'Init Time': `${stats.initTime.toFixed(2)}ms`
        });
    }
    
    checkAlerts() {
        const stats = this.metrics.getStats();
        
        if (stats.avgSearchTime > this.thresholds.searchTime) {
            this.alert('🐌 Slow Search Performance', 
                      `Average: ${stats.avgSearchTime.toFixed(2)}ms`);
        }
        
        if (stats.memoryUsage > this.thresholds.memoryUsage) {
            this.alert('💾 High Memory Usage', 
                      `Current: ${stats.memoryUsage}MB`);
        }
        
        if (stats.cacheHitRate < this.thresholds.cacheHitRate) {
            this.alert('📉 Low Cache Efficiency', 
                      `Hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
        }
    }
    
    alert(title, message) {
        console.warn(`${title}: ${message}`);
        
        // Optionnel: envoyer à un service de monitoring
        if (window.analytics) {
            window.analytics.track('performance_alert', {
                title,
                message,
                timestamp: Date.now()
            });
        }
    }
}

// Démarrer le monitoring
const dashboard = new PerformanceDashboard();
dashboard.start();
```

### Export de métriques

```javascript
// Export pour analyse externe
function exportPerformanceReport() {
    const stats = window.ragPerformanceMonitor.getStats();
    const timestamp = new Date().toISOString();
    
    const report = {
        timestamp,
        browser: {
            userAgent: navigator.userAgent,
            memory: navigator.deviceMemory,
            cores: navigator.hardwareConcurrency,
            connection: navigator.connection?.effectiveType
        },
        performance: stats,
        environment: {
            isMobile: window.innerWidth < 768,
            screenResolution: `${screen.width}x${screen.height}`,
            pixelRatio: window.devicePixelRatio
        }
    };
    
    // Export au format JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], 
                         { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `rag-performance-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    return report;
}

// Raccourci console
window.exportRAGPerformance = exportPerformanceReport;
```

---

## 🎯 Recommandations finales

### Checklist d'optimisation

#### Phase 1: Critique (< 2MB, < 3s init)
- [ ] Compression des JSON
- [ ] Index de recherche minimal
- [ ] Cache des requêtes fréquentes
- [ ] Chargement asynchrone

#### Phase 2: Important (< 5MB, < 1s search)
- [ ] Embeddings quantifiés
- [ ] Index inversé complet
- [ ] Service Worker
- [ ] Optimisations mobile

#### Phase 3: Avancé (streaming, monitoring)
- [ ] Streaming des gros fichiers
- [ ] Monitoring temps réel
- [ ] Adaptation dynamique
- [ ] Analytics avancées

### Profils de déploiement

```javascript
// Configuration par environnement
const PERFORMANCE_PROFILES = {
    development: {
        enableDebug: true,
        maxCacheSize: 100,
        enableStreaming: false,
        compressionLevel: 'none'
    },
    
    production: {
        enableDebug: false,
        maxCacheSize: 50,
        enableStreaming: true,
        compressionLevel: 'max'
    },
    
    mobile: {
        enableDebug: false,
        maxCacheSize: 20,
        enableStreaming: false,
        compressionLevel: 'medium',
        maxResults: 3,
        semanticSearchEnabled: false
    }
};

// Application automatique
function applyPerformanceProfile() {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isDevelopment = location.hostname === 'localhost';
    
    let profile = 'production';
    if (isDevelopment) profile = 'development';
    if (isMobile) profile = 'mobile';
    
    const config = PERFORMANCE_PROFILES[profile];
    console.log(`Applying ${profile} performance profile:`, config);
    
    return config;
}
```
