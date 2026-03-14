import { authorize } from "../middleware/authorize.js";

export default async function monitoringLocationRoutes(fastify, opts) {
  fastify.get(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { regionId, type } = request.query;
      const where = {};
      if (regionId) where.regionId = regionId;
      if (type) where.type = type;
      if (request.user.role === "REGIONAL_OFFICER" && request.user.regionId) {
        where.regionId = request.user.regionId;
      }
      const locations = await fastify.prisma.monitoringLocation.findMany({
        where,
        include: {
          region: { select: { name: true } },
          industry: { select: { name: true } },
        },
        orderBy: { name: "asc" },
      });
      return reply.send(locations);
    },
  );

  fastify.get(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const location = await fastify.prisma.monitoringLocation.findUnique({
        where: { id: request.params.id },
        include: { region: true, industry: true },
      });
      if (!location)
        return reply.code(404).send({ error: "Monitoring location not found" });
      return reply.send(location);
    },
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, authorize("REGIONAL_OFFICER")],
      schema: {
        body: {
          type: "object",
          required: ["name", "type", "lat", "lng", "regionId"],
          properties: {
            name: { type: "string" },
            type: { type: "string", enum: ["AIR", "WATER", "NOISE"] },
            lat: { type: "number" },
            lng: { type: "number" },
            regionId: { type: "string" },
            industryId: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const location = await fastify.prisma.monitoringLocation.create({
        data: request.body,
      });
      return reply.code(201).send(location);
    },
  );

  fastify.put(
    "/:id",
    {
      preHandler: [
        fastify.authenticate,
        authorize("SUPER_ADMIN", "REGIONAL_OFFICER"),
      ],
    },
    async (request, reply) => {
      const location = await fastify.prisma.monitoringLocation.update({
        where: { id: request.params.id },
        data: request.body,
      });
      return reply.send(location);
    },
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate, authorize("REGIONAL_OFFICER")],
    },
    async (request, reply) => {
      await fastify.prisma.monitoringLocation.delete({
        where: { id: request.params.id },
      });
      return reply.code(204).send();
    },
  );
}
