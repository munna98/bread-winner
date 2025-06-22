import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { Toaster } from 'sonner'
import { trpc, trpcClient, queryClient } from './lib/trpc'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
// import BillingPage from './pages/billing/BillingPage'
// import BillHistory from './pages/billing/BillHistory'
// import CustomersPage from './pages/customers/CustomersPage'
// import ProductsPage from './pages/products/ProductsPage'
// import OrdersPage from './pages/orders/OrdersPage'
// import PurchasesPage from './pages/purchases/PurchasesPage'
// import ExpensesPage from './pages/expenses/ExpensesPage'
// import ProductionPage from './pages/production/ProductionPage'
// import AccountsPage from './pages/accounts/AccountsPage'
// import ReportsPage from './pages/reports/ReportsPage'
// import SettingsPage from './pages/settings/SettingsPage'

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout>
                        <Navigate to="/dashboard" replace />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
{/*                   
                  <Route path="/billing" element={
                    <ProtectedRoute requiredRole="CASHIER">
                      <Layout>
                        <BillingPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/billing/history" element={
                    <ProtectedRoute requiredRole="CASHIER">
                      <Layout>
                        <BillHistory />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/customers" element={
                    <ProtectedRoute requiredRole="CASHIER">
                      <Layout>
                        <CustomersPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/products" element={
                    <ProtectedRoute requiredRole="CASHIER">
                      <Layout>
                        <ProductsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/orders" element={
                    <ProtectedRoute requiredRole="CASHIER">
                      <Layout>
                        <OrdersPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/purchases" element={
                    <ProtectedRoute requiredRole="ACCOUNTANT">
                      <Layout>
                        <PurchasesPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/expenses" element={
                    <ProtectedRoute requiredRole="ACCOUNTANT">
                      <Layout>
                        <ExpensesPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/production" element={
                    <ProtectedRoute requiredRole="MANAGER">
                      <Layout>
                        <ProductionPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/accounts" element={
                    <ProtectedRoute requiredRole="ACCOUNTANT">
                      <Layout>
                        <AccountsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/reports" element={
                    <ProtectedRoute requiredRole="ACCOUNTANT">
                      <Layout>
                        <ReportsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute requiredRole="MANAGER">
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes> */
                
                {/* Toast notifications */}
                {/* <Toaster 
                  position="top-right" 
                  richColors 
                  closeButton
                  duration={4000}
                /> */}
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
        
        {/* React Query DevTools - only in development */}
        {/* {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )} */}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default App