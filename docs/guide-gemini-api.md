# 🔑 Guide : Obtenir votre Clé API Gemini

## 📋 Vue d'ensemble

Gemini est l'IA de Google, accessible via Google AI Studio. C'est gratuit pour commencer avec des quotas généreux.

## 🚀 Étapes pour obtenir votre clé

### 1. Aller sur Google AI Studio
- Rendez-vous sur : [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- Connectez-vous avec votre compte Google

### 2. Créer une clé API
- Cliquez sur **"Create API Key"**
- Sélectionnez votre projet Google Cloud (ou créez-en un)
- Copiez la clé générée (format : `AIza...`)

### 3. Activer l'API
- Allez dans [Google Cloud Console](https://console.cloud.google.com/)
- Recherchez **"Generative Language API"**
- Cliquez sur **"Enable"**

## 💰 Coûts Gemini vs OpenAI

### Gemini API (Google)
- **Gratuit** : 60 requêtes/minute
- **Payant** : À partir de 0,50$/1M tokens
- **Avantages** : Intégration Google Cloud, plus économique

### OpenAI API
- **Payant dès le début** : 0,50$/1K tokens (GPT-3.5)
- **Plus cher** : 10$/1K tokens (GPT-4)

## 🔧 Configuration dans votre projet

### Pour les tests locaux
1. Créez un fichier `.env` dans le dossier `backend/`
2. Ajoutez votre clé :
   ```
   GEMINI_API_KEY=votre_clé_ici
   ```

### Pour le déploiement Render
1. Dans le dashboard Render
2. Allez dans **Environment Variables**
3. Ajoutez : `GEMINI_API_KEY` = `votre_clé`

## 🎯 Pourquoi choisir Gemini ?

✅ **Gratuit pour commencer**  
✅ **Quotas généreux** (60 req/min)  
✅ **Qualité comparable** à GPT-3.5  
✅ **Intégration Google Cloud** native  
✅ **Support multimodal** (texte + images)  

## 🔐 Sécurité

- ⚠️ **Ne jamais committer** la clé dans Git
- ✅ **Utilisez toujours** les variables d'environnement
- 🔄 **Régénérez la clé** si elle est compromise

---

🎉 Votre IA est maintenant alimentée par Gemini !
