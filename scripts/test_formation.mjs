// Tests de la formation « Les Fondamentaux de l'Investisseur ».
// Usage : node scripts/test_formation.mjs
// Sans dépendance : vérifie l'intégrité des données, le JWT, et invoque
// directement les handlers des fonctions Netlify (mode démo, sans Stripe).

import { createRequire } from "module";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "netlify", "functions", "formation_data");

let passed = 0, failed = 0;
function check(label, cond, detail) {
  if (cond) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.error(`  ✗ ${label}${detail ? " — " + detail : ""}`); }
}

// ---------- 1. Intégrité des données ----------
console.log("\n[1] Données (formation_data)");
const program = JSON.parse(readFileSync(path.join(dataDir, "program.json"), "utf8"));
const quizzes = JSON.parse(readFileSync(path.join(dataDir, "quizzes.json"), "utf8"));

check("program.json : 6 modules", program.modules.length === 6);
check("program.json : ids 1..6 ordonnés", program.modules.every((m, i) => m.id === i + 1));

for (const m of program.modules) {
  const html = readFileSync(path.join(dataDir, `module${m.id}.html`), "utf8");
  check(`module${m.id}.html : contenu substantiel (> 4000 caractères)`, html.length > 4000, `${html.length}`);
  check(`module${m.id}.html : passerelle coaching (f-limit)`, html.includes("f-limit"));
  check(`module${m.id}.html : pas de balise script`, !/<script/i.test(html));
  const quiz = quizzes[String(m.id)];
  check(`quiz ${m.id} : ${program.questionsPerQuiz} questions`, Array.isArray(quiz) && quiz.length === program.questionsPerQuiz);
  check(`quiz ${m.id} : 4 options, réponse valide, explication présente`,
    quiz.every((q) => q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4 && q.explain.length > 20));
  const distribution = new Set(quiz.map((q) => q.answer));
  check(`quiz ${m.id} : réponses correctes réparties sur plusieurs positions`, distribution.size >= 2);
}

// ---------- 2. JWT ----------
console.log("\n[2] Jetons d'accès (HMAC-SHA256)");
process.env.FORMATION_JWT_SECRET = "secret-de-test";
const shared = require(path.join(root, "netlify", "functions", "lib", "formation-shared.js"));

const token = shared.signToken({ sub: "test@example.com" });
const payload = shared.verifyToken(token);
check("aller-retour sign/verify", payload && payload.sub === "test@example.com");
check("scope produit présent", payload && payload.scope === "fondamentaux-v1");
check("jeton falsifié rejeté", shared.verifyToken(token.slice(0, -3) + "abc") === null);
check("jeton vide/malformé rejeté", shared.verifyToken("a.b") === null && shared.verifyToken("") === null);

// jeton expiré : re-signé à la main avec exp passé
{
  const crypto = require("crypto");
  const b64 = (s) => Buffer.from(s).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const header = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64(JSON.stringify({ sub: "x", scope: "fondamentaux-v1", iat: 0, exp: 1 }));
  const sig = b64(crypto.createHmac("sha256", "secret-de-test").update(`${header}.${body}`).digest());
  check("jeton expiré rejeté", shared.verifyToken(`${header}.${body}.${sig}`) === null);
}

// ---------- 3. formation-checkout (mode démo) ----------
console.log("\n[3] formation-checkout (sans STRIPE_SECRET_KEY → démo)");
delete process.env.STRIPE_SECRET_KEY;
const checkout = require(path.join(root, "netlify", "functions", "formation-checkout.js"));

{
  const res = await checkout.handler({ httpMethod: "POST", headers: {} });
  const body = JSON.parse(res.body);
  check("réponse 200", res.statusCode === 200);
  check("mode démo signalé + jeton valide", body.demo === true && shared.verifyToken(body.token) !== null);
  check("jeton démo marqué demo:true", shared.verifyToken(body.token).demo === true);
  const bad = await checkout.handler({ httpMethod: "GET", headers: {} });
  check("GET refusé (405)", bad.statusCode === 405);
}

// ---------- 4. formation-content (gating + correction) ----------
console.log("\n[4] formation-content (contenu gated, correction serveur)");
const content = require(path.join(root, "netlify", "functions", "formation-content.js"));
const auth = { authorization: `Bearer ${token}` };

{
  let res = await content.handler({ httpMethod: "GET", headers: {}, queryStringParameters: { resource: "program" } });
  check("programme public accessible sans jeton", res.statusCode === 200 && JSON.parse(res.body).modules.length === 6);

  res = await content.handler({ httpMethod: "GET", headers: {}, queryStringParameters: { resource: "module", id: "1" } });
  check("module refusé sans jeton (401)", res.statusCode === 401);

  res = await content.handler({ httpMethod: "GET", headers: auth, queryStringParameters: { resource: "module", id: "1" } });
  const mod = JSON.parse(res.body);
  check("module servi avec jeton", res.statusCode === 200 && mod.html.includes("<h2>"));
  check("questions envoyées SANS les réponses", mod.questions.length === 8 && mod.questions.every((q) => q.answer === undefined && q.explain === undefined));

  res = await content.handler({ httpMethod: "GET", headers: auth, queryStringParameters: { resource: "module", id: "99" } });
  check("module inexistant → 404", res.statusCode === 404);

  // correction : toutes bonnes
  const good = quizzes["1"].map((q) => q.answer);
  res = await content.handler({ httpMethod: "POST", headers: auth, body: JSON.stringify({ id: 1, answers: good }) });
  let grade = JSON.parse(res.body);
  check("8/8 → pass", grade.score === 8 && grade.pass === true);

  // correction : 5 bonnes → échec (seuil 6)
  const five = good.map((a, i) => (i < 5 ? a : (a + 1) % 4));
  res = await content.handler({ httpMethod: "POST", headers: auth, body: JSON.stringify({ id: 1, answers: five }) });
  grade = JSON.parse(res.body);
  check("5/8 → échec avec explications", grade.score === 5 && grade.pass === false && grade.results.every((r) => r.explain));

  res = await content.handler({ httpMethod: "POST", headers: {}, body: JSON.stringify({ id: 1, answers: good }) });
  check("correction refusée sans jeton (401)", res.statusCode === 401);

  res = await content.handler({ httpMethod: "POST", headers: auth, body: JSON.stringify({ id: 1, answers: [1, 2] }) });
  check("nombre de réponses invalide → 400", res.statusCode === 400);
}

// ---------- 5. formation-access (validation d'entrée, sans Stripe) ----------
console.log("\n[5] formation-access (validation, sans Stripe configuré)");
const access = require(path.join(root, "netlify", "functions", "formation-access.js"));
{
  let res = await access.handler({ httpMethod: "POST", headers: {}, body: JSON.stringify({ action: "verify", session_id: "cs_test" }) });
  check("verify sans Stripe → 503", res.statusCode === 503);
  res = await access.handler({ httpMethod: "POST", headers: {}, body: JSON.stringify({ action: "recover", email: "pas-un-email" }) });
  check("email invalide → 400", res.statusCode === 400);
  res = await access.handler({ httpMethod: "POST", headers: {}, body: "{{{" });
  check("JSON invalide → 400", res.statusCode === 400);
  res = await access.handler({ httpMethod: "POST", headers: {}, body: JSON.stringify({ action: "autre" }) });
  check("action inconnue → 400", res.statusCode === 400);
}

console.log(`\nRésultat : ${passed} OK, ${failed} échec(s)`);
process.exit(failed ? 1 : 0);
