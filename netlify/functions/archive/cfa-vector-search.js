/**
 * Module de recherche vectorielle CFA pour Netlify Functions
 * Intègre la connaissance du cours CFA Advanced Private Wealth Management
 * dans les recommandations d'investissement
 * 
 * USAGE DANS NETLIFY FUNCTION:
 *   const cfaSearch = require('./cfa-vector-search');
 *   const relevantKnowledge = await cfaSearch.findRelevantKnowledge(userQuery, userProfile);
 * 
 * CONFIGURATION:
 *   - Les fichiers JSON doivent être dans le même répertoire que ce module
 *   - Modifiez les seuils de similarité selon vos besoins
 */

const fs = require('fs');
const path = require('path');
const FrenchToEnglishTranslator = require('./french-to-english-translator');

class CFAVectorSearch {
    constructor(dataDir = __dirname) {
        this.dataDir = dataDir;
        this.embeddings = null;
        this.config = null;
        this.searchIndex = null;
        this.isInitialized = false;
        this.translator = new FrenchToEnglishTranslator();
        
        // Seuils de configuration
        this.SIMILARITY_THRESHOLD = 0.3;  // Seuil minimum de similarité
        this.MAX_RESULTS = 5;              // Nombre max de chunks retournés
        this.KEYWORD_BOOST = 0.1;          // Boost pour correspondance mots-clés
    }

    /**
     * Initialise le système de recherche CFA
     * @returns {Promise<boolean>} True si initialisé avec succès
     */
    async initialize() {
        try {
            console.log('🔄 Initialisation recherche vectorielle CFA...');
            
            // Charger les données CFA
            this.config = this.loadJSONSync('cfa_embedding_config.json');
            this.embeddings = this.loadJSONSync('cfa_knowledge_embeddings.json');
            this.searchIndex = this.loadJSONSync('cfa_search_index.json');
            
            this.isInitialized = true;
            console.log(`✅ CFA Vector Search initialisé:`);
            console.log(`   - ${this.embeddings.length} chunks CFA disponibles`);
            console.log(`   - Dimension: ${this.config.embedding_dim}`);
            
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation CFA:', error.message);
            return false;
        }
    }

