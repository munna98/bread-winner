// shared/types.ts
export type UserRole = 'ADMIN' | 'CASHIER' | 'MANAGER' | 'ACCOUNTANT'

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
}
