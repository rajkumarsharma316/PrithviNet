import { authorize } from "../middleware/authorize.js";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b";

async function callOllama(prompt) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  // For non-streaming, Ollama returns an object with a `response` field
  return data.response || "";
}

function buildChatPrompt(contextSummary, history, message) {
  const historyText = history
    .map(
      (m) =>
        `${m.role.toUpperCase()}: ${typeof m.content === "string" ? m.content : ""}`,
    )
    .join("\n");

  return `
You are PrithviNet, an AI assistant helping the Chhattisgarh Environment Conservation Board understand environmental monitoring data (air, water, noise), industries, and regulatory compliance. 
Always answer concisely and clearly. When relevant, mention specific regions, industries, and alerts from the provided context. If information is not available, say so instead of guessing.

CONTEXT (summarised from the latest database state):
${contextSummary}

CONVERSATION SO FAR:
${historyText}

USER: ${message}
ASSISTANT:`.trim();
}

async function buildContextSummary(fastify, user) {
  // Basic high‑signal snapshot – kept intentionally small for prompt length
  const [regions, alerts] = await Promise.all([
    fastify.prisma.regionalOffice.findMany({
      select: { name: true, district: true, code: true },
      orderBy: { name: "asc" },
      take: 8,
    }),
    fastify.prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        location: {
          select: { name: true, region: { select: { name: true } } },
        },
      },
    }),
  ]);

  const regionLines = regions
    .map((r) => `- ${r.name} (${r.district}) [${r.code}]`)
    .join("\n");

  const alertLines = alerts
    .map(
      (a) =>
        `- ${a.severity} ${a.parameter} at ${a.location?.name || "Unknown"} in ${
          a.location?.region?.name || "Unknown region"
        }: ${a.message}`,
    )
    .join("\n");

  return `
User role: ${user.role || "unknown"}

Key regional offices:
${regionLines || "- (none found)"}

Recent alerts:
${alertLines || "- (no recent alerts)"}  
`.trim();
}

