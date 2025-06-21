// // server/trpc.ts
// import { initTRPC, TRPCError } from '@trpc/server'
// import { CreateExpressContextOptions } from '@trpc/server/adapters/express'
// import { getUser } from './auth'

// export const createTRPCContext = async (opts: CreateExpressContextOptions) => {
//   const { req } = opts
//   const token = req.headers.authorization?.replace('Bearer ', '')
  
//   const user = token ? await getUser(token) : null
  
//   return {
//     user,
//     req,
//   }
// }

// export type Context = typeof createTRPCContext

// const t = initTRPC.context<Context>().create()

// export const router = t.router
// export const publicProcedure = t.procedure

// export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
//   if (!ctx.user) {
//     throw new TRPCError({ code: 'UNAUTHORIZED' })
//   }
//   return next({
//     ctx: {
//       user: ctx.user,
//     },
//   })
// })





// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { getUser } from './auth'

export const createTRPCContext = async (opts: CreateExpressContextOptions) => {
  const { req } = opts
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  const user = token ? await getUser(token) : null
  
  return {
    user,
    req,
  }
}

export type Context = typeof createTRPCContext

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})
