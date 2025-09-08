# 🔗 Guide d'Intégration - Solution RAG

## 🎯 Objectif
Ce guide explique comment intégrer la solution RAG dans votre projet existant étape par étape.

## 📁 Fichiers de ce répertoire

### `html-modifications.html`
**Exemple complet** d'intégration HTML avec :
- Structure requise pour le simulateur
- IDs exacts nécessaires au JavaScript
- Balises script dans le bon ordre
- Affichage optionnel des statistiques

### `css-additions.css`
**Styles supplémentaires** pour améliorer l'UI :
- Animations de chargement
- Styles pour les résultats de simulation
- Classes pour les cartes et badges
- Responsive design

### `test-integration.html`
**Page de test complète** pour valider l'intégration :
- Tests de recherche directe
- Affichage des statistiques
- Simulation complète
- Logs de debug en temps réel

## 🔧 Intégration étape par étape

### ÉTAPE 1: Préparation des fichiers

1. **Copiez les modules JavaScript** dans votre projet :
   ```
   votre-projet/
   ├── js/
   │   ├── vector-search.js        ← Du répertoire 02-frontend-modules
   │   └── script.js               ← Votre fichier existant à modifier
   └── data/
       ├── knowledge_embeddings.json  ← Généré par le script Python
       ├── embedding_config.json      ← Généré par le script Python
       └── search_index.json          ← Généré par le script Python
   ```

2. **Générez vos données** (si pas encore fait) :
   ```bash
   cd scripts
   python generate_static_embeddings.py
   ```

### ÉTAPE 2: Modification de votre HTML

#### A. Ajout des scripts
```html
<!-- AVANT votre script.js -->
<script src="js/vector-search.js"></script>
<script src="js/script.js"></script>
```

#### B. Structure du formulaire (IDs obligatoires)
```html
<input id="goal" type="text" />
<input id="initialAmount" type="number" />
<input id="monthlyAmount" type="number" />
<select id="riskProfile">
  <option value="Prudent">Prudent</option>
  <option value="Équilibré">Équilibré</option>
  <option value="Dynamique">Dynamique</option>
  <option value="Agressif">Agressif</option>
</select>
<button id="simulateBtn">
  <span>Lancer la simulation</span>
</button>
```

#### C. Zone de résultat (structure obligatoire)
```html
<div id="simulationResult" class="hidden">
  <div id="loadingSpinner" style="display: none;">
    <!-- Votre spinner de chargement -->
  </div>
  <div id="resultText">
    <!-- Les résultats apparaîtront ici -->
  </div>
</div>
```

### ÉTAPE 3: Modification de votre script.js

#### A. Variable globale (début du fichier)
```javascript
let vectorSearch = null;
```

#### B. Nouvelle fonction DOMContentLoaded
```javascript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Site chargé avec recherche vectorielle !');
    
    initializeVectorSearch();      // ← NOUVEAU
    initializeInvestmentSimulator(); // ← MODIFIÉ
    // ... vos autres fonctions existantes
});

async function initializeVectorSearch() {
    try {
        vectorSearch = new ClientVectorSearch();
        const success = await vectorSearch.initialize();
        if (success) {
            console.log('✅ Recherche vectorielle prête');
        }
    } catch (error) {
        console.error('❌ Erreur recherche vectorielle:', error);
    }
}
```

#### C. Nouvelle fonction de simulation
Remplacez votre fonction `initializeInvestmentSimulator()` par celle du fichier `script-modifications.js`.

#### D. Ajout des fonctions utilitaires
Copiez toutes les fonctions de `integration-functions.js` à la fin de votre script.

### ÉTAPE 4: Configuration et personnalisation

#### A. Chemin des données
Dans `vector-search.js`, vérifiez :
```javascript
this.baseUrl = './data/'; // ← Ajustez selon votre structure
```

#### B. Mots-clés spécialisés
Personnalisez selon votre domaine :
```javascript
const importantTerms = [
    'investissement', 'portefeuille', 'risque',
    'votre_terme_1', 'votre_terme_2' // ← Ajoutez vos termes
];
```

#### C. Profils de risque
Ajustez les rendements attendus :
```javascript
const annualReturns = {
    'Prudent': 0.04,    // 4% par an
    'Équilibré': 0.06,  // 6% par an
    // ... ajustez selon vos hypothèses
};
```

## 🧪 Tests et validation

### Test rapide avec la page de test
1. **Ouvrez** `test-integration.html` dans votre navigateur
2. **Vérifiez** que l'initialisation réussit (vert)
3. **Testez** la recherche directe
4. **Lancez** une simulation complète
5. **Consultez** les logs de debug

### Tests dans votre projet
```javascript
// Dans la console du navigateur
testVectorSearch("investissement retraite");
showKnowledgeStats();
```

### Checklist de validation
- [ ] Fichiers de données présents dans `/data/`
- [ ] Module `vector-search.js` chargé avant `script.js`
- [ ] IDs HTML corrects (`goal`, `simulateBtn`, etc.)
- [ ] Initialisation réussie (logs verts dans la console)
- [ ] Recherche fonctionne (résultats pertinents)
- [ ] Simulation génère des recommandations personnalisées

## 🔧 Dépannage

### Erreur "Failed to fetch"
**Cause**: Fichiers de données non trouvés  
**Solution**: Vérifiez le chemin `baseUrl` et la présence des fichiers JSON

### Initialisation échoue
**Cause**: Problème de format JSON ou de CORS  
**Solutions**:
- Validez vos JSON : `python -m json.tool knowledge_embeddings.json`
- Servez via un serveur web local (pas file://)
- Vérifiez l'encoding UTF-8

### Recherche ne retourne rien
**Cause**: Mots-clés non trouvés  
**Solutions**:
- Testez avec des termes présents dans vos données
- Ajustez `minScore` dans les options de recherche
- Vérifiez les mots-clés dans `search_index.json`

### Simulation sans recommandations
**Cause**: Base de connaissances non chargée  
**Solution**: Mode fallback activé, vérifiez l'initialisation

## 🎨 Personnalisation avancée

### Interface utilisateur
- Ajoutez vos propres styles CSS
- Personnalisez les messages et animations
- Intégrez avec votre framework CSS existant

### Logique métier
- Modifiez les calculs financiers selon vos besoins
- Ajustez les recommandations par profil
- Personnalisez les seuils de confiance

### Performance
- Implémentez un cache de recherche
- Optimisez le chargement des données
- Ajoutez de la compression

## 🚀 Déploiement

### Netlify (recommandé)
1. **Commitez** tous les fichiers modifiés
2. **Pushes** vers votre branche GitHub
3. **Netlify** servira automatiquement les JSON comme assets statiques
4. **Testez** en production

### Autres hébergeurs
- Assurez-vous que les fichiers JSON sont servis avec le bon MIME type
- Configurez les headers CORS si nécessaire
- Testez le chargement des assets

### Optimisations production
- Minimifiez les fichiers JS/CSS
- Compressez les JSON (gzip)
- Configurez la mise en cache
- Surveillez les performances

## 📈 Évolutions possibles

### Court terme
- Interface de recherche avancée
- Graphiques de projection
- Export des recommandations

### Moyen terme
- Multi-documents (plusieurs PDF)
- Personnalisation utilisateur
- Analytics et feedback

### Long terme
- IA générative intégrée
- Mise à jour dynamique des connaissances
- API externe pour embeddings sémantiques
