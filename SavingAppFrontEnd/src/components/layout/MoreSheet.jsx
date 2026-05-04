import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'
import { getTheme } from '../../theme'
import toast from 'react-hot-toast'

export default function MoreSheet({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const theme = getTheme(isDark)

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/login')
    onClose()
  }

  const goTo = (path) => {
    navigate(path)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1001,
          animation: 'fadeIn 0.2s ease'
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: theme.bgCard,
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px 40px',
        zIndex: 1002,
        animation: 'slideUp 0.3s ease',
        border: `0.5px solid ${theme.border}`
      }}>
        {/* Handle */}
        <div style={{
          width: '40px', height: '4px',
          background: theme.border, borderRadius: '2px',
          margin: '0 auto 20px'
        }} />

        {/* User info */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '12px', padding: '12px',
          background: theme.bg, borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px',
            fontWeight: '700', color: 'white', flexShrink: 0
          }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{
              color: theme.textPrimary, fontSize: '14px',
              fontWeight: '700', margin: 0
            }}>
              {user?.fullName}
            </p>
            <p style={{
              color: theme.textSecondary, fontSize: '12px', margin: 0
            }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Menu items */}
        {[
          { icon: '📈', label: 'Analytics', path: '/analytics' },
          { icon: '👤', label: 'Profile & Settings', path: '/profile' },
        ].map(item => (
          <button
            key={item.path}
            onClick={() => goTo(item.path)}
            style={{
              width: '100%', display: 'flex',
              alignItems: 'center', gap: '14px',
              padding: '14px 12px', background: 'transparent',
              border: 'none', borderRadius: '12px',
              color: theme.textPrimary, fontSize: '14px',
              fontWeight: '500', cursor: 'pointer',
              textAlign: 'left', transition: 'background 0.2s'
            }}
            onMouseOver={e =>
              e.currentTarget.style.background = theme.bg}
            onMouseOut={e =>
              e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* Divider */}
        <div style={{
          height: '0.5px', background: theme.border, margin: '8px 0'
        }} />

        {/* Theme Toggle */}
        <button
          onClick={() => { toggleTheme(); onClose() }}
          style={{
            width: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 12px', background: 'transparent',
            border: 'none', borderRadius: '12px',
            color: theme.textPrimary, fontSize: '14px',
            fontWeight: '500', cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '20px' }}>
              {isDark ? '☀️' : '🌙'}
            </span>
            {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </div>
          {/* Toggle switch */}
          <div style={{
            width: '44px', height: '24px',
            background: isDark ? '#c44b8a' : theme.border,
            borderRadius: '12px', position: 'relative',
            transition: 'background 0.3s'
          }}>
            <div style={{
              width: '18px', height: '18px',
              background: 'white', borderRadius: '50%',
              position: 'absolute', top: '3px',
              left: isDark ? '23px' : '3px',
              transition: 'left 0.3s'
            }} />
          </div>
        </button>

        {/* Divider */}
        <div style={{
          height: '0.5px', background: theme.border, margin: '8px 0'
        }} />

        {/* Sign out */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex',
            alignItems: 'center', gap: '14px',
            padding: '14px 12px', background: 'transparent',
            border: 'none', borderRadius: '12px',
            color: '#ef4444', fontSize: '14px',
            fontWeight: '500', cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '20px' }}>🚪</span>
          Sign Out
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}