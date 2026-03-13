// Public endpoints — NO authentication required
// These serve the citizen transparency portal

export default async function publicRoutes(fastify, opts) {

  // ── GET /api/public/overview ──────────────────────────
  // Aggregated stats for the public dashboard
  fastify.get('/overview', async (request, reply) => {
    const [
      totalLocations,
      totalIndustries,
      totalRegions,
      activeAlerts,
      latestAir,
      latestWater,
      latestNoise
    ] = await Promise.all([
      fastify.prisma.monitoringLocation.count(),
      fastify.prisma.industry.count({ where: { status: 'ACTIVE' } }),
      fastify.prisma.regionalOffice.count(),
      fastify.prisma.alert.count({ where: { status: 'ACTIVE' } }),
      fastify.prisma.airData.findFirst({ orderBy: { timestamp: 'desc' }, include: { location: { select: { name: true } } } }),
      fastify.prisma.waterData.findFirst({ orderBy: { timestamp: 'desc' }, include: { location: { select: { name: true } } } }),
      fastify.prisma.noiseData.findFirst({ orderBy: { timestamp: 'desc' }, include: { location: { select: { name: true } } } })
    ]);

    return reply.send({
      stats: { totalLocations, totalIndustries, totalRegions, activeAlerts },
      latestReadings: {
        air: latestAir,
        water: latestWater,
        noise: latestNoise
      }
    });
  });

  // ── GET /api/public/map-data/:type ────────────────────
  // Returns latest reading per monitoring location for map markers
  fastify.get('/map-data/:type', async (request, reply) => {
    const { type } = request.params; // air, water, noise

    const locations = await fastify.prisma.monitoringLocation.findMany({
      where: { type: type.toUpperCase() },
      include: {
        region: { select: { name: true, code: true } }
      }
    });

    // For each location, get the latest reading
    const mapData = await Promise.all(locations.map(async (loc) => {
      let latestReading = null;

      if (type === 'air') {
        latestReading = await fastify.prisma.airData.findFirst({
          where: { locationId: loc.id },
          orderBy: { timestamp: 'desc' }
        });
      } else if (type === 'water') {
        latestReading = await fastify.prisma.waterData.findFirst({
          where: { locationId: loc.id },
          orderBy: { timestamp: 'desc' }
        });
      } else if (type === 'noise') {
        latestReading = await fastify.prisma.noiseData.findFirst({
          where: { locationId: loc.id },
          orderBy: { timestamp: 'desc' }
        });
      }

      return {
        id: loc.id,
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        region: loc.region,
        latestReading
      };
    }));

    return reply.send(mapData);
  });

  // ── GET /api/public/alerts ────────────────────────────
  // Public-facing active alerts
  fastify.get('/alerts', async (request, reply) => {
    const alerts = await fastify.prisma.alert.findMany({
      where: { status: 'ACTIVE' },
      include: {
        location: { select: { name: true, lat: true, lng: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return reply.send(alerts);
  });

  // ── GET /api/public/regional-offices ──────────────────
  // List all regional offices for the map
  fastify.get('/regional-offices', async (request, reply) => {
    const offices = await fastify.prisma.regionalOffice.findMany({
      include: {
        _count: {
          select: { industries: true, monitoringLocations: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return reply.send(offices);
  });

  // ── GET /api/public/trend/:type/:locationId ───────────
  // Historical trend data for charts
  fastify.get('/trend/:type/:locationId', async (request, reply) => {
    const { type, locationId } = request.params;
    const { days } = request.query;
    const daysBack = parseInt(days) || 7;
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    let data = [];
    const where = { locationId, timestamp: { gte: since } };
    const orderBy = { timestamp: 'asc' };

    if (type === 'air') {
      data = await fastify.prisma.airData.findMany({ where, orderBy });
    } else if (type === 'water') {
      data = await fastify.prisma.waterData.findMany({ where, orderBy });
    } else if (type === 'noise') {
      data = await fastify.prisma.noiseData.findMany({ where, orderBy });
    }

    return reply.send(data);
  });
}
