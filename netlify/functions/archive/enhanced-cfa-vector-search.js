/**
 * Version améliorée du module CFA Vector Search avec support multilingue
 * Résout le problème de recherche français -> contenu CFA anglais
 */

const fs = require('fs');
const path = require('path');
const FrenchToEnglishTranslator = require('./french-to-english-translator');

class EnhancedCFAVectorSearch {
    constructor(dataDir = __dirname) {
        this.dataDir = dataDir;
        this.embeddings = null;
        this.config = null;
        this.searchIndex = null;
        this.isInitialized = false;
        this.translator = new FrenchToEnglishTranslator();
        
        // Seuils optimisés pour recherche multilingue FR->EN
        this.SIMILARITY_THRESHOLD = 0.15;  // Seuil très bas pour compenser la barrière linguistique
        this.MAX_RESULTS = 5;
        this.KEYWORD_BOOST = 0.3;          // Boost élevé pour mots-clés traduits
        this.TRANSLATION_BOOST = 0.25;     // Bonus substantiel pour traductions
        this.CATEGORY_BOOST = 0.2;         // Bonus pour catégories pertinentes
    }

    /**
     * Initialise le système avec support multilingue et chunks enrichis
     */
    async initialize() {
        try {
            console.log('🔄 Initialisation Enhanced CFA Vector Search...');
            
            // Charger les données CFA enrichies avec français
            this.config = this.loadJSONSync('cfa_embedding_config.json');
            
            // Priorité 1: Essayer de charger les chunks enrichis français
            try {
                this.embeddings = this.loadJSONSync('cfa_knowledge_embeddings_french_enriched.json');
                console.log('🇫🇷 Chunks CFA enrichis français chargés');
            } catch (error) {
                // Fallback: chunks originaux
                console.log('⚠️ Chunks enrichis non trouvés, fallback vers originaux');
                this.embeddings = this.loadJSONSync('cfa_knowledge_embeddings.json');
            }
            
            this.searchIndex = this.loadJSONSync('cfa_search_index.json');
            
            this.isInitialized = true;
            console.log(`✅ Enhanced CFA Vector Search initialisé:`);
            console.log(`   - ${this.embeddings.length} chunks CFA disponibles`);
            console.log(`   - Support multilingue FR/EN activé`);
            console.log(`   - Enrichissement français: ${this.embeddings[0].enriched_with_french ? 'OUI' : 'NON'}`);
            
            return true;
        } catch (error) {
            console.warn('⚠️ Données CFA non trouvées, utilisation du fallback');
            this.embeddings = this.generateEnhancedFallbackData();
            this.isInitialized = true;
            return false;
        }
    }

    /**
     * Charge un fichier JSON de manière synchrone
     */
    loadJSONSync(filename) {
        const filepath = path.join(this.dataDir, 'cfa_data', filename);
        if (!fs.existsSync(filepath)) {
            throw new Error(`Fichier non trouvé: ${filepath}`);
        }
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
    }

