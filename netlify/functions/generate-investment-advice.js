const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuration Netlify Function pour l'API Gemini
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

    // Initialize Gemini AI with environment variable
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Try to load the v3 prompt template and the knowledge base from disk
    const path = require('path');
    const fs = require('fs');
    const baseDir = path.resolve(__dirname, '../../');
    let promptTemplateV3 = null;
    try {
      const ptPath = path.join(baseDir, 'prompt_template_v3.md');
      promptTemplateV3 = fs.readFileSync(ptPath, 'utf8');
    } catch (err) {
      // Fallback: minimal embedded template if file missing
      promptTemplateV3 = `Un conseiller doit générer une stratégie d'investissement pour l'utilisateur ({objectif}, {profil_risque}, {montant_initial}, {montant_mensuel}, {horizon}). Réponds en français avec un format structuré.`;
    }

    // Load knowledge base (if present) and perform light filtering by profil_risque
    let knowledge = '';
    try {
      const kbPath = path.join(baseDir, 'knowledge_base.txt');
      knowledge = fs.readFileSync(kbPath, 'utf8');
    } catch (err) {
      knowledge = '';
    }

    // Simple filtering function (mirrors notebook logic)
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

    const filteredKnowledge = filterKnowledgeByRisk(profil_risque, knowledge);

    // Replace placeholders in prompt template
    let personalizedPrompt = promptTemplateV3
      .replace(/{objectif}/g, objectif)
      .replace(/{profil_risque}/g, profil_risque)
      .replace(/{montant_initial}/g, montant_initial)
      .replace(/{montant_mensuel}/g, montant_mensuel)
      .replace(/{horizon}/g, horizon);

    // Append filtered knowledge if any
    let finalPrompt = personalizedPrompt;
    if (filteredKnowledge && filteredKnowledge.trim().length > 0) {
      finalPrompt = `${personalizedPrompt}\n\nAllocations de référence :\n${filteredKnowledge}`;
    }

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
        parameters: { objectif, profil_risque, montant_initial, montant_mensuel, horizon }
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
