import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { hasRole } from '../../lib/auth'
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Factory,
  Calculator,
  BarChart3,
  Settings,
  ChevronLeft,
  Wheat
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredRole?: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'CASHIER'
  badge?: string
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: Receipt,
    requiredRole: 'CASHIER',
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
    requiredRole: 'CASHIER',
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
    requiredRole: 'CASHIER',
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    requiredRole: 'CASHIER',
  },
  {
    title: 'Purchases',
    href: '/purchases',
    icon: ShoppingBag,
    requiredRole: 'ACCOUNTANT',
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: CreditCard,
    requiredRole: 'ACCOUNTANT',
  },
  {
    title: 'Production',
    href: '/production',
    icon: Factory,
    requiredRole: 'MANAGER',
  },
  {
    title: 'Accounts',
    href: '/accounts',
    icon: Calculator,
    requiredRole: 'ACCOUNTANT',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    requiredRole: 'ACCOUNTANT',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    requiredRole: 'MANAGER',
  },
]

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { user } = useAuth()

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.requiredRole || hasRole(item.requiredRole)
  )

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo and toggle */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wheat className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">Bread Billing</span>
              <span className="text-xs text-muted-foreground">v1.0.0</span>
            </div>
          </div>
          
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-accent lg:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )
                  }
                  onClick={() => {
                    // Close sidebar on mobile when clicking a nav item
                    if (window.innerWidth < 1024) {
                      onToggle()
                    }
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            © 2024 Bread Billing System
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar