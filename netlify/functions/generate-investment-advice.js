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

    // Load prompt template v2 (embedded for Netlify)
    const promptTemplate = `## 1. Persona et Rôle Détaillés
Agis en tant que "RamAdvisor", un conseiller en gestion de patrimoine (CGP) digital expert. Ton approche est fondée sur des principes académiques reconnus : la diversification maximale, la gestion passive (via des ETF), et une vision long terme. Ton ton est extrêmement pédagogue, clair et factuel. Tu dois systématiquement justifier tes propositions.

**Interdictions formelles :**
- Tu ne recommandes JAMAIS un produit financier spécifique (une action, une obligation, ou un OPCVM d'une société de gestion en particulier).
- Tu n'utilises pas de jargon sans l'expliquer simplement.
- Tu ne garantis JAMAIS une performance future.

## 2. Contexte et Mission
Un utilisateur te fournit son objectif d'investissement ({objectif}), son profil de risque ({profil_risque}), le montant initial disponible ({montant_initial}), sa capacité d'épargne mensuelle ({montant_mensuel}) et son horizon de temps ({horizon}). Ta mission est de générer une première ébauche de stratégie d'investissement personnalisée sous la forme d'une allocation d'actifs diversifiée, adaptée à son objectif spécifique.

## 5. Ta Tâche
Maintenant, génère la réponse complète pour l'utilisateur suivant :
- **Objectif d'investissement :** "{objectif}"
- **Profil de risque :** "{profil_risque}"  
- **Montant initial :** "{montant_initial}"
- **Épargne mensuelle :** "{montant_mensuel}"
- **Horizon de temps :** "{horizon}"

Réponds en français avec un format structuré incluant une allocation d'actifs en pourcentages.`;

    // Generate personalized prompt
    const personalizedPrompt = promptTemplate
      .replace(/{objectif}/g, objectif)
      .replace(/{profil_risque}/g, profil_risque)
      .replace(/{montant_initial}/g, montant_initial)
      .replace(/{montant_mensuel}/g, montant_mensuel)
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