// Simple linear regression + moving average for numeric series
function computeForecast(points, steps, intervalMs) {
  // points: [{ timestamp: Date, value: number }]
  if (!points.length) {
    return { history: [], forecast: [], risk: { level: "UNKNOWN", reason: "No data" } };
  }

  const xs = [];
  const ys = [];
  const baseTime = points[0].timestamp.getTime();

  points.forEach((p, idx) => {
    const t = (p.timestamp.getTime() - baseTime) / 3600000; // hours since start
    xs.push(t);
    ys.push(p.value);
  });

  const n = xs.length;
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = ys.reduce((s, y) => s + y, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  const history = points.map((p) => ({
    timestamp: p.timestamp.toISOString(),
    value: p.value,
  }));

  const lastTime = xs[xs.length - 1];
  const forecast = [];
  for (let i = 1; i <= steps; i++) {
    const t = lastTime + (intervalMs / 3600000) * i;
    const v = intercept + slope * t;

    // Simple uncertainty band based on standard deviation of residuals
    forecast.push({
      timestamp: new Date(baseTime + t * 3600000).toISOString(),
      value: v,
    });
  }

  const riskLevel =
    slope > 0.3 ? "HIGH" : slope > 0.1 ? "MEDIUM" : slope < -0.1 ? "IMPROVING" : "STABLE";

  return {
    history,
    forecast,
    risk: {
      level: riskLevel,
      reason: `Trend slope over time is ${slope.toFixed(2)} (positive means increasing).`,
    },
  };
}

export default async function aiRoutes(fastify, opts) {
  // ── POST /api/ai/chat ─────────────────────────────────────
  fastify.post(
    "/chat",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { message, history = [] } = request.body || {};
      if (!message || typeof message !== "string") {
        return reply
          .code(400)
          .send({ error: "Missing 'message' in request body (string required)." });
      }

      try {
        const contextSummary = await buildContextSummary(fastify, request.user || {});
        const prompt = buildChatPrompt(contextSummary, history, message);
        const response = await callOllama(prompt);

        return reply.send({
          reply: response,
          contextSummary,
        });
      } catch (err) {
        request.log.error(err);
        return reply
          .code(500)
          .send({ error: "AI assistant failed", details: err.message || String(err) });
      }
    },
  );

  // ── POST /api/ai/report ───────────────────────────────────
  fastify.post(
    "/report",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const days = Number(request.body?.days || 7);
      const since = new Date();
      since.setDate(since.getDate() - days);

      try {
        const [alertCounts, industryCounts, airAgg] = await Promise.all([
          fastify.prisma.alert.groupBy({
            by: ["severity"],
            where: { createdAt: { gte: since } },
            _count: { _all: true },
          }),
          fastify.prisma.industry.groupBy({
            by: ["status"],
            _count: { _all: true },
          }),
          fastify.prisma.airData.aggregate({
            where: { timestamp: { gte: since } },
            _avg: { aqi: true },
            _max: { aqi: true },
          }),
        ]);

        const totalAlerts = alertCounts.reduce((s, a) => s + a._count._all, 0);
        const sevSummary = alertCounts
          .map((a) => `${a.severity}: ${a._count._all}`)
          .join(", ");
        const indSummary = industryCounts
          .map((a) => `${a.status}: ${a._count._all}`)
          .join(", ");

        const statsText = `
Time window: last ${days} day(s)

Alerts by severity (total ${totalAlerts}):
${sevSummary || "None recorded."}

Industries by status:
${indSummary || "No industries found."}

Air quality (across all regions, last ${days}d):
- Average AQI: ${airAgg._avg.aqi?.toFixed?.(1) ?? "N/A"}
- Max AQI: ${airAgg._max.aqi ?? "N/A"}
`.trim();

        const prompt = `
You are an environmental reporting assistant for a state pollution control board.

Using the statistics below, write a short professional report. Use Markdown formatting strictly:
- Use "## " for each section heading (e.g. ## Executive Summary).
- Use "### " for any subheadings.
- Use "- " for bullet lists.
- Use **text** for emphasis where needed.
- Leave a blank line between paragraphs and after headings.

Sections (use these exact headings):
## Executive Summary
(2–3 sentences summarising the period.)

## Air, Water and Noise Conditions
(Brief analysis; focus on air quality if other data is missing.)

## Key Concerns
(Bullet list of main issues.)

## Recommendations
(Bullet list for regulators and industries.)

Keep the report concise and professional. Do not repeat the statistics verbatim; interpret them.

STATISTICS:
${statsText}
`.trim();

        const response = await callOllama(prompt);

        return reply.send({
          days,
          stats: { alertCounts, industryCounts, airAgg },
          report: response,
        });
      } catch (err) {
        request.log.error(err);
        return reply
          .code(500)
          .send({ error: "AI report generation failed", details: err.message });
      }
    },
  );

  // ── GET /api/ai/forecast ──────────────────────────────────
  fastify.get(
    "/forecast",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { type = "air", locationId, hours = 72 } = request.query;
      const horizon = Number(hours) || 72;
      const since = new Date();
      since.setDate(since.getDate() - 7); // last week for context

      try {
        let rows = [];
        let key = "aqi";
        let unitLabel = "AQI";

        if (type === "air") {
          rows = await fastify.prisma.airData.findMany({
            where: {
              timestamp: { gte: since },
              ...(locationId ? { locationId } : {}),
            },
            select: { timestamp: true, aqi: true },
            orderBy: { timestamp: "asc" },
          });
          key = "aqi";
          unitLabel = "AQI";
        } else if (type === "water") {
          rows = await fastify.prisma.waterData.findMany({
            where: {
              timestamp: { gte: since },
              ...(locationId ? { locationId } : {}),
            },
            select: { timestamp: true, ph: true },
            orderBy: { timestamp: "asc" },
          });
          key = "ph";
          unitLabel = "pH";
        } else if (type === "noise") {
          rows = await fastify.prisma.noiseData.findMany({
            where: {
              timestamp: { gte: since },
              ...(locationId ? { locationId } : {}),
            },
            select: { timestamp: true, laeq: true },
            orderBy: { timestamp: "asc" },
          });
          key = "laeq";
          unitLabel = "dB(A)";
        } else {
          return reply
            .code(400)
            .send({ error: "Invalid type. Expected air, water, or noise." });
        }

        const numericPoints = rows
          .filter((r) => r[key] != null)
          .map((r) => ({
            timestamp: r.timestamp,
            value: Number(r[key]),
          }));

        const { history, forecast, risk } = computeForecast(
          numericPoints,
          Math.round(horizon / 3),
          3 * 3600000,
        ); // 3‑hour steps

        return reply.send({
          type,
          locationId: locationId || null,
          unitLabel,
          history,
          forecast,
          risk,
        });
      } catch (err) {
        request.log.error(err);
        return reply
          .code(500)
          .send({ error: "Forecast generation failed", details: err.message });
      }
    },
  );
}

