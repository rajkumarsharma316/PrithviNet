import { authorize } from "../middleware/authorize.js";

export default async function prescribedLimitRoutes(fastify, opts) {
  fastify.get(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { parameter, category } = request.query;
      const where = {};
      if (parameter) where.parameter = parameter;
      if (category) where.category = category;
      const limits = await fastify.prisma.prescribedLimit.findMany({
        where,
        include: {
          unit: { select: { name: true, symbol: true, parameterType: true } },
        },
        orderBy: { parameter: "asc" },
      });
      return reply.send(limits);
    },
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, authorize("SUPER_ADMIN")],
      schema: {
        body: {
          type: "object",
          required: ["parameter", "unitId"],
          properties: {
            parameter: { type: "string" },
            minValue: { type: "number" },
            maxValue: { type: "number" },
            category: { type: "string" },
            unitId: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const limit = await fastify.prisma.prescribedLimit.create({
        data: request.body,
      });
      return reply.code(201).send(limit);
    },
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, authorize("SUPER_ADMIN")],
    },
    async (request, reply) => {
      const limit = await fastify.prisma.prescribedLimit.update({
        where: { id: request.params.id },
        data: request.body,
      });
      return reply.send(limit);
    },
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate, authorize("SUPER_ADMIN")],
    },
    async (request, reply) => {
      await fastify.prisma.prescribedLimit.delete({
        where: { id: request.params.id },
      });
      return reply.code(204).send();
    },
  );
}
