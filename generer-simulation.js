// Importation des modules nécessaires
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Initialisation du client Google AI avec la clé API récupérée depuis les variables d'environnement
// C'est la manière SÉCURISÉE de stocker votre clé.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Handler principal de la fonction serverless, qui est exécuté à chaque appel.
exports.handler = async (event) => {
  // On s'assure que la requête est bien de type POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 1. Lire les fichiers de prompt et de base de connaissances
    // Le chemin doit être résolu à partir de l'emplacement du script
    const promptTemplatePath = path.resolve(__dirname, '../../prompt_template.md');
    const knowledgeBasePath = path.resolve(__dirname, '../../knowledge_base.txt');

    let promptTemplate = fs.readFileSync(promptTemplatePath, 'utf8');
    const knowledgeBase = fs.readFileSync(knowledgeBasePath, 'utf8');

    // 2. Intégrer la base de connaissances dans le template du prompt
    // Remplace la mention du fichier par son contenu réel
    promptTemplate = promptTemplate.replace(
      "le contenu du fichier `knowledge_base.txt` fourni dans ce prompt", 
      `la base de connaissances suivante :\n\n---\n${knowledgeBase}\n---`
    );

    // 3. Récupérer les données de l'utilisateur depuis le corps de la requête
    const { profil, montant, duree } = JSON.parse(event.body);

    // 4. Remplacer les variables dans le prompt avec les données de l'utilisateur
    let finalPrompt = promptTemplate.replace('"\[PROFIL_UTILISATEUR\]"', `"${profil}"`);
    finalPrompt = finalPrompt.replace('"\[MONTANT_UTILISATEUR\]"', `"${montant}"`);
    finalPrompt = finalPrompt.replace('"\[DUREE_UTILISATEUR\]"', `"${duree}"`);

    // 5. Appeler l'API Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    // 6. Renvoyer la réponse générée au frontend
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ simulation: text }),
    };

  } catch (error) {
    console.error("Erreur lors de l'appel à l'API Gemini:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Une erreur est survenue lors de la génération de la simulation." }),
    };
  }
};
