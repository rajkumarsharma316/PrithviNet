import { authorize } from '../middleware/authorize.js';

export default async function alertRoutes(fastify, opts) {

  // GET — list alerts (with filters)
  fastify.get('/', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { status, severity, type, locationId, limit } = request.query;
    const where = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (locationId) where.locationId = locationId;

    const alerts = await fastify.prisma.alert.findMany({
      where,
      include: {
        location: { select: { name: true, lat: true, lng: true, region: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit) || 50
    });
    return reply.send(alerts);
  });

  // PUT — acknowledge alert
  fastify.put('/:id/acknowledge', {
    preHandler: [fastify.authenticate, authorize('SUPER_ADMIN', 'REGIONAL_OFFICER')]
  }, async (request, reply) => {
    const alert = await fastify.prisma.alert.update({
      where: { id: request.params.id },
      data: { status: 'ACKNOWLEDGED', escalatedToId: request.user.id }
    });
    return reply.send(alert);
  });

  // PUT — resolve alert
  fastify.put('/:id/resolve', {
    preHandler: [fastify.authenticate, authorize('SUPER_ADMIN', 'REGIONAL_OFFICER')]
  }, async (request, reply) => {
    const alert = await fastify.prisma.alert.update({
      where: { id: request.params.id },
      data: { status: 'RESOLVED' }
    });
    return reply.send(alert);
  });
}
