# 🏦 RAM Advisor - Solution Cloud

Plateforme de simulation d'investissement basée sur l'IA avec architecture cloud moderne.

## 🌍 Architecture

- **Backend** : API FastAPI déployée sur Render
- **Frontend** : Site web statique déployé sur Netlify  
- **IA** : RAG (Retrieval-Augmented Generation) avec FAISS + sentence-transformers

## 🚀 Déploiement

### 📋 Prérequis
- Compte GitHub ✅
- Compte Render (gratuit)
- Compte Netlify (gratuit)

### 🎯 Guide de déploiement
Suivez le guide détaillé : [`docs/guide-deployment-cloud.md`](docs/guide-deployment-cloud.md)

**Résumé rapide :**
1. Push le code sur GitHub
2. Connecter le dossier `backend/` à Render
3. Connecter le dossier `frontend/` à Netlify
4. Configurer le domaine `ramadvisor.fr`

## 📁 Structure du Projet

```
RAMAdvisor/
├── backend/                    # Service d'IA pour Render
│   ├── main.py                # API FastAPI
│   ├── ingest_documents.py    # Traitement des documents
│   ├── requirements.txt       # Dépendances Python
│   ├── runtime.txt           # Version Python
│   └── docs/knowledge/       # Documents de connaissance
├── frontend/                  # Site web pour Netlify
│   ├── index.html            # Page principale
│   ├── css/                  # Styles
│   ├── js/                   # Scripts (connectés au backend cloud)
│   ├── pages/                # Pages additionnelles
│   └── _redirects           # Configuration Netlify
└── docs/                     # Documentation
    ├── guide-deployment-cloud.md
    └── maintenance-cloud.md
```

## 🔗 URLs

- **Site Web** : https://ramadvisor.fr
- **Backend API** : https://ramadvisor-backend.onrender.com
- **Documentation** : https://ramadvisor.fr/docs

## ⚡ Fonctionnalités

- ✅ Simulation d'investissement IA
- ✅ Base de connaissances vectorielle
- ✅ Interface web responsive
- ✅ Architecture cloud scalable
- ✅ Déploiement automatique
- ✅ Surveillance et logs

## 🔧 Maintenance

Consultez le guide de maintenance : [`docs/maintenance-cloud.md`](docs/maintenance-cloud.md)

### Mise à jour du code
```bash
git add .
git commit -m "Votre message"
git push origin main
# ↳ Redéploiement automatique sur Render + Netlify
```

## 💰 Coûts

- **Développement** : Gratuit
- **Production légère** : Gratuit (Render + Netlify)
- **Production intensive** : ~7$/mois (Render plan payant)

## 🛠️ Technologies

### Backend
- **FastAPI** : API REST moderne
- **FAISS** : Recherche vectorielle
- **sentence-transformers** : Embeddings
- **Python 3.11** : Runtime

### Frontend  
- **HTML/CSS/JS** : Interface utilisateur
- **Tailwind CSS** : Framework CSS
- **Vanilla JS** : Interactions

### Infrastructure
- **Render** : Hébergement backend
- **Netlify** : Hébergement frontend + CDN
- **GitHub** : Contrôle de version + CI/CD

## 📊 Performance

- **Temps de réponse** : < 3 secondes (après réveil)
- **Disponibilité** : 99.9% (plan payant Render)
- **Scalabilité** : Automatique selon trafic

## 🔐 Sécurité

- ✅ HTTPS forcé sur tous les services
- ✅ CORS configuré pour domaines autorisés
- ✅ Variables d'environnement sécurisées
- ✅ Pas de données sensibles exposées

## 🆘 Support

### En cas de problème
1. Consultez [`docs/maintenance-cloud.md`](docs/maintenance-cloud.md)
2. Vérifiez les dashboards Render/Netlify
3. Consultez les logs de déploiement

### Contacts
- **Issues GitHub** : Pour bugs et améliorations
- **Render Support** : Pour problèmes backend
- **Netlify Support** : Pour problèmes frontend

---

🎉 **RAM Advisor** - Simulateur d'investissement nouvelle génération !
├── 📄 index.html          # Page principale du site
├── 📄 README.md           # Ce fichier
├── 📄 web.code-workspace  # Configuration VS Code
├── 📁 assets/             # Ressources statiques
├── 📁 css/
│   └── 📄 style.css       # Styles personnalisés
├── 📁 js/
│   └── 📄 script.js       # JavaScript du site
├── 📁 pages/
│   └── 📄 exemple.html    # Pages additionnelles
└── 📁 archive/            # Fichiers non utilisés pour le déploiement
    ├── 📁 docs-et-media/  # Documents et vidéos
    └── 📁 google-sites-versions/ # Versions pour Google Sites
```

## � Fichiers nécessaires pour le déploiement :

- ✅ `index.html` (page principale)
- ✅ `css/style.css` (styles)
- ✅ `js/script.js` (JavaScript)
- ✅ `assets/` (images, etc.)
- ✅ `pages/` (pages additionnelles)

## 🌐 Déploiement sur Netlify :

1. **Connecter le dépôt** : Connectez votre dépôt Git à Netlify
2. **Configuration de build** :
   - Build command: *(laisser vide)*
   - Publish directory: `./`
3. **Domaine** : Configurez votre domaine personnalisé
4. **HTTPS** : Activé automatiquement par Netlify

## 🔧 Technologies utilisées :

- HTML5 sémantique
- CSS3 (+ Tailwind CSS via CDN)
- JavaScript Vanilla
- Chart.js pour les graphiques
- Google Fonts (Inter)

## 📧 Contact :

Email : contact@ramadvisor.fr

---

*Site créé pour RAM Advisor - Conseil en Investissement Simplifié*
- Police principale : Inter (Google Fonts)

### Sections
1. **Hero** - Message principal
2. **Mission** - Présentation de l'entreprise
3. **Simulateur** - Outil IA d'investissement
4. **Offres** - Packages de services
5. **Contact** - Call-to-action
6. **Footer** - Informations légales

## 📧 Contact
- Email : contact@ramadvisor.fr
- Site adapté pour prospection et conversion

## 🔧 Technologies utilisées
- HTML5 sémantique
- Tailwind CSS (CDN)
- JavaScript vanilla
- Google Fonts (Inter)
- API Google Gemini

## 📝 Notes importantes
- Le site remplace "ACME Conseil" par "RAM Advisor"
- L'API Gemini nécessite une clé pour fonctionner
- Responsive design pour mobile/desktop
- Code optimisé pour Google Sites et hébergement classique
