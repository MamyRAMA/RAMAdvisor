# 🛠️ Guide de maintenance RAM Advisor — par module

> Vue d'ensemble du projet : [README.md](../README.md) à la racine.
> Toutes les commandes se lancent depuis la racine du projet sauf mention contraire.

---

## 1. 📈 Performances des portefeuilles (le workflow le plus fréquent)

**Source de vérité : `performances/performance_data.xlsx`** (onglet `Feuil1`).

| Tableau | En-tête | Contenu |
|---|---|---|
| 1 | `Depuis` | Performances cumulées par année de départ, en décimal (`0.1234` = +12,34%) |
| 2 | `Actif` | Pondérations cibles par profil (Actions, Obligations Entreprises, Obligations Gouvernements, Liquidités) |

Les 5 colonnes de profils : `Securisé`, `Prudent`, `Equilibre`, `Dynamique`, `Offensif`.

**Procédure :**
1. Mettre à jour l'Excel (ajouter/modifier des lignes d'années, ajuster les pondérations).
2. ```powershell
   python scripts/update_performance_data.py
   ```
   → régénère `js/performance-data.js` (ne JAMAIS éditer ce fichier à la main).
3. Ouvrir `index.html` en local, vérifier graphique + tableau + tooltips.
4. `git add`, `git commit`, `git push` → Netlify redéploie.

> Si `js/performance-data.js` est absent ou invalide, le site retombe sur des données
> intégrées dans `js/script.js` (fallback) — le site ne casse jamais.

---

## 2. 🤖 Simulateur IA (prompt + allocations)

**Sources de vérité (racine du projet) :**
- `prompt_template_v3.md` — persona, score d'atypicité, format de réponse.
- `knowledge_base.txt` — allocations types par objectif + principes de gestion privée.

**Règles impératives pour `knowledge_base.txt` :**
- Chaque section commence par `OBJECTIF : ...` (le code découpe sur cette chaîne).
- Chaque section doit contenir un mot-clé de filtrage (en MAJUSCULES) :
  `PRESERVATION`, `REVENU`, `CROISSANCE_MODEREE` (section Équilibré),
  `CROISSANCE`, `CROISSANCE_AGGRESSIVE` (section Agressive).
- Correspondance profils → sections servies (2 max par profil) :
  - Prudent → PRESERVATION + REVENU
  - Équilibré → REVENU + ÉQUILIBRÉ
  - Audacieux → CROISSANCE + CROISSANCE AGRESSIVE

**Après modification :** recopier vers les copies de secours :
```powershell
Copy-Item knowledge_base.txt streamlit_app/ -Force
Copy-Item knowledge_base.txt docs/knowledge/ -Force
Copy-Item prompt_template_v3.md streamlit_app/ -Force
```

**Tester avant de pousser :**
```powershell
# Option A : app Streamlit locale (nécessite GEMINI_API_KEY)
streamlit run streamlit_app/app.py
# Option B : notebook de test multi-profils
# test_clients_diversifies_v2.ipynb
```

---

## 3. 🎓 Base RAG CFA (Courses 1 à 5)

**Sources : `docs/knowledge/Course 1..5 *.pdf`** → embeddings dans `netlify/functions/cfa_data/`.

**Régénérer (après ajout/remplacement d'un PDF) :**
```powershell
cd scripts
python generate_cfa_embeddings.py      # extraction PDF + embeddings (quelques minutes)
python enrich_cfa_with_french.py       # enrichissement multilingue FR
```
- Pour ajouter un nouveau PDF : le déposer dans `docs/knowledge/` et l'ajouter à
  `DEFAULT_COURSE_PDFS` en tête de `scripts/generate_cfa_embeddings.py`.
- Dépendances : `pip install -r scripts/requirements.txt` (sentence-transformers, PyPDF2, numpy).

**Contrôles avant push :**
- Taille de `netlify/functions/cfa_data/` : rester raisonnable (< ~50 Mo au total).
  Les JSON sont écrits compacts et les embeddings arrondis à 5 décimales pour cela.
- En cas de dépassement : `cfa_knowledge_embeddings.json` (version non enrichie) peut être
  exclu du déploiement — la fonction n'utilise que `*_french_enriched.json` quand il existe.
- Tester une simulation sur le site déployé (préversion Netlify) et vérifier dans les logs
  de fonction que des chunks CFA sont trouvés (`✅ X chunks CFA ultra-optimisés trouvés`).

---

## 4. 🌐 Site vitrine (index.html, css, js)

- `index.html` : page unique v2 (hero → défi → méthode → performances → simulateur → offres → à propos → FAQ → contact).
- Les **IDs HTML sont contractuels avec `js/script.js`** — ne pas renommer sans adapter le JS :
  `startYear`, `resetBtn`, `perfChart`, `perfTbody`, `fromYearLbl`, `simulateBtn`, `goal`,
  `initialAmount`, `monthlyAmount`, `riskProfile`, `timeHorizon`, `simulationResult`,
  `loadingSpinner`, `resultText`, `postSimCTA`, `mobileMenuBtn`, `mobileMenu`,
  `accompagnementDonutChart`, et les 5 `tooltip-perf` du tableau (ordre = profils).
- La FAQ utilise `<details>/<summary>` : aucun JavaScript nécessaire.
- Tarifs : sections "Offres" dans `index.html` (rechercher `295 €`, `495 €`, `985 €`, `350 €`).
- Lien de prise de RDV : rechercher `calendly.com/mamy-ramadvisor` (présent en ~8 endroits).

**Test local rapide :** ouvrir `index.html` dans le navigateur (F12 → Console pour les erreurs).
Le simulateur IA ne fonctionne qu'en environnement Netlify (fonctions serverless) :
utiliser `netlify dev` ou tester sur la préversion de déploiement.

---

## 5. 🚀 Déploiement & urgence

- **Déploiement** : `git push` sur `main` → Netlify build automatique.
- **Variables Netlify** : `GEMINI_API_KEY` (obligatoire), `GEMINI_MODEL` (optionnel).
- **Rollback** : dashboard Netlify → Deploys → "Publish deploy" sur une version antérieure,
  ou `git revert` du commit fautif.
- **Sauvegardes git** : tags `backup-*` et branches `backup/*`
  (ex. `backup-pre-v2-20260717` = état avant la refonte v2 de juillet 2026).

---

## ✅ Checklist avant chaque push

- [ ] Console navigateur sans erreur (F12)
- [ ] Affichage mobile OK (menu hamburger, CTA flottant, graphiques)
- [ ] Section performances cohérente avec l'Excel
- [ ] Liens Calendly et pages ETF/Durabilité fonctionnels
- [ ] Message de commit descriptif
