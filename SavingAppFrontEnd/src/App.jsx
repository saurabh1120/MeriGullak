import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './components/common/ProtectedRoute'
import useThemeStore from './store/themeStore'

const Register = lazy(() => import('./pages/auth/Register'))
const Login = lazy(() => import('./pages/auth/Login'))
const VerifyOtp = lazy(() => import('./pages/auth/VerifyOtp'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const Accounts = lazy(() => import('./pages/accounts/Accounts'))
const Expenses = lazy(() => import('./pages/expenses/Expenses'))
const Gullak = lazy(() => import('./pages/gullak/Gullak'))
const Budget = lazy(() => import('./pages/budget/Budget'))
const Transfer = lazy(() => import('./pages/transfer/Transfer'))
const Analytics = lazy(() => import('./pages/analytics/Analytics'))
const Profile = lazy(() => import('./pages/profile/Profile'))
const Split = lazy(() => import('./pages/split/Split'))
const GroupDetail = lazy(() => import('./pages/split/GroupDetail'))
const Friends = lazy(() => import('./pages/split/Friends'))

function App() {
  const { isDark } = useThemeStore()

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? '#1c1828' : '#ffffff',
            color: isDark ? '#f0eeff' : '#1a1628',
            border: `0.5px solid ${isDark ? '#2a2535' : '#e2e0ec'}`,
          },
        }}
      />
      <Suspense fallback={
        <div style={{
          minHeight: '100vh',
          background: isDark ? '#13111a' : '#f0f2f5',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🪙</div>
            <p style={{ color: '#7a7390' }}>Loading...</p>
          </div>
        </div>
      }>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute><Accounts /></ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute><Expenses /></ProtectedRoute>
          } />
          <Route path="/gullak" element={
            <ProtectedRoute><Gullak /></ProtectedRoute>
          } />
          <Route path="/budget" element={
            <ProtectedRoute><Budget /></ProtectedRoute>
          } />
          <Route path="/transfers" element={
            <ProtectedRoute><Transfer /></ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute><Analytics /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          {/* Split routes */}
          <Route path="/split" element={
            <ProtectedRoute><Split /></ProtectedRoute>
          } />
          <Route path="/split/groups/:id" element={
            <ProtectedRoute><GroupDetail /></ProtectedRoute>
          } />
          <Route path="/split/friends" element={
            <ProtectedRoute><Friends /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={
            <Navigate to="/dashboard" replace />
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App