# 🚀 Guide de démarrage rapide - RAM Advisor AI

## Installation automatique (Windows)

1. **Double-cliquez sur `start.bat`** dans le dossier `ai-service`
   - Le script installera automatiquement les dépendances
   - Créera l'index des documents
   - Démarrera le service

2. **Ouvrez `index.html`** dans votre navigateur

3. **Testez la simulation** dans la section 4 du site

## Installation manuelle

### Prérequis
- Python 3.8+ installé
- Connexion internet pour télécharger les dépendances

### Étapes

```bash
# 1. Aller dans le dossier ai-service
cd ai-service

# 2. Créer un environnement virtuel
python -m venv venv

# 3. Activer l'environnement (Windows)
venv\Scripts\activate

# 4. Installer les dépendances
pip install -r requirements.txt

# 5. Traiter les documents de connaissance
python ingest_documents.py

# 6. Démarrer le service
python main.py
```

## Vérification

Le service devrait afficher :
```
🚀 Démarrage du service RAM Advisor AI
✅ Service initialisé avec succès
INFO: Uvicorn running on http://0.0.0.0:8000
```

## Test rapide

```bash
# Dans un autre terminal
cd ai-service
python test_service.py
```

## Utilisation

1. **Service API** : `http://localhost:8000`
2. **Documentation** : `http://localhost:8000/docs`
3. **Santé du service** : `http://localhost:8000/health`

## Troubleshooting

### ❌ "Module not found"
```bash
pip install -r requirements.txt
```

### ❌ "Index non trouvé"
```bash
python ingest_documents.py
```

### ❌ "Service non accessible"
- Vérifiez que le service est démarré
- Vérifiez le port 8000 est libre
- Consultez les logs dans le terminal

### ❌ "Erreur CORS" dans le navigateur
- Le service inclut déjà les headers CORS
- Vérifiez que l'URL est correcte dans `js/script.js`

## Configuration avancée

### Ajouter OpenAI (optionnel)
1. Créez un fichier `.env` depuis `.env.example`
2. Ajoutez votre clé : `OPENAI_API_KEY=sk-...`
3. Redémarrez le service

### Ajouter des documents
1. Placez vos fichiers PDF/DOCX/TXT dans `docs/knowledge/`
2. Relancez : `python ingest_documents.py`
3. Redémarrez le service

### Changer le port
```bash
uvicorn main:app --host 0.0.0.0 --port 8080
```

N'oubliez pas de modifier l'URL dans `js/script.js` !
