// Auto-alert logic: check submitted data against prescribed limits
// Called after every monitoring data submission

export async function checkAndCreateAlerts(prisma, { type, locationId, parameters }) {
  // Fetch all prescribed limits for this parameter type
  const limits = await prisma.prescribedLimit.findMany({
    where: {
      unit: {
        parameterType: type // AIR, WATER, NOISE
      }
    },
    include: { unit: true }
  });

  const alerts = [];

  for (const limit of limits) {
    const paramKey = limit.parameter.toLowerCase().replace('.', '');
    const value = parameters[paramKey];

    if (value === undefined || value === null) continue;

    // Check max limit breach
    if (limit.maxValue !== null && value > limit.maxValue) {
      const severity = value > limit.maxValue * 1.5 ? 'CRITICAL' : 'WARNING';
      alerts.push({
        type,
        severity,
        message: `${limit.parameter} value of ${value} ${limit.unit.symbol} exceeds prescribed limit of ${limit.maxValue} ${limit.unit.symbol}`,
        parameter: limit.parameter,
        value: value,
        limitValue: limit.maxValue,
        locationId,
        status: 'ACTIVE'
      });
    }

    // Check min limit breach (e.g., dissolved oxygen too low)
    if (limit.minValue !== null && value < limit.minValue) {
      const severity = value < limit.minValue * 0.5 ? 'CRITICAL' : 'WARNING';
      alerts.push({
        type,
        severity,
        message: `${limit.parameter} value of ${value} ${limit.unit.symbol} is below the minimum prescribed level of ${limit.minValue} ${limit.unit.symbol}`,
        parameter: limit.parameter,
        value: value,
        limitValue: limit.minValue,
        locationId,
        status: 'ACTIVE'
      });
    }
  }

  // Bulk create alerts
  if (alerts.length > 0) {
    await prisma.alert.createMany({ data: alerts });
  }

  return alerts;
}
