// RAM Advisor - Site Web Amélioré
document.addEventListener('DOMContentLoaded', function() {
    console.log('RAM Advisor - Site chargé !');
    
    // Initialisation des modules
    initializeInvestmentSimulator();
    initializeDoughnutChart();
    initializeSmoothScroll();
    initializeMobileMenu();
});

// Menu mobile hamburger
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!mobileMenuBtn || !mobileMenu) return; // Protection si les éléments n'existent pas
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });
    
    // Fermer le menu quand on clique sur un lien
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Simulateur d'investissement avec IA Gemini via Netlify Functions
function initializeInvestmentSimulator() {
    const simulateBtn = document.getElementById('simulateBtn');
    const simulationResult = document.getElementById('simulationResult');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultText = document.getElementById('resultText');

    if (!simulateBtn) return; // Protection si l'élément n'existe pas

    simulateBtn.addEventListener('click', async () => {
        // Récupération des valeurs du formulaire
        const goal = document.getElementById('goal').value;
        const initialAmount = document.getElementById('initialAmount').value;
        const monthlyAmount = document.getElementById('monthlyAmount').value;
        const riskProfile = document.getElementById('riskProfile').value;
        const timeHorizon = document.getElementById('timeHorizon').value;

        // Validation basique
        if (!goal || !initialAmount || !monthlyAmount) {
            alert('Veuillez remplir tous les champs pour lancer la simulation.');
            return;
        }

        // Affichage de l'état de chargement
        simulationResult.classList.remove('hidden');
        loadingSpinner.style.display = 'flex';
        resultText.innerHTML = '';
        simulateBtn.disabled = true;
        simulateBtn.querySelector('span').textContent = 'Analyse en cours...';

        try {
            // Mapper les profils de risque vers les termes exacts du template V3
            const riskMapping = {
                'conservative': 'Prudent',
                'balanced': 'Équilibré', 
                'aggressive': 'Audacieux'
            };

            // Paramètres IDENTIQUES au notebook (même format exact)
            const params = {
                objectif: goal,
                profil_risque: riskMapping[riskProfile] || 'Équilibré',
                montant_initial: `${initialAmount}€`,
                montant_mensuel: `${monthlyAmount}€`,
                horizon: `${timeHorizon} ans`
            };

            console.log('📊 Envoi des paramètres au site:', params);

            // Appel à la fonction Netlify
            const response = await fetch('/.netlify/functions/generate-investment-advice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            const data = await response.json();

            if (data.success) {
                // Affichage du résultat
                loadingSpinner.style.display = 'none';
                resultText.innerHTML = formatInvestmentAdvice(data.advice);
                // CTA de conversion : proposer l'appel découverte au moment le plus opportun
                const postSimCTA = document.getElementById('postSimCTA');
                if (postSimCTA) postSimCTA.classList.remove('hidden');
            } else {
                // Remonter le détail technique (message réel de l'API) pour faciliter le diagnostic
                const detail = data.details ? ` — ${data.details}` : '';
                throw new Error((data.error || 'Erreur lors de la génération du conseil') + detail);
            }

        } catch (error) {
            console.error('Erreur:', error);
            loadingSpinner.style.display = 'none';
            
            resultText.innerHTML = `
                <div class="text-red-600 p-4 bg-red-50 rounded-lg">
                    <h3 class="font-semibold">Erreur lors de la simulation</h3>
                    <p>${error.message}</p>
                    <p class="text-sm mt-2">Veuillez réessayer plus tard.</p>
                </div>
            `;
        } finally {
            simulateBtn.disabled = false;
            simulateBtn.querySelector('span').textContent = 'Lancer la simulation';
        }
    });
}

// Formate la réponse markdown de Gemini en HTML.
// Parseur ligne par ligne : gère titres, gras/italique, listes, règles horizontales
// et surtout les tableaux markdown (en-tête | séparateur :--- | lignes).
function formatInvestmentAdvice(advice) {
    const lines = String(advice).replace(/\r\n/g, '\n').split('\n');

    // Formatage « inline » (gras, italique) appliqué au contenu des cellules/paragraphes
    const inline = (t) => t
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Une ligne de séparation de tableau : | :--- | ---: | :---: |
    const isTableSeparator = (line) => {
        if (!line || line.indexOf('|') === -1) return false;
        const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
        return cells.length > 0 && cells.every((c) => /^\s*:?-{2,}:?\s*$/.test(c));
    };

    const splitRow = (line) => {
        let l = line.trim();
        if (l.startsWith('|')) l = l.slice(1);
        if (l.endsWith('|')) l = l.slice(0, -1);
        return l.split('|').map((c) => c.trim());
    };

    let html = '';
    let i = 0;
    while (i < lines.length) {
        const raw = lines[i];
        const line = raw.trim();

        // Tableau : la ligne courante contient des | et la suivante est un séparateur
        if (line.indexOf('|') !== -1 && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
            const header = splitRow(raw);
            i += 2; // saute en-tête + séparateur
            const rows = [];
            while (i < lines.length && lines[i].indexOf('|') !== -1 && lines[i].trim() !== '') {
                rows.push(splitRow(lines[i]));
                i++;
            }
            let table = '<div class="overflow-x-auto my-4"><table class="w-full border-collapse text-sm">';
            table += '<thead><tr>' + header.map((h) => `<th class="border border-gray-300 px-3 py-2 text-left bg-violet-50 text-violet-900">${inline(h)}</th>`).join('') + '</tr></thead>';
            table += '<tbody>' + rows.map((r) => '<tr>' + r.map((c) => `<td class="border border-gray-300 px-3 py-2 align-top">${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody>';
            table += '</table></div>';
            html += table;
            continue;
        }

        if (line === '') { i++; continue; }

        // Règle horizontale
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) { html += '<hr class="my-5 border-gray-200">'; i++; continue; }

        // Titres
        if (/^###\s+/.test(line)) { html += `<h3 class="text-lg font-semibold text-violet-700 mt-4 mb-2">${inline(line.replace(/^###\s+/, ''))}</h3>`; i++; continue; }
        if (/^##\s+/.test(line)) { html += `<h2 class="text-xl font-bold text-violet-800 mt-6 mb-3">${inline(line.replace(/^##\s+/, ''))}</h2>`; i++; continue; }
        if (/^#\s+/.test(line)) { html += `<h1 class="text-2xl font-bold text-violet-900 mt-6 mb-4">${inline(line.replace(/^#\s+/, ''))}</h1>`; i++; continue; }

        // Liste à puces
        if (/^[-*]\s+/.test(line)) {
            let items = '';
            while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]) && !/^(-{3,})$/.test(lines[i].trim())) {
                items += `<li class="mb-1">${inline(lines[i].trim().replace(/^[-*]\s+/, ''))}</li>`;
                i++;
            }
            html += `<ul class="list-disc list-inside mb-3 space-y-1">${items}</ul>`;
            continue;
        }

        // Liste numérotée
        if (/^\d+\.\s+/.test(line)) {
            let items = '';
            while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
                items += `<li class="mb-1">${inline(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`;
                i++;
            }
            html += `<ol class="list-decimal list-inside mb-3 space-y-1">${items}</ol>`;
            continue;
        }

        // Paragraphe : regroupe les lignes jusqu'à une ligne vide ou un nouveau bloc
        let para = line;
        i++;
        while (i < lines.length) {
            const n = lines[i].trim();
            if (n === '' || /^(#{1,3}\s|[-*]\s|\d+\.\s)/.test(n) || /^(-{3,}|\*{3,}|_{3,})$/.test(n) ||
                (n.indexOf('|') !== -1 && i + 1 < lines.length && isTableSeparator(lines[i + 1]))) break;
            para += ' ' + n;
            i++;
        }
        html += `<p class="mb-3">${inline(para)}</p>`;
    }

    return html;
}

// Graphique Donut pour l'allocation d'actifs
function initializeDoughnutChart() {
    // Fonction pour traitement des labels longs
    const processLabel = (label) => {
        if (typeof label !== 'string' || label.length <= 16) return label;
        const words = label.split(' ');
        const lines = [];
        let currentLine = '';
        for (const word of words) {
            if ((currentLine + ' ' + word).length > 16 && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = currentLine ? currentLine + ' ' + word : word;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    };

    // Callback pour les tooltips
    const tooltipTitleCallback = (tooltipItems) => {
        const item = tooltipItems[0];
        let label = item.chart.data.labels[item.dataIndex];
        return Array.isArray(label) ? label.join(' ') : label;
    };

    // Configuration des données du graphique
    const accompagnementData = {
        labels: ['Actions Monde (ETF)', 'Obligations Europe', 'Matières Premières', 'Liquidités'].map(processLabel),
        datasets: [{
            label: 'Allocation de Portefeuille',
            data: [60, 25, 10, 5],
            backgroundColor: ['#4C1D95', '#6D28D9', '#8B5CF6', '#A78BFA'],
            borderColor: '#FFFFFF',
            borderWidth: 3,
            hoverOffset: 4
        }]
    };

    // Configuration du graphique
    const accompagnementConfig = {
        type: 'doughnut',
        data: accompagnementData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: false 
                },
                tooltip: { 
                    callbacks: { 
                        title: tooltipTitleCallback 
                    } 
                }
            }
        }
    };

    // Création du graphique
    const accompagnementDonutChartCtx = document.getElementById('accompagnementDonutChart')?.getContext('2d');
    if (accompagnementDonutChartCtx) {
        new Chart(accompagnementDonutChartCtx, accompagnementConfig);
    }
}

// Navigation avec défilement fluide
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Fonctions utilitaires
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Fonction pour calculer des projections simples
function calculateInvestmentProjection(initialAmount, monthlyAmount, years, annualReturn) {
    const monthlyReturn = annualReturn / 12;
    const totalMonths = years * 12;
    
    let futureValue = initialAmount;
    
    for (let i = 0; i < totalMonths; i++) {
        futureValue = (futureValue + monthlyAmount) * (1 + monthlyReturn);
    }
    
    return Math.round(futureValue);
}

// Animation au scroll (optionnel)
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    });

    document.querySelectorAll('.card').forEach(el => observer.observe(el));
}

// ======= SECTION PERFORMANCES =======
// Initialisation de la section performances
document.addEventListener('DOMContentLoaded', function() {
    initializePerformanceSection();
});

function initializePerformanceSection() {
    // Vérifier si les éléments existent sur la page
    const startYearSelect = document.getElementById('startYear');
    if (!startYearSelect) return; // Si pas de section performances, sortir

    // ==== DONNÉES : js/performance-data.js (généré depuis performances/performance_data.xlsx) ====
    // Fallback intégré ci-dessous si le fichier généré est absent.
    const EXTERNAL_DATA = (typeof window !== 'undefined' && window.RAM_PERF_DATA) ? window.RAM_PERF_DATA : null;

    const ALLOC_FALLBACK = {
        Securise:  { Actions: 0.03,  ObligationsEntreprises: 0.30, ObligationsGouvernements: 0.47, Liquidites: 0.20 },
        Prudent:   { Actions: 0.24,  ObligationsEntreprises: 0.31, ObligationsGouvernements: 0.35, Liquidites: 0.10 },
        Equilibre: { Actions: 0.45,  ObligationsEntreprises: 0.25, ObligationsGouvernements: 0.25, Liquidites: 0.05 },
        Dynamique: { Actions: 0.725, ObligationsEntreprises: 0.14, ObligationsGouvernements: 0.11, Liquidites: 0.025 },
        Offensif:  { Actions: 0.94,  ObligationsEntreprises: 0.02, ObligationsGouvernements: 0.02, Liquidites: 0.02 }
    };
    const ALLOC = (EXTERNAL_DATA && EXTERNAL_DATA.alloc && Object.keys(EXTERNAL_DATA.alloc).length > 0)
        ? EXTERNAL_DATA.alloc
        : ALLOC_FALLBACK;

    // Renseigne les (i) du header de tableau
    document.querySelectorAll('.tooltip-perf').forEach((tip, i) => {
        const keys = ['Securise', 'Prudent', 'Equilibre', 'Dynamique', 'Offensif'];
        const key = keys[i];
        const a = ALLOC[key];
        const fmt = (x) => (x * 100).toFixed(0) + ' %';
        const tooltipEl = tip.querySelector('.tooltiptext-perf');
        if (tooltipEl) {
            tooltipEl.innerHTML = `<em>Répartition cible de l'allocation :</em><br>Actions : ${fmt(a.Actions)}<br>Oblig. Entreprises : ${fmt(a.ObligationsEntreprises)}<br>Oblig. Gouvernements : ${fmt(a.ObligationsGouvernements)}<br>Liquidités : ${fmt(a.Liquidites)}`;
        }
    });

    // ==== DONNÉES DE PERFORMANCE (générées ou fallback intégré) ====
    const ROWS_FALLBACK = [
        { Annee: 2026, Securise: 0.0064471,   Prudent: 0.01234136,  Equilibre: 0.01829692,  Dynamique: 0.02729146,  Offensif: 0.03543707 },
        { Annee: 2025, Securise: 0.08568205,  Prudent: 0.08131781,  Equilibre: 0.12340154,  Dynamique: 0.17386906,  Offensif: 0.21112693 },
        { Annee: 2024, Securise: 0.08133363,  Prudent: 0.15100089,  Equilibre: 0.22223624,  Dynamique: 0.30726911,  Offensif: 0.36950369 },
        { Annee: 2023, Securise: 0.15160772,  Prudent: 0.25944625,  Equilibre: 0.36498796,  Dynamique: 0.48109138,  Offensif: 0.56130067 },
        { Annee: 2020, Securise: 0.05517134,  Prudent: 0.20767187,  Equilibre: 0.36774369,  Dynamique: 0.55185902,  Offensif: 0.67835683 },
        { Annee: 2015, Securise: 0.15921548,  Prudent: 0.46446447,  Equilibre: 0.76970817,  Dynamique: 1.11264089,  Offensif: 1.35202102 },
        { Annee: 2010, Securise: 0.46693833,  Prudent: 1.05622609,  Equilibre: 1.62095322,  Dynamique: 2.21278209,  Offensif: 2.60628681 },
        { Annee: 2006, Securise: 0.63821678,  Prudent: 1.13607216,  Equilibre: 1.61470764,  Dynamique: 2.15759698,  Offensif: 2.54789493 }
    ];
    const rows = ((EXTERNAL_DATA && Array.isArray(EXTERNAL_DATA.rows) && EXTERNAL_DATA.rows.length > 0)
        ? EXTERNAL_DATA.rows.slice()
        : ROWS_FALLBACK).sort((a, b) => a.Annee - b.Annee);

    // ==== CONSTANTES / HELPERS ====
    const PROFILE_KEYS = [
        { key: 'Securise',  label: 'Sécurisé'  },
        { key: 'Prudent',   label: 'Prudent'   },
        { key: 'Equilibre', label: 'Équilibré' },
        { key: 'Dynamique', label: 'Dynamique' },
        { key: 'Offensif',  label: 'Offensif'  }
    ];

    const resetBtn    = document.getElementById('resetBtn');
    const perfTbody   = document.getElementById('perfTbody');
    const fromYearLbl = document.getElementById('fromYearLbl');

    const years = [...new Set(rows.map(r => r.Annee))].sort((a, b) => a - b);
    years.forEach(y => { 
        const o = document.createElement('option'); 
        o.value = y; 
        o.textContent = y; 
        startYearSelect.appendChild(o); 
    });
    startYearSelect.value = years[years.length - 1];

    // Formats
    const nfSigned0 = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0, signDisplay: 'always' });
    const nfSigned1 = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'always' });
    const nfSigned2 = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always' });

    function lerp(a, b, t) { return a + (b - a) * t; }
    function hexToRgb(h) { 
        h = h.replace('#', ''); 
        if (h.length === 3) { 
            h = h.split('').map(x => x + x).join(''); 
        } 
        const n = parseInt(h, 16); 
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; 
    }
    function rgba({ r, g, b }, a) { return `rgba(${r},${g},${b},${a})`; }
    
    const startColor = hexToRgb('#7c3aed');
    const endColor   = hexToRgb('#2563eb');
    
    function colorForIndex(i, total) { 
        const t = total <= 1 ? 0 : i / (total - 1); 
        return rgba({ 
            r: Math.round(lerp(startColor.r, endColor.r, t)), 
            g: Math.round(lerp(startColor.g, endColor.g, t)), 
            b: Math.round(lerp(startColor.b, endColor.b, t)) 
        }, 0.9); 
    }

    // Plugin : valeurs au-dessus des barres
    const valueLabels = {
        id: 'valueLabels',
        afterDatasetsDraw(chart) {
            const { ctx, chartArea } = chart; 
            const ds = chart.data.datasets[0]; 
            if (!ds) return; 
            const meta = chart.getDatasetMeta(0);
            ctx.save(); 
            
            // Taille adaptative selon la largeur d'écran
            const fontSize = window.innerWidth < 640 ? 12 : 18; // 12px mobile, 18px desktop
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            
            ctx.textAlign = 'center';
            meta.data.forEach((bar, idx) => { 
                const v = ds.data[idx]; 
                if (v == null) return; 
                const y = Math.max(chartArea.top + 14, bar.y - 12); 
                const c = Array.isArray(ds.backgroundColor) ? ds.backgroundColor[idx] : ds.backgroundColor; 
                ctx.fillStyle = c; 
                ctx.fillText(nfSigned1.format(v), bar.x, y); 
            });
            ctx.restore();
        }
    };

    let chart;
    function buildChart() {
        const ctx = document.getElementById('perfChart'); 
        if (!ctx) return;
        if (chart) chart.destroy();
        
        const y0 = +startYearSelect.value; 
        const row = rows.find(r => r.Annee === y0);
        if (!row) return;
        
        const labels = PROFILE_KEYS.map(p => p.label); 
        const values = PROFILE_KEYS.map(p => row[p.key]);
        const maxVal = Math.max(...values); 
        const suggestedMax = maxVal * 1.2;
        const colors = PROFILE_KEYS.map((_, i) => colorForIndex(i, PROFILE_KEYS.length));

        // Configuration responsive adaptée selon la taille d'écran
        const isMobile = window.innerWidth < 640;
        
        chart = new Chart(ctx, {
            type: 'bar',
            data: { 
                labels, 
                datasets: [{ 
                    label: '', 
                    data: values, 
                    backgroundColor: colors, 
                    borderColor: colors, 
                    borderWidth: 1, 
                    borderRadius: 10, 
                    maxBarThickness: 90, 
                    categoryPercentage: 0.9, 
                    barPercentage: 0.9 
                }] 
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Permet au graphique de s'adapter au conteneur
                layout: { padding: { top: 28 } },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        displayColors: true,
                        callbacks: {
                            title: (items) => items[0].label,
                            label: (ctx) => { 
                                const idx = ctx.dataIndex; 
                                const key = PROFILE_KEYS[idx].key; 
                                const a = ALLOC[key] || {}; 
                                const fmt = (x) => (x * 100).toFixed(0).replace('.', ',') + ' %'; 
                                return [ 
                                    `Actions : ${fmt(a.Actions ?? 0)}`, 
                                    `Oblig. Entreprises : ${fmt(a.ObligationsEntreprises ?? 0)}`, 
                                    `Oblig. Gouvernements : ${fmt(a.ObligationsGouvernements ?? 0)}`, 
                                    `Liquidités : ${fmt(a.Liquidites ?? 0)}` 
                                ]; 
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        grid: { display: false, drawBorder: false }, 
                        ticks: { 
                            display: true, 
                            font: { 
                                weight: 'bold',
                                size: isMobile ? 7 : 12 // Taille réduite sur mobile
                            },
                            maxRotation: isMobile ? 45 : 0, // Rotation à 45° sur mobile
                            minRotation: isMobile ? 45 : 0,
                            autoSkip: false
                        }, 
                        border: { display: false } 
                    },
                    y: { 
                        beginAtZero: true, 
                        suggestedMax, 
                        grid: { 
                            drawBorder: false, 
                            borderDash: [1, 2], 
                            color: 'rgba(200,200,200,.25)', 
                            lineWidth: 0.8 
                        }, 
                        ticks: { 
                            color: 'rgba(100,100,100,0.7)', 
                            callback: (v) => nfSigned0.format(v) 
                        }, 
                        border: { display: false } 
                    }
                }
            },
            plugins: [valueLabels]
        });
        fromYearLbl.textContent = y0;
    }

    function renderTable() {
        if (!perfTbody) return;
        const sorted = [...rows].sort((a, b) => b.Annee - a.Annee); 
        perfTbody.innerHTML = '';
        const colorMap = Object.fromEntries(PROFILE_KEYS.map((p, i) => [p.key, colorForIndex(i, PROFILE_KEYS.length)]));
        sorted.forEach(r => { 
            const tr = document.createElement('tr'); 
            tr.className = 'border-b last:border-0 hover:bg-gray-50'; 
            tr.innerHTML = `
                <td class="p-3 font-medium">${r.Annee}</td>
                <td class="p-3 text-right" style="color:${colorMap['Securise']}; font-weight:700">${nfSigned2.format(r.Securise)}</td>
                <td class="p-3 text-right" style="color:${colorMap['Prudent']}; font-weight:700">${nfSigned2.format(r.Prudent)}</td>
                <td class="p-3 text-right" style="color:${colorMap['Equilibre']}; font-weight:700">${nfSigned2.format(r.Equilibre)}</td>
                <td class="p-3 text-right" style="color:${colorMap['Dynamique']}; font-weight:700">${nfSigned2.format(r.Dynamique)}</td>
                <td class="p-3 text-right" style="color:${colorMap['Offensif']}; font-weight:700">${nfSigned2.format(r.Offensif)}</td>
            `; 
            perfTbody.appendChild(tr); 
        });
    }

    // Interactions
    if (resetBtn) {
        resetBtn.addEventListener('click', () => { 
            startYearSelect.value = years[years.length - 1]; 
            update(); 
        });
    }
    
    function update() { 
        buildChart(); 
        renderTable(); 
    }
    
    update();
    startYearSelect.addEventListener('change', update);
    
    // Event listener pour le redimensionnement de la fenêtre
    // Permet d'adapter le graphique lors de la rotation d'écran ou changement de taille
    window.addEventListener('resize', () => {
        if (chart) {
            const isMobile = window.innerWidth < 640;
            chart.options.scales.x.ticks.font.size = isMobile ? 7 : 12;
            chart.options.scales.x.ticks.maxRotation = isMobile ? 45 : 0;
            chart.options.scales.x.ticks.minRotation = isMobile ? 45 : 0;
            chart.update('none'); // 'none' pour éviter les animations au redimensionnement
        }
    });
}
