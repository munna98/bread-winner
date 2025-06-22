// server/routers/auth.ts
import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { prisma } from '../db'
import { comparePassword, generateToken, hashPassword } from '../auth'
import { TRPCError } from '@trpc/server'
import { User, UserRole } from '../../shared/types'

type LoginResponse = {
  token: string
  user: User
}

export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }): Promise<LoginResponse> => {
      const user = await prisma.user.findUnique({
        where: { email: input.email }
      })

      if (!user || !await comparePassword(input.password, user.password)) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' })
      }

      const token = generateToken(user.id)

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        },
      }
    }),

  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
    }))
    .mutation(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email }
      })

      if (existingUser) {
        throw new TRPCError({ code: 'CONFLICT', message: 'User already exists' })
      }

      const hashedPassword = await hashPassword(input.password)
      
      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
        }
      })

      const token = generateToken(user.id)
      
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        }
      }
    }),

  me: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.user
    }),
})