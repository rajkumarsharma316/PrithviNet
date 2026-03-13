import { authorize } from '../middleware/authorize.js';

export default async function regionalOfficeRoutes(fastify, opts) {

  // GET all
  fastify.get('/', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const offices = await fastify.prisma.regionalOffice.findMany({
      include: { _count: { select: { industries: true, users: true, monitoringLocations: true } } },
      orderBy: { name: 'asc' }
    });
    return reply.send(offices);
  });

  // GET by id
  fastify.get('/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const office = await fastify.prisma.regionalOffice.findUnique({
      where: { id: request.params.id },
      include: {
        industries: true,
        waterSources: true,
        monitoringLocations: true,
        _count: { select: { users: true } }
      }
    });
    if (!office) return reply.code(404).send({ error: 'Regional office not found' });
    return reply.send(office);
  });

  // POST create
  fastify.post('/', {
    preHandler: [fastify.authenticate, authorize('SUPER_ADMIN')],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'code', 'lat', 'lng', 'district'],
        properties: {
          name: { type: 'string' },
          code: { type: 'string' },
          lat: { type: 'number' },
          lng: { type: 'number' },
          address: { type: 'string' },
          district: { type: 'string' },
          state: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const office = await fastify.prisma.regionalOffice.create({ data: request.body });
    return reply.code(201).send(office);
  });

  // PUT update
  fastify.put('/:id', {
    preHandler: [fastify.authenticate, authorize('SUPER_ADMIN')]
  }, async (request, reply) => {
    const office = await fastify.prisma.regionalOffice.update({
      where: { id: request.params.id },
      data: request.body
    });
    return reply.send(office);
  });

  // DELETE
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, authorize('SUPER_ADMIN')]
  }, async (request, reply) => {
    await fastify.prisma.regionalOffice.delete({ where: { id: request.params.id } });
    return reply.code(204).send();
  });
}
