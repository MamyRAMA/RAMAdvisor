# 📚 Référence API - Solution RAG Frontend

## 🎯 Vue d'ensemble

Cette référence documente toutes les classes, méthodes et fonctions disponibles dans la solution RAG frontend-only.

---

## 🧠 ClientVectorSearch Class

### Constructeur

```javascript
const search = new ClientVectorSearch();
```

**Description**: Initialise une nouvelle instance du moteur de recherche vectorielle.

**Paramètres**: Aucun

**Retour**: Instance de `ClientVectorSearch`

### Méthodes principales

#### `initialize()`
```javascript
await search.initialize();
```

**Description**: Charge les données d'embeddings et configure le moteur de recherche.

**Retour**: `Promise<boolean>` - `true` si initialisé avec succès

**Exceptions**:
- `Error`: Si le chargement des fichiers JSON échoue
- `TypeError`: Si les données sont mal formatées

**Exemple**:
```javascript
try {
    const isReady = await search.initialize();
    if (isReady) {
        console.log("Moteur de recherche prêt");
    }
} catch (error) {
    console.error("Erreur d'initialisation:", error);
}
```

#### `intelligentSearch(query, options)`
```javascript
const results = await search.intelligentSearch("investissement PEA", {
    maxResults: 5,
    minScore: 0.1
});
```

**Description**: Effectue une recherche hybride combinant mots-clés et sémantique.

**Paramètres**:
- `query` (string): Requête de recherche
- `options` (object, optionnel):
  - `maxResults` (number): Nombre max de résultats (défaut: 5)
  - `minScore` (number): Score minimum requis (défaut: 0.1)
  - `useSemanticSearch` (boolean): Activer recherche sémantique (défaut: false)

**Retour**: `Promise<Array<SearchResult>>`

**Format SearchResult**:
```javascript
{
    id: 0,                              // ID unique du chunk
    text: "Contenu du chunk...",        // Texte complet
    score: 0.85,                        // Score de pertinence (0-1)
    source_file: "course.pdf",          // Fichier source
    page_number: 1,                     // Numéro de page
    chunk_index: 0,                     // Index du chunk
    preview: "Aperçu 100 chars...",     // Aperçu court
    keywords: ["investissement", "PEA"], // Mots-clés extraits
    match_type: "keyword"               // Type de match: "keyword"|"semantic"|"hybrid"
}
```

#### `keywordSearch(query, options)`
```javascript
const results = search.keywordSearch("diversification portefeuille", {
    maxResults: 3
});
```

**Description**: Recherche basée uniquement sur les mots-clés avec matching intelligent.

**Paramètres**:
- `query` (string): Requête de recherche
- `options` (object, optionnel):
  - `maxResults` (number): Nombre max de résultats (défaut: 5)
  - `exactMatch` (boolean): Priorité au matching exact (défaut: false)
  - `includeVariants` (boolean): Inclure variantes de mots (défaut: true)

**Retour**: `Array<SearchResult>`

#### `getStats()`
```javascript
const stats = search.getStats();
```

**Description**: Retourne les statistiques du système.

**Retour**: `Object`
```javascript
{
    isReady: true,                      // Moteur initialisé
    totalChunks: 25,                    // Nombre total de chunks
    embeddingDimension: 384,            // Dimension des embeddings
    modelName: "all-MiniLM-L6-v2",     // Nom du modèle
    sourceFile: "course.pdf",          // Fichier source
    generatedAt: "2025-09-08T10:00:00Z", // Date de génération
    lastSearchQuery: "investissement",   // Dernière recherche
    totalSearches: 15,                  // Nombre de recherches totales
    avgSearchTime: 45                   // Temps moyen de recherche (ms)
}
```

---

## 🔧 Fonctions utilitaires

### `calculateKeywordScore(queryWords, text, keywords)`
```javascript
const score = calculateKeywordScore(
    ["investissement", "risque"],
    "L'investissement comporte des risques",
    ["investissement", "risque", "portefeuille"]
);
```

**Description**: Calcule le score de pertinence basé sur les mots-clés.

**Paramètres**:
- `queryWords` (Array<string>): Mots de la requête
- `text` (string): Texte à analyser
- `keywords` (Array<string>): Mots-clés pré-extraits

**Retour**: `number` - Score entre 0 et 1

**Algorithme**:
- Match exact: +1 point
- Keyword bonus: +0.5 point
- Terme important: +0.3 point
- Variante/inflexion: +0.5 point

### `cosineSimilarity(vectorA, vectorB)`
```javascript
const similarity = cosineSimilarity([0.1, 0.2, 0.3], [0.15, 0.25, 0.35]);
```

**Description**: Calcule la similarité cosinus entre deux vecteurs.

**Paramètres**:
- `vectorA` (Array<number>): Premier vecteur (embedding)
- `vectorB` (Array<number>): Deuxième vecteur (embedding)

**Retour**: `number` - Similarité entre -1 et 1

**Note**: Les vecteurs doivent être de même dimension.

