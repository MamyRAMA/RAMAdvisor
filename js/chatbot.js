/* ============================================================
   RAM Advisor — Chatbot pédagogique (widget auto-contenu)
   - S'injecte tout seul (HTML + CSS) : un seul <script> par page.
   - Appelle /.netlify/functions/chatbot (Gemini + base de connaissances).
   - Design aligné sur le site (violet #6D28D9→#8B5CF6, Inter, cards).
   ============================================================ */
(function () {
  "use strict";
  if (window.__ramChatbotLoaded) return;
  window.__ramChatbotLoaded = true;

  var ENDPOINT = "/.netlify/functions/chatbot";
  var CALENDLY = "https://calendly.com/mamy-ramadvisor/ram-advisor-1er-appel-offert-clone";
  // Préfixe de chemin : les pages de /pages/ doivent pointer une remontée plus haut.
  var BASE = /\/pages\//.test(window.location.pathname) ? "../" : "";

  // Historique de conversation envoyé à la fonction ({role, content}).
  var messages = [];
  var busy = false;

  var WELCOME =
    "Bonjour 👋 Je suis l'assistant RAM Advisor. Je peux **expliquer un terme " +
    "financier**, présenter la **méthode, les frais et l'accompagnement**, ou vous " +
    "orienter vers la bonne page. Que puis-je éclairer pour vous ?";

  var STARTERS = [
    "C'est quoi un ETF ?",
    "Comment se passe l'accompagnement ?",
    "Quels sont vos frais ?",
    "PEA ou assurance-vie ?",
  ];

  /* ---------- Styles ---------- */
  var CSS = `
  .ramc-launcher{position:fixed;right:20px;bottom:20px;z-index:9998;display:flex;align-items:center;gap:10px;
    background:linear-gradient(90deg,#6D28D9 0%,#8B5CF6 100%);color:#fff;border:none;cursor:pointer;
    padding:12px 18px 12px 14px;border-radius:9999px;font-family:'Inter',sans-serif;font-weight:600;font-size:14px;
    box-shadow:0 10px 25px -5px rgba(109,40,217,.5);transition:transform .2s ease,box-shadow .2s ease;}
  .ramc-launcher:hover{transform:scale(1.05);box-shadow:0 14px 30px -6px rgba(109,40,217,.6);}
  .ramc-launcher svg{width:22px;height:22px;flex:0 0 auto;}
  .ramc-launcher .ramc-dot{position:absolute;top:-2px;right:-2px;width:12px;height:12px;background:#22c55e;border:2px solid #fff;border-radius:9999px;}
  @media(max-width:767px){.ramc-launcher{bottom:84px;right:14px;padding:12px;} .ramc-launcher .ramc-lbl{display:none;}}

  .ramc-panel{position:fixed;right:20px;bottom:20px;z-index:9999;width:390px;max-width:calc(100vw - 32px);
    height:600px;max-height:calc(100vh - 40px);background:#fff;border-radius:18px;overflow:hidden;display:none;
    flex-direction:column;font-family:'Inter',sans-serif;color:#1f2937;
    box-shadow:0 25px 50px -12px rgba(0,0,0,.35);border:1px solid #E5E7EB;}
  .ramc-panel.ramc-open{display:flex;animation:ramc-in .22s ease;}
  @keyframes ramc-in{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
  @media(max-width:767px){.ramc-panel{right:0;left:0;bottom:0;width:100%;max-width:100%;height:88vh;max-height:88vh;border-radius:18px 18px 0 0;}}

  .ramc-head{background:linear-gradient(90deg,#6D28D9 0%,#8B5CF6 100%);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px;}
  .ramc-avatar{width:38px;height:38px;border-radius:9999px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex:0 0 auto;}
  .ramc-head h3{margin:0;font-size:15px;font-weight:700;line-height:1.2;}
  .ramc-head p{margin:2px 0 0;font-size:11.5px;opacity:.9;display:flex;align-items:center;gap:5px;}
  .ramc-head p::before{content:"";width:7px;height:7px;border-radius:9999px;background:#4ade80;display:inline-block;}
  .ramc-close{margin-left:auto;background:transparent;border:none;color:#fff;cursor:pointer;font-size:22px;line-height:1;opacity:.85;padding:4px;}
  .ramc-close:hover{opacity:1;}

  .ramc-body{flex:1;overflow-y:auto;padding:16px;background:#f9fafb;scroll-behavior:smooth;}
  .ramc-msg{margin-bottom:14px;display:flex;flex-direction:column;max-width:88%;}
  .ramc-msg.ramc-user{margin-left:auto;align-items:flex-end;}
  .ramc-bubble{padding:10px 13px;border-radius:14px;font-size:13.5px;line-height:1.5;word-wrap:break-word;}
  .ramc-bot .ramc-bubble{background:#fff;border:1px solid #E5E7EB;border-top-left-radius:4px;color:#1f2937;}
  .ramc-user .ramc-bubble{background:linear-gradient(90deg,#6D28D9 0%,#8B5CF6 100%);color:#fff;border-top-right-radius:4px;}
  .ramc-bubble p{margin:0 0 8px;}.ramc-bubble p:last-child{margin-bottom:0;}
  .ramc-bubble ul{margin:6px 0;padding-left:18px;}.ramc-bubble li{margin:2px 0;}
  .ramc-bubble a{color:#6D28D9;text-decoration:underline;font-weight:600;}
  .ramc-user .ramc-bubble a{color:#fff;}
  .ramc-source{font-size:10.5px;color:#8b5cf6;margin-top:5px;font-weight:600;display:flex;align-items:center;gap:4px;}
  .ramc-source svg{width:11px;height:11px;}
  .ramc-disclaimer{font-size:10.5px;color:#9ca3af;font-style:italic;margin-top:5px;line-height:1.4;}

  .ramc-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
  .ramc-link{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#6D28D9;
    background:#F5F3FF;border:1px solid #DDD6FE;border-radius:9999px;padding:5px 11px;text-decoration:none;transition:background .15s;}
  .ramc-link:hover{background:#EDE9FE;}
  .ramc-cta{display:inline-flex;align-items:center;gap:7px;margin-top:9px;background:linear-gradient(90deg,#6D28D9 0%,#8B5CF6 100%);
    color:#fff;font-size:12.5px;font-weight:700;border-radius:9999px;padding:8px 15px;text-decoration:none;box-shadow:0 6px 14px -4px rgba(109,40,217,.5);}
  .ramc-cta:hover{transform:scale(1.02);}

  .ramc-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:4px;}
  .ramc-chip{font-size:12px;font-weight:500;color:#4C1D95;background:#fff;border:1px solid #DDD6FE;border-radius:9999px;
    padding:6px 12px;cursor:pointer;transition:background .15s,border-color .15s;}
  .ramc-chip:hover{background:#F5F3FF;border-color:#c4b5fd;}

  .ramc-typing{display:inline-flex;gap:4px;padding:12px 14px;}
  .ramc-typing span{width:7px;height:7px;background:#c4b5fd;border-radius:9999px;animation:ramc-blink 1.2s infinite ease-in-out;}
  .ramc-typing span:nth-child(2){animation-delay:.2s;}.ramc-typing span:nth-child(3){animation-delay:.4s;}
  @keyframes ramc-blink{0%,80%,100%{opacity:.3;transform:scale(.8);}40%{opacity:1;transform:scale(1);}}

  .ramc-foot{border-top:1px solid #E5E7EB;background:#fff;padding:10px 12px;}
  .ramc-inputrow{display:flex;align-items:flex-end;gap:8px;background:#f3f4f6;border:1px solid #E5E7EB;border-radius:14px;padding:6px 6px 6px 12px;}
  .ramc-inputrow:focus-within{border-color:#c4b5fd;background:#fff;}
  .ramc-input{flex:1;border:none;background:transparent;resize:none;outline:none;font-family:inherit;font-size:13.5px;color:#1f2937;max-height:96px;line-height:1.4;padding:4px 0;}
  .ramc-send{flex:0 0 auto;width:34px;height:34px;border:none;border-radius:10px;cursor:pointer;color:#fff;
    background:linear-gradient(90deg,#6D28D9 0%,#8B5CF6 100%);display:flex;align-items:center;justify-content:center;transition:opacity .15s;}
  .ramc-send:disabled{opacity:.4;cursor:not-allowed;}
  .ramc-send svg{width:17px;height:17px;}
  .ramc-legal{font-size:9.5px;color:#9ca3af;text-align:center;margin:7px 4px 0;line-height:1.35;}
  `;

  /* ---------- Rendu markdown minimal (sûr) ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function renderMarkdown(md) {
    var lines = String(md).replace(/\r\n/g, "\n").split("\n");
    var html = "", inList = false;
    function inline(t) {
      t = escapeHtml(t);
      t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      t = t.replace(/\*(.+?)\*/g, "<em>$1</em>");
      // liens markdown [txt](url) — uniquement http(s), ancres # ou pages/
      t = t.replace(/\[([^\]]+)\]\((#[a-z-]+|(?:\.\.\/)?pages\/[a-z0-9-]+\.html|https?:\/\/[^\s)]+)\)/gi,
        function (_m, txt, url) {
          var ext = /^https?:/i.test(url);
          return '<a href="' + url + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + txt + "</a>";
        });
      return t;
    }
    lines.forEach(function (raw) {
      var line = raw.trim();
      if (/^[-*]\s+/.test(line)) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += "<li>" + inline(line.replace(/^[-*]\s+/, "")) + "</li>";
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        if (line) html += "<p>" + inline(line) + "</p>";
      }
    });
    if (inList) html += "</ul>";
    return html;
  }

  /* ---------- Construction du DOM ---------- */
  var panel, body, input, sendBtn, launcher;

  function build() {
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    launcher = document.createElement("button");
    launcher.className = "ramc-launcher";
    launcher.setAttribute("aria-label", "Ouvrir l'assistant RAM Advisor");
    launcher.innerHTML =
      '<span class="ramc-dot"></span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '<span class="ramc-lbl">Une question ?</span>';

    panel = document.createElement("div");
    panel.className = "ramc-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Assistant RAM Advisor");
    panel.innerHTML =
      '<div class="ramc-head">' +
        '<div class="ramc-avatar">RA</div>' +
        '<div><h3>Assistant RAM Advisor</h3><p>En ligne · réponses pédagogiques</p></div>' +
        '<button class="ramc-close" aria-label="Fermer">&times;</button>' +
      "</div>" +
      '<div class="ramc-body" id="ramc-body"></div>' +
      '<div class="ramc-foot">' +
        '<div class="ramc-inputrow">' +
          '<textarea class="ramc-input" rows="1" placeholder="Posez votre question…" aria-label="Votre message"></textarea>' +
          '<button class="ramc-send" aria-label="Envoyer">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
          "</button>" +
        "</div>" +
        '<p class="ramc-legal">Informations pédagogiques — ne constitue pas un conseil en investissement personnalisé.</p>' +
      "</div>";

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    body = panel.querySelector("#ramc-body");
    input = panel.querySelector(".ramc-input");
    sendBtn = panel.querySelector(".ramc-send");

    launcher.addEventListener("click", toggle);
    panel.querySelector(".ramc-close").addEventListener("click", toggle);
    sendBtn.addEventListener("click", onSend);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
    });
    input.addEventListener("input", function () {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 96) + "px";
    });
  }

  var opened = false, greeted = false;
  function toggle() {
    opened = !opened;
    panel.classList.toggle("ramc-open", opened);
    launcher.style.display = opened ? "none" : "flex";
    if (opened && !greeted) {
      greeted = true;
      addBot({ reply: WELCOME, source: "" });
      addStarters();
    }
    if (opened) setTimeout(function () { input.focus(); }, 150);
  }

  /* ---------- Rendu des messages ---------- */
  function scroll() { body.scrollTop = body.scrollHeight; }

  function addUser(text) {
    var el = document.createElement("div");
    el.className = "ramc-msg ramc-user";
    el.innerHTML = '<div class="ramc-bubble">' + escapeHtml(text) + "</div>";
    body.appendChild(el);
    scroll();
  }

  function fixHref(href) {
    // Ancres de page d'accueil : depuis /pages/, renvoyer vers l'index.
    if (href.charAt(0) === "#") return BASE ? BASE + "index.html" + href : href;
    if (/^pages\//.test(href)) return BASE + href; // depuis pages/, préfixer ../
    return href;
  }

  function addBot(data) {
    var el = document.createElement("div");
    el.className = "ramc-msg ramc-bot";
    var html = '<div class="ramc-bubble">' + renderMarkdown(data.reply || "");

    if (data.source) {
      html += '<div class="ramc-source">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
        "Source : " + escapeHtml(data.source) + "</div>";
    }
    if (data.disclaimer) {
      html += '<div class="ramc-disclaimer">ℹ️ Information à but pédagogique — ne constitue pas un conseil en investissement.</div>';
    }

    // Liens d'orientation
    if (data.links && data.links.length) {
      html += '<div class="ramc-links">';
      data.links.forEach(function (l) {
        var ext = /^https?:/i.test(l.href);
        html += '<a class="ramc-link" href="' + fixHref(l.href) + '"' +
          (ext ? ' target="_blank" rel="noopener"' : "") + ">" +
          '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
          escapeHtml(l.label) + "</a>";
      });
      html += "</div>";
    }

    // CTA rendez-vous
    if (data.offer_meeting) {
      html += '<a class="ramc-cta" href="' + (data.calendly || CALENDLY) + '" target="_blank" rel="noopener">' +
        '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        "Réserver un appel gratuit (15 min)</a>";
    }

    html += "</div>";
    el.innerHTML = html;
    body.appendChild(el);

    // Suggestions de suivi
    if (data.quick_replies && data.quick_replies.length) {
      addChips(data.quick_replies);
    }
    scroll();
  }

  function addChips(list) {
    var wrap = document.createElement("div");
    wrap.className = "ramc-msg ramc-bot";
    var chips = document.createElement("div");
    chips.className = "ramc-chips";
    list.forEach(function (q) {
      var b = document.createElement("button");
      b.className = "ramc-chip";
      b.textContent = q;
      b.addEventListener("click", function () {
        wrap.remove();
        submit(q);
      });
      chips.appendChild(b);
    });
    wrap.appendChild(chips);
    body.appendChild(wrap);
    scroll();
  }

  function addStarters() { addChips(STARTERS); }

  var typingEl = null;
  function showTyping() {
    typingEl = document.createElement("div");
    typingEl.className = "ramc-msg ramc-bot";
    typingEl.innerHTML = '<div class="ramc-bubble" style="padding:0"><div class="ramc-typing"><span></span><span></span><span></span></div></div>';
    body.appendChild(typingEl);
    scroll();
  }
  function hideTyping() { if (typingEl) { typingEl.remove(); typingEl = null; } }

  /* ---------- Envoi ---------- */
  function onSend() {
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    input.style.height = "auto";
    submit(text);
  }

  function submit(text) {
    if (busy) return;
    // Purge d'éventuelles suggestions restantes
    Array.prototype.forEach.call(body.querySelectorAll(".ramc-chips"), function (c) {
      c.parentElement.remove();
    });
    addUser(text);
    messages.push({ role: "user", content: text });
    busy = true;
    sendBtn.disabled = true;
    showTyping();

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        hideTyping();
        if (data && data.reply) {
          addBot(data);
          messages.push({ role: "assistant", content: data.reply });
        } else {
          addBot({
            reply: "Désolé, je n'ai pas pu répondre. Vous pouvez réessayer ou réserver un appel gratuit.",
            offer_meeting: true, calendly: CALENDLY,
          });
        }
      })
      .catch(function () {
        hideTyping();
        addBot({
          reply: "Une erreur de connexion est survenue. Réessayez dans un instant, ou contactez-nous directement.",
          offer_meeting: true, calendly: CALENDLY,
        });
      })
      .finally(function () {
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      });
  }

  /* ---------- Init ---------- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
