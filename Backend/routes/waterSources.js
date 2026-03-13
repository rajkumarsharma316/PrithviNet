import { authorize } from '../middleware/authorize.js';

export default async function waterSourceRoutes(fastify, opts) {

  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { regionId } = request.query;
    const where = {};
    if (regionId) where.regionId = regionId;
    if (request.user.role === 'REGIONAL_OFFICER' && request.user.regionId) {
      where.regionId = request.user.regionId;
    }
    const sources = await fastify.prisma.waterSource.findMany({
      where,
      include: { region: { select: { name: true } } },
      orderBy: { name: 'asc' }
    });
    return reply.send(sources);
  });

  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const source = await fastify.prisma.waterSource.findUnique({
      where: { id: request.params.id },
      include: { region: true }
    });
    if (!source) return reply.code(404).send({ error: 'Water source not found' });
    return reply.send(source);
  });

  fastify.post('/', {
    preHandler: [fastify.authenticate, authorize('SUPER_ADMIN', 'REGIONAL_OFFICER')],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'type', 'lat', 'lng', 'regionId'],
        properties: {
          name: { type: 'string' }, type: { type: 'string' },
          lat: { type: 'number' }, lng: { type: 'number' },
          regionId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const source = await fastify.prisma.waterSource.create({ data: request.body });
    return reply.code(201).send(source);
  });

  fastify.put('/:id', {
    preHandler: [fastify.authenticate, authorize('SUPER_ADMIN', 'REGIONAL_OFFICER')]
  }, async (request, reply) => {
    const source = await fastify.prisma.waterSource.update({ where: { id: request.params.id }, data: request.body });
    return reply.send(source);
  });

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, authorize('SUPER_ADMIN')]
  }, async (request, reply) => {
    await fastify.prisma.waterSource.delete({ where: { id: request.params.id } });
    return reply.code(204).send();
  });
}
