/**
 * Modifications du script principal pour intégrer la recherche vectorielle
 * 
 * INSTRUCTIONS:
 * 1. Ajoutez cette variable globale en haut de votre script.js
 * 2. Remplacez la fonction d'initialisation DOMContentLoaded
 * 3. Remplacez votre fonction de simulation d'investissement
 * 4. Ajoutez les fonctions utilitaires à la fin
 */

// =============================================================================
// 1. VARIABLE GLOBALE (à ajouter en haut de script.js)
// =============================================================================

let vectorSearch = null;

// =============================================================================
// 2. INITIALISATION MODIFIÉE (remplacer votre DOMContentLoaded)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('RAM Advisor - Site chargé avec recherche vectorielle !');
    
    // Initialisation des modules dans l'ordre
    initializeVectorSearch();
    initializeInvestmentSimulator();
    initializeDoughnutChart(); // Gardez vos fonctions existantes
    initializeSmoothScroll();  // Gardez vos fonctions existantes
});

// Initialisation de la recherche vectorielle
async function initializeVectorSearch() {
    console.log('🔄 Initialisation de la recherche vectorielle...');
    
    try {
        vectorSearch = new ClientVectorSearch();
        const success = await vectorSearch.initialize();
        
        if (success) {
            console.log('✅ Recherche vectorielle prête');
            const stats = vectorSearch.getStats();
            console.log('📊 Stats:', stats);
        } else {
            console.warn('⚠️ Recherche vectorielle non disponible - mode dégradé');
        }
    } catch (error) {
        console.error('❌ Erreur initialisation recherche vectorielle:', error);
        console.log('🔄 Fonctionnement en mode sans base de connaissances');
    }
}

// =============================================================================
// 3. SIMULATEUR D'INVESTISSEMENT MODIFIÉ (remplacer votre fonction existante)
// =============================================================================

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

        try {
            // Nouvelle approche : simulation locale avec recherche vectorielle
            const result = await generateLocalSimulation({
                goal,
                initialAmount: parseFloat(initialAmount),
                monthlyAmount: parseFloat(monthlyAmount),
                riskProfile
            });

            resultText.innerHTML = result.response;
            
            // Ajouter les sources si disponibles
            if (result.sources && result.sources.length > 0) {
                const sourcesHtml = `
                    <div class="mt-4 p-3 bg-violet-100 rounded-lg">
                        <h4 class="text-sm font-semibold text-violet-800 mb-2">📚 Sources consultées:</h4>
                        <ul class="text-xs text-violet-700 space-y-1">
                            ${result.sources.map(source => 
                                `<li>• ${source.sourceFile} (page ${source.page}) - Pertinence: ${(source.score * 100).toFixed(0)}%</li>`
                            ).join('')}
                        </ul>
                    </div>
                `;
                resultText.innerHTML += sourcesHtml;
            }
            
            // Ajouter le score de confiance
            if (result.confidenceScore) {
                const confidenceHtml = `
                    <div class="mt-2 text-xs text-gray-500 text-center">
                        Simulation basée sur notre base de connaissances - Confiance: ${(result.confidenceScore * 100).toFixed(0)}%
                    </div>
                `;
                resultText.innerHTML += confidenceHtml;
            }

        } catch (error) {
            console.error('Erreur lors de la simulation:', error);
            
            resultText.innerHTML = `
                <div class="p-4 bg-orange-100 border border-orange-400 rounded-lg">
                    <h4 class="text-orange-800 font-semibold">⚠️ Simulation de base</h4>
                    <p class="text-orange-700 text-sm mt-2">
                        La base de connaissances n'est pas disponible. Voici une simulation de base :
                    </p>
                    ${generateFallbackSimulation({goal, initialAmount: parseFloat(initialAmount), monthlyAmount: parseFloat(monthlyAmount), riskProfile})}
                </div>
            `;
        } finally {
            // Masquer le chargement et restaurer le bouton
            loadingSpinner.style.display = 'none';
            simulateBtn.disabled = false;
            simulateBtn.querySelector('span').textContent = 'Lancer la simulation';
        }
    });
}

// =============================================================================
// 4. FONCTIONS UTILITAIRES À AJOUTER
// =============================================================================

