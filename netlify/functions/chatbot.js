const { GoogleGenAI } = require("@google/genai");
// Types de schéma : littéraux chaîne (équivalents à l'enum Type du SDK,
// ex. Type.OBJECT === "OBJECT") pour éviter toute dépendance à l'export Type.
const Type = { OBJECT: "OBJECT", STRING: "STRING", BOOLEAN: "BOOLEAN", ARRAY: "ARRAY" };
const path = require("path");
const fs = require("fs");

// La base de connaissances est chargée une seule fois par instance (cold start).
let KNOWLEDGE = null;
function loadKnowledge() {
  if (KNOWLEDGE !== null) return KNOWLEDGE;
  try {
    const p = path.resolve(__dirname, "../../chatbot_knowledge.md");
    KNOWLEDGE = fs.readFileSync(p, "utf8");
  } catch (err) {
    console.warn("⚠️ chatbot_knowledge.md introuvable:", err.message);
    KNOWLEDGE = "";
  }
  return KNOWLEDGE;
}

// Liste blanche des liens que le bot est autorisé à proposer (orientation).
const CALENDLY = "https://calendly.com/mamy-ramadvisor/ram-advisor-1er-appel-offert-clone";
const ALLOWED_LINKS = new Set([
  "#methode", "#performances", "#simulator", "#frais", "#offres",
  "#apropos", "#guides", "#faq", "#contact",
  "pages/guides.html", "pages/formation.html", "pages/commencer-a-investir.html", "pages/etf.html",
  "pages/enveloppes-fiscales.html", "pages/profils-de-risque.html",
  "pages/interets-composes.html", "pages/reequilibrage-portefeuille.html",
  "pages/durabilite.html", "pages/erreurs-investisseur.html",
  CALENDLY,
]);

function buildSystemInstruction(knowledge) {
  return `Tu es "RAM Assistant", le chatbot pédagogique du site vitrine RAM Advisor
(conseil indépendant en investissement, France). Ton rôle : expliquer simplement,
présenter l'offre, orienter vers les bonnes pages, et proposer un rendez-vous
seulement quand c'est pertinent.

## SOURCES AUTORISÉES (les SEULES)
1. La base de connaissances ci-dessous (contenus validés du site + glossaire interne).
2. Des connaissances GÉNÉRALES et BASIQUES en finance, investissement et finance de
   marché (définitions largement admises, non spécifiques à un produit).
Tu n'utilises RIEN d'autre.

## RÈGLES ABSOLUES (interdits)
- N'INVENTE JAMAIS. Si l'information n'est ni dans la base ni dans les
  connaissances générales de base, dis-le clairement et propose l'appel découverte.
- AUCUNE recommandation personnalisée d'investissement, AUCUNE projection ou
  promesse de rendement, AUCUNE appréciation d'un produit précis (« bon/mauvais
  placement », « faut-il acheter X »).
- NE COLLECTE PAS de données financières sensibles (montants détenus, revenus,
  numéros de compte…). Si l'utilisateur en donne, ne les réutilise pas et ne les
  redemande pas ; redirige vers l'appel découverte confidentiel.
- N'INTERPRÈTE PAS la situation personnelle du visiteur et ne fais pas de bilan
  patrimonial : c'est l'objet du diagnostic payant / de l'appel découverte.
- Signale clairement quand une réponse dépasse tes sources.

## STYLE
- Réponds BRIÈVEMENT (2 à 5 phrases en général), en français, ton clair et pédagogue.
- Pose AU MAXIMUM UNE question de clarification, et seulement si c'est indispensable.
- Cite systématiquement ta source interne via le champ "source" (ex. "Section Frais",
  "Glossaire interne", "Section Méthode", ou "Connaissances générales" si hors base).
- Rappelle, quand tu donnes une explication financière, que c'est informatif et ne
  constitue pas un conseil en investissement (utilise le champ "disclaimer": true).
- Propose un rendez-vous (offer_meeting: true) UNIQUEMENT quand la demande nécessite
  une analyse personnelle (situation propre, "que dois-je faire", montant, choix
  d'allocation pour soi). Pas pour une simple définition.
- Dans "links", ne mets QUE des liens issus de la base (ancres #... ou pages/...html)
  réellement pertinents ; 0 à 2 maximum. N'invente aucune URL.
- "quick_replies" : 0 à 3 suggestions de questions de suivi courtes et utiles.

## BASE DE CONNAISSANCES
${knowledge}
`;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: { type: Type.STRING, description: "Réponse brève en markdown léger (gras, listes, liens)." },
    source: { type: Type.STRING, description: "Source interne citée, ex. 'Section Frais' ou 'Connaissances générales'." },
    disclaimer: { type: Type.BOOLEAN, description: "true si un rappel 'information, pas un conseil' est pertinent." },
    offer_meeting: { type: Type.BOOLEAN, description: "true seulement si une analyse personnelle est nécessaire." },
    links: {
      type: Type.ARRAY,
      description: "0 à 2 liens d'orientation issus de la base.",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          href: { type: Type.STRING },
        },
        required: ["label", "href"],
      },
    },
    quick_replies: {
      type: Type.ARRAY,
      description: "0 à 3 suggestions de questions de suivi.",
      items: { type: Type.STRING },
    },
  },
  required: ["reply", "source", "disclaimer", "offer_meeting"],
};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { messages } = JSON.parse(event.body || "{}");
    if (!Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "messages[] requis" }) };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
    if (!apiKey) {
      return {
        statusCode: 500, headers,
        body: JSON.stringify({ error: "Configuration manquante: GEMINI_API_KEY" }),
      };
    }

    // On borne l'historique (12 derniers tours) pour limiter les coûts/latence.
    const history = messages.slice(-12).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "").slice(0, 2000) }],
    }));

    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: history,
      config: {
        systemInstruction: buildSystemInstruction(loadKnowledge()),
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.3,
        maxOutputTokens: 900,
      },
    });

    let data;
    try {
      data = JSON.parse(response.text || "{}");
    } catch {
      data = { reply: (response.text || "").trim(), source: "", disclaimer: true, offer_meeting: false };
    }

    // Garde-fou serveur : ne laisser passer que les liens autorisés.
    const links = Array.isArray(data.links)
      ? data.links.filter((l) => l && ALLOWED_LINKS.has(l.href)).slice(0, 2)
      : [];

    const payload = {
      reply: String(data.reply || "Je n'ai pas pu générer de réponse. Réessayez.").trim(),
      source: String(data.source || "").trim(),
      disclaimer: Boolean(data.disclaimer),
      offer_meeting: Boolean(data.offer_meeting),
      links,
      quick_replies: Array.isArray(data.quick_replies)
        ? data.quick_replies.map((s) => String(s)).filter(Boolean).slice(0, 3)
        : [],
      calendly: CALENDLY,
    };

    return { statusCode: 200, headers, body: JSON.stringify(payload) };
  } catch (error) {
    console.error("Erreur chatbot:", error);
    return {
      statusCode: 500, headers,
      body: JSON.stringify({
        error: "Erreur lors de la génération de la réponse.",
        details: error.message,
      }),
    };
  }
};
