import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import useAuthStore from '../../store/authStore'
import useTheme from '../../hooks/useTheme'
import { getCardStyle, getInputStyle, getLabelStyle } from '../../utils/styles'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setAuth, token } = useAuthStore()
  const { theme } = useTheme()
  const card = getCardStyle(theme)
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)

  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || ''
  })
  const [passForm, setPassForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.put('/users/profile', form)
      setAuth(token, { ...user, ...res.data })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      })
      toast.success('Password changed successfully!')
      setPassForm({
        currentPassword: '', newPassword: '', confirmPassword: ''
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{
          color: theme.textPrimary,
          fontSize: '24px', fontWeight: '700', margin: '0 0 24px'
        }}>
          Profile & Settings
        </h1>

        {/* Avatar Card */}
        <div style={{
          ...card,
          display: 'flex', alignItems: 'center',
          gap: '20px', marginBottom: '20px'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '28px',
            fontWeight: '800', color: 'white', flexShrink: 0
          }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{
              color: theme.textPrimary,
              fontSize: '18px', fontWeight: '700', margin: '0 0 4px'
            }}>
              {user?.fullName}
            </p>
            <p style={{
              color: theme.textSecondary,
              fontSize: '13px', margin: '0 0 8px'
            }}>
              {user?.email}
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: theme.greenBg,
              border: `1px solid ${theme.greenBorder}`,
              borderRadius: '20px', padding: '3px 10px'
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: theme.greenLight, display: 'inline-block'
              }} />
              <span style={{
                color: theme.greenLight,
                fontSize: '11px', fontWeight: '600'
              }}>
                Verified Account
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '20px'
        }}>
          {['profile', 'security'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab
                  ? 'linear-gradient(135deg, #c44b8a, #e8632a)'
                  : theme.bgCard,
                border: `1px solid ${activeTab === tab
                  ? 'transparent' : theme.border}`,
                borderRadius: '10px', padding: '9px 20px',
                fontSize: '13px', fontWeight: '600',
                color: activeTab === tab ? 'white' : theme.textSecondary,
                cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'profile' ? '👤 Profile' : '🔒 Security'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ ...card }}>
            <h2 style={{
              color: theme.textPrimary,
              fontSize: '16px', fontWeight: '700', margin: '0 0 20px'
            }}>
              Edit Profile
            </h2>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '14px' }}>
                <label style={label}>Full Name</label>
                <input
                  type="text" required
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  style={input}
                  onFocus={e => e.target.style.borderColor = '#c44b8a'}
                  onBlur={e => e.target.style.borderColor = theme.inputBorder}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={label}>
                  Email (cannot be changed)
                </label>
                <input
                  type="email" disabled value={user?.email}
                  style={{
                    ...input,
                    opacity: 0.5, cursor: 'not-allowed'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={label}>Mobile Number</label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  style={input}
                  onFocus={e => e.target.style.borderColor = '#c44b8a'}
                  onBlur={e => e.target.style.borderColor = theme.inputBorder}
                />
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%',
                  background: loading
                    ? theme.border
                    : 'linear-gradient(135deg, #c44b8a, #e8632a)',
                  border: 'none', borderRadius: '12px',
                  padding: '13px', fontSize: '14px',
                  fontWeight: '700', color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={{ ...card }}>
            <h2 style={{
              color: theme.textPrimary,
              fontSize: '16px', fontWeight: '700', margin: '0 0 20px'
            }}>
              Change Password
            </h2>
            <form onSubmit={handleChangePassword}>
              {[
                { label: 'Current Password', key: 'currentPassword' },
                { label: 'New Password', key: 'newPassword' },
                { label: 'Confirm New Password', key: 'confirmPassword' },
              ].map(({ label: lbl, key }) => (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <label style={label}>{lbl}</label>
                  <input
                    type="password" required
                    value={passForm[key]}
                    onChange={e => setPassForm({
                      ...passForm, [key]: e.target.value
                    })}
                    style={input}
                    onFocus={e => e.target.style.borderColor = '#c44b8a'}
                    onBlur={e => e.target.style.borderColor = theme.inputBorder}
                  />
                </div>
              ))}

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', marginTop: '6px',
                  background: loading
                    ? theme.border
                    : 'linear-gradient(135deg, #c44b8a, #e8632a)',
                  border: 'none', borderRadius: '12px',
                  padding: '13px', fontSize: '14px',
                  fontWeight: '700', color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* App Info */}
        <div style={{
          ...card, marginTop: '20px', textAlign: 'center'
        }}>
          <p style={{
            color: theme.textSecondary,
            fontSize: '12px', margin: '0 0 4px'
          }}>
            ₹ Meri Gullak
          </p>
          <p style={{ color: theme.textMuted, fontSize: '11px', margin: 0 }}>
            Smart Savings & Expense Tracker v1.0
          </p>
        </div>
      </div>
    </Layout>
  )
}
