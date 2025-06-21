import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { trpc } from '../lib/trpc'
import { getAuthToken, setAuthToken, removeAuthToken, getUserData, setUserData, type User } from '../lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(getUserData())
  const [isLoading, setIsLoading] = useState(true)
  
  const loginMutation = trpc.auth.login.useMutation()
  const { data: currentUser, refetch: refetchUser } = trpc.auth.me.useQuery(
    undefined,
    {
      enabled: !!getAuthToken(),
      retry: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data) {
          setUser(data)
          setUserData(data)
        }
      },
      onError: () => {
        // Token is invalid, clear auth data
        removeAuthToken()
        setUser(null)
      },
    }
  )

  useEffect(() => {
    const token = getAuthToken()
    const userData = getUserData()
    
    if (token && userData) {
      setUser(userData)
      // Verify token is still valid
      refetchUser()
    } else {
      setUser(null)
    }
    
    setIsLoading(false)
  }, [refetchUser])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const result = await loginMutation.mutateAsync({ email, password })
      
      // Store token and user data
      setAuthToken(result.token)
      setUserData(result.user)
      setUser(result.user)
      
      // Refetch user data to ensure sync
      await refetchUser()
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    removeAuthToken()
    setUser(null)
    // Redirect to login page
    window.location.href = '/login'
  }

  const refreshUser = async () => {
    try {
      await refetchUser()
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // If refresh fails, logout user
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}