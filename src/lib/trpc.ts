import { createTRPCReact } from '@trpc/react-query'
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client'
import { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '../../server/routers'
import { getAuthToken } from './auth'

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>()

// Server URL
const getBaseUrl = () => {
  // In Electron, use localhost
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return 'http://localhost:3001'
  }
  // In development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001'
  }
  // In production, use environment variable or default
  return process.env.VITE_SERVER_URL || 'http://localhost:3001'
}

// Create tRPC client
export const trpcClient = trpc.createClient({
  links: [
    // Logger link for development
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    // HTTP batch link
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers: () => {
        const token = getAuthToken()
        return {
          ...(token && { Authorization: `Bearer ${token}` }),
          'Content-Type': 'application/json',
        }
      },
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          credentials: 'include',
        })
      },
      // Batch requests within 10ms
      maxBatchSize: 10,
      // Disable batching for mutations (optional)
      // batchMutations: false,
    }),
  ],
  transformer: undefined, // You can add superjson here if needed
})

// Create Query Client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.data?.httpStatus === 401 || error?.data?.httpStatus === 403) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        console.error('Mutation error:', error)
        // Handle auth errors globally
        if (error?.data?.httpStatus === 401) {
          // Clear auth token and redirect to login
          localStorage.removeItem('auth-token')
          window.location.href = '/login'
        }
      },
    },
  },
})

// Vanilla tRPC client (for use outside React components)
export const vanillaTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers: () => {
        const token = getAuthToken()
        return {
          ...(token && { Authorization: `Bearer ${token}` }),
          'Content-Type': 'application/json',
        }
      },
    }),
  ],
})

// Utility functions for common operations
export const trpcUtils = {
  // Invalidate all queries
  invalidateAll: () => queryClient.invalidateQueries(),
  
  // Invalidate specific query
  invalidate: (queryKey: string[]) => queryClient.invalidateQueries({ queryKey }),
  
  // Clear all cache
  clearCache: () => queryClient.clear(),
  
  // Get cached data
  getCachedData: <T>(queryKey: string[]): T | undefined => {
    return queryClient.getQueryData(queryKey)
  },
  
  // Set cached data
  setCachedData: <T>(queryKey: string[], data: T) => {
    queryClient.setQueryData(queryKey, data)
  },
  
  // Prefetch query
  prefetch: async (queryKey: string[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
    })
  },
}

// Error handling utilities
export const handleTRPCError = (error: any) => {
  if (error?.data?.httpStatus === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem('auth-token')
    window.location.href = '/login'
    return 'Please log in again'
  }
  
  if (error?.data?.httpStatus === 403) {
    return 'You do not have permission to perform this action'
  }
  
  if (error?.data?.httpStatus === 404) {
    return 'Resource not found'
  }
  
  if (error?.data?.httpStatus >= 500) {
    return 'Server error. Please try again later'
  }
  
  // Return the error message from the server or a default message
  return error?.message || error?.data?.message || 'An unexpected error occurred'
}

// Helper hooks for common patterns
export const useTRPCErrorHandler = () => {
  return (error: any) => {
    const message = handleTRPCError(error)
    // You can integrate with your toast/notification system here
    console.error('tRPC Error:', message, error)
    return message
  }
}

// Connection status utilities
export const checkServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${getBaseUrl()}/health`)
    return response.ok
  } catch {
    return false
  }
}

// Type exports for convenience
export type RouterInputs = Parameters<AppRouter['_def']['procedures'][keyof AppRouter['_def']['procedures']]>[0]
export type RouterOutputs = ReturnType<AppRouter['_def']['procedures'][keyof AppRouter['_def']['procedures']]>