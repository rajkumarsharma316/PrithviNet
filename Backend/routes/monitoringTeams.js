import { authorize } from "../middleware/authorize.js";
import bcrypt from "bcryptjs";

export default async function monitoringTeamRoutes(fastify, opts) {
  // GET — list monitoring team users for the officer's region
  fastify.get(
    "/",
    {
      preHandler: [
        fastify.authenticate,
        authorize("REGIONAL_OFFICER", "SUPER_ADMIN"),
      ],
    },
    async (request, reply) => {
      const where = { role: "MONITORING_TEAM" };

      // Regional officers only see their region's teams
      if (request.user.role === "REGIONAL_OFFICER" && request.user.regionId) {
        where.regionId = request.user.regionId;
      }

      const users = await fastify.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          region: { select: { id: true, name: true, code: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return reply.send(users);
    },
  );

  // POST — create a new monitoring team user
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, authorize("REGIONAL_OFFICER")],
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            phone: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { name, email, password, phone } = request.body;
      const regionId = request.user.regionId;

      if (!regionId) {
        return reply
          .code(400)
          .send({ error: "You are not assigned to a region" });
      }

      // Check if email already taken
      const existing = await fastify.prisma.user.findUnique({
        where: { email },
      });
      if (existing) {
        return reply
          .code(409)
          .send({ error: "A user with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await fastify.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "MONITORING_TEAM",
          phone: phone || null,
          regionId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          region: { select: { id: true, name: true, code: true } },
          createdAt: true,
        },
      });

      return reply.code(201).send(user);
    },
  );
}
