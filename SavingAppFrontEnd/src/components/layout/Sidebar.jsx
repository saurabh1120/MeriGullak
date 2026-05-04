import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'
import { getTheme } from '../../theme'
import logo from '../../assets/Applogo.png'
import toast from 'react-hot-toast'

const navGroups = [
  {
    id: 'dashboard',
    icon: '⊞',
    label: 'Dashboard',
    single: true,
    path: '/dashboard'
  },
  {
    id: 'money',
    icon: '💰',
    label: 'Money',
    single: false,
    items: [
      { path: '/accounts', icon: '🏦', label: 'Accounts' },
      { path: '/expenses', icon: '💸', label: 'Expenses' },
      { path: '/transfers', icon: '🔄', label: 'Transfers' },
    ]
  },
  {
    id: 'goals',
    icon: '🎯',
    label: 'Goals',
    single: false,
    items: [
      { path: '/gullak', icon: '🐷', label: 'My Gullak' },
      { path: '/budget', icon: '📊', label: 'Budget' },
    ]
  },
  {
    id: 'split',
    icon: '👥',
    label: 'Split',
    single: true,
    path: '/split'
  },
  {
    id: 'analytics',
    icon: '📈',
    label: 'Analytics',
    single: true,
    path: '/analytics'
  },
  {
    id: 'profile',
    icon: '👤',
    label: 'Profile',
    single: true,
    path: '/profile'
  },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const theme = getTheme(isDark)
  const navigate = useNavigate()
  const location = useLocation()
  const [activeGroup, setActiveGroup] = useState(null)

  // Auto expand group based on current path
  useEffect(() => {
    const group = navGroups.find(g =>
      !g.single && g.items?.some(item =>
        location.pathname.startsWith(item.path))
    )
    if (group) setActiveGroup(group.id)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/login')
  }

  const isGroupActive = (group) => {
    if (group.single) return location.pathname === group.path
    return group.items?.some(item =>
      location.pathname.startsWith(item.path))
  }

  const handleGroupClick = (group) => {
    if (group.single) {
      navigate(group.path)
      setActiveGroup(null)
      return
    }
    setActiveGroup(activeGroup === group.id ? null : group.id)
    if (group.items?.length > 0 && activeGroup !== group.id) {
      navigate(group.items[0].path)
    }
  }

  return (
    <div style={{
      width: '220px', minHeight: '100vh',
      background: theme.bgNav,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0,
      zIndex: 100, transition: 'all 0.3s',
      boxShadow: theme.shadowNav
    }}>
      {/* Logo */}
      {/* <div style={{
        padding: '16px',
        borderBottom: `1px solid ${theme.border}`,
        flexShrink: 0,
        background: isDark
          ? 'linear-gradient(135deg, rgba(196,75,138,0.1), rgba(232,99,42,0.05))'
          : 'linear-gradient(135deg, rgba(196,75,138,0.06), rgba(232,99,42,0.03))'
      }}>
        <img
          src={logo}
          alt="Meri Gullak"
          style={{
            width: '100%',
            maxWidth: '160px',
            height: '60px',
            objectFit: 'contain',
            objectPosition: 'left center',
            display: 'block'
          }}
        />
      </div> */}
      {/* Logo */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${theme.border}`,
        flexShrink: 0,
        background: isDark
          ? 'linear-gradient(135deg, rgba(196,75,138,0.1), rgba(232,99,42,0.05))'
          : 'linear-gradient(135deg, rgba(196,75,138,0.06), rgba(232,99,42,0.03))',
        // --- CHANGES START HERE (To center the logo) ---
        display: 'flex',          // Enables Flexbox alignment
        justifyContent: 'center',  // Aligns items horizontally in the center
        alignItems: 'center'     // Optional: Aligns items vertically in the center
        // -----------------------------------------------
      }}>
        <img
          src={logo}
          alt="Meri Gullak"
          style={{
            // --- CHANGES START HERE (To increase size) ---
            width: '100%',        // Use full width of parent
            maxWidth: '280px',    // Increased Max Width (from 160px)
            height: '120px',      // Increased Height (from 60px)
            // -----------------------------------------------
            objectFit: 'contain',
            display: 'block'
            // Note: Removed objectPosition: 'left center' as it's now handled by the parent flexbox
          }}
        />
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: '10px 8px',
        overflowY: 'auto', overflowX: 'hidden'
      }}>
        {navGroups.map(group => {
          const groupActive = isGroupActive(group)
          const isExpanded = activeGroup === group.id

          return (
            <div key={group.id} style={{ marginBottom: '2px' }}>
              {/* Main nav item */}
              <button
                onClick={() => handleGroupClick(group)}
                style={{
                  width: '100%', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                  gap: '10px', padding: '10px 12px',
                  borderRadius: '10px', border: 'none',
                  background: groupActive
                    ? theme.bgSelected
                    : 'transparent',
                  borderLeft: groupActive
                    ? `3px solid ${theme.accent}`
                    : '3px solid transparent',
                  color: groupActive
                    ? theme.accent
                    : theme.textSecondary,
                  fontSize: '13px',
                  fontWeight: groupActive ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseOver={e => {
                  if (!groupActive) {
                    e.currentTarget.style.background = theme.bgHover
                    e.currentTarget.style.color = theme.textPrimary
                  }
                }}
                onMouseOut={e => {
                  if (!groupActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = theme.textSecondary
                  }
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <span style={{ fontSize: '16px' }}>{group.icon}</span>
                  <span>{group.label}</span>
                </div>
                {!group.single && (
                  <span style={{
                    fontSize: '10px', transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: theme.textMuted
                  }}>
                    ▾
                  </span>
                )}
              </button>

              {/* Sub items — animate open/close */}
              {!group.single && isExpanded && (
                <div style={{
                  marginLeft: '12px',
                  marginTop: '2px',
                  borderLeft: `2px solid ${theme.border}`,
                  paddingLeft: '8px',
                  animation: 'slideDown 0.2s ease'
                }}>
                  {group.items.map(item => {
                    const itemActive = location.pathname === item.path
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                          width: '100%', display: 'flex',
                          alignItems: 'center', gap: '8px',
                          padding: '9px 10px', borderRadius: '8px',
                          border: 'none', marginBottom: '2px',
                          background: itemActive
                            ? theme.bgAccent : 'transparent',
                          color: itemActive
                            ? theme.accent : theme.textSecondary,
                          fontSize: '13px',
                          fontWeight: itemActive ? '600' : '400',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textAlign: 'left'
                        }}
                        onMouseOver={e => {
                          if (!itemActive) {
                            e.currentTarget.style.background = theme.bgHover
                            e.currentTarget.style.color = theme.textPrimary
                          }
                        }}
                        onMouseOut={e => {
                          if (!itemActive) {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = theme.textSecondary
                          }
                        }}
                      >
                        <span style={{ fontSize: '14px' }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{
        padding: '10px 8px',
        borderTop: `1px solid ${theme.border}`,
        flexShrink: 0
      }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '100%', display: 'flex',
            alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            border: `1px solid ${theme.border}`,
            background: theme.bgCard, color: theme.textSecondary,
            fontSize: '13px', cursor: 'pointer',
            marginBottom: '8px', transition: 'all 0.2s'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = theme.bgHover
            e.currentTarget.style.color = theme.textPrimary
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = theme.bgCard
            e.currentTarget.style.color = theme.textSecondary
          }}
        >
          <span>{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          {/* Toggle pill */}
          <div style={{
            marginLeft: 'auto',
            width: '32px', height: '18px',
            background: isDark ? theme.accent : theme.border,
            borderRadius: '9px', position: 'relative',
            transition: 'background 0.3s', flexShrink: 0
          }}>
            <div style={{
              width: '12px', height: '12px',
              background: 'white', borderRadius: '50%',
              position: 'absolute', top: '3px',
              left: isDark ? '17px' : '3px',
              transition: 'left 0.3s'
            }} />
          </div>
        </button>

        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '8px', padding: '8px 10px',
          background: theme.bgCard,
          borderRadius: '10px', marginBottom: '8px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '12px',
            fontWeight: '700', color: 'white', flexShrink: 0
          }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              color: theme.textPrimary, fontSize: '12px',
              fontWeight: '600', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.fullName}
            </p>
            <p style={{
              color: theme.textSecondary, fontSize: '10px',
              margin: 0, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', background: 'transparent',
            border: `1px solid ${theme.border}`,
            borderRadius: '10px', padding: '8px 12px',
            fontSize: '12px', color: '#dc2626',
            cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center',
            gap: '8px', justifyContent: 'center'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#fef2f2'
            e.currentTarget.style.borderColor = '#dc2626'
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = theme.border
          }}
        >
          🚪 Sign out
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}