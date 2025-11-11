// RAM Advisor - Site Web Amélioré
document.addEventListener('DOMContentLoaded', function() {
    console.log('RAM Advisor - Site chargé !');
    
    // Initialisation des modules
    initializeInvestmentSimulator();
    initializeDoughnutChart();
    initializeSmoothScroll();
});

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

            // Détecter si on est en local ou en production
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            if (isLocalhost) {
                // En local, afficher un message informatif
                throw new Error('Le simulateur IA nécessite un déploiement sur Netlify pour fonctionner. En local, seuls les graphiques et l\'interface sont testables.');
            }

            // Appel à la fonction Netlify (uniquement en production)
            const response = await fetch('/.netlify/functions/generate-investment-advice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            // Vérifier si la réponse est bien du JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Le serveur a retourné une réponse invalide. Assurez-vous que le site est déployé sur Netlify.');
            }

            const data = await response.json();

            if (data.success) {
                // Affichage du résultat
                loadingSpinner.style.display = 'none';
                resultText.innerHTML = formatInvestmentAdvice(data.advice);
            } else {
                throw new Error(data.error || 'Erreur lors de la génération du conseil');
            }

        } catch (error) {
            console.error('Erreur:', error);
            loadingSpinner.style.display = 'none';
            
            // Message plus informatif selon le contexte
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const localMessage = isLocalhost ? '<p class="text-sm mt-2 bg-blue-50 p-2 rounded">💡 <strong>Mode local détecté :</strong> Le simulateur IA fonctionne uniquement sur le site déployé (Netlify). Vous pouvez tester les autres fonctionnalités du site en local.</p>' : '<p class="text-sm mt-2">Veuillez réessayer plus tard.</p>';
            
            resultText.innerHTML = `
                <div class="text-red-600 p-4 bg-red-50 rounded-lg">
                    <h3 class="font-semibold">Simulateur IA non disponible</h3>
                    <p>${error.message}</p>
                    ${localMessage}
                </div>
            `;
        } finally {
            simulateBtn.disabled = false;
            simulateBtn.querySelector('span').textContent = 'Lancer la simulation';
        }
    });
}

// Fonction pour formater la réponse de Gemini en HTML
function formatInvestmentAdvice(advice) {
    // Convertir le markdown en HTML basique
    let html = advice
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/### (.*?)$/gm, '<h3 class="text-lg font-semibold text-violet-700 mt-4 mb-2">$1</h3>')
        .replace(/## (.*?)$/gm, '<h2 class="text-xl font-bold text-violet-800 mt-6 mb-3">$1</h2>')
        .replace(/# (.*?)$/gm, '<h1 class="text-2xl font-bold text-violet-900 mt-8 mb-4">$1</h1>')
        .replace(/\n\n/g, '</p><p class="mb-3">')
        .replace(/\|(.*?)\|/g, '<td class="border px-3 py-2">$1</td>');

    // Ajouter les balises de paragraphe
    html = '<p class="mb-3">' + html + '</p>';
    
    // Traitement spécial pour les tableaux
    if (html.includes('<td')) {
        html = html.replace(/(<td.*?<\/td>.*?<td.*?<\/td>.*?<td.*?<\/td>)/g, '<tr>$1</tr>');
        html = html.replace(/(<tr>.*?<\/tr>)/g, '<table class="w-full border-collapse border border-gray-300 my-4">$1</table>');
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

    // ==== PONDÉRATIONS INLINE POUR TOOLTIP & EN-TÊTES ====
    const ALLOC = {
        Securise:  { Actions: 0.03,  ObligationsEntreprises: 0.30, ObligationsGouvernements: 0.47, Securite: 0.20 },
        Prudent:   { Actions: 0.24,  ObligationsEntreprises: 0.31, ObligationsGouvernements: 0.35, Securite: 0.10 },
        Equilibre: { Actions: 0.45,  ObligationsEntreprises: 0.25, ObligationsGouvernements: 0.25, Securite: 0.05 },
        Dynamique: { Actions: 0.725, ObligationsEntreprises: 0.14, ObligationsGouvernements: 0.11, Securite: 0.025 },
        Offensif:  { Actions: 0.94,  ObligationsEntreprises: 0.02, ObligationsGouvernements: 0.02, Securite: 0.02 }
    };

    // Renseigne les (i) du header de tableau
    document.querySelectorAll('.tooltip-perf').forEach((tip, i) => {
        const keys = ['Securise', 'Prudent', 'Equilibre', 'Dynamique', 'Offensif'];
        const key = keys[i];
        const a = ALLOC[key];
        const fmt = (x) => (x * 100).toFixed(0) + ' %';
        const tooltipEl = tip.querySelector('.tooltiptext-perf');
        if (tooltipEl) {
            tooltipEl.innerHTML = `<em>Répartition cible de l'allocation :</em><br>Actions : ${fmt(a.Actions)}<br>Oblig. Entreprises : ${fmt(a.ObligationsEntreprises)}<br>Oblig. Gouvernements : ${fmt(a.ObligationsGouvernements)}<br>Sécurité : ${fmt(a.Securite)}`;
        }
    });

    // ==== DONNÉES DE PERFORMANCE INLINE ====
    const rows = [
        { Annee: 2025, Securise: 0.030761549, Prudent: 0.061882622, Equilibre: 0.091874908, Dynamique: 0.127789697, Offensif: 0.153831025 },
        { Annee: 2024, Securise: 0.074779637, Prudent: 0.12965576,  Equilibre: 0.187288937, Dynamique: 0.255756613, Offensif: 0.305145209 },
        { Annee: 2023, Securise: 0.144512061, Prudent: 0.23535374,  Equilibre: 0.325348399, Dynamique: 0.422709525, Offensif: 0.488530368 },
        { Annee: 2022, Securise: 0.029137542, Prudent: 0.094175675, Equilibre: 0.165238473, Dynamique: 0.245795216, Offensif: 0.298551397 },
        { Annee: 2020, Securise: 0.048320175, Prudent: 0.182481602, Equilibre: 0.32581244,  Dynamique: 0.489650296, Offensif: 0.600602267 },
        { Annee: 2015, Securise: 0.08962308,  Prudent: 0.264413442, Equilibre: 0.44356053,  Dynamique: 0.646226222, Offensif: 0.786223966 },
        { Annee: 2010, Securise: 0.150977033, Prudent: 0.430437914, Equilibre: 0.712048509, Dynamique: 1.025921363, Offensif: 1.242866839 },
        { Annee: 2005, Securise: 0.455687568, Prudent: 1.005198393, Equilibre: 1.533610699, Dynamique: 2.081376814, Offensif: 2.441289123 }
    ].sort((a, b) => a.Annee - b.Annee);

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
            ctx.font = 'bold 18px Inter, sans-serif'; 
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
                                    `Sécurité : ${fmt(a.Securite ?? 0)}` 
                                ]; 
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        grid: { display: false, drawBorder: false }, 
                        ticks: { display: true, font: { weight: 'bold' } }, 
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
}
