// POST → crée une session Stripe Checkout pour la formation (45 €).
// Sans STRIPE_SECRET_KEY (local / preview) : renvoie un accès de démonstration
// pour tester le parcours complet, marqué demo:true (bandeau affiché par l'app).

const {
  PRODUCT_ID, signToken, stripeConfigured, stripeRequest, json, handleOptions,
} = require("./lib/formation-shared");

const PRICE_EUR_CENTS = 4500;

exports.handler = async (event) => {
  const opt = handleOptions(event);
  if (opt) return opt;
  if (event.httpMethod !== "POST") return json(405, { error: "Méthode non autorisée" });

  const baseUrl = process.env.URL || "http://localhost:8888";

  if (!stripeConfigured()) {
    // Mode démo : parcours testable de bout en bout sans paiement.
    const token = signToken({ sub: "demo@ramadvisor.local", demo: true });
    return json(200, { demo: true, token });
  }

  try {
    const session = await stripeRequest("POST", "/v1/checkout/sessions", {
      mode: "payment",
      customer_creation: "always",
      allow_promotion_codes: "true",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: PRICE_EUR_CENTS,
          product_data: {
            name: "Les Fondamentaux de l'Investisseur — formation en ligne",
            description: "6 modules, quiz et attestation. Accès 1 an. Contenu éducatif : ne constitue pas un conseil en investissement.",
          },
        },
      }],
      metadata: { product: PRODUCT_ID },
      custom_text: {
        submit: {
          message: "Contenu numérique à accès immédiat : en payant, vous demandez l'exécution immédiate et renoncez expressément à votre droit de rétractation de 14 jours (art. L221-28 13° du Code de la consommation).",
        },
      },
      success_url: `${baseUrl}/formation/index.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pages/formation.html?paiement=annule`,
    });
    return json(200, { url: session.url });
  } catch (err) {
    console.error("formation-checkout:", err.message);
    return json(502, { error: "Impossible de créer la session de paiement. Réessayez ou contactez-nous." });
  }
};
