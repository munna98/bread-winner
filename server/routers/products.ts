// server/routers/products.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { prisma } from '../db'

export const productsRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      category: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const where = {
        isActive: true,
        ...(input.search && {
          name: { contains: input.search, mode: 'insensitive' as const }
        }),
        ...(input.category && {
          category: input.category
        })
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { name: 'asc' },
        }),
        prisma.product.count({ where })
      ])

      return { products, total, pages: Math.ceil(total / input.limit) }
    }),

  getCategories: protectedProcedure
    .query(async () => {
      const categories = await prisma.product.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
      })
      return categories.map(c => c.category).filter(Boolean)
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      category: z.string().optional(),
      unit: z.string().default('pcs'),
      sellingPrice: z.number().min(0),
      costPrice: z.number().min(0).optional(),
    }))
    .mutation(async ({ input }) => {
      return await prisma.product.create({
        data: {
          ...input,
          sellingPrice: input.sellingPrice,
          costPrice: input.costPrice || 0,
        }
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2),
      category: z.string().optional(),
      unit: z.string().default('pcs'),
      sellingPrice: z.number().min(0),
      costPrice: z.number().min(0).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return await prisma.product.update({
        where: { id },
        data: {
          ...data,
          sellingPrice: data.sellingPrice,
          costPrice: data.costPrice || 0,
        }
      })
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await prisma.product.update({
        where: { id: input },
        data: { isActive: false }
      })
    }),
})