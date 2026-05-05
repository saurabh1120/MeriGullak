import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { splitApi } from '../../api/splitApi'
import useTheme from '../../hooks/useTheme'
import useIsMobile from '../../hooks/useIsMobile'
import { getCardStyle, getInputStyle, getLabelStyle } from '../../utils/styles'
import toast from 'react-hot-toast'

export default function Friends() {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const card = getCardStyle(theme)
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)

  const [activeTab, setActiveTab] = useState('friends')
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [friendEmail, setFriendEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [friendRes, pendingRes] = await Promise.all([
        splitApi.getMyFriends(),
        splitApi.getPendingRequests()
      ])
      setFriends(friendRes.data)
      setPendingRequests(pendingRes.data)
    } catch {
      toast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await splitApi.sendFriendRequest(friendEmail)
      toast.success('Friend request sent! 📧')
      setIsModalOpen(false)
      setFriendEmail('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRespond = async (id, accept) => {
    try {
      await splitApi.respondToRequest(id, accept)
      toast.success(accept
        ? 'Friend request accepted! 🎉'
        : 'Request rejected')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to respond')
    }
  }

  const filteredFriends = friends.filter(f =>
    f.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tabs = [
    { id: 'friends', label: '🤝 My Friends', count: friends.length },
    {
      id: 'requests', label: '🔔 Requests',
      count: pendingRequests.length
    },
  ]

  return (
    <Layout>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <h1 style={{
            color: theme.textPrimary,
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700', margin: 0
          }}>
            Friends 🤝
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '13px', margin: '4px 0 0'
          }}>
            Manage your friends for split expenses
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
            border: 'none', borderRadius: '12px',
            padding: '11px 20px', fontSize: '14px',
            fontWeight: '600', color: 'white', cursor: 'pointer'
          }}
        >
          + Add Friend
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '20px',
        borderBottom: `1px solid ${theme.border}`
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent', border: 'none',
              borderBottom: activeTab === tab.id
                ? '2px solid #c44b8a' : '2px solid transparent',
              padding: '10px 16px', fontSize: '13px',
              fontWeight: '600',
              color: activeTab === tab.id
                ? '#c44b8a' : theme.textSecondary,
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id
                  ? '#c44b8a' : theme.bgHover,
                color: activeTab === tab.id
                  ? 'white' : theme.textSecondary,
                borderRadius: '20px', padding: '1px 7px',
                fontSize: '11px', fontWeight: '700'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── FRIENDS TAB ── */}
      {activeTab === 'friends' && (
        <>
          {/* Search */}
          {friends.length > 0 && (
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <span style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)', fontSize: '15px',
                color: theme.textSecondary, pointerEvents: 'none'
              }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  ...input,
                  paddingLeft: '38px'
                }}
                onFocus={e => e.target.style.borderColor = '#c44b8a'}
                onBlur={e =>
                  e.target.style.borderColor = theme.inputBorder}
              />
            </div>
          )}

          {loading ? (
            <div style={{
              textAlign: 'center',
              color: theme.textSecondary, padding: '60px'
            }}>
              Loading friends...
            </div>
          ) : friends.length === 0 ? (
            <div style={{
              ...card, textAlign: 'center', padding: '60px'
            }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>
                🤝
              </div>
              <p style={{
                color: theme.textPrimary, fontSize: '16px',
                fontWeight: '700', margin: '0 0 8px'
              }}>
                No friends yet!
              </p>
              <p style={{
                color: theme.textSecondary, fontSize: '13px',
                margin: '0 0 24px', lineHeight: '1.5'
              }}>
                Add friends with their email to start splitting
                expenses together
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
                  border: 'none', borderRadius: '12px',
                  padding: '11px 24px', fontSize: '14px',
                  fontWeight: '600', color: 'white', cursor: 'pointer'
                }}
              >
                + Add Your First Friend
              </button>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div style={{
              ...card, textAlign: 'center', padding: '40px'
            }}>
              <p style={{
                color: theme.textSecondary, fontSize: '14px', margin: 0
              }}>
                No friends found for "{searchQuery}"
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              {filteredFriends.map((friend, i) => (
                <div key={friend.id} style={{
                  ...card, padding: '16px',
                  display: 'flex', alignItems: 'center',
                  gap: '14px', transition: 'all 0.2s'
                }}
                  onMouseOver={e =>
                    e.currentTarget.style.borderColor = '#c44b8a40'}
                  onMouseOut={e =>
                    e.currentTarget.style.borderColor = theme.border}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: `linear-gradient(135deg, 
                      hsl(${(i * 47) % 360}, 65%, 55%), 
                      hsl(${(i * 47 + 40) % 360}, 65%, 45%))`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '20px',
                    fontWeight: '700', color: 'white', flexShrink: 0
                  }}>
                    {friend.fullName?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: theme.textPrimary, fontSize: '14px',
                      fontWeight: '600', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {friend.fullName}
                    </p>
                    <p style={{
                      color: theme.textSecondary, fontSize: '12px',
                      margin: '2px 0 0', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {friend.email}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div style={{
                    background: theme.greenBg,
                    border: `1px solid ${theme.greenBorder}`,
                    borderRadius: '20px', padding: '5px 12px',
                    fontSize: '11px', color: theme.greenLight,
                    fontWeight: '600', flexShrink: 0,
                    whiteSpace: 'nowrap'
                  }}>
                    ✅ Friends
                  </div>
                </div>
              ))}

              {/* Count */}
              <p style={{
                color: theme.textMuted, fontSize: '12px',
                textAlign: 'center', margin: '8px 0 0'
              }}>
                {filteredFriends.length} friend
                {filteredFriends.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </>
      )}

      {/* ── REQUESTS TAB ── */}
      {activeTab === 'requests' && (
        <>
          {pendingRequests.length === 0 ? (
            <div style={{
              ...card, textAlign: 'center', padding: '60px'
            }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>
                🔔
              </div>
              <p style={{
                color: theme.textPrimary, fontSize: '16px',
                fontWeight: '700', margin: '0 0 8px'
              }}>
                No pending requests
              </p>
              <p style={{
                color: theme.textSecondary,
                fontSize: '13px', margin: 0
              }}>
                When someone sends you a friend request,
                it will appear here
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              <p style={{
                color: theme.textSecondary,
                fontSize: '13px', margin: '0 0 4px'
              }}>
                {pendingRequests.length} pending request
                {pendingRequests.length !== 1 ? 's' : ''}
              </p>
              {pendingRequests.map((req, i) => (
                <div key={req.id} style={{
                  ...card, padding: '18px',
                  display: 'flex', alignItems: 'center',
                  gap: '14px', flexWrap: 'wrap'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: `linear-gradient(135deg,
                      hsl(${(i * 53 + 200) % 360}, 65%, 55%),
                      hsl(${(i * 53 + 240) % 360}, 65%, 45%))`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '20px',
                    fontWeight: '700', color: 'white', flexShrink: 0
                  }}>
                    {req.fullName?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <p style={{
                      color: theme.textPrimary, fontSize: '14px',
                      fontWeight: '600', margin: 0
                    }}>
                      {req.fullName}
                    </p>
                    <p style={{
                      color: theme.textSecondary,
                      fontSize: '12px', margin: '2px 0 0'
                    }}>
                      {req.email}
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      marginTop: '4px'
                    }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: theme.yellowLight,
                        display: 'inline-block'
                      }} />
                      <p style={{
                        color: theme.yellowLight, fontSize: '11px',
                        margin: 0, fontWeight: '500'
                      }}>
                        Wants to be your friend
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{
                    display: 'flex', gap: '8px', flexShrink: 0
                  }}>
                    <button
                      onClick={() => handleRespond(req.id, true)}
                      style={{
                        background: theme.greenBg,
                        border: `1px solid ${theme.greenBorder}`,
                        borderRadius: '10px',
                        padding: isMobile ? '8px 12px' : '9px 18px',
                        fontSize: '13px', fontWeight: '700',
                        color: theme.greenLight, cursor: 'pointer',
                        transition: 'all 0.2s', whiteSpace: 'nowrap'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = '#3ecf8e'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = theme.greenBg
                        e.currentTarget.style.color = theme.greenLight
                      }}
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, false)}
                      style={{
                        background: theme.redBg,
                        border: `1px solid ${theme.redBorder}`,
                        borderRadius: '10px',
                        padding: isMobile ? '8px 12px' : '9px 18px',
                        fontSize: '13px', fontWeight: '700',
                        color: theme.redLight, cursor: 'pointer',
                        transition: 'all 0.2s', whiteSpace: 'nowrap'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = '#ef4444'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = theme.redBg
                        e.currentTarget.style.color = theme.redLight
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Friend Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Friend 🤝"
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            background: theme.bgInput,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px', padding: '14px 16px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: theme.textSecondary, fontSize: '13px',
              margin: 0, lineHeight: '1.5'
            }}>
              💡 Your friend must have a Meri Gullak account.
              Enter their registered email to send a friend request.
            </p>
          </div>
        </div>

        <form onSubmit={handleSendRequest}>
          <div style={{ marginBottom: '20px' }}>
            <label style={label}>Friend's Email Address</label>
            <input
              type="email" required
              placeholder="friend@gmail.com"
              value={friendEmail}
              onChange={e => setFriendEmail(e.target.value)}
              style={input}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e =>
                e.target.style.borderColor = theme.inputBorder}
            />
          </div>

          <button
            type="submit" disabled={submitting}
            style={{
              width: '100%',
              background: submitting
                ? theme.border
                : 'linear-gradient(135deg, #c44b8a, #e8632a)',
              border: 'none', borderRadius: '12px',
              padding: '13px', fontSize: '14px',
              fontWeight: '700', color: 'white',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {submitting ? 'Sending...' : 'Send Friend Request 📧'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}
