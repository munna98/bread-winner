// Auth token management
const AUTH_TOKEN_KEY = 'auth-token'
const USER_DATA_KEY = 'user-data'

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'CASHIER' | 'MANAGER' | 'ACCOUNTANT'
}

// Token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(USER_DATA_KEY)
}

// User data management
export const getUserData = (): User | null => {
  if (typeof window === 'undefined') return null
  const userData = localStorage.getItem(USER_DATA_KEY)
  return userData ? JSON.parse(userData) : null
}

export const setUserData = (user: User): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
}

// Auth state checks
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

export const hasRole = (requiredRole: User['role']): boolean => {
  const user = getUserData()
  if (!user) return false
  
  // Role hierarchy: ADMIN > MANAGER > ACCOUNTANT > CASHIER
  const roleHierarchy = {
    ADMIN: 4,
    MANAGER: 3,
    ACCOUNTANT: 2,
    CASHIER: 1,
  }
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

// Permission checks
export const canAccessBilling = (): boolean => {
  return hasRole('CASHIER')
}

export const canAccessReports = (): boolean => {
  return hasRole('ACCOUNTANT')
}

export const canAccessSettings = (): boolean => {
  return hasRole('MANAGER')
}

export const canAccessAccounts = (): boolean => {
  return hasRole('ACCOUNTANT')
}

export const canAccessUsers = (): boolean => {
  return hasRole('ADMIN')
}

// Logout utility
export const logout = (): void => {
  removeAuthToken()
  // Redirect to login page
  window.location.href = '/login'
}