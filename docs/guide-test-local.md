# 🧪 Guide de Test Local - RAM Advisor Cloud

## 📋 Vue d'ensemble

Ce guide vous permet de tester votre nouvelle architecture cloud **localement** avant de déployer sur Render et Netlify. C'est une étape cruciale pour éviter les problèmes après déploiement.

## 🎯 Objectifs du test local

✅ Vérifier que le backend FastAPI fonctionne  
✅ Vérifier que le frontend communique avec le backend  
✅ Tester les fonctionnalités de simulation IA  
✅ S'assurer que tout est prêt pour le déploiement  

---

## 🛠️ ÉTAPE 1 : Préparation de l'environnement

### 1.1 Vérifier la structure du projet
Votre projet doit ressembler à ceci :
```
RAMAdvisor/
├── backend/              # Service d'IA
│   ├── main.py
│   ├── ingest_documents.py
│   ├── requirements.txt
│   └── docs/knowledge/
└── frontend/             # Site web
    ├── index.html
    ├── js/script.js
    └── css/
```

### 1.2 Ouvrir le terminal PowerShell
- Dans VS Code : **Terminal** → **New Terminal**
- Assurez-vous d'être dans le dossier racine : `G:\Drive partagés\BLACKROB\web\RAMAdvisor`

---

## 🐍 ÉTAPE 2 : Configuration du Backend Python

### 2.1 Créer l'environnement virtuel
```powershell
# Aller dans le dossier backend
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
.\venv\Scripts\activate

# Vous devriez voir (venv) au début de votre ligne de commande
```

### 2.2 Installer les dépendances

**🎯 VERSION ALLÉGÉE (Recommandée pour Render gratuit):**
```powershell
# Installer la version légère sans FAISS
pip install -r requirements-light.txt

# 📊 Consommation mémoire allégée:
# - FastAPI + uvicorn: ~50 MB
# - google-generativeai: ~100 MB  
# - Autres dépendances: ~50 MB
# - Total: ~200 MB (bien sous la limite de 512 MB!)

# ⏳ Installation plus rapide: 30 secondes - 2 minutes
```

**🔬 VERSION COMPLÈTE (Pour tests locaux uniquement):**
```powershell
# Version complète avec FAISS (pour comparaison)
pip install -r requirements.txt

# ⚠️ IMPORTANT pour Render gratuit: 
# Cette version dépasse la limite de 512MB RAM de Render gratuit
# 
# 📊 Consommation mémoire complète:
# - sentence-transformers: ~200-300 MB
# - faiss-cpu: ~100-200 MB  
# - FastAPI + autres: ~100 MB
# - Total: ~500-600 MB (dépasse la limite gratuite)

# ⏳ Installation plus longue: 2-5 minutes
```

### 2.3 Configuration pour la version allégée

**🎯 POUR VERSION ALLÉGÉE (recommandée):**
```powershell
# Créer le fichier .env pour Gemini API
copy .env.example .env

# Editer .env et ajouter votre clé Gemini:
# GEMINI_API_KEY=votre_clé_ici

# Pas besoin d'ingestion de documents - tout est simplifié!
```

**🔬 POUR VERSION COMPLÈTE (optionnel):**
```powershell
# Traiter les documents pour créer l'index FAISS
python ingest_documents.py

# ✅ Vous devriez voir des messages comme :
# "📚 Traitement de knowledge.txt..."
# "✅ Index FAISS créé avec 766 chunks"
```

---

## 🚀 ÉTAPE 3 : Lancer le Backend

### 3.1 Démarrer le serveur FastAPI

**🎯 VERSION ALLÉGÉE:**
```powershell
# Lancer la version allégée (sans FAISS)
python main-light.py

# ✅ Vous devriez voir :
# "🚀 Démarrage du service RAM Advisor AI (Version Allégée)"
# "✅ Service initialisé avec succès"
# "INFO: Uvicorn running on http://0.0.0.0:8000"
```

**🔬 VERSION COMPLÈTE (si installée):**
```powershell
# Lancer la version complète (avec FAISS)
python main.py

# ✅ Vous devriez voir :
# "🚀 Démarrage du service RAM Advisor AI"
# "✅ Service initialisé avec succès"
# "INFO: Uvicorn running on http://0.0.0.0:8000"
```

### 3.2 Tester le backend dans le navigateur
1. Ouvrez votre navigateur
2. Allez sur : **http://localhost:8000**
3. ✅ Vous devriez voir :
   ```json
   {
     "message": "RAM Advisor AI Service",
     "status": "active",
     "version": "1.0.0"
   }
   ```

### 3.3 Tester la documentation API
1. Allez sur : **http://localhost:8000/docs**
2. ✅ Vous devriez voir l'interface Swagger avec les endpoints `/simulate` et `/health`
3. Cliquez sur **`/health`** → **"Try it out"** → **"Execute"**
4. ✅ Réponse attendue :
   ```json
   {
     "status": "healthy",
     "knowledge_base_loaded": true,
     "total_documents": 766
   }
   ```

---

## 🌐 ÉTAPE 4 : Configurer le Frontend pour les tests

### 4.1 Modifier temporairement script.js
Ouvrez le fichier `frontend/js/script.js` et trouvez la ligne :
```javascript
const apiUrl = 'https://ramadvisor-backend.onrender.com/simulate';
```

Remplacez-la **temporairement** par :
```javascript
const apiUrl = 'http://localhost:8000/simulate';
// const apiUrl = 'https://ramadvisor-backend.onrender.com/simulate'; // Pour le cloud
```

⚠️ **Important** : N'oubliez pas de remettre l'URL cloud avant le déploiement !

