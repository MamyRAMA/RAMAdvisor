// RAM Advisor - Site Web Amélioré
document.addEventListener('DOMContentLoaded', function() {
    console.log('RAM Advisor - Site chargé !');
    
    // Initialisation des modules
    initializeInvestmentSimulator();
    initializeDoughnutChart();
    initializeSmoothScroll();
});

// Simulateur d'investissement avec IA Gemini
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

        // Configuration du service RAM Advisor AI
        // 🧪 Pour tests locaux, décommentez la ligne suivante :
        // const apiUrl = 'http://localhost:8000/simulate';
        
        // 🌐 Pour production cloud (Render) :
        const apiUrl = 'https://ramadvisor-backend.onrender.com/simulate';

        const payload = {
            goal: goal,
            initial_amount: parseFloat(initialAmount),
            monthly_amount: parseFloat(monthlyAmount),
            risk_profile: riskProfile
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.response) {
                // Afficher la réponse principale
                resultText.innerHTML = result.response;
                
                // Ajouter les sources si disponibles
                if (result.sources && result.sources.length > 0) {
                    const sourcesHtml = `
                        <div class="mt-4 p-3 bg-violet-100 rounded-lg">
                            <h4 class="text-sm font-semibold text-violet-800 mb-2">📚 Sources consultées:</h4>
                            <ul class="text-xs text-violet-700 space-y-1">
                                ${result.sources.map(source => 
                                    `<li>• ${source.file} (page ${source.page}) - Score: ${(source.relevance_score * 100).toFixed(0)}%</li>`
                                ).join('')}
                            </ul>
                        </div>
                    `;
                    resultText.innerHTML += sourcesHtml;
                }
                
                // Ajouter le score de confiance
                if (result.confidence_score) {
                    const confidenceHtml = `
                        <div class="mt-2 text-xs text-gray-500 text-center">
                            Niveau de confiance: ${(result.confidence_score * 100).toFixed(0)}%
                        </div>
                    `;
                    resultText.innerHTML += confidenceHtml;
                }
            } else {
                resultText.textContent = "Désolé, une erreur est survenue lors de la génération de la simulation. Veuillez réessayer.";
            }

        } catch (error) {
            console.error('Erreur lors de l\'appel au service RAM Advisor AI:', error);
            
            // Message d'erreur plus informatif pour le cloud
            if (error.message.includes('Failed to fetch')) {
                resultText.innerHTML = `
                    <div class="p-4 bg-red-100 border border-red-400 rounded-lg">
                        <h4 class="text-red-800 font-semibold">🚫 Service temporairement indisponible</h4>
                        <p class="text-red-700 text-sm mt-2">
                            Le service d'IA est en cours de redémarrage. Veuillez patienter quelques instants et réessayer.
                        </p>
                        <p class="text-red-600 text-xs mt-2">
                            Les services cloud peuvent prendre 30-60 secondes pour redémarrer après une période d'inactivité.
                        </p>
                    </div>
                `;
            } else {
                resultText.innerHTML = `
                    <div class="text-orange-600">
                        <p><strong>⚠️ Erreur de connexion</strong></p>
                        <p>Une erreur technique est survenue. Veuillez réessayer dans quelques instants.</p>
                        <p class="text-sm mt-2 text-gray-600">Erreur: ${error.message}</p>
                    </div>
                `;
            }
        } finally {
            // Masquer le chargement et restaurer le bouton
            loadingSpinner.style.display = 'none';
            simulateBtn.disabled = false;
            simulateBtn.querySelector('span').textContent = 'Lancer la simulation';
        }
    });
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
