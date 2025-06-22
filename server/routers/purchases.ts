// server/routers/purchases.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { prisma } from '../db'

const purchaseItemSchema = z.object({
  productId: z.string().optional(),
  itemName: z.string(),
  quantity: z.number().min(0.001),
  rate: z.number().min(0),
  discount: z.number().min(0).default(0),
  amount: z.number().min(0),
})

export const purchasesRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      supplierId: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const where = {
        ...(input.search && {
          OR: [
            { purchaseNumber: { contains: input.search, mode: 'insensitive' as const } },
            { supplier: { name: { contains: input.search, mode: 'insensitive' as const } } },
          ]
        }),
        ...(input.supplierId && { supplierId: input.supplierId }),
      }

      const [purchases, total] = await Promise.all([
        prisma.purchase.findMany({
          where,
          include: {
            supplier: { select: { name: true } },
            items: true
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { purchaseDate: 'desc' },
        }),
        prisma.purchase.count({ where })
      ])

      return { purchases, total, pages: Math.ceil(total / input.limit) }
    }),

  create: protectedProcedure
    .input(z.object({
      supplierId: z.string().optional(),
      billNumber: z.string().optional(),
      items: z.array(purchaseItemSchema).min(1),
      subtotal: z.number().min(0),
      discount: z.number().min(0).default(0),
      taxAmount: z.number().min(0).default(0),
      total: z.number().min(0),
      paidAmount: z.number().min(0).default(0),
      paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CREDIT']).default('CASH'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const settings = await prisma.companySettings.findFirst()
      const prefix = settings?.purchasePrefix || 'PUR'
      
      const lastPurchase = await prisma.purchase.findFirst({
        orderBy: { purchaseNumber: 'desc' },
        where: { purchaseNumber: { startsWith: prefix } }
      })

      let nextNumber = 1
      if (lastPurchase) {
        const lastNumber = parseInt(lastPurchase.purchaseNumber.replace(prefix, ''))
        nextNumber = lastNumber + 1
      }

      const purchaseNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`
      const balanceAmount = input.total - input.paidAmount

      return await prisma.purchase.create({
        data: {
          purchaseNumber,
          supplierId: input.supplierId,
          billNumber: input.billNumber,
          subtotal: input.subtotal,
          discount: input.discount,
          taxAmount: input.taxAmount,
          total: input.total,
          paidAmount: input.paidAmount,
          balanceAmount,
          paymentMode: input.paymentMode,
          notes: input.notes,
          userId: ctx.user.id,
          items: {
            create: input.items.map(item => ({
              productId: item.productId,
              itemName: item.itemName,
              quantity: item.quantity,
              rate: item.rate,
              discount: item.discount,
              amount: item.amount,
            }))
          }
        },
        include: {
          items: true,
          supplier: true
        }
      })
    }),
})