### `normalizeVector(vector)`
```javascript
const normalized = normalizeVector([1, 2, 3]);
// Résultat: [0.267, 0.535, 0.802]
```

**Description**: Normalise un vecteur (norme L2 = 1).

**Paramètres**:
- `vector` (Array<number>): Vecteur à normaliser

**Retour**: `Array<number>` - Vecteur normalisé

---

## 📊 Fonctions d'intégration

### `initializeVectorSearch()`
```javascript
await initializeVectorSearch();
```

**Description**: Initialise le moteur de recherche global et configure les event listeners.

**Retour**: `Promise<void>`

**Effets de bord**:
- Configure `window.vectorSearch`
- Attache les événements de simulation
- Active les boutons d'interface

### `generateSmartResponse(query, profile)`
```javascript
const response = await generateSmartResponse(
    "Comment diversifier mon portefeuille ?",
    {
        age: 35,
        riskTolerance: "modéré",
        investmentGoal: "retraite",
        monthlyAmount: 500
    }
);
```

**Description**: Génère une réponse contextualisée basée sur le profil utilisateur.

**Paramètres**:
- `query` (string): Question de l'utilisateur
- `profile` (object): Profil d'investissement
  - `age` (number): Âge de l'utilisateur
  - `riskTolerance` (string): "conservateur"|"modéré"|"agressif"
  - `investmentGoal` (string): "court-terme"|"moyen-terme"|"retraite"
  - `monthlyAmount` (number): Montant mensuel disponible

**Retour**: `Promise<Object>`
```javascript
{
    analysis: "Votre profil indique...",       // Analyse personnalisée
    recommendations: [                         // Recommandations spécifiques
        {
            strategy: "Diversification",
            allocation: { actions: 60, obligations: 40 },
            reasoning: "Étant donné votre âge..."
        }
    ],
    projections: {                            // Projections financières
        year5: 45000,
        year10: 120000,
        year20: 280000
    },
    sources: [                               // Sources utilisées
        { text: "...", page: 5, score: 0.9 }
    ]
}
```

### `calculateDetailedProjections(initial, monthly, profile)`
```javascript
const projections = calculateDetailedProjections(10000, 500, {
    riskTolerance: "modéré",
    timeHorizon: 20
});
```

**Description**: Calcule des projections financières détaillées avec différents scenarios.

**Paramètres**:
- `initial` (number): Capital initial
- `monthly` (number): Versement mensuel
- `profile` (object): Profil de risque

**Retour**: `Object`
```javascript
{
    conservative: {
        rate: 0.04,                    // 4% annuel
        projections: [                 // Par année
            { year: 1, value: 16120, gains: 120 },
            { year: 5, value: 35000, gains: 5000 },
            // ...
        ],
        finalValue: 280000,
        totalInvested: 250000,
        totalGains: 30000
    },
    moderate: { /* ... */ },
    aggressive: { /* ... */ }
}
```

---

## 🎨 Fonctions d'interface

### `displaySimulationResults(results, containerId)`
```javascript
displaySimulationResults(projections, "simulation-results");
```

**Description**: Affiche les résultats de simulation dans un conteneur HTML.

**Paramètres**:
- `results` (object): Résultats de `calculateDetailedProjections`
- `containerId` (string): ID du conteneur HTML

**Effets de bord**: Modifie le DOM pour afficher tableaux et graphiques.

### `showSmartInsights(recommendations, containerId)`
```javascript
showSmartInsights(smartResponse.recommendations, "insights-panel");
```

**Description**: Affiche les recommandations intelligentes avec styling.

**Paramètres**:
- `recommendations` (Array): Recommandations de `generateSmartResponse`
- `containerId` (string): ID du conteneur HTML

---

## 🔍 Fonctions de recherche avancée

### `searchWithContext(query, context)`
```javascript
const results = await searchWithContext(
    "allocation d'actifs",
    {
        userAge: 30,
        riskProfile: "modéré",
        previousSearches: ["diversification", "ETF"]
    }
);
```

**Description**: Recherche avec prise en compte du contexte utilisateur.

**Paramètres**:
- `query` (string): Requête principale
- `context` (object): Contexte additionnel

**Retour**: `Promise<Array<SearchResult>>` avec scoring ajusté

### `getRelatedConcepts(query)`
```javascript
const related = getRelatedConcepts("PEA");
// Retourne: ["assurance vie", "compte-titres", "défiscalisation"]
```

**Description**: Trouve des concepts liés à la requête.

**Paramètres**:
- `query` (string): Concept de base

**Retour**: `Array<string>` - Concepts reliés

---

## 📈 Fonctions de performance

### `measureSearchPerformance()`
```javascript
const perf = measureSearchPerformance();
```

**Description**: Mesure les performances du système de recherche.

**Retour**: `Object`
```javascript
{
    avgSearchTime: 45,        // ms
    searchCount: 127,
    cacheHitRate: 0.85,
    memoryUsage: 12.5,        // MB
    errorRate: 0.02           // 2%
}
```