### 4.2 Installer Live Server (optionnel mais recommandé)
1. Dans VS Code, allez dans **Extensions** (Ctrl+Shift+X)
2. Recherchez **"Live Server"**
3. Installez l'extension de **Ritwick Dey**

---

## 🎮 ÉTAPE 5 : Tester le Frontend

### 5.1 Lancer le site web
**Option A - Avec Live Server (recommandé) :**
1. Clic droit sur `frontend/index.html`
2. Sélectionnez **"Open with Live Server"**
3. Le site s'ouvre dans votre navigateur sur `http://127.0.0.1:5500`

**Option B - Sans Live Server :**
1. Double-cliquez sur `frontend/index.html`
2. Le site s'ouvre dans votre navigateur par défaut

### 5.2 Navigation sur le site
1. ✅ Vérifiez que le site s'affiche correctement
2. ✅ Naviguez vers la section **"Simulez votre projet d'investissement"**
3. ✅ Vérifiez que le formulaire est présent

---

## 🧪 ÉTAPE 6 : Test de la Simulation IA

### 6.1 Remplir le formulaire de test
- **Objectif** : "Préparer ma retraite"
- **Montant initial** : 10000
- **Montant mensuel** : 500
- **Profil de risque** : "Modéré"

### 6.2 Lancer la simulation
1. Cliquez sur **"Lancer la simulation"**
2. ✅ Le bouton doit afficher **"Analyse en cours..."**
3. ✅ Un spinner de chargement doit apparaître

### 6.3 Vérifier la réponse
Après 3-10 secondes, vous devriez voir :
- ✅ Une réponse détaillée sur la stratégie d'investissement
- ✅ Des sources consultées avec scores de pertinence
- ✅ Un niveau de confiance en pourcentage

### 6.4 Vérifier les logs backend
Dans le terminal où tourne le backend, vous devriez voir :
```
INFO: Nouvelle requête de simulation
INFO: Recherche dans la base de connaissances...
INFO: 5 documents pertinents trouvés
INFO: Génération de la réponse...
INFO: Réponse générée avec succès
```

---

## 🔍 ÉTAPE 7 : Tests Avancés

### 7.1 Tester différents scénarios
Essayez plusieurs simulations avec :
- Différents montants (100€, 50000€)
- Différents objectifs ("Acheter une maison", "Créer une entreprise")
- Différents profils de risque

### 7.2 Tester la gestion d'erreurs
1. Arrêtez le backend (Ctrl+C dans le terminal)
2. Essayez une simulation
3. ✅ Vous devriez voir un message d'erreur explicite

### 7.3 Vérifier la console développeur
1. Appuyez sur **F12** dans votre navigateur
2. Allez dans l'onglet **Console**
3. ✅ Aucune erreur rouge ne doit apparaître
4. Allez dans l'onglet **Network**
5. ✅ Les requêtes vers `/simulate` doivent retourner un statut 200

---

## ✅ ÉTAPE 8 : Checklist avant déploiement

### Backend ✅
- [ ] Le serveur démarre sans erreur
- [ ] L'endpoint `/health` retourne `"healthy"`
- [ ] L'endpoint `/simulate` fonctionne avec des données de test
- [ ] Les logs ne montrent pas d'erreurs critiques

### Frontend ✅
- [ ] Le site s'affiche correctement
- [ ] Le formulaire de simulation fonctionne
- [ ] Les réponses s'affichent avec sources et confiance
- [ ] Aucune erreur dans la console développeur

### Intégration ✅
- [ ] Frontend et backend communiquent correctement
- [ ] Les simulations retournent des résultats cohérents
- [ ] La gestion d'erreurs fonctionne

---

## 🔧 ÉTAPE 9 : Remise en état pour déploiement

### 9.1 Remettre l'URL cloud dans script.js
Replacez dans `frontend/js/script.js` :
```javascript
const apiUrl = 'https://ramadvisor-backend.onrender.com/simulate';
// const apiUrl = 'http://localhost:8000/simulate'; // Pour les tests locaux
```

### 9.2 Arrêter les services locaux
```powershell
# Dans le terminal du backend, appuyez sur Ctrl+C
# Puis désactivez l'environnement virtuel
deactivate
```

### 9.3 Commit de vos changements
1. Dans VS Code, allez dans **Source Control**
2. Ajoutez tous les fichiers modifiés (+)
3. Message de commit : `"Tests locaux validés - prêt pour déploiement"`
4. Committez et poussez

---

## 🚨 Dépannage

### ❌ "Module not found" lors de l'installation
```powershell
# Vérifiez que vous êtes dans le bon dossier et que venv est activé
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### ❌ Le backend ne démarre pas
```powershell
# Vérifiez les erreurs dans le terminal
# Vérifiez que le port 8000 n'est pas utilisé par un autre service
```

### ❌ "Failed to fetch" dans le frontend
- Vérifiez que le backend tourne sur `http://localhost:8000`
- Vérifiez l'URL dans `script.js`
- Vérifiez la console développeur pour plus de détails

### ❌ Réponses vides ou erreurs IA
- Vérifiez que `ingest_documents.py` a bien créé les index
- Vérifiez que les fichiers dans `docs/knowledge/` existent

---

## 🎉 Étapes suivantes

Une fois tous les tests validés :
1. 📚 Consultez le **Guide de Déploiement Cloud** : `docs/guide-deployment-cloud.md`
2. 🚀 Créez vos comptes Render et Netlify
3. 🌐 Déployez votre solution en production !

---

💡 **Conseil** : Gardez ce guide pour refaire des tests lors de futures modifications !
