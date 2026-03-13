import fp from 'fastify-plugin';

async function authPlugin(fastify, opts) {
  fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'fallback-secret'
  });

  // Decorator: authenticate — verifies JWT and attaches user
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized — invalid or missing token' });
    }
  });
}

export default fp(authPlugin);
