// server/routers/index.ts
import { router } from '../trpc'
import { authRouter } from './auth'
import { customersRouter } from './customers'
import { productsRouter } from './products'
import { billingRouter } from './billing'
import { ordersRouter } from './orders'
import { purchasesRouter } from './purchases'
import { expensesRouter } from './expenses'
import { productionRouter } from './production'
import { accountsRouter } from './accounts'
// import { reportsRouter } from './reports'
// import { settingsRouter } from './settings'

export const appRouter = router({
  auth: authRouter,
  customers: customersRouter,
  products: productsRouter,
  billing: billingRouter,
  orders: ordersRouter,
  purchases: purchasesRouter,
  expenses: expensesRouter,
  production: productionRouter,
  accounts: accountsRouter,
  // reports: reportsRouter,
  // settings: settingsRouter,
})

export type AppRouter = typeof appRouter