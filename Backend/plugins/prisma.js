import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';

const prisma = new PrismaClient();

async function prismaPlugin(fastify, opts) {
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });
}

export default fp(prismaPlugin);
