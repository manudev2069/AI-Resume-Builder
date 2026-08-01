
import { PrismaClient } from '@prisma/client';
export const db = globalThis.prisma || new PrismaClient();

// Example: Get all users
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
