import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import logo from '../../assets/Applogo.png'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const { token, email, fullName, role, emailVerified } = res.data
      setAuth(token, { email, fullName, role, emailVerified })
      toast.success(`Welcome back, ${fullName}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
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
            Create your account
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#1c1828', border: '0.5px solid #2a2535', borderRadius: '20px', padding: '28px 24px' }}>
          <h2 style={{ color: '#f0eeff', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
            Sign in
          </h2>

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Email address', name: 'email', type: 'email', placeholder: 'rahul@gmail.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Your password' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
                  {label}
                </label>
                <input
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%', background: '#13111a',
                    border: '0.5px solid #2a2535', borderRadius: '10px',
                    padding: '11px 14px', fontSize: '13px',
                    color: '#c9c4e8', outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#c44b8a'}
                  onBlur={e => e.target.style.borderColor = '#2a2535'}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', marginTop: '8px',
                background: loading ? '#2a2535' : 'linear-gradient(135deg, #c44b8a, #e8632a)',
                border: 'none', borderRadius: '12px',
                padding: '13px', fontSize: '14px',
                fontWeight: '700', color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in to Gullak →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#6b6580' }}>
            New to Meri Gullak?{' '}
            <Link to="/register" style={{ color: '#c44b8a', textDecoration: 'none', fontWeight: '600' }}>
              Create account
            </Link>
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {['🔐 JWT secured', '🛡️ Session protected'].map(t => (
            <span key={t} style={{
              background: '#1c1828', border: '0.5px solid #2a2535',
              borderRadius: '20px', padding: '4px 10px',
              fontSize: '10px', color: '#7a7390'
            }}>{t}</span>
          ))}
        </div>

      </div>
    </div>
  )
}