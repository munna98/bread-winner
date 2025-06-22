// server/routers/billing.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { prisma } from '../db'
import { TRPCError } from '@trpc/server'

const billItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0.001),
  rate: z.number().min(0),
  discount: z.number().min(0).default(0),
  amount: z.number().min(0),
})

export const billingRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      customerId: z.string().optional(),
      fromDate: z.date().optional(),
      toDate: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const where = {
        ...(input.search && {
          OR: [
            { billNumber: { contains: input.search, mode: 'insensitive' as const } },
            { customer: { name: { contains: input.search, mode: 'insensitive' as const } } },
          ]
        }),
        ...(input.customerId && { customerId: input.customerId }),
        ...(input.fromDate && input.toDate && {
          billDate: {
            gte: input.fromDate,
            lte: input.toDate,
          }
        }),
      }

      const [bills, total] = await Promise.all([
        prisma.salesBill.findMany({
          where,
          include: {
            customer: { select: { name: true } },
            items: {
              include: {
                product: { select: { name: true } }
              }
            }
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { billDate: 'desc' },
        }),
        prisma.salesBill.count({ where })
      ])

      return { bills, total, pages: Math.ceil(total / input.limit) }
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await prisma.salesBill.findUnique({
        where: { id: input },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      })
    }),

  getNextBillNumber: protectedProcedure
    .query(async () => {
      const settings = await prisma.companySettings.findFirst()
      const prefix = settings?.invoicePrefix || 'INV'
      
      const lastBill = await prisma.salesBill.findFirst({
        orderBy: { billNumber: 'desc' },
        where: {
          billNumber: { startsWith: prefix }
        }
      })

      let nextNumber = 1
      if (lastBill) {
        const lastNumber = parseInt(lastBill.billNumber.replace(prefix, ''))
        nextNumber = lastNumber + 1
      }

      return `${prefix}${String(nextNumber).padStart(4, '0')}`
    }),

  create: protectedProcedure
    .input(z.object({
      customerId: z.string().optional(),
      items: z.array(billItemSchema).min(1),
      subtotal: z.number().min(0),
      discount: z.number().min(0).default(0),
      taxAmount: z.number().min(0).default(0),
      total: z.number().min(0),
      paidAmount: z.number().min(0).default(0),
      paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CREDIT']).default('CASH'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const billNumber = await billingRouter.createCaller({ user: ctx.user }).getNextBillNumber()
      
      const balanceAmount = input.total - input.paidAmount

      return await prisma.$transaction(async (tx) => {
        // Create sales bill
        const bill = await tx.salesBill.create({
          data: {
            billNumber,
            customerId: input.customerId || null,
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
                quantity: item.quantity,
                rate: item.rate,
                discount: item.discount,
                amount: item.amount,
              }))
            }
          },
          include: {
            items: {
              include: { product: true }
            },
            customer: true
          }
        })

        // Create ledger entries
        const salesAccount = await tx.account.findFirst({
          where: { name: 'Sales', accountType: 'INCOME' }
        })
        
        const cashAccount = await tx.account.findFirst({
          where: { name: 'Cash', accountType: 'ASSET' }
        })

        if (salesAccount && cashAccount) {
          // Sales entry
          await tx.ledgerEntry.create({
            data: {
              voucherNumber: billNumber,
              voucherType: 'SALES',
              debitAccountId: cashAccount.id,
              creditAccountId: salesAccount.id,
              amount: input.total,
              narration: `Sales bill ${billNumber}`,
              customerId: input.customerId,
              salesBillId: bill.id,
            }
          })
        }

        return bill
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      customerId: z.string().optional(),
      items: z.array(billItemSchema).min(1),
      subtotal: z.number().min(0),
      discount: z.number().min(0).default(0),
      taxAmount: z.number().min(0).default(0),
      total: z.number().min(0),
      paidAmount: z.number().min(0).default(0),
      paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CREDIT']).default('CASH'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input
      const balanceAmount = input.total - input.paidAmount

      return await prisma.$transaction(async (tx) => {
        // Delete existing items
        await tx.salesBillItem.deleteMany({
          where: { salesBillId: id }
        })

        // Update bill
        const bill = await tx.salesBill.update({
          where: { id },
          data: {
            customerId: updateData.customerId || null,
            subtotal: updateData.subtotal,
            discount: updateData.discount,
            taxAmount: updateData.taxAmount,
            total: updateData.total,
            paidAmount: updateData.paidAmount,
            balanceAmount,
            paymentMode: updateData.paymentMode,
            notes: updateData.notes,
            items: {
              create: updateData.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                rate: item.rate,
                discount: item.discount,
                amount: item.amount,
              }))
            }
          },
          include: {
            items: {
              include: { product: true }
            },
            customer: true
          }
        })

        return bill
      })
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await prisma.salesBill.update({
        where: { id: input },
        data: { status: 'CANCELLED' }
      })
    }),
})