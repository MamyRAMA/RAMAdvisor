# 🚨 Dépannage Render - Problèmes Courants

## 📊 Analyse de vos logs

D'après vos logs Render, voici les problèmes identifiés :

### ❌ **Problème Principal : Out of Memory**
```
==> Out of memory (used over 512Mi)
```

**Cause** : Votre application utilise plus de RAM que le plan gratuit (512 MB)

**Consommation typique** :
- sentence-transformers : ~200-300 MB
- faiss-cpu : ~100-200 MB  
- FastAPI + dépendances : ~100 MB
- **Total** : ~500-600 MB (dépasse la limite)

## 🔧 Solutions par ordre de préférence

### Solution 1 : Upgrade vers plan payant (RECOMMANDÉ)
**Coût** : 7$/mois  
**Avantages** :
- ✅ Plus de RAM (512 MB → 512 MB+ selon plan)
- ✅ Pas de coupures pour inactivité
- ✅ Fonctionnalités IA complètes
- ✅ Performances optimales

**Comment faire** :
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
