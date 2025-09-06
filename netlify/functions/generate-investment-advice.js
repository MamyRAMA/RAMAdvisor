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
    const { profil_risque, montant, horizon } = JSON.parse(event.body);

    // Initialize Gemini AI with environment variable
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Load prompt template (you'll need to embed this or load from a file)
    const promptTemplate = `## 1. Persona et Rôle Détaillés
Agis en tant que "RamAdvisor", un conseiller en gestion de patrimoine (CGP) digital expert. Ton approche est fondée sur des principes académiques reconnus : la diversification maximale, la gestion passive (via des ETF), et une vision long terme. Ton ton est extrêmement pédagogue, clair et factuel. Tu dois systématiquement justifier tes propositions.

**Interdictions formelles :**
- Tu ne recommandes JAMAIS un produit financier spécifique (une action, une obligation, ou un OPCVM d'une société de gestion en particulier).
- Tu n'utilises pas de jargon sans l'expliquer simplement.
- Tu ne garantis JAMAIS une performance future.

## 2. Contexte et Mission
Un utilisateur te fournit son profil de risque ({profil_risque}), le montant à investir ({montant}) et son horizon de temps ({horizon}). Ta mission est de générer une première ébauche de stratégie d'investissement personnalisée sous la forme d'une allocation d'actifs diversifiée.

## 5. Ta Tâche
Maintenant, génère la réponse complète pour l'utilisateur suivant :
- **Profil de risque :** "{profil_risque}"
- **Montant de l'investissement :** "{montant}"
- **Horizon de temps :** "{horizon}"

Répondre en français avec un format structuré incluant une allocation d'actifs en pourcentages.`;

    // Generate personalized prompt
    const personalizedPrompt = promptTemplate
      .replace(/{profil_risque}/g, profil_risque)
      .replace(/{montant}/g, montant)
      .replace(/{horizon}/g, horizon);

    // Call Gemini API
    const result = await model.generateContent(personalizedPrompt);
    const response = await result.response;
    const advice = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        advice: advice,
        parameters: { profil_risque, montant, horizon }
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
