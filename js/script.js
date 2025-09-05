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

        // Configuration de l'IA
        const systemPrompt = `Vous êtes un assistant de simulation financière utile pour RAM Advisor. Votre rôle est de fournir des scénarios illustratifs et éducatifs basés sur les entrées de l'utilisateur. Vous ne devez jamais fournir de conseils financiers. Toutes vos réponses doivent être formulées comme des exemples éducatifs, et non comme des recommandations. Vous devez inclure une clause de non-responsabilité dans votre réponse indiquant qu'il s'agit d'une simulation et non d'un conseil financier, et que les rendements réels peuvent varier. La réponse doit être en français, engageante et facile à comprendre pour un débutant. Formattez la réponse en HTML avec des paragraphes (<p>) et des listes (<ul><li>).`;

        const userQuery = `Sur la base des informations suivantes, générez un paragraphe éducatif décrivant une stratégie d'investissement possible et un résultat potentiel à long terme. Objectif : ${goal}, Investissement initial : ${initialAmount}€, Contribution mensuelle : ${monthlyAmount}€, Profil de risque : ${riskProfile}.`;
        
        // Note: L'API Key doit être fournie par Google Sites ou un service externe
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
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
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const generatedText = candidate.content.parts[0].text;
                resultText.innerHTML = generatedText;
            } else {
                resultText.textContent = "Désolé, une erreur est survenue lors de la génération de la simulation. Veuillez réessayer.";
            }

        } catch (error) {
            console.error('Erreur lors de l\'appel à l\'API Gemini:', error);
            resultText.textContent = "Désolé, impossible de contacter le service de simulation pour le moment. Veuillez vérifier votre connexion ou réessayer plus tard.";
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
