// Gestion des accès à la formation.
// POST {action:"verify", session_id}  → vérifie le paiement Stripe, émet le jeton d'accès (1 an).
// POST {action:"recover", email}     → si un achat existe pour cet email, envoie un lien magique
//                                       (Resend) ; réponse identique dans tous les cas (pas de fuite).

const {
  PRODUCT_ID, signToken, stripeConfigured, stripeRequest, json, handleOptions,
} = require("./lib/formation-shared");

async function verifySession(sessionId) {
  const session = await stripeRequest("GET", `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
  if (session.payment_status !== "paid") return { error: "Paiement non confirmé pour cette session." };
  if (!session.metadata || session.metadata.product !== PRODUCT_ID) {
    return { error: "Cette session ne correspond pas à la formation." };
  }
  const email = (session.customer_details && session.customer_details.email) || "inconnu";
  return { token: signToken({ sub: email }), email };
}

async function hasPurchase(email) {
  const found = await stripeRequest("GET", "/v1/customers/search", {
    query: `email:'${email.replace(/'/g, "")}'`,
    limit: 5,
  });
  for (const customer of found.data || []) {
    const sessions = await stripeRequest("GET", "/v1/checkout/sessions", {
      customer: customer.id,
      limit: 20,
    });
    for (const s of sessions.data || []) {
      if (s.payment_status === "paid" && s.metadata && s.metadata.product === PRODUCT_ID) return true;
    }
  }
  return false;
}

async function sendMagicLink(email) {
  const baseUrl = process.env.URL || "http://localhost:8888";
  const token = signToken({ sub: email });
  const link = `${baseUrl}/formation/index.html?token=${encodeURIComponent(token)}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.FORMATION_EMAIL_FROM || "RAM Advisor <onboarding@resend.dev>",
      to: [email],
      subject: "Votre accès à la formation — Les Fondamentaux de l'Investisseur",
      html: `<p>Bonjour,</p>
<p>Voici votre lien d'accès personnel à la formation <strong>Les Fondamentaux de l'Investisseur</strong> (valable 1 an) :</p>
<p><a href="${link}">Accéder à ma formation</a></p>
<p>Ce lien est personnel : ne le partagez pas.</p>
<p>— RAM Advisor</p>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}`);
}

exports.handler = async (event) => {
  const opt = handleOptions(event);
  if (opt) return opt;
  if (event.httpMethod !== "POST") return json(405, { error: "Méthode non autorisée" });

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "JSON invalide" }); }

  try {
    if (body.action === "verify") {
      if (!body.session_id) return json(400, { error: "session_id manquant" });
      if (!stripeConfigured()) return json(503, { error: "Paiement non configuré sur cet environnement." });
      const result = await verifySession(String(body.session_id));
      return result.error ? json(402, result) : json(200, result);
    }

    if (body.action === "recover") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: "Email invalide" });
      if (!stripeConfigured()) return json(503, { error: "Paiement non configuré sur cet environnement." });
      if (!process.env.RESEND_API_KEY) {
        return json(200, { ok: true, mailer: false }); // le front affiche l'adresse de contact
      }
      // Réponse volontairement identique qu'un achat existe ou non.
      if (await hasPurchase(email)) await sendMagicLink(email);
      return json(200, { ok: true, mailer: true });
    }

    return json(400, { error: "Action inconnue" });
  } catch (err) {
    console.error("formation-access:", err.message);
    return json(502, { error: "Erreur lors de la vérification. Réessayez ou contactez-nous." });
  }
};
