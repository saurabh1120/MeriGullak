import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'
import logo from '../../assets/Applogo.png'


const navItems = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/accounts', icon: '🏦', label: 'Accounts' },
  { path: '/expenses', icon: '💸', label: 'Expenses' },
  { path: '/gullak', icon: '🐷', label: 'My Gullak' },
  { path: '/budget', icon: '📊', label: 'Budget' },
  { path: '/transfers', icon: '🔄', label: 'Transfers' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/login')
  }

  return (
    <div style={{
      width: '240px', minHeight: '100vh',
      background: '#100e1a',
      border: '0.5px solid #2a2535',
      display: 'flex', flexDirection: 'column',
      padding: '20px 0', position: 'fixed',
      left: 0, top: 0, bottom: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '0.5px solid #2a2535' }}>
        <img src={logo} alt="Meri Gullak"
          style={{ width: '120px', objectFit: 'contain' }} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(({ path, icon, label }) => (
          <NavLink
            key={path} to={path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 14px', borderRadius: '12px',
              marginBottom: '4px', textDecoration: 'none',
              fontSize: '14px', fontWeight: isActive ? '600' : '400',
              color: isActive ? '#f0eeff' : '#7a7390',
              background: isActive
                ? 'linear-gradient(135deg, rgba(196,75,138,0.2), rgba(232,99,42,0.2))'
                : 'transparent',
              borderLeft: isActive ? '3px solid #c44b8a' : '3px solid transparent',
              transition: 'all 0.2s'
            })}
          >
            <span style={{ fontSize: '16px' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div style={{
        padding: '16px', borderTop: '0.5px solid #2a2535',
        margin: '0 12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '14px',
            fontWeight: '700', color: 'white'
          }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0eeff' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: '11px', color: '#7a7390' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', background: '#1c1828',
            border: '0.5px solid #2a2535', borderRadius: '10px',
            padding: '9px', fontSize: '13px',
            color: '#7a7390', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => { e.target.style.background = '#2a2535'; e.target.style.color = '#f0eeff' }}
          onMouseOut={e => { e.target.style.background = '#1c1828'; e.target.style.color = '#7a7390' }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}