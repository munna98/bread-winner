import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { db } from '../db'
import { AccountType, VoucherType } from '@prisma/client'

export const accountsRouter = router({
  // Get all accounts with hierarchy
  getAll: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      accountType: z.nativeEnum(AccountType).optional(),
      includeInactive: z.boolean().default(false),
    }))
    .query(async ({ input }) => {
      const where = {
        ...(input.includeInactive ? {} : { isActive: true }),
        ...(input.search && {
          name: { contains: input.search, mode: 'insensitive' as const }
        }),
        ...(input.accountType && {
          accountType: input.accountType
        })
      }

      return await db.account.findMany({
        where,
        include: {
          parent: true,
          children: {
            where: { isActive: true },
            select: { id: true, name: true, accountType: true }
          },
          _count: {
            select: { 
              debitEntries: true, 
              creditEntries: true 
            }
          }
        },
        orderBy: [
          { accountType: 'asc' },
          { name: 'asc' }
        ],
      })
    }),

  // Get account hierarchy (parent accounts only)
  getHierarchy: protectedProcedure
    .query(async () => {
      const accounts = await db.account.findMany({
        where: { isActive: true },
        include: {
          children: {
            where: { isActive: true },
            include: {
              children: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: [
          { accountType: 'asc' },
          { name: 'asc' }
        ],
      })

      // Group by account type for better organization
      return {
        ASSET: accounts.filter(a => a.accountType === 'ASSET' && !a.parentId),
        LIABILITY: accounts.filter(a => a.accountType === 'LIABILITY' && !a.parentId),
        EQUITY: accounts.filter(a => a.accountType === 'EQUITY' && !a.parentId),
        INCOME: accounts.filter(a => a.accountType === 'INCOME' && !a.parentId),
        EXPENSE: accounts.filter(a => a.accountType === 'EXPENSE' && !a.parentId),
      }
    }),

  // Get account by ID with balance
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const account = await db.account.findUnique({
        where: { id: input },
        include: {
          parent: true,
          children: {
            where: { isActive: true }
          },
          debitEntries: {
            include: {
              creditAccount: { select: { name: true } }
            },
            orderBy: { date: 'desc' },
            take: 10
          },
          creditEntries: {
            include: {
              debitAccount: { select: { name: true } }
            },
            orderBy: { date: 'desc' },
            take: 10
          }
        }
      })

      if (!account) return null

      // Calculate current balance
      const debitTotal = await db.ledgerEntry.aggregate({
        where: { debitAccountId: input },
        _sum: { amount: true }
      })

      const creditTotal = await db.ledgerEntry.aggregate({
        where: { creditAccountId: input },
        _sum: { amount: true }
      })

      const debitSum = Number(debitTotal._sum.amount || 0)
      const creditSum = Number(creditTotal._sum.amount || 0)
      
      // Balance calculation based on account type
      let currentBalance = Number(account.openingBalance)
      if (account.accountType === 'ASSET' || account.accountType === 'EXPENSE') {
        currentBalance += debitSum - creditSum
      } else {
        currentBalance += creditSum - debitSum
      }

      return {
        ...account,
        currentBalance,
        debitTotal: debitSum,
        creditTotal: creditSum
      }
    }),

  // Create new account
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      accountType: z.nativeEnum(AccountType),
      parentId: z.string().optional(),
      openingBalance: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      return await db.account.create({
        data: {
          ...input,
          openingBalance: input.openingBalance,
        }
      })
    }),

  // Update account
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2),
      accountType: z.nativeEnum(AccountType),
      parentId: z.string().optional(),
      openingBalance: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return await db.account.update({
        where: { id },
        data: {
          ...data,
          openingBalance: data.openingBalance,
        }
      })
    }),

  // Delete account (soft delete)
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      // Check if account has entries
      const hasEntries = await db.ledgerEntry.findFirst({
        where: {
          OR: [
            { debitAccountId: input },
            { creditAccountId: input }
          ]
        }
      })

      if (hasEntries) {
        // Soft delete if has entries
        return await db.account.update({
          where: { id: input },
          data: { isActive: false }
        })
      } else {
        // Hard delete if no entries
        return await db.account.delete({
          where: { id: input }
        })
      }
    }),

  // Ledger Entries Management
  getLedgerEntries: protectedProcedure
    .input(z.object({
      accountId: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      voucherType: z.nativeEnum(VoucherType).optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const where = {
        ...(input.accountId && {
          OR: [
            { debitAccountId: input.accountId },
            { creditAccountId: input.accountId }
          ]
        }),
        ...(input.startDate && input.endDate && {
          date: {
            gte: input.startDate,
            lte: input.endDate
          }
        }),
        ...(input.voucherType && {
          voucherType: input.voucherType
        })
      }

      const [entries, total] = await Promise.all([
        db.ledgerEntry.findMany({
          where,
          include: {
            debitAccount: { select: { name: true, accountType: true } },
            creditAccount: { select: { name: true, accountType: true } },
            customer: { select: { name: true } },
            supplier: { select: { name: true } },
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: [
            { date: 'desc' },
            { createdAt: 'desc' }
          ],
        }),
        db.ledgerEntry.count({ where })
      ])

      return { entries, total, pages: Math.ceil(total / input.limit) }
    }),

  // Create ledger entry (Journal Entry)
  createLedgerEntry: protectedProcedure
    .input(z.object({
      date: z.date().default(() => new Date()),
      voucherNumber: z.string(),
      voucherType: z.nativeEnum(VoucherType).default('JOURNAL'),
      debitAccountId: z.string(),
      creditAccountId: z.string(),
      amount: z.number().min(0.01),
      narration: z.string(),
      reference: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.ledgerEntry.create({
        data: {
          ...input,
          amount: input.amount,
        },
        include: {
          debitAccount: { select: { name: true } },
          creditAccount: { select: { name: true } },
        }
      })
    }),

  // Get account balance
  getAccountBalance: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      asOfDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      const account = await db.account.findUnique({
        where: { id: input.accountId },
        select: { 
          name: true, 
          accountType: true, 
          openingBalance: true 
        }
      })

      if (!account) throw new Error('Account not found')

      const whereClause = {
        ...(input.asOfDate && {
          date: { lte: input.asOfDate }
        })
      }

      const [debitTotal, creditTotal] = await Promise.all([
        db.ledgerEntry.aggregate({
          where: { 
            debitAccountId: input.accountId,
            ...whereClause
          },
          _sum: { amount: true }
        }),
        db.ledgerEntry.aggregate({
          where: { 
            creditAccountId: input.accountId,
            ...whereClause
          },
          _sum: { amount: true }
        })
      ])

      const debitSum = Number(debitTotal._sum.amount || 0)
      const creditSum = Number(creditTotal._sum.amount || 0)
      let balance = Number(account.openingBalance)

      // Balance calculation based on account type
      if (account.accountType === 'ASSET' || account.accountType === 'EXPENSE') {
        balance += debitSum - creditSum
      } else {
        balance += creditSum - debitSum
      }

      return {
        account,
        balance,
        debitTotal: debitSum,
        creditTotal: creditSum,
        openingBalance: Number(account.openingBalance)
      }
    }),

  // Get trial balance
  getTrialBalance: protectedProcedure
    .input(z.object({
      asOfDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      const accounts = await db.account.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          accountType: true,
          openingBalance: true
        },
        orderBy: [
          { accountType: 'asc' },
          { name: 'asc' }
        ]
      })

      const whereClause = input.asOfDate ? {
        date: { lte: input.asOfDate }
      } : {}

      const trialBalance = await Promise.all(
        accounts.map(async (account) => {
          const [debitTotal, creditTotal] = await Promise.all([
            db.ledgerEntry.aggregate({
              where: { 
                debitAccountId: account.id,
                ...whereClause
              },
              _sum: { amount: true }
            }),
            db.ledgerEntry.aggregate({
              where: { 
                creditAccountId: account.id,
                ...whereClause
              },
              _sum: { amount: true }
            })
          ])

          const debitSum = Number(debitTotal._sum.amount || 0)
          const creditSum = Number(creditTotal._sum.amount || 0)
          let balance = Number(account.openingBalance)

          if (account.accountType === 'ASSET' || account.accountType === 'EXPENSE') {
            balance += debitSum - creditSum
          } else {
            balance += creditSum - debitSum
          }

          return {
            ...account,
            debitTotal: debitSum,
            creditTotal: creditSum,
            balance: Math.abs(balance),
            balanceType: balance >= 0 ? 'DEBIT' : 'CREDIT'
          }
        })
      )

      // Calculate totals
      const totalDebit = trialBalance
        .filter(acc => acc.balanceType === 'DEBIT')
        .reduce((sum, acc) => sum + acc.balance, 0)
      
      const totalCredit = trialBalance
        .filter(acc => acc.balanceType === 'CREDIT')
        .reduce((sum, acc) => sum + acc.balance, 0)

      return {
        accounts: trialBalance.filter(acc => acc.balance > 0), // Only show accounts with balance
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
      }
    }),
})