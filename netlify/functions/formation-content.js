// Sert le contenu gated de la formation.
// GET  ?resource=program                     → syllabus public (page de vente + app).
// GET  ?resource=module&id=N   (+ Bearer)    → contenu HTML du module N.
// POST {id, answers:[…]}       (+ Bearer)    → correction du quiz côté serveur
//                                              (les bonnes réponses ne quittent jamais le serveur avant soumission).

const path = require("path");
const fs = require("fs");
const { bearerPayload, json, handleOptions } = require("./lib/formation-shared");

const DATA_DIR = path.resolve(__dirname, "formation_data");
const PASS_THRESHOLD = 6;

let cache = {};
function readData(file) {
  if (!cache[file]) cache[file] = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
  return cache[file];
}
function program() { return JSON.parse(readData("program.json")); }
function quizzes() { return JSON.parse(readData("quizzes.json")); }

function validModuleId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && program().modules.some((m) => m.id === id) ? id : null;
}

exports.handler = async (event) => {
  const opt = handleOptions(event);
  if (opt) return opt;

  try {
    if (event.httpMethod === "GET") {
      const q = event.queryStringParameters || {};

      if (q.resource === "program") return json(200, program());

      if (q.resource === "module") {
        const payload = bearerPayload(event);
        if (!payload) return json(401, { error: "Accès non autorisé. Reconnectez-vous depuis votre lien d'accès." });
        const id = validModuleId(q.id);
        if (!id) return json(404, { error: "Module inconnu" });
        return json(200, {
          id,
          html: readData(`module${id}.html`),
          questions: quizzes()[String(id)].map((item) => ({ q: item.q, options: item.options })),
          demo: Boolean(payload.demo),
        });
      }

      return json(400, { error: "Paramètre resource invalide" });
    }

    if (event.httpMethod === "POST") {
      const payload = bearerPayload(event);
      if (!payload) return json(401, { error: "Accès non autorisé. Reconnectez-vous depuis votre lien d'accès." });

      let body;
      try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "JSON invalide" }); }
      const id = validModuleId(body.id);
      if (!id) return json(404, { error: "Module inconnu" });

      const quiz = quizzes()[String(id)];
      const answers = Array.isArray(body.answers) ? body.answers : [];
      if (answers.length !== quiz.length) return json(400, { error: `Le quiz attend ${quiz.length} réponses.` });

      const results = quiz.map((item, i) => ({
        correct: Number(answers[i]) === item.answer,
        answer: item.answer,
        explain: item.explain,
      }));
      const score = results.filter((r) => r.correct).length;
      return json(200, { score, total: quiz.length, pass: score >= PASS_THRESHOLD, results });
    }

    return json(405, { error: "Méthode non autorisée" });
  } catch (err) {
    console.error("formation-content:", err.message);
    return json(500, { error: "Erreur serveur" });
  }
};
