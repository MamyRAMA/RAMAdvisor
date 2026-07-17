# RAM Advisor — Site vitrine & outils

Site de conseil en investissement pour particuliers (mass affluent français) : portefeuilles ETF sur mesure, coaching, simulateur IA. Déployé sur **Netlify**.

## 🗺️ Vue d'ensemble des modules

| Module | Rôle | Source de vérité | Mise à jour |
|---|---|---|---|
| **Site vitrine** | Acquisition & conversion | `index.html`, `css/`, `js/`, `pages/` | Éditer puis commit/push (Netlify redéploie) |
| **Performances** | Graphique + tableau de la section Performances | `performances/performance_data.xlsx` | `python scripts/update_performance_data.py` |
| **Simulateur IA** | Conseil généré par Gemini + RAG | `netlify/functions/` + `prompt_template_v3.md` + `knowledge_base.txt` | Éditer les fichiers racine puis synchroniser les copies |
| **Base RAG (CFA)** | Connaissance Courses 1-5 en embeddings | `docs/knowledge/Course *.pdf` | `python scripts/generate_cfa_embeddings.py` puis `python scripts/enrich_cfa_with_french.py` |
| **App Streamlit** | Version locale du simulateur (tests) | `streamlit_app/` | `streamlit run streamlit_app/app.py` |

Guide détaillé pas à pas : [docs/guide-maintenance.md](docs/guide-maintenance.md)

## 📁 Structure du projet

```
📁 RAMAdvisor/
├── index.html                  # Page principale (v2 optimisée conversion)
├── knowledge_base.txt          # Base de connaissances allocations (SOURCE DE VÉRITÉ)
├── prompt_template_v3.md       # Template de prompt IA (SOURCE DE VÉRITÉ)
├── netlify.toml                # Configuration de déploiement Netlify
├── css/style.css               # Styles personnalisés (complément Tailwind CDN)
├── js/
│   ├── script.js               # JavaScript du site (simulateur, graphiques, menu)
│   └── performance-data.js     # GÉNÉRÉ depuis l'Excel — ne pas éditer à la main
├── performances/
│   └── performance_data.xlsx   # Performances des portefeuilles modèles (à alimenter)
├── netlify/functions/
│   ├── generate-investment-advice.js   # API principale (Gemini + RAG)
│   ├── ultra-optimized-cfa-search.js   # Recherche vectorielle multilingue
│   ├── french-to-english-translator.js # Traducteur FR→EN pour la recherche
│   └── cfa_data/               # Embeddings GÉNÉRÉS (Courses 1-5)
├── pages/                      # Pages additionnelles (ETF, durabilité)
├── new-content/                # Brouillons de contenus (blog) non publiés
├── docs/
│   ├── knowledge/              # PDFs Courses 1-5 (base de connaissances CFA)
│   └── guide-maintenance.md    # Guide de mise à jour de chaque module
├── scripts/                    # Scripts Python de génération/maintenance
│   ├── update_performance_data.py   # Excel → js/performance-data.js
│   ├── generate_cfa_embeddings.py   # PDFs Courses 1-5 → embeddings JSON
│   └── enrich_cfa_with_french.py    # Enrichissement français des embeddings
└── streamlit_app/              # Simulateur local (tests de prompt/KB)
```

## 🔁 Les 3 workflows de mise à jour courants

### 1. Mettre à jour les performances affichées sur le site
1. Éditer `performances/performance_data.xlsx` (tableau "Depuis" + tableau "Actif").
2. `python scripts/update_performance_data.py`
3. Vérifier en local, puis commit + push.

### 2. Modifier le conseil IA (prompt ou allocations)
1. Éditer `prompt_template_v3.md` et/ou `knowledge_base.txt` **à la racine** (sources de vérité).
2. Recopier vers `streamlit_app/` et `docs/knowledge/` (copies de secours) :
   `Copy-Item knowledge_base.txt streamlit_app/; Copy-Item knowledge_base.txt docs/knowledge/`
3. Tester avec l'app Streamlit ou le notebook `test_clients_diversifies_v2.ipynb`, puis push.

⚠️ `knowledge_base.txt` : chaque section doit commencer par `OBJECTIF :` et contenir un des mots-clés
de filtrage (`PRESERVATION`, `REVENU`, `CROISSANCE_MODEREE`, `CROISSANCE`, `CROISSANCE_AGGRESSIVE`)
— c'est ce qui permet au site de sélectionner les bonnes sections par profil de risque.

### 3. Étendre la base de connaissances RAG (PDFs CFA)
1. Déposer le(s) PDF(s) dans `docs/knowledge/` et les référencer dans
   `DEFAULT_COURSE_PDFS` de `scripts/generate_cfa_embeddings.py`.
2. `cd scripts` puis `python generate_cfa_embeddings.py` (extraction + embeddings).
3. `python enrich_cfa_with_french.py` (recherche multilingue).
4. Vérifier la taille de `netlify/functions/cfa_data/` (< ~50 Mo recommandé), puis push.

## 🌐 Déploiement Netlify
- Build command : *(vide)* — Publish directory : `./`
- Variables d'environnement : `GEMINI_API_KEY` (obligatoire), `GEMINI_MODEL` (défaut : `gemini-flash-lite-latest`)

## 🔧 Technologies
HTML5 + Tailwind CSS (CDN) + JavaScript vanilla · Chart.js · Google Gemini API (SDK `@google/genai`) · RAG avec embeddings statiques (sentence-transformers MiniLM) · Netlify Functions · Python (openpyxl, PyPDF2, sentence-transformers)

## 📧 Contact
contact@ramadvisor.fr
