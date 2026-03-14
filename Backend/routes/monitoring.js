import { authorize } from "../middleware/authorize.js";
import { checkAndCreateAlerts } from "../utils/alertChecker.js";

export default async function monitoringRoutes(fastify, opts) {
  // ═══════════════════════════════════════════════════════
  // AIR DATA
  // ═══════════════════════════════════════════════════════

  // POST — submit air quality data (Monitoring Team or Industry)
  fastify.post(
    "/air",
    {
      preHandler: [
        fastify.authenticate,
        authorize("MONITORING_TEAM", "INDUSTRY_USER"),
      ],
      schema: {
        body: {
          type: "object",
          required: ["locationId"],
          properties: {
            locationId: { type: "string" },
            pm25: { type: "number" },
            pm10: { type: "number" },
            no2: { type: "number" },
            so2: { type: "number" },
            co: { type: "number" },
            o3: { type: "number" },
            aqi: { type: "number" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
    async (request, reply) => {
      const { locationId, timestamp, ...parameters } = request.body;

      const entry = await fastify.prisma.airData.create({
        data: {
          ...parameters,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          locationId,
          submittedById: request.user.id,
        },
      });

      // Auto-alert check
      const alerts = await checkAndCreateAlerts(fastify.prisma, {
        type: "AIR",
        locationId,
        parameters,
      });

      return reply.code(201).send({ entry, alertsGenerated: alerts.length });
    },
  );

  // GET — retrieve air data (any authenticated user)
  fastify.get(
    "/air",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { locationId, from, to, limit } = request.query;
      const where = {};
      if (locationId) where.locationId = locationId;
      if (from || to) {
        where.timestamp = {};
        if (from) where.timestamp.gte = new Date(from);
        if (to) where.timestamp.lte = new Date(to);
      }
      // Region filter for officers
      if (request.user.role === "REGIONAL_OFFICER" && request.user.regionId) {
        where.location = { ...where.location, regionId: request.user.regionId };
      }
      // Industry filter for industry users
      if (request.user.role === "INDUSTRY_USER" && request.user.industryId) {
        where.location = { ...where.location, industryId: request.user.industryId };
      }

      const data = await fastify.prisma.airData.findMany({
        where,
        include: {
          location: { select: { name: true, lat: true, lng: true } },
          submittedBy: { select: { name: true } },
        },
        orderBy: { timestamp: "desc" },
        take: parseInt(limit) || 100,
      });
      return reply.send(data);
    },
  );

  // ═══════════════════════════════════════════════════════
  // WATER DATA
  // ═══════════════════════════════════════════════════════

  fastify.post(
    "/water",
    {
      preHandler: [
        fastify.authenticate,
        authorize("MONITORING_TEAM", "INDUSTRY_USER"),
      ],
      schema: {
        body: {
          type: "object",
          required: ["locationId"],
          properties: {
            locationId: { type: "string" },
            ph: { type: "number" },
            tds: { type: "number" },
            turbidity: { type: "number" },
            dissolvedOxygen: { type: "number" },
            bod: { type: "number" },
            cod: { type: "number" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
    async (request, reply) => {
      const { locationId, timestamp, ...parameters } = request.body;

      const entry = await fastify.prisma.waterData.create({
        data: {
          ...parameters,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          locationId,
          submittedById: request.user.id,
        },
      });

      const alerts = await checkAndCreateAlerts(fastify.prisma, {
        type: "WATER",
        locationId,
        parameters,
      });

      return reply.code(201).send({ entry, alertsGenerated: alerts.length });
    },
  );

  fastify.get(
    "/water",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { locationId, from, to, limit } = request.query;
      const where = {};
      if (locationId) where.locationId = locationId;
      if (from || to) {
        where.timestamp = {};
        if (from) where.timestamp.gte = new Date(from);
        if (to) where.timestamp.lte = new Date(to);
      }
      // Region filter for officers
      if (request.user.role === "REGIONAL_OFFICER" && request.user.regionId) {
        where.location = { ...where.location, regionId: request.user.regionId };
      }
      // Industry filter for industry users
      if (request.user.role === "INDUSTRY_USER" && request.user.industryId) {
        where.location = { ...where.location, industryId: request.user.industryId };
      }
      const data = await fastify.prisma.waterData.findMany({
        where,
        include: {
          location: { select: { name: true, lat: true, lng: true } },
          submittedBy: { select: { name: true } },
        },
        orderBy: { timestamp: "desc" },
        take: parseInt(limit) || 100,
      });
      return reply.send(data);
    },
  );

  // ═══════════════════════════════════════════════════════
  // NOISE DATA
  // ═══════════════════════════════════════════════════════

  fastify.post(
    "/noise",
    {
      preHandler: [
        fastify.authenticate,
        authorize("MONITORING_TEAM", "INDUSTRY_USER"),
      ],
      schema: {
        body: {
          type: "object",
          required: ["locationId"],
          properties: {
            locationId: { type: "string" },
            laeq: { type: "number" },
            lmax: { type: "number" },
            lmin: { type: "number" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
    async (request, reply) => {
      const { locationId, timestamp, ...parameters } = request.body;

      const entry = await fastify.prisma.noiseData.create({
        data: {
          ...parameters,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          locationId,
          submittedById: request.user.id,
        },
      });

      const alerts = await checkAndCreateAlerts(fastify.prisma, {
        type: "NOISE",
        locationId,
        parameters,
      });

      return reply.code(201).send({ entry, alertsGenerated: alerts.length });
    },
  );

  fastify.get(
    "/noise",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { locationId, from, to, limit } = request.query;
      const where = {};
      if (locationId) where.locationId = locationId;
      if (from || to) {
        where.timestamp = {};
        if (from) where.timestamp.gte = new Date(from);
        if (to) where.timestamp.lte = new Date(to);
      }
      // Region filter for officers
      if (request.user.role === "REGIONAL_OFFICER" && request.user.regionId) {
        where.location = { ...where.location, regionId: request.user.regionId };
      }
      // Industry filter for industry users
      if (request.user.role === "INDUSTRY_USER" && request.user.industryId) {
        where.location = { ...where.location, industryId: request.user.industryId };
      }
      const data = await fastify.prisma.noiseData.findMany({
        where,
        include: {
          location: { select: { name: true, lat: true, lng: true } },
          submittedBy: { select: { name: true } },
        },
        orderBy: { timestamp: "desc" },
        take: parseInt(limit) || 100,
      });
      return reply.send(data);
    },
  );
}
