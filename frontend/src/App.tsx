import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthRoute } from './components/AuthRoute'

import { HomePage } from './pages/home'
import { LoginPage } from './pages/login'
import { RegisterPage } from './pages/register'
import { ForgotPasswordPage } from './pages/forgot-password'
import { OnboardingPage } from './pages/onboarding'
import { WithdrawPage } from './pages/withdraw'

import { DashboardLayout } from './pages/(dashboard)/layout'
import { DashboardPage } from './pages/(dashboard)/dashboard'
import { TransactionsPage } from './pages/(dashboard)/transactions'
import { WithdrawalsPage } from './pages/(dashboard)/withdrawals'
import { SettingsPage } from './pages/(dashboard)/settings'
import { HelpPage } from './pages/(dashboard)/help'
import { NewTransactionPage } from './pages/(dashboard)/new-transaction'

import { AdminLayout } from './pages/admin/layout'
import { AdminDashboard } from './pages/admin/index'
import { AdminTenantsPage } from './pages/admin/tenants/index'
import { AdminTransactionsPage } from './pages/admin/transactions/index'
import { AdminWithdrawalsPage } from './pages/admin/withdrawals/index'
import { AdminTermsPage } from './pages/admin/terms/index'
import { AdminLogsPage } from './pages/admin/logs/index'
import { TenantDetailsPage } from './pages/admin/tenants/[id]/index'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/withdraw" element={<WithdrawPage />} />

              <Route element={<AuthRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/withdrawals" element={<WithdrawalsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/new-transaction" element={<NewTransactionPage />} />
                </Route>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/tenants" element={<AdminTenantsPage />} />
                  <Route path="/admin/tenants/:id" element={<TenantDetailsPage />} />
                  <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
                  <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
                  <Route path="/admin/terms" element={<AdminTermsPage />} />
                  <Route path="/admin/logs" element={<AdminLogsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}
