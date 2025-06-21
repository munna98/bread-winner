// server/routers/customers.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { db } from '../db'

export const customersRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const where = input.search ? {
        OR: [
          { name: { contains: input.search, mode: 'insensitive' as const } },
          { phone: { contains: input.search } },
          { email: { contains: input.search, mode: 'insensitive' as const } },
        ]
      } : {}

      const [customers, total] = await Promise.all([
        db.customer.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { name: 'asc' },
        }),
        db.customer.count({ where })
      ])

      return { customers, total, pages: Math.ceil(total / input.limit) }
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await db.customer.findUnique({
        where: { id: input },
        include: {
          salesBills: {
            select: { id: true, billNumber: true, total: true, billDate: true }
          }
        }
      })
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
      gstNumber: z.string().optional(),
      openingBalance: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      return await db.customer.create({
        data: {
          ...input,
          openingBalance: input.openingBalance,
        }
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
      gstNumber: z.string().optional(),
      openingBalance: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return await db.customer.update({
        where: { id },
        data: {
          ...data,
          openingBalance: data.openingBalance,
        }
      })
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await db.customer.update({
        where: { id: input },
        data: { isActive: false }
      })
    }),
})