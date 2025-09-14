/**
 * Fonctions utilitaires pour les calculs d'investissement et recommandations
 * 
 * INSTRUCTIONS:
 * Ajoutez ces fonctions à la fin de votre script.js principal
 */

// =============================================================================
// CALCULS D'INVESTISSEMENT
// =============================================================================

/**
 * Calcule des projections détaillées selon le profil de risque
 */
function calculateDetailedProjections(initialAmount, monthlyAmount, riskProfile) {
    // Taux de rendement selon le profil de risque
    const annualReturns = {
        'Prudent': 0.04,
        'Équilibré': 0.06,
        'Dynamique': 0.08,
        'Agressif': 0.10
    };
    
    const annualReturn = annualReturns[riskProfile] || 0.06;
    const monthlyReturn = annualReturn / 12;
    
    // Calculs pour 10 et 20 ans
    const projections = {
        year10: calculateCompoundGrowth(initialAmount, monthlyAmount, monthlyReturn, 120),
        year20: calculateCompoundGrowth(initialAmount, monthlyAmount, monthlyReturn, 240)
    };
    
    // Allocation suggérée selon le profil
    const allocations = {
        'Prudent': [
            { asset: 'Obligations', percentage: 60 },
            { asset: 'Actions', percentage: 30 },
            { asset: 'Liquidités', percentage: 10 }
        ],
        'Équilibré': [
            { asset: 'Actions', percentage: 50 },
            { asset: 'Obligations', percentage: 40 },
            { asset: 'Liquidités', percentage: 10 }
        ],
        'Dynamique': [
            { asset: 'Actions', percentage: 70 },
            { asset: 'Obligations', percentage: 20 },
            { asset: 'Alternatives', percentage: 10 }
        ],
        'Agressif': [
            { asset: 'Actions', percentage: 80 },
            { asset: 'Alternatives', percentage: 15 },
            { asset: 'Liquidités', percentage: 5 }
        ]
    };
    
    return {
        ...projections,
        allocation: allocations[riskProfile] || allocations['Équilibré']
    };
}

/**
 * Calcule la croissance composée avec versements réguliers
 */
function calculateCompoundGrowth(initial, monthly, monthlyRate, months) {
    let value = initial;
    for (let i = 0; i < months; i++) {
        value = (value + monthly) * (1 + monthlyRate);
    }
    
    const totalInvested = initial + (monthly * months);
    const gains = value - totalInvested;
    
    return {
        value: Math.round(value),
        totalInvested: Math.round(totalInvested),
        gains: Math.round(gains)
    };
}

// =============================================================================
// ANALYSE DU CONTEXTE ET RECOMMANDATIONS
// =============================================================================

/**
 * Analyse le contexte des documents trouvés pour générer des recommandations
 */
