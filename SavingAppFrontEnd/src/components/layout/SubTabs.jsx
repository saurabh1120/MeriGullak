import { useNavigate, useLocation } from 'react-router-dom'
import useThemeStore from '../../store/themeStore'
import { getTheme } from '../../theme'

const tabGroups = {
  money: [
    { path: '/accounts', label: '🏦 Accounts' },
    { path: '/expenses', label: '💸 Expenses' },
    { path: '/transfers', label: '🔄 Transfers' },
  ],
  goals: [
    { path: '/gullak', label: ' My Gullak' },
    { path: '/budget', label: '📊 Budget' },
  ],
}

const getGroup = (pathname) => {
  if (['/accounts', '/expenses', '/transfers']
    .some(p => pathname.startsWith(p))) return 'money'
  if (['/gullak', '/budget']
    .some(p => pathname.startsWith(p))) return 'goals'
  return null
}

export default function SubTabs() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useThemeStore()
  const theme = getTheme(isDark)

  const group = getGroup(location.pathname)
  if (!group) return null

  const tabs = tabGroups[group]

  return (
    <div style={{
      display: 'flex', gap: '8px',
      padding: '12px 16px',
      background: theme.navBg,
      borderBottom: `0.5px solid ${theme.border}`,
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none'
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: active
                ? 'linear-gradient(135deg, #c44b8a, #e8632a)'
                : theme.bgCard,
              border: `0.5px solid ${active ? 'transparent' : theme.border}`,
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '13px', fontWeight: '600',
              color: active ? 'white' : theme.textSecondary,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}