// Génération de simulation locale avec recherche vectorielle
async function generateLocalSimulation(params) {
    const { goal, initialAmount, monthlyAmount, riskProfile } = params;
    
    // Construire la requête de recherche
    const searchQuery = `${goal} investissement ${riskProfile} portefeuille allocation stratégie risque`;
    
    let relevantSources = [];
    let knowledgeContext = '';
    
    // Rechercher dans la base de connaissances si disponible
    if (vectorSearch && vectorSearch.isInitialized) {
        console.log(`🔍 Recherche pour: "${searchQuery}"`);
        relevantSources = await vectorSearch.intelligentSearch(searchQuery, { topK: 3 });
        
        if (relevantSources.length > 0) {
            knowledgeContext = relevantSources
                .map(source => `[${source.sourceFile}, page ${source.page}]\n${source.text}`)
                .join('\n\n');
        }
    }
    
    // Générer la réponse
    const response = await generateSmartResponse(params, relevantSources, knowledgeContext);
    
    return {
        response: response,
        sources: relevantSources,
        confidenceScore: relevantSources.length > 0 ? 0.85 : 0.5
    };
}

// Générateur de réponse intelligente basée sur les connaissances
async function generateSmartResponse(params, sources, context) {
    const { goal, initialAmount, monthlyAmount, riskProfile } = params;
    
    // Calculs de base
    const projections = calculateDetailedProjections(initialAmount, monthlyAmount, riskProfile);
    
    // Analyser le contexte pour des recommandations personnalisées
    const recommendations = analyzeContextForRecommendations(context, riskProfile, goal);
    
    let response = `
        <div class="simulation-result">
            <h3 class="text-xl font-bold text-violet-800 mb-4">📊 Analyse personnalisée pour votre projet</h3>
            
            <div class="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg mb-4">
                <h4 class="font-semibold text-violet-700">🎯 Votre profil d'investissement</h4>
                <p><strong>Objectif :</strong> ${goal}</p>
                <p><strong>Profil de risque :</strong> ${riskProfile}</p>
                <p><strong>Capital initial :</strong> ${formatCurrency(initialAmount)}</p>
                <p><strong>Versements mensuels :</strong> ${formatCurrency(monthlyAmount)}</p>
            </div>
    `;
    
    // Ajouter les recommandations basées sur les connaissances
    if (recommendations.strategy) {
        response += `
            <div class="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 class="font-semibold text-blue-700 mb-2">💡 Stratégie recommandée</h4>
                <p>${recommendations.strategy}</p>
            </div>
        `;
    }
    
    // Projections détaillées
    response += `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-semibold text-green-700">📈 Projection 10 ans</h4>
                <p class="text-2xl font-bold text-green-800">${formatCurrency(projections.year10.value)}</p>
                <p class="text-sm text-green-600">Gain potentiel: ${formatCurrency(projections.year10.gains)}</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
                <h4 class="font-semibold text-purple-700">🚀 Projection 20 ans</h4>
                <p class="text-2xl font-bold text-purple-800">${formatCurrency(projections.year20.value)}</p>
                <p class="text-sm text-purple-600">Gain potentiel: ${formatCurrency(projections.year20.gains)}</p>
            </div>
        </div>
    `;
    
    // Allocation recommandée
    response += `
        <div class="bg-yellow-50 p-4 rounded-lg mb-4">
            <h4 class="font-semibold text-yellow-700 mb-2">🎯 Allocation suggérée</h4>
            ${projections.allocation.map(item => 
                `<div class="flex justify-between py-1">
                    <span>${item.asset}</span>
                    <span class="font-semibold">${item.percentage}%</span>
                </div>`
            ).join('')}
        </div>
    `;
    
    // Ajouter des insights basés sur les connaissances
    if (recommendations.insights.length > 0) {
        response += `
            <div class="bg-indigo-50 p-4 rounded-lg mb-4">
                <h4 class="font-semibold text-indigo-700 mb-2">🧠 Points clés à retenir</h4>
                <ul class="space-y-2">
                    ${recommendations.insights.map(insight => `<li class="flex items-start">
                        <span class="text-indigo-500 mr-2">•</span>
                        <span>${insight}</span>
                    </li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Prochaines étapes
    response += `
        <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-700 mb-2">📋 Prochaines étapes recommandées</h4>
            <ol class="space-y-1 text-sm">
                <li>1. Définir précisément vos objectifs et horizon de placement</li>
                <li>2. Évaluer votre capacité d'épargne et situation financière</li>
                <li>3. Choisir une enveloppe fiscale adaptée (PEA, Assurance-vie, CTO)</li>
                <li>4. Diversifier vos investissements selon votre profil de risque</li>
                <li>5. Faire un suivi régulier et rééquilibrer si nécessaire</li>
            </ol>
        </div>
        
        <div class="mt-4 text-center text-xs text-gray-500 italic">
            Cette simulation est fournie à titre éducatif et ne constitue pas un conseil en investissement personnalisé.
            Consultez un conseiller financier pour une analyse détaillée de votre situation.
        </div>
    </div>
    `;
    
    return response;
}
