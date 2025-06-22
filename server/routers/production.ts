import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { prisma } from '../db'

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
        prisma.productionLog.findMany({
          where,
          include: {
            product: { select: { name: true, unit: true } }
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { date: 'desc' },
        }),
        prisma.productionLog.count({ where })
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
      return await prisma.productionLog.create({
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
      const startOfDay = new Date(input.date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(input.date)
      endOfDay.setHours(23, 59, 59, 999)

      return await prisma.productionLog.groupBy({
        by: ['productId'],
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          }
        },
        _sum: {
          quantity: true,
        },
        _count: {
          id: true,
        }
      })
    }),

  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      return await prisma.productionLog.findUnique({
        where: { id: input.id },
        include: {
          product: true,
          user: { select: { name: true, email: true } }
        }
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      quantity: z.number().min(0.001).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input
      
      return await prisma.productionLog.update({
        where: { id },
        data: updateData,
        include: {
          product: true
        }
      })
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await prisma.productionLog.delete({
        where: { id: input.id }
      })
    }),

  getProductionStats: protectedProcedure
    .input(z.object({
      productId: z.string().optional(),
      fromDate: z.date().optional(),
      toDate: z.date().optional(),
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

      const stats = await prisma.productionLog.aggregate({
        where,
        _sum: { quantity: true },
        _avg: { quantity: true },
        _count: { id: true },
        _max: { quantity: true },
        _min: { quantity: true },
      })

      return {
        totalQuantity: stats._sum.quantity || 0,
        averageQuantity: stats._avg.quantity || 0,
        totalEntries: stats._count.id,
        maxQuantity: stats._max.quantity || 0,
        minQuantity: stats._min.quantity || 0,
      }
    }),
})