function analyzeContextForRecommendations(context, riskProfile, goal) {
    const recommendations = {
        strategy: '',
        insights: []
    };
    
    // Analyse du contexte pour extraire des recommandations
    if (context) {
        const contextLower = context.toLowerCase();
        
        // Stratégie basée sur l'objectif et le profil
        if (goal.toLowerCase().includes('retraite')) {
            recommendations.strategy = `Pour votre objectif de retraite avec un profil ${riskProfile}, privilégiez une approche progressive diminuant le risque avec l'âge.`;
            recommendations.insights.push('Commencez par des investissements dynamiques puis réduisez progressivement le risque');
            recommendations.insights.push('Considérez les avantages fiscaux du PER (Plan Épargne Retraite)');
        } else if (goal.toLowerCase().includes('achat') || goal.toLowerCase().includes('immobilier')) {
            recommendations.strategy = `Pour un projet immobilier, sécurisez progressivement votre capital à l'approche de l'échéance.`;
            recommendations.insights.push('Privilégiez la sécurisation du capital 2-3 ans avant l\'achat');
        } else {
            recommendations.strategy = `Avec un profil ${riskProfile}, diversifiez vos investissements pour optimiser le rapport rendement/risque.`;
        }
        
        // Insights basés sur le contenu des documents trouvés
        if (contextLower.includes('diversification')) {
            recommendations.insights.push('La diversification est la clé pour réduire les risques sans sacrifier le rendement');
        }
        if (contextLower.includes('volatilité') || contextLower.includes('risque')) {
            recommendations.insights.push('Accepter une certaine volatilité à court terme peut améliorer les rendements à long terme');
        }
        if (contextLower.includes('frais') || contextLower.includes('coût')) {
            recommendations.insights.push('Minimisez les frais de gestion qui réduisent significativement la performance long terme');
        }
        if (contextLower.includes('dollar cost averaging') || contextLower.includes('versements réguliers')) {
            recommendations.insights.push('Les versements réguliers lissent l\'impact de la volatilité des marchés');
        }
    }
    
    // Recommandations génériques selon le profil si pas assez d'insights
    const profileInsights = {
        'Prudent': [
            'Privilégiez la sécurité du capital avec des rendements modérés mais stables',
            'Les fonds euros et obligations d\'État conviennent à votre profil'
        ],
        'Équilibré': [
            'Un bon équilibre entre croissance et sécurité correspond à votre profil',
            'Les ETF diversifiés sont adaptés pour une exposition mondiale'
        ],
        'Dynamique': [
            'Vous pouvez accepter plus de volatilité pour un potentiel de gains supérieur',
            'Les actions et ETF actions constituent la base de votre allocation'
        ],
        'Agressif': [
            'Maximisez votre exposition aux actifs de croissance',
            'Considérez les marchés émergents et secteurs innovants'
        ]
    };
    
    // Compléter avec des insights spécifiques au profil si nécessaire
    if (recommendations.insights.length < 3) {
        const additionalInsights = profileInsights[riskProfile] || [];
        recommendations.insights.push(...additionalInsights.slice(0, 3 - recommendations.insights.length));
    }
    
    return recommendations;
}

// =============================================================================
// FONCTIONS DE FALLBACK
// =============================================================================

/**
 * Génère une simulation de base sans base de connaissances
 */
function generateFallbackSimulation(params) {
    const { goal, initialAmount, monthlyAmount, riskProfile } = params;
    const projections = calculateDetailedProjections(initialAmount, monthlyAmount, riskProfile);
    
    return `
        <div class="p-4">
            <h4 class="font-semibold mb-2">Simulation de base pour ${goal}</h4>
            <p><strong>Profil:</strong> ${riskProfile}</p>
            <p><strong>Projection 10 ans:</strong> ${formatCurrency(projections.year10.value)}</p>
            <p><strong>Projection 20 ans:</strong> ${formatCurrency(projections.year20.value)}</p>
            <p class="text-sm text-gray-600 mt-2">
                Cette simulation utilise des hypothèses de rendement standard. 
                Pour une analyse personnalisée, la base de connaissances doit être chargée.
            </p>
        </div>
    `;
}

// =============================================================================
// FONCTIONS UTILITAIRES GÉNÉRALES
// =============================================================================

/**
 * Formate un montant en euros
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

/**
 * Valide une adresse email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// =============================================================================
// FONCTIONS DE DEBUG (optionnelles)
// =============================================================================

/**
 * Teste la recherche vectorielle dans la console
 * Usage: testVectorSearch("investissement long terme")
 */
function testVectorSearch(query) {
    if (vectorSearch && vectorSearch.isInitialized) {
        vectorSearch.intelligentSearch(query).then(results => {
            console.log(`Résultats pour "${query}":`, results);
        });
    } else {
        console.log('❌ Recherche vectorielle non initialisée');
    }
}

/**
 * Affiche les statistiques de la base de connaissances
 */
function showKnowledgeStats() {
    if (vectorSearch && vectorSearch.isInitialized) {
        const stats = vectorSearch.getStats();
        console.log('📊 Statistiques de la base de connaissances:', stats);
    } else {
        console.log('❌ Recherche vectorielle non initialisée');
    }
}
