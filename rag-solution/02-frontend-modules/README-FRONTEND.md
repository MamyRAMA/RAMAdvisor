# 🎨 Modules Frontend - Recherche Vectorielle

## 📁 Fichiers de ce répertoire

### `vector-search.js`
**Module principal** de recherche vectorielle côté client
- Charge les embeddings depuis des fichiers JSON
- Effectue la recherche par mots-clés intelligente
- Calcule les scores de pertinence
- Génère des aperçus contextuels

### `script-modifications.js`
**Modifications** à apporter à votre script.js principal
- Initialisation de la recherche vectorielle
- Nouvelle fonction de simulation d'investissement
- Intégration avec l'interface utilisateur

### `integration-functions.js`
**Fonctions utilitaires** pour calculs et recommandations
- Calculs financiers avancés
- Analyse contextuelle des documents
- Génération de recommandations personnalisées
- Fonctions de fallback et debug

## 🔧 Intégration étape par étape

### Étape 1: Ajouter le module de recherche
```html
<!-- Dans votre HTML, avant script.js -->
<script src="js/vector-search.js"></script>
<script src="js/script.js"></script>
```

### Étape 2: Modifier votre script.js
1. **Ajoutez la variable globale** (début du fichier)
```javascript
let vectorSearch = null;
```

2. **Remplacez DOMContentLoaded** par le code de `script-modifications.js`

3. **Ajoutez les fonctions utilitaires** de `integration-functions.js`

### Étape 3: Vérifier les IDs HTML
Assurez-vous que votre HTML contient ces éléments :
```html
<input id="goal" />
<input id="initialAmount" />
<input id="monthlyAmount" />
<select id="riskProfile">
  <option value="Prudent">Prudent</option>
  <option value="Équilibré">Équilibré</option>
  <option value="Dynamique">Dynamique</option>
  <option value="Agressif">Agressif</option>
</select>
<button id="simulateBtn">
  <span>Lancer la simulation</span>
</button>
<div id="simulationResult" class="hidden">
  <div id="loadingSpinner">Chargement...</div>
  <div id="resultText"></div>
</div>
```

## ⚙️ Configuration

### Chemins des données
Dans `vector-search.js`, modifiez si nécessaire :
```javascript
this.baseUrl = './data/'; // ← Chemin vers vos fichiers JSON
```

### Mots-clés spécialisés
Personnalisez la liste dans `isImportantTerm()` :
```javascript
const importantTerms = [
    'investissement', 'portefeuille', 'risque',
    // Ajoutez vos termes spécifiques
];
```

### Profils de risque
Ajustez les rendements dans `calculateDetailedProjections()` :
```javascript
const annualReturns = {
    'Prudent': 0.04,    // 4% par an
    'Équilibré': 0.06,  // 6% par an
    'Dynamique': 0.08,  // 8% par an
    'Agressif': 0.10    // 10% par an
};
```

### Allocations d'actifs
Modifiez les répartitions selon vos besoins :
```javascript
const allocations = {
    'Prudent': [
        { asset: 'Obligations', percentage: 60 },
        { asset: 'Actions', percentage: 30 },
        { asset: 'Liquidités', percentage: 10 }
    ],
    // ...
};
```

## 🔍 API de recherche

### Recherche principale
```javascript
// Recherche intelligente (recommandée)
const results = await vectorSearch.intelligentSearch("investissement long terme", {
    topK: 5,              // Nombre de résultats
    includePreview: true, // Inclure les aperçus
    minScore: 0.1        // Score minimum
});
```

### Recherche par mots-clés
```javascript
// Recherche par mots-clés uniquement
const results = vectorSearch.keywordSearch("portefeuille diversifié", 3);
```

### Statistiques
```javascript
// Obtenir des infos sur la base de connaissances
const stats = vectorSearch.getStats();
console.log(stats);
// {
//   totalChunks: 25,
//   totalPages: 10,
//   avgChunkLength: 350,
//   sourceFile: "course.pdf",
//   generatedAt: "2025-09-08T10:00:00"
// }
```

## 🎯 Format des résultats

### Structure d'un résultat
```javascript
{
    id: 0,                           // ID unique
    text: "Contenu complet...",      // Texte du chunk
    sourceFile: "course.pdf",        // Fichier source
    page: 3,                         // Numéro de page
    chunkIndex: 1,                   // Index du chunk
    score: 0.85,                     // Score de pertinence (0-1)
    preview: "Aperçu avec contexte...", // Aperçu (optionnel)
    relevanceReason: "Contient 3 termes" // Explication
}
```

## 🧪 Tests et debug

### Test en console
```javascript
// Tester la recherche
testVectorSearch("investissement retraite");

// Voir les statistiques
showKnowledgeStats();

// Vérifier l'initialisation
console.log(vectorSearch.isInitialized);
```

### Mode dégradé
Le système fonctionne même si :
- Les fichiers JSON ne sont pas disponibles
- La recherche vectorielle échoue
- Le réseau est lent

→ Mode fallback avec calculs de base activé automatiquement

## 🎨 Personnalisation UI

### Classes CSS utilisées
```css
.bg-violet-100    /* Arrière-plan sources */
.text-violet-800  /* Titres des sections */
.bg-green-50      /* Projections positives */
.bg-orange-100    /* Alertes/avertissements */
.bg-gray-50       /* Sections neutres */
```

### Structure HTML générée
```html
<div class="simulation-result">
  <h3>Analyse personnalisée</h3>
  <div class="bg-gradient-to-r from-violet-50 to-purple-50">
    <!-- Profil utilisateur -->
  </div>
  <div class="bg-blue-50">
    <!-- Stratégie recommandée -->
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Projections -->
  </div>
  <!-- Sources, insights, étapes... -->
</div>
```

## 🚀 Optimisations possibles

### Performance
- Mise en cache des recherches fréquentes
- Chargement paresseux des données
- Compression des embeddings

### Fonctionnalités avancées
- Recherche sémantique vraie (avec API)
- Mise à jour dynamique des connaissances
- Personnalisation des recommandations

### Intégration
- Support multi-langues
- Intégration avec Analytics
- A/B testing des recommandations
