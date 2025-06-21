// server/routers/orders.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { db } from '../db'

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0.001),
  rate: z.number().min(0),
  discount: z.number().min(0).default(0),
  amount: z.number().min(0),
})

export const ordersRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED']).optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const where = {
        ...(input.search && {
          OR: [
            { orderNumber: { contains: input.search, mode: 'insensitive' as const } },
            { customer: { name: { contains: input.search, mode: 'insensitive' as const } } },
          ]
        }),
        ...(input.status && { status: input.status }),
      }

      const [orders, total] = await Promise.all([
        db.salesOrder.findMany({
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
          orderBy: { orderDate: 'desc' },
        }),
        db.salesOrder.count({ where })
      ])

      return { orders, total, pages: Math.ceil(total / input.limit) }
    }),

  create: protectedProcedure
    .input(z.object({
      customerId: z.string(),
      deliveryDate: z.date().optional(),
      items: z.array(orderItemSchema).min(1),
      subtotal: z.number().min(0),
      discount: z.number().min(0).default(0),
      taxAmount: z.number().min(0).default(0),
      total: z.number().min(0),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const settings = await db.companySettings.findFirst()
      const prefix = settings?.orderPrefix || 'ORD'
      
      const lastOrder = await db.salesOrder.findFirst({
        orderBy: { orderNumber: 'desc' },
        where: { orderNumber: { startsWith: prefix } }
      })

      let nextNumber = 1
      if (lastOrder) {
        const lastNumber = parseInt(lastOrder.orderNumber.replace(prefix, ''))
        nextNumber = lastNumber + 1
      }

      const orderNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`

      return await db.salesOrder.create({
        data: {
          orderNumber,
          customerId: input.customerId,
          deliveryDate: input.deliveryDate,
          subtotal: input.subtotal,
          discount: input.discount,
          taxAmount: input.taxAmount,
          total: input.total,
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
          items: { include: { product: true } },
          customer: true
        }
      })
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED']),
    }))
    .mutation(async ({ input }) => {
      return await db.salesOrder.update({
        where: { id: input.id },
        data: { status: input.status }
      })
    }),

  convertToBill: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const order = await db.salesOrder.findUnique({
        where: { id: input },
        include: { items: true }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      // Get next bill number
      const settings = await db.companySettings.findFirst()
      const prefix = settings?.invoicePrefix || 'INV'
      
      const lastBill = await db.salesBill.findFirst({
        orderBy: { billNumber: 'desc' },
        where: { billNumber: { startsWith: prefix } }
      })

      let nextNumber = 1
      if (lastBill) {
        const lastNumber = parseInt(lastBill.billNumber.replace(prefix, ''))
        nextNumber = lastNumber + 1
      }

      const billNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`

      return await db.$transaction(async (tx) => {
        // Create bill from order
        const bill = await tx.salesBill.create({
          data: {
            billNumber,
            customerId: order.customerId,
            subtotal: order.subtotal,
            discount: order.discount,
            taxAmount: order.taxAmount,
            total: order.total,
            userId: ctx.user.id,
            items: {
              create: order.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                rate: item.rate,
                discount: item.discount,
                amount: item.amount,
              }))
            }
          }
        })

        // Mark order as fulfilled
        await tx.salesOrder.update({
          where: { id: input },
          data: { status: 'FULFILLED' }
        })

        return bill
      })
    }),
})