    /**
     * Recherche multilingue améliorée avec fallback français
     */
    findRelevantKnowledge(query, riskProfile = 'Équilibré', maxResults = this.MAX_RESULTS) {
        if (!this.isInitialized) {
            console.warn('Enhanced CFA Vector Search non initialisé');
            return [];
        }

        console.log(`🔍 Recherche Enhanced CFA: "${query}" (profil: ${riskProfile})`);
        
        // 🌍 Traduction et mots-clés multilingues
        const englishQuery = this.translator.translateQuery(query);
        const multilingualKeywords = this.translator.getMultilingualKeywords(query);
        
        console.log(`🔄 Query EN: "${englishQuery}"`);
        console.log(`🔑 Keywords: ${multilingualKeywords.slice(0, 3).join(', ')}...`);
        
        // Calculer les scores améliorés
        const scoredChunks = this.embeddings.map((chunk, index) => {
            let score = 0;
            const chunkTextLower = chunk.text.toLowerCase();
            
            // 1. Score vectoriel basique (pseudo-embedding)
            const queryEmbeddingFr = this.generatePseudoEmbedding(query);
            const queryEmbeddingEn = this.generatePseudoEmbedding(englishQuery);
            
            if (chunk.embedding) {
                const chunkEmbedding = chunk.embedding.slice(0, 50);
                const scoreFr = this.cosineSimilarity(queryEmbeddingFr, chunkEmbedding);
                const scoreEn = this.cosineSimilarity(queryEmbeddingEn, chunkEmbedding);
                score = Math.max(scoreFr, scoreEn);
            }
            
            // 2. 🚀 BOOST MULTILINGUE AGRESSIF
            let multilingualMatches = 0;
            for (const keyword of multilingualKeywords) {
                if (chunkTextLower.includes(keyword.toLowerCase())) {
                    multilingualMatches++;
                }
            }
            score += multilingualMatches * this.KEYWORD_BOOST;
            
            // 3. 🎯 FALLBACK FRANÇAIS - Si pas de matches anglais, forcer des correspondances françaises
            if (multilingualMatches === 0) {
                // Mapping de concepts français directs
                const frenchConceptMappings = {
                    'portefeuille': ['portfolio', 'allocation', 'investment'],
                    'retraite': ['retirement', 'planning', 'long-term'],
                    'risque': ['risk', 'conservative', 'volatility'],
                    'diversification': ['diversification', 'allocation', 'portfolio'],
                    'épargne': ['savings', 'investment', 'accumulation'],
                    'patrimoine': ['wealth', 'management', 'portfolio'],
                    'prudent': ['conservative', 'stable', 'preservation'],
                    'équilibré': ['balanced', 'moderate', 'diversified'],
                    'audacieux': ['aggressive', 'growth', 'opportunity']
                };
                
                for (const [frTerm, enConcepts] of Object.entries(frenchConceptMappings)) {
                    if (query.toLowerCase().includes(frTerm)) {
                        for (const concept of enConcepts) {
                            if (chunkTextLower.includes(concept)) {
                                score += 0.2; // Bonus fallback français
                                break;
                            }
                        }
                    }
                }
            }
            
            // 4. Boost pour correspondance directe de requête traduite
            if (chunkTextLower.includes(englishQuery.toLowerCase().replace(/[^\w\s]/g, ''))) {
                score += this.TRANSLATION_BOOST;
            }
            
            // 5. Boost par catégorie CFA avec termes anglais + bonus profil
            if (chunk.topic_category) {
                const categoryBoosts = {
                    'Asset Allocation': this.containsTerms(englishQuery + ' ' + query, ['allocation', 'portfolio', 'asset', 'portefeuille', 'répartition']) ? 0.3 : 0,
                    'Risk Management': this.containsTerms(englishQuery + ' ' + query, ['risk', 'conservative', 'volatility', 'risque', 'prudent']) ? 0.25 : 0,
                    'Investment Strategy': this.containsTerms(englishQuery + ' ' + query, ['strategy', 'investment', 'growth', 'stratégie', 'investissement']) ? 0.2 : 0,
                    'Client Management': this.containsTerms(englishQuery + ' ' + query, ['client', 'wealth', 'management', 'gestion', 'patrimoine']) ? 0.15 : 0
                };
                score += categoryBoosts[chunk.topic_category] || 0;
            }
            
            // 6. Boost par profil de risque avec termes français ET anglais
            const riskTerms = {
                'Prudent': ['conservative', 'prudent', 'stable', 'security', 'preservation', 'prudent', 'sécurité', 'stable'],
                'Équilibré': ['balanced', 'moderate', 'diversified', 'mixed', 'équilibré', 'modéré', 'diversifié'],
                'Audacieux': ['aggressive', 'growth', 'dynamic', 'opportunity', 'higher', 'audacieux', 'croissance', 'dynamique']
            };
            
            const profileTerms = riskTerms[riskProfile] || [];
            for (const term of profileTerms) {
                if (chunkTextLower.includes(term.toLowerCase()) || query.toLowerCase().includes(term)) {
                    score += 0.15;
                    break;
                }
            }
            
            // 7. Boost pour chunks avec contexte financier général
            const financialContext = ['portfolio', 'investment', 'allocation', 'wealth', 'client', 'strategy', 'portefeuille', 'investissement', 'gestion'];
            const contextMatches = financialContext.filter(term => chunkTextLower.includes(term.toLowerCase())).length;
            score += contextMatches * 0.05;
            
            return {
                chunk,
                score,
                index,
                matches: multilingualMatches,
                category: chunk.topic_category || 'General'
            };
        });

        // Filtrer et trier avec seuil plus bas
        let filteredChunks = scoredChunks
            .filter(item => item.score > this.SIMILARITY_THRESHOLD)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);

