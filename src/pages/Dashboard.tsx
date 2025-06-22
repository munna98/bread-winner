import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  ShoppingCart,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { useAuth } from '@/context/AuthContext'
import { trpc } from '../lib/trpc'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  description?: string
}

const StatCard = ({ title, value, change, icon: Icon, trend = 'neutral', description }: StatCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {change !== undefined && TrendIcon && (
            <>
              <TrendIcon className={`h-3 w-3 ${getTrendColor()}`} />
              <span className={getTrendColor()}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span>from last month</span>
            </>
          )}
          {description && !change && <span>{description}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = trpc.reports.dashboard.useQuery({
    timeRange
  })

  const { data: recentOrders } = trpc.orders.getRecent.useQuery({ limit: 5 })
  const { data: lowStockProducts } = trpc.products.getLowStock.useQuery({ limit: 5 })

  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's what's happening with your business.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{currentTime}</span>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {(['today', 'week', 'month'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
            className="capitalize"
          >
            {range === 'today' ? 'Today' : `This ${range}`}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`₹${dashboardData?.totalSales?.toLocaleString() || '0'}`}
          change={dashboardData?.salesChange}
          icon={DollarSign}
          trend={dashboardData?.salesChange && dashboardData.salesChange > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Orders"
          value={dashboardData?.totalOrders || 0}
          change={dashboardData?.ordersChange}
          icon={ShoppingCart}
          trend={dashboardData?.ordersChange && dashboardData.ordersChange > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Customers"
          value={dashboardData?.totalCustomers || 0}
          icon={Users}
          description="Active customers"
        />
        <StatCard
          title="Products"
          value={dashboardData?.totalProducts || 0}
          icon={Package}
          description="In inventory"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Your sales performance over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              {/* Placeholder for chart - you can integrate recharts here */}
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Sales chart will be displayed here</p>
                <p className="text-sm">Integrate with recharts for visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div>
                      <p className="text-sm font-medium">Order #{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.name || 'Walk-in Customer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{order.total.toLocaleString()}</p>
                    <Badge 
                      variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {order.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent orders
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-600">Low Stock Alert</CardTitle>
            </div>
            <CardDescription>
              These products are running low and need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      {product.currentStock} left
                    </p>
                    <Progress 
                      value={(product.currentStock / product.minStock) * 100} 
                      className="w-20 h-1 mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you might want to perform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Order
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
            <Button variant="outline" className="justify-start">
              <Package className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button variant="outline" className="justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard