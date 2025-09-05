# RAM Advisor - Configuration de Déploiement

## 🌍 Architecture Cloud

### Backend (Render)
- Service d'IA basé sur FastAPI
- FAISS pour la recherche vectorielle
- Embeddings avec sentence-transformers
- URL publique: `https://ramadvisor-backend.onrender.com`

### Frontend (Netlify)
- Site web statique (HTML, CSS, JS)
- Interface utilisateur connectée au backend
- URL: `https://ramadvisor.netlify.app` → `ramadvisor.fr`

## 📁 Structure Cloud

```
RAMAdvisor/
├── backend/                 # Service pour Render
│   ├── main.py             # API FastAPI
│   ├── ingest_documents.py # Ingestion des documents
│   ├── requirements.txt    # Dépendances Python
│   ├── runtime.txt         # Version Python pour Render
│   ├── render.yaml         # Configuration Render
│   └── docs/              # Documents de connaissance
├── frontend/               # Site pour Netlify
│   ├── index.html         # Page principale
│   ├── css/              # Styles
│   ├── js/               # Scripts (avec URL backend cloud)
│   ├── pages/            # Pages additionnelles
│   └── _redirects       # Configuration Netlify
└── docs/                 # Documentation
    ├── guide-deployment-cloud.md
    └── maintenance-cloud.md
```

## 🚀 Avantages

1. **Performance**: Service toujours accessible
2. **Simplicité**: Pas d'installation locale requise
3. **Scalabilité**: Peut gérer plus d'utilisateurs
4. **Maintenance**: Mises à jour centralisées
5. **Coût**: Gratuit ou < 10$/mois

## 📋 Prochaines Étapes

1. Restructurer les fichiers
2. Configurer le backend pour Render
3. Adapter le frontend pour Netlify
4. Déployer et tester
5. Mettre à jour la documentation