        // 🆘 FALLBACK ULTIME : Si aucun résultat, prendre les meilleurs scores même faibles
        if (filteredChunks.length === 0) {
            console.log('🆘 Aucun résultat au seuil, utilisation fallback ultime');
            filteredChunks = scoredChunks
                .filter(item => item.score > 0.05) // Seuil très bas
                .sort((a, b) => b.score - a.score)
                .slice(0, Math.min(3, maxResults));
        }

        console.log(`📊 Résultats: ${filteredChunks.length}/${this.embeddings.length} chunks (seuil: ${this.SIMILARITY_THRESHOLD})`);
        
        if (filteredChunks.length > 0) {
            console.log(`🏆 Meilleur score: ${filteredChunks[0].score.toFixed(3)} (${filteredChunks[0].matches} matches)`);
        } else {
            console.log('⚠️ Aucun chunk pertinent trouvé même avec fallback');
        }

        return filteredChunks.map(item => [item.score, item.chunk]);
    }

    /**
     * Vérifie si une requête contient certains termes
     */
    containsTerms(query, terms) {
        const queryLower = query.toLowerCase();
        return terms.some(term => queryLower.includes(term));
    }

    /**
     * Génère un pseudo-embedding amélioré avec support multilingue
     */
    generatePseudoEmbedding(query) {
        const queryLower = query.toLowerCase();
        
        // Concepts étendus français/anglais
        const conceptDimensions = {
            // Asset allocation (FR/EN)
            'allocation': [1, 0.8, 0.6, 0, 0, 0, 0, 0, 0, 0],
            'répartition': [1, 0.8, 0.6, 0, 0, 0, 0, 0, 0, 0],
            'diversification': [0.8, 1, 0.7, 0, 0, 0, 0, 0, 0, 0],
            'portfolio': [0.9, 0.9, 1, 0, 0, 0, 0, 0, 0, 0],
            'portefeuille': [0.9, 0.9, 1, 0, 0, 0, 0, 0, 0, 0],
            
            // Risk (FR/EN)
            'risk': [0, 0, 0, 1, 0.8, 0.6, 0, 0, 0, 0],
            'risque': [0, 0, 0, 1, 0.8, 0.6, 0, 0, 0, 0],
            'conservative': [0, 0, 0, 0.8, 0.6, 1, 0, 0, 0, 0],
            'prudent': [0, 0, 0, 0.8, 0.6, 1, 0, 0, 0, 0],
            'volatility': [0, 0, 0, 0.7, 1, 0.8, 0, 0, 0, 0],
            'volatilité': [0, 0, 0, 0.7, 1, 0.8, 0, 0, 0, 0],
            
            // Investment types (FR/EN)
            'stocks': [0, 0, 0, 0, 0, 0, 1, 0.8, 0, 0],
            'actions': [0, 0, 0, 0, 0, 0, 1, 0.8, 0, 0],
            'bonds': [0, 0, 0, 0, 0, 0, 0.3, 0.2, 1, 0.8],
            'obligations': [0, 0, 0, 0, 0, 0, 0.3, 0.2, 1, 0.8],
            
            // Goals (FR/EN)
            'retirement': [0.6, 0.4, 0.8, 0.3, 0.2, 0.7, 0.5, 0.3, 0.4, 0.2],
            'retraite': [0.6, 0.4, 0.8, 0.3, 0.2, 0.7, 0.5, 0.3, 0.4, 0.2],
            'wealth': [0.7, 0.5, 0.9, 0.2, 0.1, 0.4, 0.6, 0.4, 0.3, 0.5],
            'patrimoine': [0.7, 0.5, 0.9, 0.2, 0.1, 0.4, 0.6, 0.4, 0.3, 0.5]
        };
        
        let embedding = new Array(50).fill(0);
        
        for (const [keyword, vector] of Object.entries(conceptDimensions)) {
            if (queryLower.includes(keyword)) {
                for (let i = 0; i < Math.min(vector.length, embedding.length); i++) {
                    embedding[i] += vector[i] * 0.4;
                }
            }
        }
        
        // Normaliser
        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (norm > 0) {
            embedding = embedding.map(val => val / norm);
        }
        
        return embedding;
    }

    /**
     * Calcule la similarité cosinus
     */
    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Génère des données de fallback enrichies
     */
    generateEnhancedFallbackData() {
        return [
            {
                text: "Asset allocation is a fundamental investment strategy that involves dividing an investment portfolio among different asset categories, such as stocks, bonds, and cash. The purpose of asset allocation is to minimize risk while maximizing returns by investing in different areas that would each react differently to the same event.",
                topic_category: "Asset Allocation",
                page_number: 1,
                embedding: this.generatePseudoEmbedding("asset allocation portfolio diversification investment strategy"),
                relevance_keywords: ["allocation", "portfolio", "diversification", "investment", "strategy"]
            },
            {
                text: "Risk management in wealth management involves identifying, analyzing, and mitigating potential risks that could negatively impact a client's financial goals. This includes market risk, credit risk, liquidity risk, and operational risk. Conservative investors typically prefer lower-risk investments.",
                topic_category: "Risk Management",
                page_number: 2,
                embedding: this.generatePseudoEmbedding("risk management conservative investment portfolio"),
                relevance_keywords: ["risk", "management", "conservative", "investment", "portfolio"]
            },
            {
                text: "Portfolio diversification is the practice of spreading investments across various financial instruments, industries, and other categories to reduce exposure to risk. A well-diversified portfolio typically includes a mix of stocks, bonds, real estate, and other asset classes.",
                topic_category: "Asset Allocation",
                page_number: 3,
                embedding: this.generatePseudoEmbedding("portfolio diversification stocks bonds real estate"),
                relevance_keywords: ["diversification", "portfolio", "stocks", "bonds", "real estate"]
            },
            {
                text: "Retirement planning requires a long-term investment strategy that balances growth potential with capital preservation. As investors approach retirement, portfolios typically shift from aggressive growth strategies to more conservative income-generating investments.",
                topic_category: "Investment Strategy",
                page_number: 4,
                embedding: this.generatePseudoEmbedding("retirement planning long term conservative income"),
                relevance_keywords: ["retirement", "planning", "conservative", "income", "long-term"]
            }
        ];
    }

    /**
     * Formate les chunks trouvés pour intégration dans le prompt
     */
    formatKnowledgeForPrompt(relevantChunks) {
        if (!relevantChunks || relevantChunks.length === 0) {
            return '';
        }

        let formattedKnowledge = "CONNAISSANCE CFA PROFESSIONNELLE:\n\n";
        
        relevantChunks.forEach(([score, chunk], index) => {
            const category = chunk.topic_category || 'CFA Knowledge';
            formattedKnowledge += `[${category}] ${chunk.text}\n\n`;
        });

        return formattedKnowledge;
    }
}

module.exports = EnhancedCFAVectorSearch;
