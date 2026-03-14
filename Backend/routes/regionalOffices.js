import { authorize } from "../middleware/authorize.js";
import bcrypt from "bcryptjs";

export default async function regionalOfficeRoutes(fastify, opts) {
  // GET all
  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const offices = await fastify.prisma.regionalOffice.findMany({
        include: {
          _count: {
            select: {
              industries: true,
              users: true,
              monitoringLocations: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });
      return reply.send(offices);
    },
  );

  // GET by id
  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const office = await fastify.prisma.regionalOffice.findUnique({
        where: { id: request.params.id },
        include: {
          industries: true,
          waterSources: true,
          monitoringLocations: true,
          _count: { select: { users: true } },
        },
      });
      if (!office)
        return reply.code(404).send({ error: "Regional office not found" });
      return reply.send(office);
    },
  );

  // POST create (also creates a REGIONAL_OFFICER user for the office)
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, authorize("SUPER_ADMIN")],
      schema: {
        body: {
          type: "object",
          required: ["name", "code", "lat", "lng", "district", "officerEmail", "officerPassword"],
          properties: {
            name: { type: "string" },
            code: { type: "string" },
            lat: { type: "number" },
            lng: { type: "number" },
            address: { type: "string" },
            district: { type: "string" },
            state: { type: "string" },
            officerEmail: { type: "string", format: "email" },
            officerPassword: { type: "string", minLength: 6 },
          },
        },
      },
    },
    async (request, reply) => {
      const { officerEmail, officerPassword, ...officeData } = request.body;

      // Check if email already taken
      const existing = await fastify.prisma.user.findUnique({ where: { email: officerEmail } });
      if (existing) {
        return reply.code(409).send({ error: "A user with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(officerPassword, salt);

      // Create office + officer user in a transaction
      const [office, user] = await fastify.prisma.$transaction(async (tx) => {
        const newOffice = await tx.regionalOffice.create({ data: officeData });
        const newUser = await tx.user.create({
          data: {
            name: `${officeData.name} Officer`,
            email: officerEmail,
            password: hashedPassword,
            role: "REGIONAL_OFFICER",
            regionId: newOffice.id,
          },
          select: { id: true, name: true, email: true, role: true },
        });
        return [newOffice, newUser];
      });

      return reply.code(201).send({ office, officer: user });
    },
  );

  // PUT update
  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, authorize("SUPER_ADMIN")],
    },
    async (request, reply) => {
      const office = await fastify.prisma.regionalOffice.update({
        where: { id: request.params.id },
        data: request.body,
      });
      return reply.send(office);
    },
  );

  // DELETE
  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate, authorize("SUPER_ADMIN")],
    },
    async (request, reply) => {
      await fastify.prisma.regionalOffice.delete({
        where: { id: request.params.id },
      });
      return reply.code(204).send();
    },
  );
}
