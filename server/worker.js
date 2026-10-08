/**
 * Serveur IA de Jarvis (Cloudflare Worker, gratuit).
 * Il garde la clé Gemini secrète : l'application ne la voit jamais.
 *
 * Variables à définir dans Cloudflare (Settings > Variables) :
 *   GEMINI_API_KEY  (secret)  ta clé créée sur https://aistudio.google.com
 *   MODEL           (option)  nom du modèle Gemini, par défaut "gemini-2.5-flash".
 *                             Vérifie le nom exact dans AI Studio : les modèles changent souvent.
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...CORS, "Content-Type": "application/json" } });

function parseJSON(text) {
  try { return JSON.parse(text); } catch {}
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch {} }
  return null;
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method !== "POST") return json({ error: "Utilise POST." }, 405);
    if (!env.GEMINI_API_KEY) return json({ error: "Clé GEMINI_API_KEY manquante." }, 500);

    let body;
    try { body = await req.json(); } catch { return json({ error: "Requête illisible." }, 400); }
    const prompt = String(body.prompt || "");
    if (!prompt || prompt.length > 60000) return json({ error: "Message vide ou trop long." }, 400);

    const parts = [{ text: prompt }];
    if (body.image && body.image.data) {
      if (body.image.data.length > 8_000_000) return json({ error: "Image trop lourde." }, 413);
      parts.push({ inlineData: { mimeType: body.image.mime || "image/jpeg", data: body.image.data } });
    }

    const model = env.MODEL || "gemini-2.5-flash";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.8 },
      }),
    });
    if (r.status === 429) return json({ error: "Quota gratuit atteint, réessaie plus tard." }, 429);
    if (!r.ok) return json({ error: "Gemini a répondu " + r.status, details: (await r.text()).slice(0, 500) }, 502);

    const d = await r.json();
    const text = (d.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
    const result = parseJSON(text);
    if (!result) return json({ error: "Réponse illisible." }, 502);
    return json({ result });
  },
};
