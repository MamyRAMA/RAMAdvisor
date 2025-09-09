const { GoogleGenerativeAI } = require("@google/generative-ai");
const UltraOptimizedCFASearch = require("./ultra-optimized-cfa-search");

// Instance globale pour la recherche CFA ultra-optimisée
let ultraCfaSearch = null;

/**
 * Initialise le système CFA Ultra-Optimisé avec chunks enrichis français
 */
async function initUltraOptimizedCFASearch() {
  if (!ultraCfaSearch) {
    ultraCfaSearch = new UltraOptimizedCFASearch();
    await ultraCfaSearch.initialize();
    console.log('🚀 Ultra-Optimized CFA Search initialisé (Chunks enrichis FR + Algorithmes avancés)');
  }
  return ultraCfaSearch;
}

/**
 * Améliore le prompt avec la connaissance CFA ultra-optimisée
 */
async function enhanceWithCFAKnowledge(userQuery, riskProfile = 'Équilibré') {
  try {
    const cfaSearch = await initUltraOptimizedCFASearch();
    const relevantChunks = cfaSearch.findRelevantKnowledge(userQuery, riskProfile, 4); // Plus de chunks
    
    if (relevantChunks && relevantChunks.length > 0) {
      console.log(`✅ ${relevantChunks.length} chunks CFA ultra-optimisés trouvés pour: "${userQuery}"`);
      console.log(`🇫🇷 Recherche multilingue FR/EN avec enrichissement français ACTIF`);
      return cfaSearch.formatKnowledgeForPrompt(relevantChunks);
    }
    
    console.log('⚠️ Aucun chunk CFA pertinent trouvé (même avec ultra-optimisation)');
    return '';
  } catch (error) {
    console.error('❌ Erreur Ultra-Optimized CFA:', error);
    return '';
  }
}

// Configuration Netlify Function pour l'API Gemini avec RAG CFA Ultra-Optimisé
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { objectif, profil_risque, montant_initial, montant_mensuel, horizon } = JSON.parse(event.body);

    console.log(`📊 Nouvelle demande: ${profil_risque} - ${objectif}`);

    // Initialize Gemini AI with environment variable
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Try to load the v3 prompt template and the knowledge base from disk
    const path = require('path');
    const fs = require('fs');
    const baseDir = path.resolve(__dirname, '../../');
    let promptTemplateV3 = null;
    try {
      const ptPath = path.join(baseDir, 'prompt_template_v3.md');
      console.log(`🔍 Tentative de chargement Template V3: ${ptPath}`);
      promptTemplateV3 = fs.readFileSync(ptPath, 'utf8');
      console.log(`✅ Template V3 chargé: ${promptTemplateV3.length} caractères`);
    } catch (err) {
      // Fallback: minimal embedded template if file missing
      console.warn('⚠️ Template V3 non trouvé, utilisation du fallback:', err.message);
      promptTemplateV3 = `Agis en tant que conseiller en gestion de patrimoine expert. Génère une stratégie d'investissement personnalisée structurée.

INFORMATIONS CLIENT:
- Objectif: {objectif}
- Profil de risque: {profil_risque}
- Montant initial: {montant_initial}
- Épargne mensuelle: {montant_mensuel}
- Horizon d'investissement: {horizon}

Réponds en français avec un format structuré et professionnel incluant:
1. Une introduction personnalisée
2. Une analyse de l'objectif
3. Une évaluation de l'atypicité (score 1-10)
4. Les principes clés de la stratégie
5. Un tableau d'allocation d'actifs
6. Un plan d'investissement progressif
7. Des exemples de supports génériques
8. Un avertissement important
9. Une proposition d'accompagnement

Ne jamais mentionner tes sources de connaissance.`;
    }

    // 🎓 INTÉGRATION RAG CFA - Récupération de la connaissance pertinente
    console.log('🔍 Recherche de connaissance CFA pertinente...');
    let cfaKnowledge = '';
    try {
      cfaKnowledge = await enhanceWithCFAKnowledge(objectif, profil_risque);
      console.log(`✅ Connaissance CFA intégrée: ${cfaKnowledge.length} caractères`);
    } catch (error) {
      console.warn('⚠️ Recherche CFA échouée, utilisation de la base standard:', error.message);
      cfaKnowledge = '';
    }

    // Load standard knowledge base as fallback
    let standardKnowledge = '';
    try {
      const kbPath = path.join(baseDir, 'knowledge_base.txt');
      console.log(`🔍 Chargement knowledge base: ${kbPath}`);
      standardKnowledge = fs.readFileSync(kbPath, 'utf8');
      console.log(`✅ Knowledge base chargée: ${standardKnowledge.length} caractères`);
    } catch (err) {
      console.warn('⚠️ Knowledge base non trouvée:', err.message);
      standardKnowledge = '';
    }

    // Simple filtering function for standard knowledge
    function filterKnowledgeByRisk(profil, knowledgeContent) {
      if (!knowledgeContent) return '';
      const riskMap = {
        'Prudent': ['PRESERVATION', 'REVENU'],
        'Équilibré': ['REVENU', 'CROISSANCE_MODEREE'],
        'Audacieux': ['CROISSANCE', 'CROISSANCE_AGGRESSIVE']
      };
      const relevant = riskMap[profil] || ['CROISSANCE_MODEREE'];
      const sections = knowledgeContent.split('OBJECTIF :');
      const filtered = [];
      for (let i = 1; i < sections.length; i++) {
        const section = 'OBJECTIF :' + sections[i];
        for (const obj of relevant) {
          if (section.includes(obj)) {
            filtered.push(section);
            break;
          }
        }
        if (filtered.length >= 2) break; // limit
      }
      return filtered.join('\n\n');
    }

    const filteredStandardKnowledge = filterKnowledgeByRisk(profil_risque, standardKnowledge);

    // Replace placeholders in prompt template
    let personalizedPrompt = promptTemplateV3
      .replace(/{objectif}/g, objectif)
      .replace(/{profil_risque}/g, profil_risque)
      .replace(/{montant_initial}/g, montant_initial)
      .replace(/{montant_mensuel}/g, montant_mensuel)
      .replace(/{horizon}/g, horizon);

    // Construire le prompt final avec les différentes sources de connaissance
    let finalPrompt = personalizedPrompt;
    
    // Priorité 1: Connaissance professionnelle enrichie (si disponible)
    if (cfaKnowledge && cfaKnowledge.trim().length > 50) {
      finalPrompt += `\n\n${cfaKnowledge}`;
      console.log('📚 Utilisation de la connaissance professionnelle enrichie');
    }
    
    // Priorité 2: Connaissance standard filtrée (en complément ou fallback)
    if (filteredStandardKnowledge && filteredStandardKnowledge.trim().length > 0) {
      finalPrompt += `\n\nAllocations de référence:\n${filteredStandardKnowledge}`;
      console.log('📋 Ajout de la connaissance standard filtrée');
    }

    console.log(`📝 Prompt final construit: ${finalPrompt.length} caractères`);

    // Call Gemini API
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const advice = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        advice: advice,
        parameters: { objectif, profil_risque, montant_initial, montant_mensuel, horizon },
        cfa_enhanced: cfaKnowledge.length > 50,
        knowledge_sources: {
          cfa_length: cfaKnowledge.length,
          standard_length: filteredStandardKnowledge.length
        }
      }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erreur lors de la génération du conseil. Veuillez réessayer.',
        details: error.message
      }),
    };
  }
};
