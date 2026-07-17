#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génère js/performance-data.js à partir de performances/performance_data.xlsx.

WORKFLOW DE MISE À JOUR DES PERFORMANCES :
    1. Mettre à jour performances/performance_data.xlsx (onglet Feuil1) :
       - Tableau 1 : en-tête "Depuis" + colonnes Securisé/Prudent/Equilibre/Dynamique/Offensif
                     (performances cumulées en décimal, ex: 0.1234 = +12,34%)
       - Tableau 2 : en-tête "Actif" + mêmes colonnes (pondérations cibles en décimal)
    2. Lancer :  python scripts/update_performance_data.py
    3. Vérifier le site en local puis commit + push (Netlify redéploie).

Le site (js/script.js) lit window.RAM_PERF_DATA depuis js/performance-data.js.
Si le fichier généré est absent, script.js retombe sur ses données intégrées.
"""

import json
import sys
from datetime import date
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("openpyxl manquant. Installer avec :  pip install openpyxl")

ROOT = Path(__file__).resolve().parent.parent
XLSX_PATH = ROOT / "performances" / "performance_data.xlsx"
OUTPUT_PATH = ROOT / "js" / "performance-data.js"

# Ordre et clés attendus par js/script.js
PROFILE_KEYS = ["Securise", "Prudent", "Equilibre", "Dynamique", "Offensif"]
ASSET_KEYS = {
    "actions": "Actions",
    "obligations entreprises": "ObligationsEntreprises",
    "obligations gouvernements": "ObligationsGouvernements",
    "liquidites": "Liquidites",
    "liquidités": "Liquidites",
}


def normalize(text):
    """Minuscule sans accents pour comparer les libellés Excel."""
    if text is None:
        return ""
    table = str.maketrans("éèêëàâîïôûùç", "eeeeaaiiouuc")
    return str(text).strip().lower().translate(table)


def parse_workbook(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.worksheets[0]
    all_rows = [[c.value for c in row] for row in ws.iter_rows()]

    perf_rows, alloc = [], {}
    mode = None  # "perf" après l'en-tête "Depuis", "alloc" après l'en-tête "Actif"

    for row in all_rows:
        first = normalize(row[0])
        if first == "depuis":
            mode = "perf"
            continue
        if first == "actif":
            mode = "alloc"
            continue
        if not first:
            continue

        if mode == "perf" and isinstance(row[0], (int, float)):
            values = row[1:1 + len(PROFILE_KEYS)]
            if any(v is None for v in values):
                continue
            entry = {"Annee": int(row[0])}
            entry.update({k: round(float(v), 8) for k, v in zip(PROFILE_KEYS, values)})
            perf_rows.append(entry)
        elif mode == "alloc" and first in ASSET_KEYS:
            asset_key = ASSET_KEYS[first]
            values = row[1:1 + len(PROFILE_KEYS)]
            for profile, v in zip(PROFILE_KEYS, values):
                if v is not None:
                    alloc.setdefault(profile, {})[asset_key] = round(float(v), 6)

    return perf_rows, alloc


def main():
    if not XLSX_PATH.exists():
        sys.exit(f"Fichier introuvable : {XLSX_PATH}")

    perf_rows, alloc = parse_workbook(XLSX_PATH)
    if not perf_rows:
        sys.exit("Aucune ligne de performance trouvée (en-tête 'Depuis' + années attendues).")

    perf_rows.sort(key=lambda r: r["Annee"])

    payload = {
        "generatedAt": date.today().isoformat(),
        "source": "performances/performance_data.xlsx",
        "rows": perf_rows,
        "alloc": alloc,
    }

    js = (
        "// FICHIER GÉNÉRÉ — ne pas éditer à la main.\n"
        "// Source : performances/performance_data.xlsx\n"
        "// Régénérer avec :  python scripts/update_performance_data.py\n"
        "window.RAM_PERF_DATA = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n"
    )

    OUTPUT_PATH.write_text(js, encoding="utf-8")
    years = [r["Annee"] for r in perf_rows]
    print(f"OK : {OUTPUT_PATH}")
    print(f"  {len(perf_rows)} lignes de performance (années {min(years)}-{max(years)})")
    print(f"  Allocations pour {len(alloc)} profils : {', '.join(alloc)}")


if __name__ == "__main__":
    main()
