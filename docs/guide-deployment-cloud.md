# 🚀 Guide de Déploiement Cloud - RAM Advisor

## Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer RAM Advisor avec une architecture cloud moderne :
- **Backend** : Render (service d'IA FastAPI)
- **Frontend** : Netlify (site web statique)

## 📋 Prérequis

### Comptes nécessaires
1. **Compte GitHub** (déjà fait ✅)
2. **Compte Render** : [render.com](https://render.com) - Gratuit
3. **Compte Netlify** : [netlify.com](https://netlify.com) - Gratuit

### Préparation du code
✅ Restructuration terminée :
```
RAMAdvisor/
├── backend/          # Service pour Render
├── frontend/         # Site pour Netlify
└── docs/            # Documentation
```

## 🎯 Étape 1 : Déployer le Backend sur Render

### 1.1 Pousser le code sur GitHub
```bash
# Dans le terminal
cd "G:\Drive partagés\BLACKROB\web\RAMAdvisor"
git add .
git commit -m "Restructuration pour déploiement cloud"
git push origin main
```

### 1.2 Créer le service sur Render
1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Get Started for Free"**
3. Connectez-vous avec GitHub
4. Cliquez sur **"New +"** → **"Web Service"**

### 1.3 Configuration du service
- **Repository** : Sélectionnez `RAMAdvisor`
- **Name** : `ramadvisor-backend`
- **Root Directory** : `backend`
- **Environment** : `Python 3`
- **Build Command** : `pip install -r requirements.txt && python ingest_documents.py`
- **Start Command** : `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 1.4 Variables d'environnement (optionnel)
- **OPENAI_API_KEY** : Votre clé OpenAI si vous en avez une

### 1.5 Déployer
- Cliquez sur **"Create Web Service"**
- ⏳ Le déploiement prend 5-10 minutes
- 📝 Notez l'URL fournie : `https://ramadvisor-backend.onrender.com`

## 🌐 Étape 2 : Déployer le Frontend sur Netlify

### 2.1 Connexion à Netlify
1. Allez sur [netlify.com](https://netlify.com)
2. Cliquez sur **"Get started for free"**
3. Connectez-vous avec GitHub

### 2.2 Créer un nouveau site
1. Cliquez sur **"Add new site"** → **"Import an existing project"**
2. Choisissez **"Deploy with GitHub"**
3. Sélectionnez le repository `RAMAdvisor`

### 2.3 Configuration du déploiement
- **Branch to deploy** : `main`
- **Base directory** : `frontend`
- **Build command** : (laisser vide)
- **Publish directory** : `.` (point)

### 2.4 Configurer le domaine personnalisé
1. Une fois déployé, allez dans **Site settings** → **Domain management**
2. Cliquez sur **"Add custom domain"**
3. Entrez : `ramadvisor.fr`
4. Suivez les instructions pour configurer le DNS

## 🔧 Étape 3 : Mise à jour de l'URL Backend

### 3.1 Récupérer l'URL finale
Une fois le backend Render déployé, récupérez l'URL exacte (ex: `https://ramadvisor-backend-xyz.onrender.com`)

### 3.2 Mettre à jour le frontend
Modifiez le fichier `frontend/js/script.js` :
```javascript
// Remplacez cette ligne
const apiUrl = 'https://ramadvisor-backend.onrender.com/simulate';

// Par votre URL exacte
const apiUrl = 'https://votre-url-exacte.onrender.com/simulate';
```

### 3.3 Pousser la mise à jour
```bash
git add frontend/js/script.js
git commit -m "Mise à jour URL backend"
git push origin main
```

Netlify redéploiera automatiquement ! 🎉

## ✅ Étape 4 : Tests et Validation

### 4.1 Test du backend
Allez sur `https://votre-backend.onrender.com` - vous devriez voir :
```json
{
  "message": "RAM Advisor AI Service",
  "status": "active",
  "version": "1.0.0"
}
```

### 4.2 Test du frontend
1. Allez sur `https://ramadvisor.fr`
2. Naviguez vers la section simulation
3. Remplissez le formulaire et testez

### 4.3 En cas de problème
- ⏰ **Première requête lente** : Normal, le service Render se réveille
- 🔄 **Timeout** : Attendez 1-2 minutes et réessayez
- ❌ **Erreur CORS** : Vérifiez l'URL dans script.js

## 💰 Coûts

### Render (Backend)
- **Gratuit** : 512 MB RAM, 0.1 vCPU
- **Payant** : 7$/mois pour plus de ressources

### Netlify (Frontend)
- **Gratuit** : 100 GB bande passante/mois
- **Payant** : 19$/mois pour fonctionnalités pro

### Total estimé
**0$/mois** pour commencer, **~7$/mois** si plus de ressources nécessaires.

## 🔄 Maintenance

### Mise à jour du code
```bash
git add .
git commit -m "Votre message"
git push origin main
```
Les deux services se redéploient automatiquement !

### Monitoring
- **Render** : Dashboard avec logs et métriques
- **Netlify** : Analytics et logs de déploiement

## 🆘 Support

### Problèmes courants
1. **Service lent au premier appel** : Normal, temps de réveil
2. **Erreur 500** : Vérifiez les logs Render
3. **CORS error** : Vérifiez l'URL backend dans script.js

### Contacts
- **Render Support** : [render.com/help](https://render.com/help)
- **Netlify Support** : [netlify.com/support](https://netlify.com/support)

---

🎉 **Félicitations !** Votre site RAM Advisor est maintenant déployé en cloud avec une architecture moderne et scalable !
