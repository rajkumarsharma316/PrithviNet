import bcrypt from 'bcryptjs';
import { authorize } from '../middleware/authorize.js';

export default async function authRoutes(fastify, opts) {

  // ── POST /api/auth/register ──────────────────────────
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['SUPER_ADMIN', 'REGIONAL_OFFICER', 'MONITORING_TEAM', 'INDUSTRY_USER', 'CITIZEN'] },
          phone: { type: 'string' },
          regionId: { type: 'string' },
          industryId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { name, email, password, role, phone, regionId, industryId } = request.body;

    // Check if user already exists
    const existing = await fastify.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await fastify.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CITIZEN',
        phone,
        regionId: regionId || null,
        industryId: industryId || null
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    // Generate JWT
    const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });

    return reply.code(201).send({ user, token });
  });

  // ── POST /api/auth/login ─────────────────────────────
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body;

    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });

    return reply.send({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  });

  // ── GET /api/auth/me ─────────────────────────────────
  fastify.get('/me', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        region: { select: { id: true, name: true, code: true } },
        industry: { select: { id: true, name: true } },
        createdAt: true
      }
    });

    if (!user) return reply.code(404).send({ error: 'User not found' });
    return reply.send(user);
  });
}
