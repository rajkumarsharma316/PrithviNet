import { authorize } from '../middleware/authorize.js';

export default async function monitoringUnitRoutes(fastify, opts) {

  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { parameterType } = request.query;
    const where = {};
    if (parameterType) where.parameterType = parameterType;
    const units = await fastify.prisma.monitoringUnit.findMany({ where, orderBy: { name: 'asc' } });
    return reply.send(units);
  });

  fastify.post('/', {
    preHandler: [fastify.authenticate, authorize('SUPER_ADMIN')],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'symbol', 'parameterType'],
        properties: {
          name: { type: 'string' },
          symbol: { type: 'string' },
          parameterType: { type: 'string', enum: ['AIR', 'WATER', 'NOISE'] }
        }
      }
    }
  }, async (request, reply) => {
    const unit = await fastify.prisma.monitoringUnit.create({ data: request.body });
    return reply.code(201).send(unit);
  });

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, authorize('SUPER_ADMIN')]
  }, async (request, reply) => {
    await fastify.prisma.monitoringUnit.delete({ where: { id: request.params.id } });
    return reply.code(204).send();
  });
}
