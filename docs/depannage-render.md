# 🚨 Dépannage Render - Version Ultra-Light

## ✅ Problème Résolu avec Version Ultra-Light

### 🎉 **Solution Adoptée : Backend Ultra-Allégé**

**Anciens problèmes** :
- ❌ Out of Memory (used over 512Mi)
- ❌ sentence-transformers : ~200-300 MB
- ❌ faiss-cpu : ~100-200 MB  
- ❌ FastAPI + dépendances : ~100 MB
- ❌ **Total** : ~500-600 MB (dépassait la limite)

**Nouvelle architecture** :
- ✅ Serveur HTTP natif Python : ~30 MB
- ✅ google-generativeai : ~100 MB
- ✅ python-dotenv : ~5 MB
- ✅ **Total** : ~135 MB (largement sous la limite !)

## 🔧 Configuration Render Ultra-Light

### Paramètres Render optimisés :
```yaml
Root Directory: backend
Build Command: pip install -r requirements-ultra-light.txt
Start Command: python main-ultra-light.py
Environment Variables:
  - GEMINI_API_KEY: your_key_here
```
1. Dans votre dashboard Render
2. Allez dans Settings → Plan
3. Sélectionnez "Starter" (7$/mois)

### Solution 2 : Mode allégé (TEMPORAIRE)
**Coût** : Gratuit  
**Limitations** :
- ⚠️ Pas de recherche vectorielle FAISS
- ⚠️ Réponses moins précises
- ⚠️ Seulement Gemini API

**Comment faire** :
1. Modifiez la Build Command sur Render :
   ```
   pip install -r requirements-light.txt
   ```
2. Redéployez le service

### Solution 3 : Alternative cloud
**Options** :
- **Heroku** : Plan payant similaire
- **Railway** : Plans plus flexibles
- **Google Cloud Run** : Pay-per-use

## 🎯 Recommandation pour vous

**Débutant + Budget serré** : Commencez par Solution 2 (mode allégé)  
**Sérieux sur le projet** : Solution 1 (upgrade 7$/mois)  

## 📋 Checklist dépannage

### ✅ Vérifications de base
- [ ] Logs montrent "Out of memory" ?
- [ ] Service redémarre en boucle ?
- [ ] Build réussit mais start échoue ?

### ✅ Tests de mémoire
- [ ] Essayez `requirements-light.txt`
- [ ] Vérifiez dashboard Render utilisation RAM
- [ ] Surveillez les métriques

### ✅ Configuration Render
- [ ] Root Directory = `backend`
- [ ] Start Command = `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Variables d'environnement configurées

## 🔄 Plan d'action immédiat

### Étape 1 : Test mode allégé (5 min)
```bash
# Sur Render, changez Build Command vers :
pip install -r requirements-light.txt
```

### Étape 2 : Si ça marche (temporaire)
- ✅ Service démarre
- ⚠️ Fonctionnalités réduites
- 📈 Considérez upgrade plus tard

### Étape 3 : Si vous voulez toutes les fonctionnalités
- 💳 Upgrade vers plan Starter (7$/mois)
- 🚀 Revenez à `requirements.txt` complet

## 📞 Support supplémentaire

### Si mode allégé ne marche pas
1. Vérifiez les nouveaux logs
2. Contactez support Render
3. Considérez alternatives cloud

### Si upgrade payant ne marche pas
1. Problème probablement ailleurs
2. Vérifiez configuration ports
3. Vérifiez variables d'environnement

---

💡 **Conseil** : 7$/mois reste très raisonnable pour un service professionnel. C'est moins qu'un café par semaine ! ☕
