/**
 * Traducteur Français -> Anglais pour recherche CFA
 * Améliore la recherche vectorielle cross-linguistique
 */

class FrenchToEnglishTranslator {
    constructor() {
        // Dictionnaire terminologie financière FR -> EN
        this.financialTerms = {
            // Objectifs d'investissement
            'portefeuille': 'portfolio',
            'diversification': 'diversification',
            'diversifié': 'diversified',
            'diversifiée': 'diversified',
            'retraite': 'retirement',
            'épargne': 'savings',
            'investissement': 'investment',
            'placement': 'investment',
            'allocation': 'allocation',
            'répartition': 'allocation',
            
            // Gestion des risques
            'risque': 'risk',
            'risques': 'risks',
            'minimiser': 'minimize',
            'réduire': 'reduce',
            'volatilité': 'volatility',
            'sécurité': 'security',
            'stabilité': 'stability',
            'prudent': 'conservative',
            'conservateur': 'conservative',
            'prudence': 'conservative',
            'audacieux': 'aggressive',
            'agressif': 'aggressive',
            'équilibré': 'balanced',
            'modéré': 'moderate',
            
            // Types d'actifs
            'actions': 'stocks',
            'obligations': 'bonds',
            'immobilier': 'real estate',
            'liquidité': 'liquidity',
            'matières premières': 'commodities',
            'or': 'gold',
            
            // Stratégies
            'croissance': 'growth',
            'rendement': 'yield',
            'revenu': 'income',
            'patrimoine': 'wealth',
            'gestion': 'management',
            'stratégie': 'strategy',
            'planification': 'planning',
            'conseil': 'advice',
            'recommandation': 'recommendation',
            'optimisation': 'optimization',
            'performance': 'performance'
        };
        
        // Expressions complexes
        this.expressions = {
            'constituer un portefeuille': 'build portfolio',
            'gestion de patrimoine': 'wealth management',
            'allocation d\'actifs': 'asset allocation',
            'profil de risque': 'risk profile',
            'tolérance au risque': 'risk tolerance',
            'horizon d\'investissement': 'investment horizon',
            'objectifs financiers': 'financial objectives',
            'planification financière': 'financial planning',
            'gestion des risques': 'risk management',
            'stratégie d\'investissement': 'investment strategy',
            'préparation retraite': 'retirement planning',
            'épargne retraite': 'retirement savings',
            'minimiser les risques': 'minimize risks',
            'maximiser les rendements': 'maximize returns'
        };
    }
    
    /**
     * Traduit une requête française pour la recherche CFA
     * @param {string} frenchQuery - Requête en français
     * @returns {string} Requête traduite en anglais
     */
    translateQuery(frenchQuery) {
        if (!frenchQuery || typeof frenchQuery !== 'string') {
            return '';
        }
        
        let query = frenchQuery.toLowerCase().trim();
        
        // 1. Remplacer les expressions complexes
        for (const [fr, en] of Object.entries(this.expressions)) {
            if (query.includes(fr)) {
                query = query.replace(new RegExp(fr, 'gi'), en);
            }
        }
        
        // 2. Remplacer les termes individuels
        const words = query.split(/\s+/);
        const translatedWords = words.map(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            return this.financialTerms[cleanWord] || word;
        });
        
        const translatedQuery = translatedWords.join(' ');
        
        // 3. Nettoyer et optimiser
        return this.optimizeForCFASearch(translatedQuery);
    }
    
    /**
     * Optimise la requête traduite pour la recherche CFA
     * @param {string} query - Requête à optimiser
     * @returns {string} Requête optimisée
     */
    optimizeForCFASearch(query) {
        // Supprimer les mots vides
        const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'pour', 'avec', 'sans', 'dans', 'sur', 'en', 'et', 'ou', 'à', 'au', 'aux', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const words = query.split(/\s+/).filter(word => 
            word.length > 2 && !stopWords.includes(word.toLowerCase())
        );
        
        // Ajouter contexte CFA si requête courte
        if (words.length <= 2) {
            words.push('portfolio', 'wealth', 'management');
        }
        
        return words.join(' ');
    }
    
    /**
     * Génère des mots-clés multilingues pour la recherche hybride
     * @param {string} frenchQuery - Requête en français
     * @returns {Array<string>} Mots-clés FR + EN
     */
    getMultilingualKeywords(frenchQuery) {
        const frenchWords = this.extractKeywords(frenchQuery);
        const englishQuery = this.translateQuery(frenchQuery);
        const englishWords = this.extractKeywords(englishQuery);
        
        // Combiner et dédupliquer
        const allKeywords = [...new Set([...frenchWords, ...englishWords])];
        return allKeywords.filter(word => word.length > 2);
    }
    
    /**
     * Extrait les mots-clés d'une requête
     * @param {string} query - Requête à analyser
     * @returns {Array<string>} Mots-clés extraits
     */
    extractKeywords(query) {
        if (!query) return [];
        return query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
}

module.exports = FrenchToEnglishTranslator;
