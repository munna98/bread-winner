import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { hasRole, type User } from '../../lib/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: User['role']
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Required role: <span className="font-medium">{requiredRole}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Your role: <span className="font-medium">{user.role}</span>
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute