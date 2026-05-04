import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useTheme from '../../hooks/useTheme'
import { getInputStyle, getLabelStyle } from '../../utils/styles'
import logo from '../../assets/Applogo.png'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const { theme } = useTheme()
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)

  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [notVerified, setNotVerified] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setNotVerified(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login(form)
      const { token, email, fullName, role, emailVerified } = res.data
      setAuth(token, { email, fullName, role, emailVerified })
      toast.success(`Welcome back, ${fullName}! 🪙`)
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed'
      if (errorMsg.toLowerCase().includes('not verified')) {
        setNotVerified(true)
        toast.error('Email not verified!')
      } else {
        toast.error(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!form.email) {
      toast.error('Please enter your email first')
      return
    }
    setResending(true)
    try {
      await authApi.resendOtp(form.email)
      toast.success('OTP sent! Check your inbox 📧')
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px',
      transition: 'background 0.3s'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: '28px'
        }}>
          <img
            src={logo} alt="Meri Gullak"
            style={{
              width: '150px', height: '150px',
              objectFit: 'contain', display: 'block'
            }}
          />
        </div>

        {/* Card */}
        <div style={{
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px', padding: '28px 24px',
          boxShadow: theme.shadowCard
        }}>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '18px', fontWeight: '700', marginBottom: '20px'
          }}>
            Sign in
          </h2>

          {/* Not verified alert */}
          {notVerified && (
            <div style={{
              background: theme.yellowBg,
              border: `1px solid ${theme.yellowBorder}`,
              borderRadius: '12px', padding: '14px 16px',
              marginBottom: '16px'
            }}>
              <p style={{
                color: theme.yellowLight, fontSize: '13px',
                margin: '0 0 10px', fontWeight: '600'
              }}>
                ⚠️ Email not verified!
              </p>
              <p style={{
                color: theme.textSecondary,
                fontSize: '12px', margin: '0 0 12px'
              }}>
                Your email is not verified yet.
                Click below to resend OTP and verify.
              </p>
              <button
                onClick={handleResendOtp} disabled={resending}
                style={{
                  width: '100%',
                  background: resending
                    ? theme.border
                    : 'linear-gradient(135deg, #f59e0b, #e8632a)',
                  border: 'none', borderRadius: '10px',
                  padding: '10px', fontSize: '13px',
                  fontWeight: '700', color: 'white',
                  cursor: resending ? 'not-allowed' : 'pointer'
                }}
              >
                {resending ? 'Sending OTP...' : '📧 Resend Verification OTP'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '14px' }}>
              <label style={label}>Email address</label>
              <input
                name="email" type="email"
                placeholder="rahul@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
                style={input}
                onFocus={e => e.target.style.borderColor = '#c44b8a'}
                onBlur={e => e.target.style.borderColor = theme.inputBorder}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '8px' }}>
              <label style={label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ ...input, paddingRight: '44px' }}
                  onFocus={e => e.target.style.borderColor = '#c44b8a'}
                  onBlur={e => e.target.style.borderColor = theme.inputBorder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '16px',
                    color: theme.textSecondary
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div style={{
              textAlign: 'right', marginBottom: '16px'
            }}>
              <Link
                to="/forgot-password"
                style={{
                  color: '#c44b8a', fontSize: '12px',
                  textDecoration: 'none', fontWeight: '500'
                }}
              >
                Forgot password?
              </Link>
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
                fontWeight: '700', color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in to Gullak →'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: '16px',
            fontSize: '12px', color: theme.textSecondary
          }}>
            New to Meri Gullak?{' '}
            <Link to="/register" style={{
              color: '#c44b8a', textDecoration: 'none', fontWeight: '600'
            }}>
              Create account
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: '8px', marginTop: '16px', flexWrap: 'wrap'
        }}>
          {['🔐 JWT secured', '🛡️ Session protected'].map(t => (
            <span key={t} style={{
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px', padding: '4px 10px',
              fontSize: '10px', color: theme.textSecondary
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
