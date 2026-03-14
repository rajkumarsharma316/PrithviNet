// Public endpoints — NO authentication required
// These serve the citizen transparency portal

export default async function publicRoutes(fastify, opts) {
  // ── GET /api/public/overview ──────────────────────────
  // Aggregated stats for the public dashboard. Optional ?regionId= for regional view.
  fastify.get("/overview", async (request, reply) => {
    const rawRegionId = request.query?.regionId;
    const regionId = rawRegionId && String(rawRegionId).trim() ? String(rawRegionId).trim() : null;
    const regionFilter = regionId ? { regionId } : {};
    const locationRegionFilter = regionId ? { location: { regionId } } : {};

    const [
      totalLocations,
      totalIndustries,
      totalRegions,
      activeAlerts,
      latestAir,
      latestWater,
      latestNoise,
    ] = await Promise.all([
      fastify.prisma.monitoringLocation.count({ where: regionFilter }),
      fastify.prisma.industry.count({
        where: { status: "ACTIVE", ...regionFilter },
      }),
      regionId
        ? 1
        : fastify.prisma.regionalOffice.count(),
      fastify.prisma.alert.count({
        where: {
          status: "ACTIVE",
          ...(regionId ? { location: { regionId } } : {}),
        },
      }),
      fastify.prisma.airData.findFirst({
        where: locationRegionFilter,
        orderBy: { timestamp: "desc" },
        include: { location: { select: { name: true } } },
      }),
      fastify.prisma.waterData.findFirst({
        where: locationRegionFilter,
        orderBy: { timestamp: "desc" },
        include: { location: { select: { name: true } } },
      }),
      fastify.prisma.noiseData.findFirst({
        where: locationRegionFilter,
        orderBy: { timestamp: "desc" },
        include: { location: { select: { name: true } } },
      }),
    ]);

    return reply.send({
      stats: { totalLocations, totalIndustries, totalRegions, activeAlerts },
      latestReadings: {
        air: latestAir,
        water: latestWater,
        noise: latestNoise,
      },
    });
  });

  // ── GET /api/public/map-data/:type ────────────────────
  // Returns latest reading per monitoring location for map markers
  fastify.get("/map-data/:type", async (request, reply) => {
    reply.header("Cache-Control", "no-store, no-cache");
    const { type } = request.params; // air, water, noise

    const locations = await fastify.prisma.monitoringLocation.findMany({
      where: { type: type.toUpperCase() },
      include: {
        region: { select: { name: true, code: true } },
      },
    });

    // For each location, get the latest reading
    const mapData = await Promise.all(
      locations.map(async (loc) => {
        let latestReading = null;

        if (type === "air") {
          latestReading = await fastify.prisma.airData.findFirst({
            where: { locationId: loc.id },
            orderBy: { timestamp: "desc" },
          });
        } else if (type === "water") {
          latestReading = await fastify.prisma.waterData.findFirst({
            where: { locationId: loc.id },
            orderBy: { timestamp: "desc" },
          });
        } else if (type === "noise") {
          latestReading = await fastify.prisma.noiseData.findFirst({
            where: { locationId: loc.id },
            orderBy: { timestamp: "desc" },
          });
        }

        return {
          id: loc.id,
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          region: loc.region,
          latestReading,
        };
      }),
    );

    return reply.send(mapData);
  });

  // ── GET /api/public/alerts ────────────────────────────
  // Public-facing active alerts. Optional ?regionId= to filter by regional office.
  fastify.get("/alerts", async (request, reply) => {
    const { regionId } = request.query || {};
    const where = {
      status: "ACTIVE",
      ...(regionId ? { location: { regionId } } : {}),
    };
    const alerts = await fastify.prisma.alert.findMany({
      where,
      include: {
        location: { select: { name: true, lat: true, lng: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return reply.send(alerts);
  });

  // ── GET /api/public/regional-offices ──────────────────
  // List all regional offices for the map
  fastify.get("/regional-offices", async (request, reply) => {
    const offices = await fastify.prisma.regionalOffice.findMany({
      include: {
        _count: {
          select: { industries: true, monitoringLocations: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return reply.send(offices);
  });

  // ── GET /api/public/trend/:type/:locationId ───────────
  // Historical trend data for charts
  fastify.get("/trend/:type/:locationId", async (request, reply) => {
    const { type, locationId } = request.params;
    const { days } = request.query;
    const daysBack = parseInt(days) || 7;
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    let data = [];
    const where = { locationId, timestamp: { gte: since } };
    const orderBy = { timestamp: "asc" };

    if (type === "air") {
      data = await fastify.prisma.airData.findMany({ where, orderBy });
    } else if (type === "water") {
      data = await fastify.prisma.waterData.findMany({ where, orderBy });
    } else if (type === "noise") {
      data = await fastify.prisma.noiseData.findMany({ where, orderBy });
    }

    return reply.send(data);
  });

  // ── GET /api/public/region-summary ─────────────────────
  // Returns all regions with computed stats from real data
  fastify.get("/region-summary", async (request, reply) => {
    reply.header("Cache-Control", "no-store, no-cache");
    const regions = await fastify.prisma.regionalOffice.findMany({
      include: {
        industries: {
          select: { id: true, status: true },
        },
        monitoringLocations: {
          select: { id: true, type: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const summary = regions.map((r) => {
      const total = r.industries.length;
      const compliant = r.industries.filter(
        (i) => i.status === "ACTIVE",
      ).length;
      const nonCompliant = total - compliant;
      const pending = r.industries.filter(
        (i) => i.status === "PENDING",
      ).length;
      const compliance = total > 0 ? Math.round((compliant / total) * 100) : 100;

      return {
        id: r.id,
        name: r.name,
        code: r.code,
        district: r.district,
        lat: r.lat,
        lng: r.lng,
        industries: { total, compliant, nonCompliant, pending },
        stationsCount: r.monitoringLocations.length,
        compliance,
      };
    });

    return reply.send(summary);
  });

  // ── GET /api/public/region-trend/:regionId ─────────────
  // Returns last 30 days of aggregated monitoring data for a region
  fastify.get("/region-trend/:regionId", async (request, reply) => {
    const { regionId } = request.params;
    const since = new Date();
    since.setDate(since.getDate() - 30);

    // Get all location IDs in this region
    const locations = await fastify.prisma.monitoringLocation.findMany({
      where: { regionId },
      select: { id: true, type: true },
    });
    const locationIds = locations.map((l) => l.id);

    if (locationIds.length === 0) {
      return reply.send([]);
    }

    const [airRows, waterRows, noiseRows] = await Promise.all([
      fastify.prisma.airData.findMany({
        where: { locationId: { in: locationIds }, timestamp: { gte: since } },
        orderBy: { timestamp: "asc" },
        select: { timestamp: true, aqi: true },
      }),
      fastify.prisma.waterData.findMany({
        where: { locationId: { in: locationIds }, timestamp: { gte: since } },
        orderBy: { timestamp: "asc" },
        select: { timestamp: true, ph: true },
      }),
      fastify.prisma.noiseData.findMany({
        where: { locationId: { in: locationIds }, timestamp: { gte: since } },
        orderBy: { timestamp: "asc" },
        select: { timestamp: true, laeq: true },
      }),
    ]);

    // Group by day
    const dayMap = {};
    const addToDay = (rows, key) => {
      rows.forEach((r) => {
        const day = r.timestamp.toISOString().slice(0, 10);
        if (!dayMap[day]) dayMap[day] = { day, aqiSum: 0, aqiN: 0, phSum: 0, phN: 0, noiseSum: 0, noiseN: 0 };
        if (r[key] != null) {
          if (key === "aqi") { dayMap[day].aqiSum += r.aqi; dayMap[day].aqiN++; }
          if (key === "ph") { dayMap[day].phSum += r.ph; dayMap[day].phN++; }
          if (key === "laeq") { dayMap[day].noiseSum += r.laeq; dayMap[day].noiseN++; }
        }
      });
    };

    addToDay(airRows, "aqi");
    addToDay(waterRows, "ph");
    addToDay(noiseRows, "laeq");

    const trend = Object.values(dayMap)
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((d, i) => ({
        day: `${i + 1}`,
        date: d.day,
        aqi: d.aqiN > 0 ? Math.round(d.aqiSum / d.aqiN) : null,
        ph: d.phN > 0 ? parseFloat((d.phSum / d.phN).toFixed(1)) : null,
        noise: d.noiseN > 0 ? Math.round(d.noiseSum / d.noiseN) : null,
      }));

    return reply.send(trend);
  });

  // ── GET /api/public/yoy-trend/:type ────────────────────
  // Returns monthly averages for the last 3 years for a given type (air, water, noise)
  fastify.get("/yoy-trend/:type", async (request, reply) => {
    const { type } = request.params; // air, water, noise
    const now = new Date();
    const years = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()];
    const since = new Date(years[0], 0, 1);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let rows = [];

    if (type === "air") {
      rows = await fastify.prisma.airData.findMany({
        where: { timestamp: { gte: since } },
        select: { timestamp: true, aqi: true },
      });
    } else if (type === "water") {
      rows = await fastify.prisma.waterData.findMany({
        where: { timestamp: { gte: since } },
        select: { timestamp: true, ph: true },
      });
    } else if (type === "noise") {
      rows = await fastify.prisma.noiseData.findMany({
        where: { timestamp: { gte: since } },
        select: { timestamp: true, laeq: true },
      });
    }

    // Group by year-month
    const buckets = {};
    rows.forEach((r) => {
      const d = new Date(r.timestamp);
      const y = d.getFullYear();
      const m = d.getMonth(); // 0-11
      const key = `${y}-${m}`;
      if (!buckets[key]) buckets[key] = { sum: 0, n: 0 };
      const val = type === "air" ? r.aqi : type === "water" ? r.ph : r.laeq;
      if (val != null) { buckets[key].sum += val; buckets[key].n++; }
    });

    // Build result: 12 months, each with y2022, y2023, y2024 (or whatever the 3 years are)
    const result = months.map((month, idx) => {
      const row = { month };
      years.forEach((y) => {
        const b = buckets[`${y}-${idx}`];
        const avg = b && b.n > 0 ? (b.sum / b.n) : null;
        row[`y${y}`] = avg != null ? (type === "water" ? parseFloat(avg.toFixed(1)) : Math.round(avg)) : null;
      });
      // compute YoY change between last two years
      const prev = row[`y${years[1]}`];
      const curr = row[`y${years[2]}`];
      row.yoyChange = prev && curr ? parseFloat((((curr - prev) / prev) * 100).toFixed(1)) : 0;
      return row;
    });

    return reply.send({ years, data: result });
  });
}
