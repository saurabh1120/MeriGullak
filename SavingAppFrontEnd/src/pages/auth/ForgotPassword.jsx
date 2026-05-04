import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useTheme from '../../hooks/useTheme'
import { getInputStyle, getLabelStyle } from '../../utils/styles'
import toast from 'react-hot-toast'
import logo from '../../assets/Applogo.png'

// Step indicators
const STEPS = [
  { id: 1, label: 'Enter Email' },
  { id: 2, label: 'Verify OTP' },
  { id: 3, label: 'New Password' },
]

export default function ForgotPassword() {
  const { theme } = useTheme()
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const inputRefs = useRef([])

  // Step 1 — Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('OTP sent to your email! 📧')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email not found')
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/verify-reset-otp', {
        email, otp: otpString
      })
      toast.success('OTP verified! Set your new password.')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 3 — Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        email,
        otp: otp.join(''),
        newPassword
      })
      toast.success('Password reset successfully! Please login. 🎉')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d{6}$/.test(pasted)) setOtp(pasted.split(''))
  }

  const handleResendOtp = async () => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('OTP resent! Check your inbox 📧')
    } catch (err) {
      toast.error('Failed to resend OTP')
    } finally {
      setLoading(false)
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
          marginBottom: '24px'
        }}>
          <img
            src={logo} alt="Meri Gullak"
            style={{
              width: '120px', height: '120px',
              objectFit: 'contain', display: 'block'
            }}
          />
        </div>

        {/* Step Indicator */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '24px', gap: '0'
        }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center'
            }}>
              {/* Step circle */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '4px'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: step > s.id
                    ? theme.greenLight
                    : step === s.id
                      ? '#c44b8a'
                      : theme.bgCard,
                  border: `2px solid ${step >= s.id
                    ? step > s.id ? theme.greenLight : '#c44b8a'
                    : theme.border}`,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px', fontWeight: '700',
                  color: step >= s.id ? 'white' : theme.textMuted,
                  transition: 'all 0.3s'
                }}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: '500',
                  color: step === s.id
                    ? '#c44b8a' : theme.textMuted,
                  whiteSpace: 'nowrap'
                }}>
                  {s.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div style={{
                  width: '60px', height: '2px', marginBottom: '16px',
                  background: step > s.id
                    ? theme.greenLight : theme.border,
                  transition: 'background 0.3s'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px', padding: '28px 24px',
          boxShadow: theme.shadowCard
        }}>

          {/* ── STEP 1 — Email ── */}
          {step === 1 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔐</div>
                <h2 style={{
                  color: theme.textPrimary,
                  fontSize: '18px', fontWeight: '700', margin: '0 0 6px'
                }}>
                  Forgot Password?
                </h2>
                <p style={{
                  color: theme.textSecondary, fontSize: '13px', margin: 0
                }}>
                  Enter your email and we'll send you an OTP to reset your password
                </p>
              </div>

              <form onSubmit={handleSendOtp}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={label}>Email Address</label>
                  <input
                    type="email" required
                    placeholder="rahul@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP 📧'}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2 — OTP ── */}
          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📧</div>
                <h2 style={{
                  color: theme.textPrimary,
                  fontSize: '18px', fontWeight: '700', margin: '0 0 6px'
                }}>
                  Enter OTP
                </h2>
                <p style={{
                  color: theme.textSecondary, fontSize: '13px', margin: 0
                }}>
                  OTP sent to{' '}
                  <span style={{
                    color: theme.textPrimary, fontWeight: '600'
                  }}>
                    {email}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp}>
                {/* OTP Boxes */}
                <div style={{
                  display: 'flex', gap: '10px',
                  marginBottom: '20px', justifyContent: 'center'
                }}
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{
                        width: '48px', height: '52px',
                        textAlign: 'center',
                        fontSize: '20px', fontWeight: '800',
                        background: theme.bgInput,
                        border: `2px solid ${digit
                          ? '#c44b8a' : theme.border}`,
                        borderRadius: '12px',
                        color: '#c44b8a',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = '#c44b8a'}
                      onBlur={e => e.target.style.borderColor = digit
                        ? '#c44b8a' : theme.border}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  style={{
                    width: '100%',
                    background: otp.join('').length === 6
                      ? 'linear-gradient(135deg, #c44b8a, #e8632a)'
                      : theme.border,
                    border: 'none', borderRadius: '12px',
                    padding: '13px', fontSize: '14px',
                    fontWeight: '700', color: 'white',
                    cursor: otp.join('').length === 6
                      ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify OTP →'}
                </button>
              </form>

              <div style={{
                textAlign: 'center', marginTop: '16px'
              }}>
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '12px', margin: '0 0 6px'
                }}>
                  Didn't receive OTP?
                </p>
                <button
                  onClick={handleResendOtp} disabled={loading}
                  style={{
                    background: 'none', border: 'none',
                    color: '#c44b8a', fontWeight: '600',
                    fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Resend OTP
                </button>
              </div>

              <p style={{
                textAlign: 'center', marginTop: '6px',
                color: theme.textMuted, fontSize: '11px'
              }}>
                Valid for 5 minutes only
              </p>
            </>
          )}

          {/* ── STEP 3 — New Password ── */}
          {step === 3 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔑</div>
                <h2 style={{
                  color: theme.textPrimary,
                  fontSize: '18px', fontWeight: '700', margin: '0 0 6px'
                }}>
                  Set New Password
                </h2>
                <p style={{
                  color: theme.textSecondary, fontSize: '13px', margin: 0
                }}>
                  Choose a strong password for your account
                </p>
              </div>

              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={label}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
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

                <div style={{ marginBottom: '16px' }}>
                  <label style={label}>Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{
                      ...input,
                      borderColor: confirmPassword && confirmPassword !== newPassword
                        ? '#ef4444' : theme.inputBorder
                    }}
                    onFocus={e => e.target.style.borderColor = '#c44b8a'}
                    onBlur={e => e.target.style.borderColor =
                      confirmPassword && confirmPassword !== newPassword
                        ? '#ef4444' : theme.inputBorder}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p style={{
                      color: '#ef4444', fontSize: '11px', margin: '4px 0 0'
                    }}>
                      ⚠️ Passwords do not match
                    </p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p style={{
                      color: theme.greenLight,
                      fontSize: '11px', margin: '4px 0 0'
                    }}>
                      ✅ Passwords match
                    </p>
                  )}
                </div>

                {/* Password strength indicator */}
                {newPassword && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      display: 'flex', gap: '4px', marginBottom: '4px'
                    }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          background: newPassword.length >= i * 2
                            ? i <= 1 ? '#ef4444'
                              : i <= 2 ? '#f59e0b'
                                : i <= 3 ? '#3ecf8e' : '#16a34a'
                            : theme.border,
                          transition: 'background 0.3s'
                        }} />
                      ))}
                    </div>
                    <p style={{
                      color: theme.textMuted,
                      fontSize: '11px', margin: 0
                    }}>
                      {newPassword.length < 4 ? '🔴 Weak'
                        : newPassword.length < 6 ? '🟡 Fair'
                          : newPassword.length < 8 ? '🟢 Good'
                            : '💪 Strong'}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    newPassword !== confirmPassword ||
                    newPassword.length < 6
                  }
                  style={{
                    width: '100%',
                    background: (loading ||
                      newPassword !== confirmPassword ||
                      newPassword.length < 6)
                      ? theme.border
                      : 'linear-gradient(135deg, #c44b8a, #e8632a)',
                    border: 'none', borderRadius: '12px',
                    padding: '13px', fontSize: '14px',
                    fontWeight: '700', color: 'white',
                    cursor: (loading ||
                      newPassword !== confirmPassword ||
                      newPassword.length < 6)
                      ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? 'Resetting...' : 'Reset Password 🔑'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
        <p style={{
          textAlign: 'center', marginTop: '20px',
          fontSize: '13px', color: theme.textSecondary
        }}>
          Remember your password?{' '}
          <Link to="/login" style={{
            color: '#c44b8a', textDecoration: 'none', fontWeight: '600'
          }}>
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  )
}