### `optimizeSearchCache()`
```javascript
optimizeSearchCache();
```

**Description**: Optimise le cache de recherche (supprime les entrées anciennes).

**Effets de bord**: Nettoie `searchCache` interne

---

## 🛠️ Fonctions de configuration

### `updateSearchConfig(config)`
```javascript
updateSearchConfig({
    maxResults: 10,
    minScore: 0.15,
    enableSemanticSearch: true
});
```

**Description**: Met à jour la configuration du moteur de recherche.

**Paramètres**:
- `config` (object): Nouvelle configuration

### `enableDebugMode(enabled)`
```javascript
enableDebugMode(true);
```

**Description**: Active/désactive le mode debug avec logs détaillés.

**Paramètres**:
- `enabled` (boolean): État du mode debug

---

## 🚨 Gestion d'erreurs

### Types d'erreurs

#### `SearchError`
```javascript
try {
    await search.intelligentSearch("");
} catch (error) {
    if (error instanceof SearchError) {
        console.log("Erreur de recherche:", error.message);
    }
}
```

**Codes d'erreur**:
- `EMPTY_QUERY`: Requête vide
- `INITIALIZATION_FAILED`: Échec d'initialisation
- `INVALID_CONFIG`: Configuration invalide
- `NETWORK_ERROR`: Erreur de chargement des données

#### `ValidationError`
```javascript
// Validation automatique des entrées
function validateSearchQuery(query) {
    if (!query || query.trim().length === 0) {
        throw new ValidationError("Query cannot be empty");
    }
    if (query.length > 500) {
        throw new ValidationError("Query too long");
    }
    return true;
}
```

---

## 📝 Exemples d'usage complets

### Intégration basique
```javascript
// 1. Initialisation
const search = new ClientVectorSearch();
await search.initialize();

// 2. Recherche simple
const results = await search.intelligentSearch("diversification");

// 3. Affichage
results.forEach(result => {
    console.log(`${result.score.toFixed(2)}: ${result.preview}`);
});
```

### Intégration avancée
```javascript
// Configuration complète avec gestion d'erreurs
class InvestmentAdvisor {
    constructor() {
        this.search = new ClientVectorSearch();
        this.initialized = false;
    }
    
    async init() {
        try {
            this.initialized = await this.search.initialize();
            enableDebugMode(true);
            return this.initialized;
        } catch (error) {
            console.error("Initialization failed:", error);
            return false;
        }
    }
    
    async getAdvice(query, userProfile) {
        if (!this.initialized) {
            throw new Error("Advisor not initialized");
        }
        
        // Recherche contextuelle
        const results = await searchWithContext(query, {
            age: userProfile.age,
            riskProfile: userProfile.riskTolerance
        });
        
        // Génération de recommandations
        const response = await generateSmartResponse(query, userProfile);
        
        // Calculs financiers
        const projections = calculateDetailedProjections(
            userProfile.initialAmount,
            userProfile.monthlyAmount,
            userProfile
        );
        
        return {
            searchResults: results,
            recommendations: response.recommendations,
            projections: projections,
            performance: measureSearchPerformance()
        };
    }
}

// Usage
const advisor = new InvestmentAdvisor();
await advisor.init();

const advice = await advisor.getAdvice(
    "Comment investir pour la retraite ?",
    {
        age: 35,
        riskTolerance: "modéré",
        initialAmount: 10000,
        monthlyAmount: 500
    }
);
```

### Test et validation
```javascript
// Suite de tests pour validation
async function runValidationTests() {
    const search = new ClientVectorSearch();
    
    console.log("🧪 Tests de validation");
    
    // Test 1: Initialisation
    const initialized = await search.initialize();
    console.assert(initialized, "❌ Initialization failed");
    console.log("✅ Initialization successful");
    
    // Test 2: Recherche basique
    const results = await search.intelligentSearch("investissement");
    console.assert(results.length > 0, "❌ No search results");
    console.log(`✅ Search returned ${results.length} results`);
    
    // Test 3: Scoring
    const topResult = results[0];
    console.assert(topResult.score > 0, "❌ Invalid scoring");
    console.log(`✅ Top result score: ${topResult.score.toFixed(3)}`);
    
    // Test 4: Performance
    const stats = search.getStats();
    console.assert(stats.avgSearchTime < 100, "❌ Search too slow");
    console.log(`✅ Average search time: ${stats.avgSearchTime}ms`);
    
    console.log("🎉 All validation tests passed!");
}

// Exécution des tests
runValidationTests().catch(console.error);
```

---

## 🔗 Références externes

- [Sentence Transformers](https://www.sbert.net/) - Modèle d'embeddings utilisé
- [Similarité cosinus](https://fr.wikipedia.org/wiki/Similarité_cosinus) - Algorithme de base
- [TF-IDF](https://fr.wikipedia.org/wiki/TF-IDF) - Inspiration pour le scoring de mots-clés
