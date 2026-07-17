# RAM Advisor├── 📄 prompt_template_v3.md # Template pour les réponses IA- Site Web

## 🚀 Déploiement

Ce site est optimisé pour être déployé sur **Netlify**.

### Structure du projet :

```
📁 RAMAdvisor/
├── 📄 index.html          # Page principale du site
├── 📄 README.md           # Ce fichier
├── 📄 knowledge_base.txt  # Base de connaissances pour l'IA
├── � prompt_template_v3.md # Template pour les réponses IA
├── 📄 netlify.toml        # Configuration de déploiement Netlify
├── 📁 css/
│   └── 📄 style.css       # Styles personnalisés
├── 📁 js/
│   └── 📄 script.js       # JavaScript du site
├── 📁 netlify/
│   └── 📁 functions/      # Fonctions serverless Netlify
│       ├── 📄 generate-investment-advice.js # API principal
│       ├── 📄 ultra-optimized-cfa-search.js # Recherche vectorielle
│       ├── 📄 french-to-english-translator.js # Traducteur multilingue
│       ├── 📁 archive/    # Anciennes versions archivées
│       └── 📁 cfa_data/   # Embeddings et données vectorielles
├── 📁 pages/
│   └── 📄 exemple.html    # Pages additionnelles
├── 📁 scripts/            # Scripts de traitement des données
├── 📁 rag-solution/       # Solution RAG documentée
└── 📁 docs/               # Documentation
```

## 📋 Fichiers nécessaires pour le déploiement :

- ✅ `index.html` (page principale)
- ✅ `css/style.css` (styles)
- ✅ `js/script.js` (JavaScript)
- ✅ `knowledge_base.txt` (base de connaissances)
- ✅ `prompt_template_v3.md` (template IA)
- ✅ `netlify/functions/` (fonctions serverless)
- ✅ `netlify.toml` (configuration Netlify)
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
- Google Gemini API (IA générative)
- RAG (Retrieval Augmented Generation) avec embeddings vectoriels

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
- JavaScript ES6+
- Google Fonts (Inter)
- API Google Gemini (modèle configurable via GEMINI_MODEL, défaut: gemini-flash-lite-latest)
- Netlify Functions (serverless)
- Système RAG (Retrieval Augmented Generation)

## 📝 Notes importantes
- L'API Gemini nécessite une clé pour fonctionner (à configurer dans Netlify)
- Responsive design pour mobile/desktop
- Le notebook de test `test_clients_diversifies_v2.ipynb` permet de valider le système
- Utilise le template de prompt V3 avec système d'atypicité avancé
- Solution RAG implémentée dans les fonctions Netlify
