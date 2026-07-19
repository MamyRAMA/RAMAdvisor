// Bibliothèque partagée des fonctions "formation" (checkout / access / content).
// Zéro dépendance npm : JWT HMAC-SHA256 via crypto natif, Stripe via son API REST + fetch.

const crypto = require("crypto");

const PRODUCT_ID = "fondamentaux-v1";
const TOKEN_TTL_SECONDS = 365 * 24 * 3600; // accès 1 an, renouvelable en re-vérifiant la session Stripe

function jwtSecret() {
  // Fallback de développement uniquement : en production, définir FORMATION_JWT_SECRET.
  return process.env.FORMATION_JWT_SECRET || "formation-dev-secret-change-me";
}

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + TOKEN_TTL_SECONDS, scope: PRODUCT_ID, ...payload };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const data = `${header}.${b64url(JSON.stringify(body))}`;
  const sig = b64url(crypto.createHmac("sha256", jwtSecret()).update(data).digest());
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const data = `${parts[0]}.${parts[1]}`;
  const expected = b64url(crypto.createHmac("sha256", jwtSecret()).update(data).digest());
  const given = parts[2];
  if (expected.length !== given.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given))) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch { return null; }
  if (payload.scope !== PRODUCT_ID) return null;
  if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
  return payload;
}

function bearerPayload(event) {
  const h = event.headers && (event.headers.authorization || event.headers.Authorization);
  if (!h || !h.startsWith("Bearer ")) return null;
  return verifyToken(h.slice(7).trim());
}

// --- Stripe (API REST, corps x-www-form-urlencoded) ---

function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function encodeForm(params, prefix, out) {
  out = out || [];
  for (const [k, v] of Object.entries(params)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v === null || v === undefined) continue;
    if (typeof v === "object" && !Array.isArray(v)) encodeForm(v, key, out);
    else if (Array.isArray(v)) v.forEach((item, i) => {
      if (typeof item === "object") encodeForm(item, `${key}[${i}]`, out);
      else out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(item)}`);
    });
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return out;
}

async function stripeRequest(method, path, params) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  let url = `https://api.stripe.com${path}`;
  if (params && method === "GET") url += `?${encodeForm(params).join("&")}`;
  else if (params) opts.body = encodeForm(params).join("&");
  const res = await fetch(url, opts);
  const json = await res.json();
  if (!res.ok) {
    const msg = (json.error && json.error.message) || `Stripe HTTP ${res.status}`;
    const err = new Error(msg);
    err.stripe = true;
    throw err;
  }
  return json;
}

// --- Réponses HTTP ---

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  };
}

function handleOptions(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, body: "" };
  return null;
}

module.exports = {
  PRODUCT_ID,
  signToken,
  verifyToken,
  bearerPayload,
  stripeConfigured,
  stripeRequest,
  json,
  handleOptions,
};
