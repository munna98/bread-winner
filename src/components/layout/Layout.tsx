import { ReactNode, useState } from 'react'
import { cn } from '../../lib/utils'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Page content */}
        <main className={cn(
          "flex-1 overflow-auto bg-muted/20 p-6",
          "transition-all duration-300 ease-in-out"
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout