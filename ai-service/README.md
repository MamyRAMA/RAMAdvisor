# RAM Advisor AI Service

Service d'intelligence artificielle pour la simulation d'investissement basé sur une base de connaissances documentaire.

## 🎯 Fonctionnalités

- **Ingestion de documents** : Traite automatiquement les fichiers PDF, DOCX et TXT
- **Recherche vectorielle** : Utilise FAISS et sentence-transformers pour la recherche sémantique
- **API REST** : Endpoints pour simulation et recherche
- **RAG (Retrieval-Augmented Generation)** : Génère des réponses contextualisées
- **Support OpenAI** : Intégration optionnelle avec GPT pour des réponses de qualité

## 🚀 Installation et démarrage

### 1. Installation des dépendances

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate  # Sur Windows
# ou source venv/bin/activate  # Sur Linux/Mac

pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copier le fichier d'exemple
copy .env.example .env

# Éditer le fichier .env et ajouter votre clé OpenAI (optionnel)
# OPENAI_API_KEY=your_key_here
```

### 3. Ingestion des documents

```bash
# Traiter les documents de docs/knowledge
python ingest_documents.py
```

### 4. Démarrage du service

```bash
# Démarrer l'API
python main.py

# Ou avec uvicorn directement
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Le service sera accessible sur `http://localhost:8000`

## 📡 API Endpoints

### POST /simulate
Génère une simulation d'investissement personnalisée.

**Request body:**
```json
{
  "goal": "Acheter une résidence principale dans 10 ans",
  "initial_amount": 5000,
  "monthly_amount": 300,
  "risk_profile": "Équilibré"
}
```

**Response:**
```json
{
  "response": "<div>Simulation HTML...</div>",
  "sources": [
    {
      "file": "knowledge_FR.docx",
      "page": 1,
      "excerpt": "Extrait du document...",
      "relevance_score": 0.85
    }
  ],
  "confidence_score": 0.78
}
```

### GET /search?query=...&top_k=5
Recherche dans la base de connaissances.

### GET /health
Vérification de l'état du service.

## 🔧 Architecture

```
ai-service/
├── main.py              # API FastAPI
├── ingest_documents.py  # Script d'ingestion
├── requirements.txt     # Dépendances Python
├── .env.example        # Configuration d'exemple
└── indexes/            # Index FAISS générés
    ├── faiss_index.bin
    ├── chunks_metadata.json
    └── config.json
```

## 🔄 Intégration avec le frontend

Modifier `js/script.js` pour utiliser votre service local :

```javascript
// Remplacer l'appel Gemini par :
const response = await fetch('http://localhost:8000/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        goal: goal,
        initial_amount: parseFloat(initialAmount),
        monthly_amount: parseFloat(monthlyAmount),
        risk_profile: riskProfile
    })
});

const result = await response.json();
resultText.innerHTML = result.response;
```

## 🛠️ Personnalisation

### Ajout de nouveaux documents
1. Placez vos fichiers dans `docs/knowledge/`
2. Relancez `python ingest_documents.py`
3. Redémarrez le service

### Changement de modèle d'embeddings
Modifiez `EMBEDDING_MODEL` dans `.env` puis relancez l'ingestion.

### Amélioration des prompts
Éditez la méthode `build_context_prompt` dans `main.py`.

## 🔍 Dépannage

### Erreur "Index non trouvé"
Assurez-vous d'avoir exécuté `python ingest_documents.py` avant de démarrer le service.

### Réponses de faible qualité
1. Vérifiez que vos documents contiennent des informations pertinentes
2. Ajoutez une clé OpenAI pour de meilleures réponses
3. Augmentez le nombre de chunks retournés (top_k)

### Performance lente
1. Utilisez un modèle d'embeddings plus petit
2. Réduisez la taille des chunks
3. Limitez le nombre de documents traités

## 📈 Améliorations futures

- [ ] Cache des embeddings pour accélérer les requêtes
- [ ] Interface web d'administration
- [ ] Support de plus de formats de documents
- [ ] Système de feedback pour améliorer les réponses
- [ ] Authentification et limitation de débit
