import bcrypt from "bcryptjs";
import { authorize } from "../middleware/authorize.js";

export default async function authRoutes(fastify, opts) {
  // ── POST /api/auth/register ──────────────────────────
  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            role: {
              type: "string",
              enum: [
                "SUPER_ADMIN",
                "REGIONAL_OFFICER",
                "MONITORING_TEAM",
                "INDUSTRY_USER",
                "CITIZEN",
              ],
            },
            phone: { type: "string" },
            regionId: { type: "string" },
            industryId: { type: "string" },
            // Industry fields (used when role = INDUSTRY_USER)
            industryName: { type: "string" },
            industryType: { type: "string" },
            registrationNo: { type: "string" },
            lat: { type: "number" },
            lng: { type: "number" },
            industryRegionId: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const {
        name,
        email,
        password,
        role,
        phone,
        regionId,
        industryId,
        industryName,
        industryType,
        registrationNo,
        lat,
        lng,
        industryRegionId,
      } = request.body;

      // Check if user already exists
      const existing = await fastify.prisma.user.findUnique({
        where: { email },
      });
      if (existing) {
        return reply
          .code(409)
          .send({ error: "User with this email already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      let linkedIndustryId = industryId || null;

      try {
        // If registering as INDUSTRY_USER with industry details, auto-create a PENDING industry
        if (
          role === "INDUSTRY_USER" &&
          industryName &&
          industryType &&
          registrationNo &&
          lat != null &&
          lng != null &&
          industryRegionId
        ) {
          // Check if registration number already exists
          const existingIndustry = await fastify.prisma.industry.findUnique({
            where: { registrationNo },
          });
          if (existingIndustry) {
            return reply
              .code(409)
              .send({
                error:
                  "An industry with this registration number already exists",
              });
          }

          const newIndustry = await fastify.prisma.industry.create({
            data: {
              name: industryName,
              type: industryType,
              registrationNo,
              lat: Number(lat),
              lng: Number(lng),
              regionId: industryRegionId,
              status: "PENDING",
            },
          });
          linkedIndustryId = newIndustry.id;
        }

        const user = await fastify.prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: role || "CITIZEN",
            phone,
            regionId: regionId || null,
            industryId: linkedIndustryId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        });

        // Generate JWT
        const token = fastify.jwt.sign({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        // Re-fetch with relations so we return industry + region data
        const fullUser = await fastify.prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            region: { select: { id: true, name: true, code: true, lat: true, lng: true, district: true } },
            industry: {
              select: {
                id: true,
                name: true,
                type: true,
                registrationNo: true,
                status: true,
                regionId: true,
              },
            },
          },
        });

        return reply.code(201).send({ user: fullUser, token });
      } catch (err) {
        request.log.error(err);
        return reply
          .code(500)
          .send({ error: err.message || "Registration failed" });
      }
    },
  );

  // ── POST /api/auth/login ─────────────────────────────
  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const user = await fastify.prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.code(401).send({ error: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.code(401).send({ error: "Invalid email or password" });
      }

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Re-fetch with relations so we return industry + region data
      const fullUser = await fastify.prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          region: { select: { id: true, name: true, code: true, lat: true, lng: true, district: true } },
          industry: {
            select: {
              id: true,
              name: true,
              type: true,
              registrationNo: true,
              status: true,
              regionId: true,
            },
          },
        },
      });

      return reply.send({
        user: fullUser,
        token,
      });
    },
  );

  // ── GET /api/auth/me ─────────────────────────────────
  fastify.get(
    "/me",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          region: { select: { id: true, name: true, code: true, lat: true, lng: true, district: true } },
          industry: {
            select: {
              id: true,
              name: true,
              type: true,
              registrationNo: true,
              status: true,
              regionId: true,
              lat: true,
              lng: true,
            },
          },
          createdAt: true,
        },
      });

      if (!user) return reply.code(404).send({ error: "User not found" });
      return reply.send(user);
    },
  );
}
