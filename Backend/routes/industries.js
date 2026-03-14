import { authorize } from "../middleware/authorize.js";

export default async function industryRoutes(fastify, opts) {
  // GET all (with optional regionId filter)
  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { regionId, status } = request.query;
      const where = {};
      if (regionId) where.regionId = regionId;
      if (status) where.status = status;

      // Regional officers only see their own region
      if (request.user.role === "REGIONAL_OFFICER" && request.user.regionId) {
        where.regionId = request.user.regionId;
      }

      const industries = await fastify.prisma.industry.findMany({
        where,
        include: { region: { select: { name: true, code: true } } },
        orderBy: { name: "asc" },
      });
      return reply.send(industries);
    },
  );

  // GET by id
  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const industry = await fastify.prisma.industry.findUnique({
        where: { id: request.params.id },
        include: {
          region: true,
          monitoringLocations: true,
          _count: { select: { users: true } },
        },
      });
      if (!industry)
        return reply.code(404).send({ error: "Industry not found" });
      return reply.send(industry);
    },
  );

  // POST create
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, authorize("REGIONAL_OFFICER")],
      schema: {
        body: {
          type: "object",
          required: [
            "name",
            "type",
            "registrationNo",
            "lat",
            "lng",
            "regionId",
          ],
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            registrationNo: { type: "string" },
            lat: { type: "number" },
            lng: { type: "number" },
            address: { type: "string" },
            regionId: { type: "string" },
            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"],
            },
          },
        },
      },
    },
    async (request, reply) => {
      // Force status to PENDING for new industries
      const data = { ...request.body, status: "PENDING" };
      const industry = await fastify.prisma.industry.create({ data });
      return reply.code(201).send(industry);
    },
  );

  // PUT update
  fastify.put(
    "/:id",
    {
      preHandler: [
        fastify.authenticate,
        authorize("SUPER_ADMIN", "REGIONAL_OFFICER"),
      ],
    },
    async (request, reply) => {
      const updateData = { ...request.body };

      const industry = await fastify.prisma.industry.update({
        where: { id: request.params.id },
        data: updateData,
      });
      return reply.send(industry);
    },
  );

  // DELETE
  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate, authorize("REGIONAL_OFFICER")],
    },
    async (request, reply) => {
      await fastify.prisma.industry.delete({
        where: { id: request.params.id },
      });
      return reply.code(204).send();
    },
  );
}
