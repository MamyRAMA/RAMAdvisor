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
            // Mapper les profils de risque vers les termes du prompt
            const riskMapping = {
                'conservative': 'Prudent',
                'balanced': 'Équilibré', 
                'aggressive': 'Audacieux'
            };

            // Paramètres pour le prompt template v2
            const params = {
                objectif: goal, // Objectif tel que saisi par l'utilisateur
                profil_risque: riskMapping[riskProfile] || 'Équilibré',
                montant_initial: `${initialAmount}€`,
                montant_mensuel: `${monthlyAmount}€`,
                horizon: `${timeHorizon} ans`
            };

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
            } else {
                throw new Error(data.error || 'Erreur lors de la génération du conseil');
            }

        } catch (error) {
            console.error('Erreur:', error);
            loadingSpinner.style.display = 'none';
            resultText.innerHTML = `
                <div class="text-red-600 p-4 bg-red-50 rounded-lg">
                    <h3 class="font-semibold">Erreur de simulation</h3>
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
