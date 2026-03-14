// Role-based authorization hook factory
// Usage: { preHandler: [fastify.authenticate, authorize('SUPER_ADMIN', 'REGIONAL_OFFICER')] }

export function authorize(...allowedRoles) {
  return async function (request, reply) {
    const userRole = request.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return reply.code(403).send({
        error: "Forbidden",
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }
  };
}
