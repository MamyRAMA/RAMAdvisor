# 🔧 Guide de Maintenance Cloud - RAM Advisor

## Vue d'ensemble

Ce guide décrit la maintenance d'une solution cloud déployée sur :
- **Backend** : Render (service d'IA)
- **Frontend** : Netlify (site web)

## 📊 Monitoring et Surveillance

### Vérification de l'état des services

#### Backend (Render)
```bash
# Test de santé
curl https://ramadvisor-backend.onrender.com/health

# Réponse attendue :
{
  "status": "healthy",
  "knowledge_base_loaded": true,
  "total_documents": 766
}
```

#### Frontend (Netlify)
- Site accessible : `https://ramadvisor.fr`
- Console développeur sans erreurs CORS
- Fonctionnalité de simulation opérationnelle

### Dashboards de monitoring
1. **Render Dashboard** : [dashboard.render.com](https://dashboard.render.com)
   - Logs en temps réel
   - Métriques de performance
   - Alertes de santé

2. **Netlify Dashboard** : [app.netlify.com](https://app.netlify.com)
   - Analytics du site
   - Logs de déploiement
   - Métriques de bande passante

## 🔄 Déploiements et Mises à jour

### Processus de déploiement automatique
```bash
# 1. Modifier le code localement
# 2. Commit et push
git add .
git commit -m "Description de la modification"
git push origin main

# 3. Les services se redéploient automatiquement
# - Render : Backend en ~5-10 min
# - Netlify : Frontend en ~1-2 min
```

### Types de mises à jour

#### Mise à jour du backend (IA)
- **Fichiers** : `backend/main.py`, `backend/requirements.txt`
- **Impact** : Redémarrage du service (~5-10 min)
- **Test** : Vérifier `/health` endpoint

#### Mise à jour du frontend
- **Fichiers** : `frontend/js/script.js`, `frontend/index.html`, etc.
- **Impact** : Déploiement rapide (~1-2 min)
- **Test** : Vérifier interface utilisateur

#### Mise à jour des documents de connaissance
- **Fichiers** : `backend/docs/knowledge/*`
- **Impact** : Réindexation automatique au redéploiement
- **Test** : Vérifier nouvelles réponses

## 🔧 Maintenance Préventive

### Tâches hebdomadaires
- [ ] Vérifier les logs Render pour erreurs
- [ ] Tester la simulation sur le site
- [ ] Vérifier les métriques de performance
- [ ] Contrôler l'utilisation des ressources

### Tâches mensuelles
- [ ] Analyser les statistiques Netlify
- [ ] Réviser les coûts Render/Netlify
- [ ] Sauvegarder les configurations
- [ ] Mettre à jour les dépendances si nécessaire

## 🚨 Résolution de Problèmes

### Problèmes courants

#### 1. Service backend lent/indisponible
**Symptômes** :
- Timeout sur les requêtes
- Erreur "Service temporairement indisponible"

**Solutions** :
```bash
# Vérifier l'état sur Render dashboard
# Consulter les logs pour erreurs
# Si besoin, redéployer manuellement
```

**Prévention** :
- Plan payant Render pour éviter le "sleep" automatique
- Ping automatique toutes les 10 minutes

#### 2. Erreurs CORS frontend
**Symptômes** :
- Erreur dans la console navigateur
- Requêtes bloquées

**Solutions** :
1. Vérifier l'URL backend dans `frontend/js/script.js`
2. Vérifier configuration CORS dans `backend/main.py`
3. Redéployer si modification nécessaire

#### 3. Site Netlify indisponible
**Symptômes** :
- Erreur 404 ou 500 sur ramadvisor.fr

**Solutions** :
1. Vérifier le dashboard Netlify
2. Consulter les logs de déploiement
3. Redéployer manuellement si nécessaire

### Procédures d'urgence

#### Rollback rapide
```bash
# Revenir au commit précédent
git log --oneline -5  # Voir les derniers commits
git revert HEAD       # Annuler le dernier commit
git push origin main  # Déclencher un redéploiement
```

#### Redéploiement manuel
1. **Render** : Dashboard → Service → "Manual Deploy"
2. **Netlify** : Dashboard → Deploys → "Trigger deploy"

## 📈 Optimisation des Performances

### Backend (Render)
- **Upgrade vers plan payant** si latence élevée
- **Optimisation du cache** FAISS
- **Monitoring de la RAM** utilisation

### Frontend (Netlify)
- **Compression des images** dans `assets/`
- **Minification du CSS/JS** (optionnel)
- **CDN automatique** de Netlify

## 🔐 Sécurité

### Bonnes pratiques
- **Clés API** : Stocker dans variables d'environnement Render
- **CORS** : Restreindre aux domaines autorisés
- **HTTPS** : Forcé automatiquement par Render/Netlify

### Vérifications de sécurité
- [ ] Audit mensuel des permissions GitHub
- [ ] Vérification des variables d'environnement
- [ ] Contrôle des logs pour tentatives d'intrusion

## 💰 Gestion des Coûts

### Surveillance mensuelle
- **Render** : Dashboard → Usage → Voir la consommation
- **Netlify** : Dashboard → Usage → Bande passante utilisée

### Optimisation des coûts
- **Render gratuit** : Suffisant pour <100 requêtes/jour
- **Upgrade Render** : Si service trop lent ou indisponible
- **Netlify gratuit** : Suffisant pour la plupart des usages

## 📱 Alertes et Notifications

### Configuration recommandée
1. **Email de monitoring** pour les pannes
2. **Slack/Discord webhook** pour les déploiements
3. **UptimeRobot** pour surveillance externe (gratuit)

### URLs à surveiller
- `https://ramadvisor-backend.onrender.com/health`
- `https://ramadvisor.fr`

## 📝 Journal de Maintenance

### Template d'entrée
```
Date : YYYY-MM-DD
Type : [MAINTENANCE/INCIDENT/UPGRADE]
Description : 
Actions : 
Résultat : 
Durée d'indisponibilité : 
```

---

## 🆘 Contacts de Support

- **Render** : [help.render.com](https://help.render.com)
- **Netlify** : [support.netlify.com](https://support.netlify.com)
- **GitHub** : [support.github.com](https://support.github.com)

---

💡 **Astuce** : Gardez ce guide à jour avec vos propres observations et solutions !
