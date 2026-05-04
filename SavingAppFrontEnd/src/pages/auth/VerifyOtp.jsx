import { useState, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import logo from '../../assets/Applogo.png'
import { authApi } from '../../api/authApi'

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d{6}$/.test(pasted)) setOtp(pasted.split(''))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) { toast.error('Enter complete OTP'); return }
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, otp: otpString })
      toast.success('Email verified! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }
  const handleResend = async () => {
    if (!email) return
    try {
      await authApi.resendOtp(email)
      toast.success('OTP resent! Check your inbox 📧')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#13111a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',

        }}>
          <img
            src={logo}
            alt="Meri Gullak"
            style={{
              width: '300px',
              height: '300px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '13px', color: '#7a7390' }}>
            Almost there!
          </div>
        </div>

        <div style={{ background: '#1c1828', border: '0.5px solid #2a2535', borderRadius: '20px', padding: '28px 24px' }}>
          <h2 style={{ color: '#f0eeff', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
            Verify your email
          </h2>
          <p style={{ fontSize: '12px', color: '#6b6580', marginBottom: '20px' }}>
            OTP sent to <span style={{ color: '#c9c4e8' }}>{email}</span>
          </p>

          <form onSubmit={handleSubmit}>
            {/* OTP Boxes */}
            <div
              style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
              onPaste={handlePaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  style={{
                    width: '48px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: '800',
                    background: '#13111a',
                    border: digit
                      ? '1.5px solid #c44b8a'
                      : '0.5px solid #2a2535',
                    borderRadius: '12px',
                    color: '#f0c0e0',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    flexShrink: 0
                  }}
                  onFocus={e => e.target.style.borderColor = '#c44b8a'}
                  onBlur={e => e.target.style.borderColor = digit
                    ? '#c44b8a' : '#2a2535'}
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
                  : '#2a2535',
                border: 'none', borderRadius: '12px',
                padding: '13px', fontSize: '14px',
                fontWeight: '700', color: '#fff',
                cursor: otp.join('').length === 6 ? 'pointer' : 'not-allowed',
                transition: 'background 0.3s'
              }}
            >
              {loading ? 'Verifying...' : 'Verify OTP →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#6b6580' }}>
            Didn't receive?{' '}
            <button
              onClick={handleResend}
              style={{
                background: 'none', border: 'none',
                color: '#c44b8a', fontWeight: '600',
                cursor: 'pointer', fontSize: '12px'
              }}
            >
              Resend OTP
            </button>
          </p>
          <p style={{ textAlign: 'center', marginTop: '6px', fontSize: '11px', color: '#4a4560' }}>
            Valid for 5 minutes only
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#4a4560' }}>
          <Link to="/login" style={{ color: '#6b6580', textDecoration: 'none' }}>← Back to sign in</Link>
        </p>
      </div>
    </div>


  )

}