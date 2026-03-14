import fp from "fastify-plugin";

async function authPlugin(fastify, opts) {
  fastify.register(import("@fastify/jwt"), {
    secret: process.env.JWT_SECRET || "fallback-secret",
  });

  // Decorator: authenticate — verifies JWT and attaches user (enriched with regionId)
  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
      // Enrich with regionId from DB so routes can filter by region
      const dbUser = await fastify.prisma.user.findUnique({
        where: { id: request.user.id },
        select: { regionId: true, industryId: true },
      });
      if (dbUser) {
        request.user.regionId = dbUser.regionId;
        request.user.industryId = dbUser.industryId;
      }
    } catch (err) {
      reply
        .code(401)
        .send({ error: "Unauthorized — invalid or missing token" });
    }
  });
}

export default fp(authPlugin);
