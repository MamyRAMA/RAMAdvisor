# 🚀 Guide Déploiement Version Allégée - RAM Advisor

## 🎯 Objectif

Déployer RAM Advisor sur Render **gratuit** (512 MB) avec Gemini AI uniquement, sans FAISS.

## ✅ Avantages Version Allégée

- **💰 Gratuit** : Fonctionne sur Render gratuit
- **⚡ Ultra-rapide** : Démarrage en ~10 secondes
- **🔧 Ultra-simple** : Seulement 2 dépendances
- **🤖 IA** : Powered by Gemini (Google)
- **📦 Serveur HTTP natif** : Pas de FastAPI

## ⚠️ Limitations

- **Pas de recherche vectorielle** FAISS
- **Base de connaissances simple** (recherche par mots-clés)
- **Moins de précision** dans les recommandations

---

## 🚀 Déploiement sur Render

### Étape 1 : Préparer le code

```bash
# Committez la version allégée
git add .
git commit -m "Version allégée pour Render gratuit"
git push origin test-cloud
```

### Étape 2 : Configurer Render

1. **Repository** : `RAMAdvisor`
2. **Name** : `ramadvisor-backend-light`
3. **Root Directory** : `backend`
4. **Environment** : `Python 3`
5. **Build Command** : `pip install -r requirements-ultra-light.txt`
6. **Start Command** : `python main-ultra-light.py`

### Étape 3 : Variables d'environnement

Ajoutez dans Render :
- **GEMINI_API_KEY** : `votre_clé_gemini`

### Étape 4 : Déployer

- Cliquez **"Create Web Service"**
- ⏳ Déploiement : 2-3 minutes
- 📝 URL fournie : `https://ramadvisor-backend-light.onrender.com`

---

## 🧪 Test du Déploiement

### Test de base
```bash
curl https://ramadvisor-backend-light.onrender.com/

# Réponse attendue :
{
  "message": "RAM Advisor AI Service (Version Allégée)",
  "status": "active",
  "version": "1.0.0-light"
}
```

### Test de santé
```bash
curl https://ramadvisor-backend-light.onrender.com/health

# Réponse attendue :
{
  "status": "healthy",
  "knowledge_base_loaded": true,
  "total_documents": 1,
  "gemini_configured": true
}
```

---

## 🌐 Configuration Frontend

Mettez à jour `frontend/js/script.js` :

```javascript
// Version allégée
const apiUrl = 'https://ramadvisor-backend-light.onrender.com/simulate';
```

---

## 📊 Monitoring

### Consommation mémoire (Render dashboard) :
- **Cible** : < 200 MB
- **Limite** : 512 MB
- **Marge** : ~300 MB

### Performance attendue :
- **Démarrage** : 5-15 secondes
- **Première requête** : 2-3 secondes
- **Requêtes suivantes** : < 1 seconde
- **Mémoire utilisée** : ~150MB

---

## 🔄 Migration vers Version Complète

Quand vous voulez passer au plan payant (7$/mois) :

1. **Upgrade Render** vers plan Starter
2. **Modifier Build Command** : `pip install -r requirements.txt && python ingest_documents.py`
3. **Modifier Start Command** : `python main.py`
4. **Redéployer**

---

## 🆘 Dépannage

### ❌ Out of Memory
- Vérifiez que vous utilisez `requirements-ultra-light.txt`
- Vérifiez que vous lancez `main-ultra-light.py`

### ❌ Gemini API Error
- Vérifiez la clé dans les variables d'environnement
- Vérifiez les quotas sur Google AI Studio

### ❌ Service Lent
- Premier appel normal (réveil du service)
- Si persistant, vérifiez les logs Render

---

## 🎉 Résultat

Votre site fonctionne maintenant **gratuitement** avec :
- ✅ Gemini AI pour les conseils
- ✅ Interface web complète  
- ✅ Déploiement automatique
- ✅ Évolutif vers version premium

**Coût total : 0€/mois** 🎯
