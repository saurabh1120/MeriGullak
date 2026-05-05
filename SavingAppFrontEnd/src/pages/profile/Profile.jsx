import { useState, useRef, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import useAuthStore from '../../store/authStore'
import useTheme from '../../hooks/useTheme'
import useIsMobile from '../../hooks/useIsMobile'
import { getCardStyle, getInputStyle, getLabelStyle } from '../../utils/styles'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const GENDERS = [
  { value: 'MALE', label: '👨 Male' },
  { value: 'FEMALE', label: '👩 Female' },
  { value: 'OTHER', label: '🧑 Other' },
  { value: 'PREFER_NOT_TO_SAY', label: '🤐 Prefer not to say' },
]

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada',
  'Australia', 'Germany', 'France', 'UAE', 'Singapore', 'Other'
]

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const card = getCardStyle(theme)
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)
  const photoRef = useRef(null)

  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState(null)

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    gender: '',
    address: '',
    city: '',
    country: '',
  })

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPass, setShowPass] = useState({
    current: false, new: false, confirm: false
  })

  // ✅ Fetch fresh profile from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me')
        const data = res.data

        // Update store
        updateUser(data)

        // Update form with fresh data
        setForm({
          fullName: data.fullName || '',
          mobile: data.mobile || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
        })
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        // Fallback to stored user data
        if (user) {
          setForm({
            fullName: user.fullName || '',
            mobile: user.mobile || '',
            gender: user.gender || '',
            address: user.address || '',
            city: user.city || '',
            country: user.country || '',
          })
        }
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [])

  // Profile photo upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB')
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewPhoto(ev.target.result)
    reader.readAsDataURL(file)

    setPhotoLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/users/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser({ profilePhoto: res.data.profilePhoto })
      toast.success('Profile photo updated! 📸')
    } catch (err) {
      toast.error('Failed to upload photo')
      setPreviewPhoto(null)
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.put('/users/profile', form)
      const data = res.data

      // ✅ Update store with ALL returned fields
      updateUser({
        fullName: data.fullName,
        mobile: data.mobile,
        gender: data.gender,
        address: data.address,
        city: data.city,
        country: data.country,
      })

      // ✅ Update form too
      setForm({
        fullName: data.fullName || '',
        mobile: data.mobile || '',
        gender: data.gender || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
      })

      toast.success('Profile updated successfully! ✅')
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
      toast.error('Min 6 characters required')
      return
    }
    setLoading(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      })
      toast.success('Password changed! 🔐')
      setPassForm({
        currentPassword: '', newPassword: '', confirmPassword: ''
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  // Get current user data (from store, updated by updateUser)
  const currentUser = useAuthStore(state => state.user)
  const photoUrl = previewPhoto || currentUser?.profilePhoto
  const hasPhoto = !!photoUrl
  const initial = currentUser?.fullName?.charAt(0).toUpperCase()

  if (fetching) return (
    <Layout>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', height: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👤</div>
          <p style={{ color: theme.textSecondary }}>
            Loading profile...
          </p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <h1 style={{
          color: theme.textPrimary,
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '700', margin: '0 0 24px'
        }}>
          Profile & Settings
        </h1>

        {/* ── Profile Header Card ── */}
        <div style={{ ...card, marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            gap: '24px'
          }}>
            {/* Avatar section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0
            }}>
              {/* Photo circle */}
              <div style={{
                width: isMobile ? '80px' : '96px',
                height: isMobile ? '80px' : '96px',
                borderRadius: '50%',
                background: hasPhoto
                  ? 'transparent'
                  : 'linear-gradient(135deg, #c44b8a, #e8632a)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '32px' : '38px',
                fontWeight: '800', color: 'white',
                overflow: 'hidden',
                border: `3px solid ${theme.border}`,
                position: 'relative',
                flexShrink: 0
              }}>
                {hasPhoto ? (
                  <img
                    src={photoUrl} alt="Profile"
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block'
                    }}
                  />
                ) : initial}

                {photoLoading && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', borderRadius: '50%'
                  }}>
                    <div style={{
                      width: '24px', height: '24px',
                      border: '3px solid white',
                      borderTop: '3px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                  </div>
                )}
              </div>

              {/* Change photo button - below avatar, not overlapping */}
              <button
                onClick={() => photoRef.current?.click()}
                style={{
                  background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
                  border: 'none', borderRadius: '20px',
                  padding: '6px 14px', fontSize: '12px',
                  fontWeight: '600', color: 'white',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                📷 Change Photo
              </button>

              <p style={{
                color: theme.textMuted, fontSize: '10px',
                margin: 0, textAlign: 'center'
              }}>
                Max 5MB • JPG/PNG
              </p>

              <input
                ref={photoRef} type="file"
                accept="image/*" style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </div>

            {/* User info */}
            <div style={{
              flex: 1, minWidth: 0,
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <h2 style={{
                color: theme.textPrimary,
                fontSize: isMobile ? '18px' : '22px',
                fontWeight: '800', margin: '0 0 6px',
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {currentUser?.fullName}
              </h2>

              <p style={{
                color: theme.textSecondary, fontSize: '13px',
                margin: '0 0 4px'
              }}>
                ✉️ {currentUser?.email}
              </p>

              {currentUser?.mobile && (
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '13px', margin: '0 0 4px'
                }}>
                  📱 {currentUser.mobile}
                </p>
              )}

              {currentUser?.gender && (
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '13px', margin: '0 0 4px'
                }}>
                  {currentUser.gender === 'MALE' ? '👨' :
                    currentUser.gender === 'FEMALE' ? '👩' : '🧑'}{' '}
                  {currentUser.gender.replace(/_/g, ' ')}
                </p>
              )}

              {(currentUser?.city || currentUser?.country) && (
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '13px', margin: '0 0 12px'
                }}>
                  📍 {[currentUser.city, currentUser.country]
                    .filter(Boolean).join(', ')}
                </p>
              )}

              {/* Verified badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                gap: '5px', background: theme.greenBg,
                border: `1px solid ${theme.greenBorder}`,
                borderRadius: '20px', padding: '4px 12px',
                marginTop: '4px'
              }}>
                <span style={{
                  width: '7px', height: '7px',
                  borderRadius: '50%',
                  background: theme.greenLight,
                  display: 'inline-block'
                }} />
                <span style={{
                  color: theme.greenLight,
                  fontSize: '12px', fontWeight: '600'
                }}>
                  Verified Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '20px'
        }}>
          {[
            { id: 'profile', label: '👤 Profile' },
            { id: 'security', label: '🔒 Security' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #c44b8a, #e8632a)'
                  : theme.bgCard,
                border: `1px solid ${activeTab === tab.id
                  ? 'transparent' : theme.border}`,
                borderRadius: '10px', padding: '9px 20px',
                fontSize: '13px', fontWeight: '600',
                color: activeTab === tab.id
                  ? 'white' : theme.textSecondary,
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div style={{ ...card }}>
            <h2 style={{
              color: theme.textPrimary, fontSize: '16px',
              fontWeight: '700', margin: '0 0 20px'
            }}>
              Personal Information
            </h2>

            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '14px' }}>
                <label style={label}>Full Name</label>
                <input
                  type="text" required
                  value={form.fullName}
                  onChange={e => setForm({
                    ...form, fullName: e.target.value
                  })}
                  style={input}
                  onFocus={e =>
                    e.target.style.borderColor = '#c44b8a'}
                  onBlur={e =>
                    e.target.style.borderColor = theme.inputBorder}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={label}>
                  Email Address{' '}
                  <span style={{
                    color: theme.textMuted, fontSize: '10px'
                  }}>
                    (cannot be changed)
                  </span>
                </label>
                <input
                  type="email" disabled
                  value={currentUser?.email || ''}
                  style={{
                    ...input, opacity: 0.5, cursor: 'not-allowed'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={label}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={form.mobile}
                  onChange={e => setForm({
                    ...form, mobile: e.target.value
                  })}
                  style={input}
                  onFocus={e =>
                    e.target.style.borderColor = '#c44b8a'}
                  onBlur={e =>
                    e.target.style.borderColor = theme.inputBorder}
                />
              </div>

              {/* Gender */}
              <div style={{ marginBottom: '20px' }}>
                <label style={label}>Gender</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile
                    ? '1fr 1fr' : 'repeat(4, 1fr)',
                  gap: '8px'
                }}>
                  {GENDERS.map(g => (
                    <button
                      key={g.value} type="button"
                      onClick={() => setForm({
                        ...form, gender: g.value
                      })}
                      style={{
                        background: form.gender === g.value
                          ? 'rgba(196,75,138,0.15)' : theme.bgInput,
                        border: form.gender === g.value
                          ? '1px solid #c44b8a'
                          : `1px solid ${theme.border}`,
                        borderRadius: '10px', padding: '10px 6px',
                        color: form.gender === g.value
                          ? '#c44b8a' : theme.textSecondary,
                        fontSize: '12px', fontWeight: '500',
                        cursor: 'pointer', transition: 'all 0.15s',
                        textAlign: 'center', lineHeight: '1.3'
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                height: '1px', background: theme.border,
                margin: '4px 0 20px'
              }} />

              <h3 style={{
                color: theme.textPrimary, fontSize: '14px',
                fontWeight: '700', margin: '0 0 14px'
              }}>
                📍 Location
              </h3>

              <div style={{ marginBottom: '14px' }}>
                <label style={label}>Address</label>
                <input
                  type="text"
                  placeholder="e.g. 123 Main Street"
                  value={form.address}
                  onChange={e => setForm({
                    ...form, address: e.target.value
                  })}
                  style={input}
                  onFocus={e =>
                    e.target.style.borderColor = '#c44b8a'}
                  onBlur={e =>
                    e.target.style.borderColor = theme.inputBorder}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px', marginBottom: '24px'
              }}>
                <div>
                  <label style={label}>City</label>
                  <input
                    type="text"
                    placeholder="e.g. Raipur"
                    value={form.city}
                    onChange={e => setForm({
                      ...form, city: e.target.value
                    })}
                    style={input}
                    onFocus={e =>
                      e.target.style.borderColor = '#c44b8a'}
                    onBlur={e =>
                      e.target.style.borderColor = theme.inputBorder}
                  />
                </div>
                <div>
                  <label style={label}>Country</label>
                  <select
                    value={form.country}
                    onChange={e => setForm({
                      ...form, country: e.target.value
                    })}
                    style={input}
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
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
                {loading ? 'Saving...' : 'Save Changes ✅'}
              </button>
            </form>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === 'security' && (
          <div style={{ ...card }}>
            <h2 style={{
              color: theme.textPrimary, fontSize: '16px',
              fontWeight: '700', margin: '0 0 8px'
            }}>
              Change Password 🔐
            </h2>
            <p style={{
              color: theme.textSecondary, fontSize: '13px',
              margin: '0 0 20px', lineHeight: '1.5'
            }}>
              Choose a strong password with at least 6 characters
            </p>

            <form onSubmit={handleChangePassword}>
              {[
                {
                  lbl: 'Current Password',
                  key: 'currentPassword',
                  show: showPass.current,
                  toggle: () => setShowPass(p => ({
                    ...p, current: !p.current
                  }))
                },
                {
                  lbl: 'New Password',
                  key: 'newPassword',
                  show: showPass.new,
                  toggle: () => setShowPass(p => ({
                    ...p, new: !p.new
                  }))
                },
                {
                  lbl: 'Confirm New Password',
                  key: 'confirmPassword',
                  show: showPass.confirm,
                  toggle: () => setShowPass(p => ({
                    ...p, confirm: !p.confirm
                  }))
                },
              ].map(({ lbl, key, show, toggle }) => (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <label style={label}>{lbl}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={show ? 'text' : 'password'}
                      required
                      value={passForm[key]}
                      onChange={e => setPassForm(p => ({
                        ...p, [key]: e.target.value
                      }))}
                      style={{ ...input, paddingRight: '44px' }}
                      onFocus={e =>
                        e.target.style.borderColor = '#c44b8a'}
                      onBlur={e =>
                        e.target.style.borderColor = theme.inputBorder}
                    />
                    <button
                      type="button" onClick={toggle}
                      style={{
                        position: 'absolute', right: '12px',
                        top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: '16px',
                        color: theme.textSecondary
                      }}
                    >
                      {show ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {key === 'confirmPassword'
                    && passForm.confirmPassword && (
                    <p style={{
                      fontSize: '11px', margin: '4px 0 0',
                      color: passForm.newPassword
                        === passForm.confirmPassword
                        ? theme.greenLight : '#ef4444'
                    }}>
                      {passForm.newPassword === passForm.confirmPassword
                        ? '✅ Passwords match'
                        : '⚠️ Passwords do not match'}
                    </p>
                  )}
                </div>
              ))}

              {passForm.newPassword && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex', gap: '4px', marginBottom: '4px'
                  }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: passForm.newPassword.length >= i * 2
                          ? i <= 1 ? '#ef4444'
                            : i <= 2 ? '#f59e0b'
                              : i <= 3 ? '#3ecf8e' : '#16a34a'
                          : theme.border,
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <p style={{
                    color: theme.textMuted, fontSize: '11px', margin: 0
                  }}>
                    {passForm.newPassword.length < 4 ? '🔴 Weak'
                      : passForm.newPassword.length < 6 ? '🟡 Fair'
                        : passForm.newPassword.length < 8 ? '🟢 Good'
                          : '💪 Strong'}
                  </p>
                </div>
              )}

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
                {loading ? 'Changing...' : 'Change Password 🔐'}
              </button>
            </form>
          </div>
        )}

        {/* App Info */}
        <div style={{
          ...card, marginTop: '16px', textAlign: 'center'
        }}>
          <p style={{
            color: theme.textSecondary, fontSize: '13px',
            margin: '0 0 4px', fontWeight: '600'
          }}>
            🪙 Meri Gullak
          </p>
          <p style={{
            color: theme.textMuted, fontSize: '11px', margin: 0
          }}>
            Smart Savings & Expense Tracker • v1.0
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  )
}
