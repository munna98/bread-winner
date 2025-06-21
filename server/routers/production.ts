// server/routers/production.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { db } from '../db'

export const productionRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      productId: z.string().optional(),
      fromDate: z.date().optional(),
      toDate: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const where = {
        ...(input.productId && { productId: input.productId }),
        ...(input.fromDate && input.toDate && {
          date: {
            gte: input.fromDate,
            lte: input.toDate,
          }
        }),
      }

      const [logs, total] = await Promise.all([
        db.productionLog.findMany({
          where,
          include: {
            product: { select: { name: true, unit: true } }
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { date: 'desc' },
        }),
        db.productionLog.count({ where })
      ])

      return { logs, total, pages: Math.ceil(total / input.limit) }
    }),

  create: protectedProcedure
    .input(z.object({
      productId: z.string(),
      quantity: z.number().min(0.001),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.productionLog.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
        include: {
          product: true
        }
      })
    }),

  getDailySummary: protectedProcedure
    .input(z.object({
      date: z.date(),
    }))
    .query(async ({ input }) => {
      return await db.productionLog.groupBy({
        by: ['product// server/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
