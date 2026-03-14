import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";

// Plugins
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";

// Routes
import authRoutes from "./routes/auth.js";
import regionalOfficeRoutes from "./routes/regionalOffices.js";
import industryRoutes from "./routes/industries.js";
import waterSourceRoutes from "./routes/waterSources.js";
import monitoringLocationRoutes from "./routes/monitoringLocations.js";
import monitoringUnitRoutes from "./routes/monitoringUnits.js";
import prescribedLimitRoutes from "./routes/prescribedLimits.js";
import monitoringRoutes from "./routes/monitoring.js";
import alertRoutes from "./routes/alerts.js";
import publicRoutes from "./routes/public.js";
import aiRoutes from "./routes/ai.js";
import monitoringTeamRoutes from "./routes/monitoringTeams.js";

const app = Fastify({ logger: true });

// ─── GLOBAL PLUGINS ─────────────────────────────────────
await app.register(cors, { origin: true }); // Allow all origins in dev
await app.register(prismaPlugin);
await app.register(authPlugin);

// ─── ROUTE REGISTRATION ────────────────────────────────
app.register(authRoutes, { prefix: "/api/auth" });
app.register(regionalOfficeRoutes, { prefix: "/api/regional-offices" });
app.register(industryRoutes, { prefix: "/api/industries" });
app.register(waterSourceRoutes, { prefix: "/api/water-sources" });
app.register(monitoringLocationRoutes, { prefix: "/api/monitoring-locations" });
app.register(monitoringUnitRoutes, { prefix: "/api/monitoring-units" });
app.register(prescribedLimitRoutes, { prefix: "/api/prescribed-limits" });
app.register(monitoringRoutes, { prefix: "/api/monitoring" });
app.register(alertRoutes, { prefix: "/api/alerts" });
app.register(publicRoutes, { prefix: "/api/public" });
app.register(monitoringTeamRoutes, { prefix: "/api/monitoring-teams" });
app.register(aiRoutes, { prefix: "/api/ai" });

// ─── HEALTH CHECK ───────────────────────────────────────
app.get("/api/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

// ─── START SERVER ───────────────────────────────────────
const PORT = process.env.PORT || 3001;

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`🌿 PrithviNet Backend running at http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
