/**
 * Module de recherche vectorielle côté client pour RAMAdvisor
 * Utilise des embeddings pré-calculés pour une recherche sémantique sans backend
 */

class ClientVectorSearch {
    constructor() {
        this.embeddings = null;
        this.config = null;
        this.searchIndex = null;
        this.isInitialized = false;
        this.baseUrl = './data/'; // Chemin vers les fichiers de données
    }

    /**
     * Initialise le système de recherche en chargeant les données
     */
    async initialize() {
        try {
            console.log('🔄 Initialisation de la recherche vectorielle...');
            
            // Charger les configurations et données en parallèle
            const [config, embeddings, searchIndex] = await Promise.all([
                this.loadJSON('embedding_config.json'),
                this.loadJSON('knowledge_embeddings.json'),
                this.loadJSON('search_index.json')
            ]);

            this.config = config;
            this.embeddings = embeddings;
            this.searchIndex = searchIndex;
            this.isInitialized = true;

            console.log(`✅ Recherche vectorielle initialisée:`);
            console.log(`   - ${this.embeddings.length} chunks disponibles`);
            console.log(`   - Dimension des embeddings: ${this.config.embedding_dim}`);
            console.log(`   - Source: ${this.config.source_file}`);
            
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            return false;
        }
    }

    /**
     * Charge un fichier JSON
     */
    async loadJSON(filename) {
        const response = await fetch(this.baseUrl + filename);
        if (!response.ok) {
            throw new Error(`Impossible de charger ${filename}: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Calcule la similarité cosinus entre deux vecteurs
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Les vecteurs doivent avoir la même dimension');
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
     * Recherche hybride: sémantique + mots-clés
     */
    hybridSearch(query, options = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ Recherche vectorielle non initialisée');
            return [];
        }

        const {
            topK = 5,
            semanticWeight = 0.7,
            keywordWeight = 0.3,
            minScore = 0.1
        } = options;

        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
        
        const results = [];

        // Pour chaque chunk, calculer un score hybride
        for (let i = 0; i < this.embeddings.length; i++) {
            const chunk = this.embeddings[i];
            const indexChunk = this.searchIndex.chunks[i];
            
            // Score sémantique (nécessiterait l'embedding de la requête)
            // Pour l'instant, on utilise la recherche par mots-clés
            let semanticScore = 0;
            
            // Score par mots-clés
            let keywordScore = this.calculateKeywordScore(queryWords, chunk.text, indexChunk.keywords);
            
            // Score hybride
            const hybridScore = (semanticScore * semanticWeight) + (keywordScore * keywordWeight);
            
            if (hybridScore > minScore) {
                results.push({
                    id: chunk.id,
                    text: chunk.text,
                    sourceFile: chunk.source_file,
                    page: chunk.page_number,
                    chunkIndex: chunk.chunk_index,
                    score: hybridScore,
                    keywordScore: keywordScore,
                    semanticScore: semanticScore
                });
            }
        }

        // Trier par score décroissant
        results.sort((a, b) => b.score - a.score);
        
        return results.slice(0, topK);
    }

    /**
     * Recherche par mots-clés avec scoring avancé
     */
    keywordSearch(query, topK = 5) {
        if (!this.isInitialized) {
            console.warn('⚠️ Recherche vectorielle non initialisée');
            return [];
        }

        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
        
        const results = [];

        for (let i = 0; i < this.embeddings.length; i++) {
            const chunk = this.embeddings[i];
            const indexChunk = this.searchIndex.chunks[i];
            
            const score = this.calculateKeywordScore(queryWords, chunk.text, indexChunk.keywords);
            
            if (score > 0) {
                results.push({
                    id: chunk.id,
                    text: chunk.text,
                    sourceFile: chunk.source_file,
                    page: chunk.page_number,
                    chunkIndex: chunk.chunk_index,
                    score: score,
                    preview: this.generatePreview(chunk.text, queryWords)
                });
            }
        }

        // Trier par score décroissant
        results.sort((a, b) => b.score - a.score);
        
        return results.slice(0, topK);
    }

    /**
     * Calcule le score de pertinence par mots-clés
     */
    calculateKeywordScore(queryWords, text, keywords = []) {
        const textLower = text.toLowerCase();
        let score = 0;
        let matches = 0;

        for (const word of queryWords) {
            // Recherche exacte
            if (textLower.includes(word)) {
                matches++;
                score += 1;
                
                // Bonus si le mot est dans les mots-clés
                if (keywords.includes(word)) {
                    score += 0.5;
                }
                
                // Bonus pour les mots importants
                if (this.isImportantTerm(word)) {
                    score += 0.3;
                }
            }
            
            // Recherche de racines/variantes
            const variants = this.getWordVariants(word);
            for (const variant of variants) {
                if (textLower.includes(variant) && variant !== word) {
                    score += 0.5;
                }
            }
        }

        // Normaliser le score par le nombre de mots de la requête
        const normalizedScore = queryWords.length > 0 ? score / queryWords.length : 0;
        
        // Bonus si plusieurs mots correspondent
        const matchRatio = queryWords.length > 0 ? matches / queryWords.length : 0;
        const bonusScore = matchRatio > 0.5 ? 0.2 : 0;
        
        return Math.min(1, normalizedScore + bonusScore);
    }

    /**
     * Vérifie si un terme est important dans le contexte financier
     */
    isImportantTerm(term) {
        const importantTerms = [
            'investissement', 'portefeuille', 'risque', 'rendement', 'action', 'obligation',
            'diversification', 'allocation', 'épargne', 'placement', 'capital', 'profit',
            'volatilité', 'dividende', 'bourse', 'prudent', 'équilibré', 'dynamique'
        ];
        return importantTerms.includes(term);
    }

    /**
     * Génère des variantes d'un mot (simple)
     */
    getWordVariants(word) {
        const variants = [word];
        
        // Enlever les 's' finaux
        if (word.endsWith('s') && word.length > 3) {
            variants.push(word.slice(0, -1));
        }
        
        // Ajouter les 's' finaux
        if (!word.endsWith('s')) {
            variants.push(word + 's');
        }
        
        // Variantes communes
        const commonVariants = {
            'investir': ['investissement', 'investi'],
            'investissement': ['investir', 'investi'],
            'risque': ['risqué', 'risquer'],
            'portefeuille': ['portfolio'],
            'action': ['actions'],
            'épargne': ['épargner', 'épargnant']
        };
        
        if (commonVariants[word]) {
            variants.push(...commonVariants[word]);
        }
        
        return variants;
    }

    /**
     * Génère un aperçu du texte avec les mots-clés mis en évidence
     */
    generatePreview(text, queryWords, maxLength = 200) {
        const textLower = text.toLowerCase();
        
        // Trouver la première occurrence d'un mot-clé
        let firstMatch = -1;
        for (const word of queryWords) {
            const index = textLower.indexOf(word);
            if (index !== -1 && (firstMatch === -1 || index < firstMatch)) {
                firstMatch = index;
            }
        }
        
        let start = 0;
        if (firstMatch !== -1) {
            start = Math.max(0, firstMatch - 50);
        }
        
        let preview = text.substring(start, start + maxLength);
        
        // Ajouter des points de suspension si nécessaire
        if (start > 0) preview = '...' + preview;
        if (start + maxLength < text.length) preview = preview + '...';
        
        return preview;
    }

    /**
     * Recherche intelligente qui combine différentes stratégies
     */
    async intelligentSearch(query, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const {
            topK = 5,
            includePreview = true,
            minScore = 0.1
        } = options;

        console.log(`🔍 Recherche: "${query}"`);
        
        // Recherche par mots-clés
        const keywordResults = this.keywordSearch(query, topK * 2);
        
        // Filtrer et enrichir les résultats
        const finalResults = keywordResults
            .filter(result => result.score >= minScore)
            .slice(0, topK)
            .map(result => ({
                ...result,
                preview: includePreview ? this.generatePreview(result.text, query.split(/\s+/)) : null,
                relevanceReason: this.explainRelevance(result, query)
            }));

        console.log(`📊 ${finalResults.length} résultats trouvés`);
        
        return finalResults;
    }

    /**
     * Explique pourquoi un résultat est pertinent
     */
    explainRelevance(result, query) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const textLower = result.text.toLowerCase();
        const matchedWords = [];
        
        for (const word of queryWords) {
            if (textLower.includes(word)) {
                matchedWords.push(word);
            }
        }
        
        if (matchedWords.length === 0) return "Pertinence contextuelle";
        if (matchedWords.length === 1) return `Contient "${matchedWords[0]}"`;
        return `Contient ${matchedWords.length} termes de recherche`;
    }

    /**
     * Obtient des statistiques sur la base de connaissances
     */
    getStats() {
        if (!this.isInitialized) {
            return null;
        }

        const totalChunks = this.embeddings.length;
        const totalPages = Math.max(...this.embeddings.map(e => e.page_number));
        const avgChunkLength = this.embeddings.reduce((sum, e) => sum + e.text.length, 0) / totalChunks;
        
        return {
            totalChunks,
            totalPages,
            avgChunkLength: Math.round(avgChunkLength),
            sourceFile: this.config.source_file,
            generatedAt: this.config.generated_at,
            embeddingDim: this.config.embedding_dim
        };
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClientVectorSearch;
}

// Ajout global pour utilisation directe
window.ClientVectorSearch = ClientVectorSearch;
