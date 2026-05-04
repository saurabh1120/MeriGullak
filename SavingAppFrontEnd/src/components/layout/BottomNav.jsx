import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import useThemeStore from '../../store/themeStore'
import { getTheme } from '../../theme'
import MoreSheet from './MoreSheet'

const bottomTabs = [
  { id: 'home', icon: '⊞', label: 'Home', path: '/dashboard' },
  { id: 'money', icon: '💰', label: 'Money', path: null },
  { id: 'goals', icon: '🎯', label: 'Goals', path: null },
  { id: 'split', icon: '👥', label: 'Split', path: '/split' },
  { id: 'more', icon: '•••', label: 'More', path: null },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useThemeStore()
  const theme = getTheme(isDark)
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const isMoneyActive = [
    '/accounts', '/expenses', '/transfers'
  ].some(p => location.pathname.startsWith(p))

  const isGoalsActive = [
    '/gullak', '/budget'
  ].some(p => location.pathname.startsWith(p))

  const isActive = (tab) => {
    if (tab.path) return location.pathname === tab.path
    if (tab.id === 'money') return isMoneyActive
    if (tab.id === 'goals') return isGoalsActive
    return false
  }

  const handleTab = (tab) => {
    if (tab.path) {
      navigate(tab.path)
      return
    }
    if (tab.id === 'money') {
      navigate('/accounts')
      return
    }
    if (tab.id === 'goals') {
      navigate('/gullak')
      return
    }
    if (tab.id === 'more') {
      setIsMoreOpen(true)
      return
    }
  }

  return (
    <>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: theme.navBg,
        borderTop: `0.5px solid ${theme.border}`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 0 16px', zIndex: 1000,
        transition: 'background 0.3s'
      }}>
        {bottomTabs.map(tab => {
          const active = isActive(tab)
          return (
            <button
              key={tab.id}
              onClick={() => handleTab(tab)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '3px',
                background: 'transparent', border: 'none',
                padding: '6px 16px', borderRadius: '12px',
                cursor: 'pointer',
                background: active
                  ? isDark
                    ? 'rgba(196,75,138,0.12)'
                    : 'rgba(196,75,138,0.08)'
                  : 'transparent'
              }}
            >
              <span style={{
                fontSize: '20px',
                filter: active ? 'none' : 'grayscale(0.3)'
              }}>
                {tab.icon}
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: active ? '700' : '400',
                color: active ? '#c44b8a' : theme.textSecondary
              }}>
                {tab.label}
              </span>
              {active && (
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  width: '4px', height: '4px',
                  borderRadius: '50%',
                  background: '#c44b8a'
                }} />
              )}
            </button>
          )
        })}
      </nav>

      <MoreSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
      />
    </>
  )
}