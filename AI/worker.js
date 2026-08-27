// Cloudflare Worker — proxy papunta sa Anthropic API.
// Ang API key ay nakatago dito (server-side), hindi makikita ng browser/user.

// PALITAN MO ITO ng sarili mong Anthropic API key
// (Mas mainam: ilagay sa Cloudflare Dashboard -> Settings -> Variables
//  bilang "encrypted" secret na pinangalanang ANTHROPIC_API_KEY,
//  tapos gamitin ang env.ANTHROPIC_API_KEY sa halip na i-hardcode dito)
const ANTHROPIC_API_KEY = "PASTE_YOUR_API_KEY_HERE";

// PALITAN MO ITO ng URL ng GitHub Pages site mo (para lang doon galing
// ang mga request na papayagan — extra layer ng proteksyon)
const ALLOWED_ORIGIN = "https://YOUR-GITHUB-USERNAME.github.io";

export default {
  async fetch(request, env) {
    // Handle preflight CORS request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const body = await request.json();

      const apiKey = (env && env.ANTHROPIC_API_KEY) || ANTHROPIC_API_KEY;

      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });

      const data = await anthropicResponse.text();

      return new Response(data, {
        status: anthropicResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      });
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
