import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "https://vyral-frontend.pages.dev",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

type AuditInput = {
  platform: "Instagram" | "TikTok";
  profileUrl?: string;
  followers: number;
  avgLikes: number;
  avgComments: number;
  postsPerWeek: number;
  clearNiche: boolean;
  bioHasCta: boolean;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function validInput(value: unknown): value is AuditInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (v.platform === "Instagram" || v.platform === "TikTok")
    && (v.profileUrl === undefined || (typeof v.profileUrl === "string" && v.profileUrl.length <= 300))
    && typeof v.followers === "number" && Number.isFinite(v.followers) && v.followers > 0
    && typeof v.avgLikes === "number" && Number.isFinite(v.avgLikes) && v.avgLikes >= 0
    && typeof v.avgComments === "number" && Number.isFinite(v.avgComments) && v.avgComments >= 0
    && typeof v.postsPerWeek === "number" && Number.isFinite(v.postsPerWeek) && v.postsPerWeek >= 0 && v.postsPerWeek <= 100
    && typeof v.clearNiche === "boolean"
    && typeof v.bioHasCta === "boolean";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  const apiKey = Deno.env.get("NVIDIA_API_KEY");
  if (!apiKey) return json({ error: "La IA todavía no está configurada en el servidor." }, 503);

  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return json({ error: "El cuerpo de la solicitud no es JSON válido." }, 400);
  }
  if (!validInput(input)) return json({ error: "Revisá los datos del análisis." }, 400);

  const engagementRate = ((input.avgLikes + input.avgComments) / input.followers) * 100;
  const metrics = {
    platform: input.platform,
    profileUrl: input.profileUrl ?? null,
    followers: input.followers,
    averageLikes: input.avgLikes,
    averageComments: input.avgComments,
    averageInteractions: input.avgLikes + input.avgComments,
    estimatedEngagementRate: Number(engagementRate.toFixed(2)),
    postsPerWeek: input.postsPerWeek,
    nicheClearlyCommunicated: input.clearNiche,
    bioHasCallToAction: input.bioHasCta,
  };

  const prompt = `Actuás como estratega senior de contenido para creadores y negocios. Analizá los datos proporcionados y respondé en español neutro, claro y accionable. No inventes datos, no afirmes haber visitado el perfil ni haber extraído métricas de la plataforma. Estos datos fueron ingresados manualmente. No uses benchmarks universales como si fueran reglas; contextualizá cualquier observación. Priorizá 3 oportunidades concretas y un plan de acción de 7 días. Devolvé exclusivamente JSON válido con esta estructura: {"summary":"...","strengths":["..."],"opportunities":[{"title":"...","reason":"...","action":"...","priority":"alta|media|baja"}],"sevenDayPlan":[{"day":1,"task":"..."}],"caveats":["..."]}. Incluí exactamente 7 elementos en sevenDayPlan.\n\nDatos del perfil: ${JSON.stringify(metrics)}`;

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("NVIDIA_MODEL") ?? "meta/llama-3.3-70b-instruct",
        messages: [
          { role: "system", content: "Sos Vyral Intelligence. Respondé únicamente con JSON válido, sin Markdown ni texto adicional." },
          { role: "user", content: prompt },
        ],
        temperature: 0.35,
        top_p: 0.8,
        max_tokens: 1800,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("NVIDIA API error", response.status, detail.slice(0, 500));
      return json({ error: "El servicio de IA no pudo completar el análisis. Intentá nuevamente." }, 502);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (typeof content !== "string") return json({ error: "La IA devolvió una respuesta inesperada." }, 502);

    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    let analysis: unknown;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      console.error("NVIDIA returned invalid JSON", cleaned.slice(0, 500));
      return json({ error: "No se pudo interpretar el análisis generado. Intentá nuevamente." }, 502);
    }

    return json({ metrics, analysis, generatedAt: new Date().toISOString(), source: "user_provided_metrics" });
  } catch (error) {
    console.error("Account audit failed", error);
    return json({ error: "No se pudo conectar con el servicio de análisis." }, 500);
  }
});
