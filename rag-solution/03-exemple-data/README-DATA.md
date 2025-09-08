# 📊 Exemples de Données - Format et Structure

## 🎯 Objectif
Ces fichiers d'exemple montrent le format exact des données générées par le script Python et utilisées par le frontend.

## 📁 Fichiers d'exemple

### `knowledge_embeddings.json` (Principal)
**Le fichier le plus important** contenant tous les chunks avec leurs embeddings.

#### Structure d'un chunk:
```json
{
  "id": 0,                              // ID unique séquentiel
  "text": "Contenu complet du chunk...",   // Texte intégral
  "source_file": "course.pdf",          // Fichier source
  "page_number": 1,                     // Numéro de page
  "chunk_index": 0,                     // Index dans la page
  "embedding": [0.1, 0.2, 0.3, ...]    // Vecteur d'embedding (384 dimensions)
}
```

#### Caractéristiques:
- **Taille**: 2-5 MB selon le nombre de chunks
- **Encoding**: UTF-8 pour les caractères français
- **Embeddings**: Vecteurs de 384 dimensions normalisés
- **Format**: JSON array avec indentation pour lisibilité

### `embedding_config.json` (Configuration)
**Métadonnées** sur le modèle et la génération.

```json
{
  "model_name": "sentence-transformers/all-MiniLM-L6-v2",
  "embedding_dim": 384,
  "total_chunks": 6,
  "source_file": "course.pdf", 
  "generated_at": "2025-09-08T10:00:00.000Z"
}
```

#### Utilisation:
- Vérification de compatibilité
- Statistiques pour l'interface
- Debug et maintenance

### `search_index.json` (Index de recherche)
**Index optimisé** pour la recherche rapide par mots-clés.

```json
{
  "chunks": [
    {
      "id": 0,
      "text_preview": "Aperçu du chunk (100 premiers caractères)...",
      "keywords": ["mot1", "mot2", "mot3"],
      "page": 1
    }
  ]
}
```

#### Avantages:
- Recherche rapide sans charger les embeddings complets
- Aperçus pour l'interface utilisateur
- Mots-clés pré-extraits pour scoring

## 🔧 Utilisation en développement

### Test rapide
1. **Copiez ces fichiers** dans `votre-frontend/data/`
2. **Intégrez les modules** JavaScript
3. **Testez** avec les données d'exemple
4. **Remplacez** par vos vraies données ensuite

### Validation des données
```javascript
// Tester le chargement
const vectorSearch = new ClientVectorSearch();
await vectorSearch.initialize();

// Tester une recherche
const results = await vectorSearch.intelligentSearch("investissement");
console.log(results);
```

## 📏 Spécifications techniques

### Embeddings
- **Modèle**: sentence-transformers/all-MiniLM-L6-v2
- **Dimensions**: 384 (peut varier selon le modèle)
- **Normalisation**: Vecteurs L2 normalisés pour similarité cosinus
- **Type**: Float32, convertis en arrays JavaScript

### Chunks
- **Taille moyenne**: 300-500 caractères
- **Chevauchement**: 50 caractères entre chunks
- **Découpage**: Intelligent (phrases complètes quand possible)
- **Encoding**: UTF-8 pour caractères accentués

### Performance
- **Chargement initial**: ~1-2 secondes pour 6 chunks
- **Recherche**: <10ms après chargement
- **Mémoire**: ~5-10MB en RAM pour les données

## 🎨 Personnalisation

### Mots-clés spécialisés
Modifiez la liste selon votre domaine dans le script de génération:
```python
investment_terms = [
    'investissement', 'portefeuille', 'risque',
    'votre_terme_1', 'votre_terme_2'  # ← Ajoutez ici
]
```

### Taille des chunks
Ajustez selon votre contenu:
```python
chunks = self.chunk_text(text, 
    chunk_size=400,  # ← Plus grand = moins de chunks
    overlap=50       # ← Plus grand = meilleur contexte
)
```

### Aperçus
Modifiez la longueur des previews:
```python
'text_preview': chunk.text[:100] + "..."  # ← Ajustez 100
```

## 🔍 Validation des données

### Vérifications automatiques
Le script de génération vérifie:
- ✅ Présence du fichier PDF source
- ✅ Extraction réussie du texte
- ✅ Génération des embeddings
- ✅ Sauvegarde des 3 fichiers JSON
- ✅ Cohérence des IDs et métadonnées

### Tests manuels
```bash
# Vérifier la structure JSON
python -m json.tool knowledge_embeddings.json > /dev/null

# Compter les chunks
grep -c '"id":' knowledge_embeddings.json

# Vérifier l'encoding UTF-8
file -bi knowledge_embeddings.json
```

## 🚨 Erreurs communes

### Fichier trop volumineux
**Problème**: JSON > 10MB  
**Solution**: Réduire chunk_size ou filtrer le contenu

### Embeddings manquants
**Problème**: embedding: null dans le JSON  
**Solution**: Vérifier l'installation de sentence-transformers

### Caractères corrompus
**Problème**: Caractères accentués mal encodés  
**Solution**: Forcer UTF-8 dans la sauvegarde

### IDs non séquentiels
**Problème**: IDs manquants ou dupliqués  
**Solution**: Vérifier la logique de génération des chunks

## 📈 Évolution des données

### Mise à jour
Pour mettre à jour les connaissances:
1. Modifiez le PDF source
2. Relancez le script de génération
3. Redéployez les nouveaux JSON
4. Pas besoin de modifier le code frontend

### Versioning
Gardez trace des versions:
```json
{
  "model_name": "sentence-transformers/all-MiniLM-L6-v2",
  "version": "1.2",
  "generated_at": "2025-09-08T10:00:00.000Z",
  "source_hash": "abc123..."  // Hash du PDF source
}
```

### Migration
Pour changer de modèle d'embedding:
1. Régénérez tous les embeddings
2. Vérifiez la compatibilité des dimensions
3. Testez la qualité de recherche
4. Mettez à jour la configuration