    /**
     * Charge un fichier JSON de manière synchrone
     * @param {string} filename - Nom du fichier
     * @returns {Object} Données JSON
     */
    loadJSONSync(filename) {
        const filePath = path.join(this.dataDir, filename);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Fichier CFA non trouvé: ${filePath}`);
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }

    /**
     * Calcule la similarité cosinus entre deux vecteurs
     * @param {Array<number>} vecA - Premier vecteur  
     * @param {Array<number>} vecB - Deuxième vecteur
     * @returns {number} Similarité cosinus (0-1)
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Vecteurs de dimensions différentes');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    /**
     * Génère un pseudo-embedding basé sur des mots-clés
     * (Fallback quand l'API Sentence Transformers n'est pas disponible)
     * @param {string} query - Requête utilisateur
     * @returns {Array<number>} Pseudo-embedding
     */
    generatePseudoEmbedding(query) {
        const queryLower = query.toLowerCase();
        
        // Mapping de mots-clés vers des "dimensions" conceptuelles
        const conceptDimensions = {
            // Asset allocation concepts (dimensions 0-9)
            'allocation': [1, 0.8, 0.6, 0, 0, 0, 0, 0, 0, 0],
            'diversification': [0.8, 1, 0.7, 0, 0, 0, 0, 0, 0, 0],
            'portfolio': [0.9, 0.9, 1, 0, 0, 0, 0, 0, 0, 0],
            
            // Risk concepts (dimensions 10-19) 
            'risk': [0, 0, 0, 1, 0.8, 0.6, 0, 0, 0, 0],
            'volatility': [0, 0, 0, 0.7, 1, 0.8, 0, 0, 0, 0],
            'conservative': [0, 0, 0, 0.8, 0.6, 1, 0, 0, 0, 0],
            'prudent': [0, 0, 0, 0.8, 0.5, 0.9, 0, 0, 0, 0],
            
            // Investment types (dimensions 20-29)
            'equity': [0, 0, 0, 0, 0, 0, 1, 0.8, 0, 0],
            'bond': [0, 0, 0, 0, 0, 0, 0.3, 0.2, 1, 0.8],
            'alternative': [0, 0, 0, 0, 0, 0, 0.5, 0.3, 0.2, 1],
            
            // Time horizon concepts (dimensions 30-39)
            'long': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            'short': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            'retirement': [0.6, 0.4, 0.8, 0.3, 0.2, 0.7, 0.5, 0.3, 0.4, 0.2]
        };
        
        // Créer un vecteur de base (50 dimensions pour simplicité)
        let embedding = new Array(50).fill(0);
        
        // Ajouter les contributions des mots-clés trouvés
        for (const [keyword, vector] of Object.entries(conceptDimensions)) {
            if (queryLower.includes(keyword)) {
                for (let i = 0; i < Math.min(vector.length, embedding.length); i++) {
                    embedding[i] += vector[i] * 0.3; // Facteur de contribution
                }
            }
        }
        
        // Normaliser le vecteur
        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (norm > 0) {
            embedding = embedding.map(val => val / norm);
        }
        
        return embedding;
    }

    /**
     * Recherche les chunks CFA les plus pertinents pour une requête
     * @param {string} query - Requête de l'utilisateur
     * @param {string} riskProfile - Profil de risque (Prudent, Équilibré, Audacieux)
     * @param {number} maxResults - Nombre maximum de résultats
     * @returns {Array<Object>} Chunks pertinents avec scores
     */
    findRelevantKnowledge(query, riskProfile = 'Équilibré', maxResults = this.MAX_RESULTS) {
        if (!this.isInitialized) {
            console.warn('CFA Vector Search non initialisé');
            return [];
        }

        console.log(`🔍 Recherche CFA: "${query}" (profil: ${riskProfile})`);
        
        // Générer un pseudo-embedding pour la requête
        const queryEmbedding = this.generatePseudoEmbedding(query);
        const queryLower = query.toLowerCase();
        
        // Calculer les scores pour chaque chunk
        const scoredChunks = this.embeddings.map((chunk, index) => {
            let score = 0;
            
            // Score de similarité vectorielle (si embedding disponible)
            if (chunk.embedding && chunk.embedding.length > 0) {
                // Utiliser seulement les premières dimensions pour la compatibilité
                const chunkEmbedding = chunk.embedding.slice(0, queryEmbedding.length);
                score = this.cosineSimilarity(queryEmbedding, chunkEmbedding);
            }
            
            // Boost pour correspondance de mots-clés
            const keywordMatches = chunk.relevance_keywords?.filter(keyword => 
                queryLower.includes(keyword.toLowerCase())
            ).length || 0;
            score += keywordMatches * this.KEYWORD_BOOST;
            
            // Boost pour correspondance de texte direct
            if (chunk.text.toLowerCase().includes(queryLower)) {
                score += 0.15;
            }
            
            // Boost basé sur la catégorie CFA
            if (chunk.topic_category) {
                const categoryBoosts = {
                    'Asset Allocation': queryLower.includes('allocation') || queryLower.includes('portfolio') ? 0.2 : 0,
                    'Risk Management': queryLower.includes('risk') || riskProfile === 'Prudent' ? 0.15 : 0,
                    'Investment Strategy': queryLower.includes('strategy') || queryLower.includes('investment') ? 0.1 : 0
                };
                score += categoryBoosts[chunk.topic_category] || 0;
            }
            
            // Boost basé sur le profil de risque
            const riskBoosts = {
                'Prudent': chunk.text.toLowerCase().includes('conservative') || chunk.text.toLowerCase().includes('prudent') ? 0.1 : 0,
                'Équilibré': chunk.text.toLowerCase().includes('balanced') || chunk.text.toLowerCase().includes('moderate') ? 0.1 : 0,
                'Audacieux': chunk.text.toLowerCase().includes('aggressive') || chunk.text.toLowerCase().includes('growth') ? 0.1 : 0
            };
            score += riskBoosts[riskProfile] || 0;
            
            return {
                chunk,
                score,
                index,
                source: 'CFA Course',
                relevance_reason: this.generateRelevanceReason(chunk, score, keywordMatches)
            };
        });
        
        // Filtrer et trier par score
        const relevantChunks = scoredChunks
            .filter(item => item.score >= this.SIMILARITY_THRESHOLD)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
        
        console.log(`📋 Trouvé ${relevantChunks.length} chunks CFA pertinents`);
        
        return relevantChunks.map(item => ({
            text: item.chunk.text,
            score: Math.round(item.score * 100) / 100,
            source: item.source,
            page: item.chunk.page_number,
            category: item.chunk.topic_category,
            keywords: item.chunk.relevance_keywords,
            relevance_reason: item.relevance_reason
        }));
    }

    /**
     * Génère une explication de la pertinence d'un chunk
     * @param {Object} chunk - Chunk CFA
     * @param {number} score - Score de pertinence  
     * @param {number} keywordMatches - Nombre de mots-clés correspondants
     * @returns {string} Raison de la pertinence
     */
    generateRelevanceReason(chunk, score, keywordMatches) {
        const reasons = [];
        
        if (score > 0.7) reasons.push("Très forte correspondance sémantique");
        else if (score > 0.5) reasons.push("Bonne correspondance sémantique");
        else if (score > 0.3) reasons.push("Correspondance modérée");
        
        if (keywordMatches > 2) reasons.push(`${keywordMatches} mots-clés correspondants`);
        else if (keywordMatches > 0) reasons.push(`${keywordMatches} mot-clé correspondant`);
        
        if (chunk.topic_category) reasons.push(`Catégorie: ${chunk.topic_category}`);
        
        return reasons.join(", ") || "Correspondance générale";
    }

    /**
     * Formatte les chunks trouvés pour integration dans un prompt
     * @param {Array<Object>} relevantChunks - Chunks trouvés par la recherche
     * @param {number} maxLength - Longueur maximale du texte formaté
     * @returns {string} Connaissance CFA formatée pour le prompt
     */
    formatKnowledgeForPrompt(relevantChunks, maxLength = 2000) {
        if (!relevantChunks || relevantChunks.length === 0) {
            return "Aucune connaissance CFA spécifique trouvée pour cette requête.";
        }
        
        let formattedKnowledge = "CONNAISSANCE CFA PERTINENTE:\n\n";
        let currentLength = formattedKnowledge.length;
        
        for (const chunk of relevantChunks) {
            const chunkText = `[${chunk.category || 'CFA'}] ${chunk.text}\n\n`;
            
            if (currentLength + chunkText.length <= maxLength) {
                formattedKnowledge += chunkText;
                currentLength += chunkText.length;
            } else {
                // Tronquer le dernier chunk pour respecter la limite
                const remainingSpace = maxLength - currentLength;
                if (remainingSpace > 100) {
                    formattedKnowledge += `[${chunk.category || 'CFA'}] ${chunk.text.substring(0, remainingSpace - 50)}...\n\n`;
                }
                break;
            }
        }
        
        return formattedKnowledge.trim();
    }

    /**
     * Recherche et formatte la connaissance CFA pour intégration directe
     * @param {string} userQuery - Requête utilisateur
     * @param {string} riskProfile - Profil de risque  
     * @returns {string} Connaissance formatée pour le prompt
     */
    async getEnhancedKnowledge(userQuery, riskProfile = 'Équilibré') {
        if (!this.isInitialized) {
            const initSuccess = await this.initialize();
            if (!initSuccess) {
                return "Connaissance CFA temporairement indisponible.";
            }
        }
        
        const relevantChunks = this.findRelevantKnowledge(userQuery, riskProfile, 3);
        return this.formatKnowledgeForPrompt(relevantChunks, 1800);
    }

    /**
     * Retourne des statistiques sur la base de connaissance CFA
     * @returns {Object} Statistiques CFA
     */
    getStats() {
        if (!this.isInitialized) {
            return { error: "Non initialisé" };
        }
        
        return {
            total_chunks: this.embeddings.length,
            embedding_dimension: this.config.embedding_dim,
            categories: [...new Set(this.embeddings.map(chunk => chunk.topic_category).filter(Boolean))],
            source: this.config.source_file
        };
    }
}

// Instance globale pour réutilisation dans les fonctions Netlify
let cfaSearchInstance = null;

/**
 * Fonction utilitaire pour obtenir l'instance de recherche CFA
 * @param {string} dataDir - Répertoire des données CFA
 * @returns {CFAVectorSearch} Instance de recherche
 */
function getCFASearchInstance(dataDir = __dirname) {
    if (!cfaSearchInstance) {
        cfaSearchInstance = new CFAVectorSearch(dataDir);
    }
    return cfaSearchInstance;
}

/**
 * Fonction simplifiée pour intégration rapide dans Netlify Functions
 * @param {string} userObjective - Objectif d'investissement de l'utilisateur
 * @param {string} riskProfile - Profil de risque
 * @returns {Promise<string>} Connaissance CFA formatée
 */
async function enhanceWithCFAKnowledge(userObjective, riskProfile = 'Équilibré') {
    try {
        const cfaSearch = getCFASearchInstance();
        return await cfaSearch.getEnhancedKnowledge(userObjective, riskProfile);
    } catch (error) {
        console.error('Erreur recherche CFA:', error);
        return "Connaissance CFA temporairement indisponible.";
    }
}

module.exports = {
    CFAVectorSearch,
    getCFASearchInstance,
    enhanceWithCFAKnowledge
};
