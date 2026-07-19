# Mise à jour des performances

Le site **ne lit jamais ce dossier directement**. Après toute modification de
`performance_data.xlsx`, il faut régénérer le fichier consommé par le site :

```
python scripts/update_performance_data.py
```

Ce script lit `performance_data.xlsx` et régénère `js/performance-data.js`
(chargé par `js/script.js` via `window.RAM_PERF_DATA`). Sans cette étape,
le site continue d'afficher les anciens chiffres même après un commit du xlsx.

Workflow complet :
1. Mettre à jour `performance_data.xlsx` (onglet Feuil1).
2. Lancer `python scripts/update_performance_data.py`.
3. Vérifier le site en local, puis commit + push **des deux fichiers**
   (`performance_data.xlsx` et `js/performance-data.js`).
4. Si plusieurs branches sont actives (ex. `refonte/*`), répéter la mise à
   jour et le script sur chacune — ce ne sont pas des fichiers générés à la volée par Netlify.
