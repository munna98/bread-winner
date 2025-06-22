// server/routers/expenses.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { prisma } from '../db'

export const expensesRouter = router({
  getCategories: protectedProcedure
    .query(async () => {
      return await prisma.expenseCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      })
    }),

  createCategory: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
    }))
    .mutation(async ({ input }) => {
      return await prisma.expenseCategory.create({
        data: input
      })
    }),

  getAll: protectedProcedure
    .input(z.object({
      categoryId: z.string().optional(),
      fromDate: z.date().optional(),
      toDate: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const where = {
        ...(input.categoryId && { categoryId: input.categoryId }),
        ...(input.fromDate && input.toDate && {
          date: {
            gte: input.fromDate,
            lte: input.toDate,
          }
        }),
      }

      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          include: {
            category: { select: { name: true } }
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { date: 'desc' },
        }),
        prisma.expense.count({ where })
      ])

      return { expenses, total, pages: Math.ceil(total / input.limit) }
    }),

  create: protectedProcedure
    .input(z.object({
      categoryId: z.string(),
      amount: z.number().min(0),
      description: z.string().min(2),
      paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']).default('CASH'),
      billNumber: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await prisma.expense.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
        include: {
          category: true
        }
      })
    }),
})
