import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { splitApi } from '../../api/splitApi'
import useTheme from '../../hooks/useTheme'
import useIsMobile from '../../hooks/useIsMobile'
import { getCardStyle, getInputStyle, getLabelStyle } from '../../utils/styles'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const GROUP_ICONS = ['🏠', '✈️', '🍕', '🎉', '💼', '🏖️', '🎮', '🚗', '👨‍👩‍👧', '🏋️']
const GROUP_COLORS = ['#c44b8a', '#e8632a', '#2d3a8c', '#0f6e56', '#7c3aed', '#e8a020']

const initialGroupForm = {
  name: '', icon: '🏠', color: '#c44b8a',
  description: '', memberIds: []
}

export default function Split() {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const card = getCardStyle(theme)
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)

  const [activeTab, setActiveTab] = useState('groups')
  const [groups, setGroups] = useState([])
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false)
  const [groupForm, setGroupForm] = useState(initialGroupForm)
  const [friendEmail, setFriendEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [groupRes, friendRes, pendingRes] = await Promise.all([
        splitApi.getMyGroups(),
        splitApi.getMyFriends(),
        splitApi.getPendingRequests()
      ])
      setGroups(groupRes.data)
      setFriends(friendRes.data)
      setPendingRequests(pendingRes.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await splitApi.createGroup(groupForm)
      setGroups([res.data, ...groups])
      toast.success('Group created! 🎉')
      setIsGroupModalOpen(false)
      setGroupForm(initialGroupForm)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create group')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendFriendRequest = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await splitApi.sendFriendRequest(friendEmail)
      toast.success('Friend request sent! 📧')
      setIsFriendModalOpen(false)
      setFriendEmail('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRespondToRequest = async (id, accept) => {
    try {
      await splitApi.respondToRequest(id, accept)
      toast.success(accept ? 'Friend request accepted! 🎉' : 'Request rejected')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to respond')
    }
  }

  const handleDeleteGroup = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this group?')) return
    try {
      await splitApi.deleteGroup(id)
      setGroups(groups.filter(g => g.id !== id))
      toast.success('Group deleted!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete')
    }
  }

  const tabs = [
    { id: 'groups', label: '👥 Groups', count: groups.length },
    { id: 'friends', label: '🤝 Friends', count: friends.length },
    { id: 'requests', label: '🔔 Requests', count: pendingRequests.length },
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
            Split Expense 👥
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '13px', margin: '4px 0 0'
          }}>
            Split bills with friends easily
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsFriendModalOpen(true)}
            style={{
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px', padding: '10px 16px',
              fontSize: '13px', fontWeight: '600',
              color: theme.textSecondary, cursor: 'pointer'
            }}
          >
            + Add Friend
          </button>
          <button
            onClick={() => setIsGroupModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
              border: 'none', borderRadius: '12px',
              padding: '10px 16px', fontSize: '13px',
              fontWeight: '600', color: 'white', cursor: 'pointer'
            }}
          >
            + New Group
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '20px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '0'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id
                ? '2px solid #c44b8a' : '2px solid transparent',
              padding: '10px 16px',
              fontSize: '13px', fontWeight: '600',
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

      {/* ── GROUPS TAB ── */}
      {activeTab === 'groups' && (
        <>
          {loading ? (
            <div style={{
              textAlign: 'center',
              color: theme.textSecondary, padding: '60px'
            }}>
              Loading groups...
            </div>
          ) : groups.length === 0 ? (
            <div style={{
              ...card, textAlign: 'center', padding: '60px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                👥
              </div>
              <p style={{
                color: theme.textPrimary, fontSize: '16px',
                fontWeight: '600', margin: '0 0 8px'
              }}>
                No groups yet!
              </p>
              <p style={{
                color: theme.textSecondary, fontSize: '13px', margin: 0
              }}>
                Create a group to start splitting expenses
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {groups.map(group => (
                <div
                  key={group.id}
                  onClick={() => navigate(`/split/groups/${group.id}`)}
                  style={{
                    ...card,
                    cursor: 'pointer',
                    borderTop: `3px solid ${group.color || '#c44b8a'}`,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = theme.shadowDropdown
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = theme.shadowCard
                  }}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '14px'
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                      <div style={{
                        width: '48px', height: '48px',
                        borderRadius: '14px',
                        background: `${group.color || '#c44b8a'}20`,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '24px'
                      }}>
                        {group.icon || '👥'}
                      </div>
                      <div>
                        <p style={{
                          color: theme.textPrimary, fontSize: '15px',
                          fontWeight: '700', margin: 0
                        }}>
                          {group.name}
                        </p>
                        {group.description && (
                          <p style={{
                            color: theme.textSecondary,
                            fontSize: '12px', margin: '2px 0 0'
                          }}>
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteGroup(group.id, e)}
                      style={{
                        background: 'transparent', border: 'none',
                        color: theme.textMuted, cursor: 'pointer',
                        fontSize: '16px', padding: '4px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'flex', gap: '12px', marginBottom: '14px'
                  }}>
                    <div style={{
                      flex: 1, background: theme.bgInput,
                      borderRadius: '10px', padding: '10px',
                      border: `1px solid ${theme.border}`
                    }}>
                      <p style={{
                        color: theme.textSecondary,
                        fontSize: '10px', margin: '0 0 2px'
                      }}>
                        Total Spent
                      </p>
                      <p style={{
                        color: theme.textPrimary, fontSize: '14px',
                        fontWeight: '700', margin: 0
                      }}>
                        ₹{parseFloat(group.totalAmount || 0)
                          .toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div style={{
                      flex: 1, background: theme.bgInput,
                      borderRadius: '10px', padding: '10px',
                      border: `1px solid ${theme.border}`
                    }}>
                      <p style={{
                        color: theme.textSecondary,
                        fontSize: '10px', margin: '0 0 2px'
                      }}>
                        Expenses
                      </p>
                      <p style={{
                        color: '#c44b8a', fontSize: '14px',
                        fontWeight: '700', margin: 0
                      }}>
                        {group.totalExpenses || 0}
                      </p>
                    </div>
                  </div>

                  {/* Members */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex' }}>
                      {group.members?.slice(0, 4).map((m, i) => (
                        <div key={m.userId} style={{
                          width: '28px', height: '28px',
                          borderRadius: '50%',
                          background: `hsl(${(i * 60) % 360}, 60%, 50%)`,
                          border: `2px solid ${theme.bgCard}`,
                          marginLeft: i > 0 ? '-8px' : '0',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '11px',
                          fontWeight: '700', color: 'white'
                        }}>
                          {m.fullName?.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {group.members?.length > 4 && (
                        <div style={{
                          width: '28px', height: '28px',
                          borderRadius: '50%', background: theme.bgHover,
                          border: `2px solid ${theme.bgCard}`,
                          marginLeft: '-8px',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '10px',
                          color: theme.textSecondary, fontWeight: '700'
                        }}>
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                    <p style={{
                      color: theme.textMuted, fontSize: '11px', margin: 0
                    }}>
                      {group.members?.length || 0} members
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── FRIENDS TAB ── */}
      {activeTab === 'friends' && (
        <>
          {friends.length === 0 ? (
            <div style={{
              ...card, textAlign: 'center', padding: '60px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                🤝
              </div>
              <p style={{
                color: theme.textPrimary, fontSize: '16px',
                fontWeight: '600', margin: '0 0 8px'
              }}>
                No friends yet!
              </p>
              <p style={{
                color: theme.textSecondary,
                fontSize: '13px', margin: '0 0 20px'
              }}>
                Add friends to split expenses with them
              </p>
              <button
                onClick={() => setIsFriendModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
                  border: 'none', borderRadius: '12px',
                  padding: '11px 24px', fontSize: '14px',
                  fontWeight: '600', color: 'white', cursor: 'pointer'
                }}
              >
                + Add Friend
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              {friends.map(friend => (
                <div key={friend.id} style={{
                  ...card, padding: '16px',
                  display: 'flex', alignItems: 'center', gap: '14px'
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '18px',
                    fontWeight: '700', color: 'white', flexShrink: 0
                  }}>
                    {friend.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      color: theme.textPrimary, fontSize: '14px',
                      fontWeight: '600', margin: 0
                    }}>
                      {friend.fullName}
                    </p>
                    <p style={{
                      color: theme.textSecondary,
                      fontSize: '12px', margin: '2px 0 0'
                    }}>
                      {friend.email}
                    </p>
                  </div>
                  <div style={{
                    background: theme.greenBg,
                    border: `1px solid ${theme.greenBorder}`,
                    borderRadius: '20px', padding: '4px 12px',
                    fontSize: '11px', color: theme.greenLight,
                    fontWeight: '600'
                  }}>
                    ✅ Friend
                  </div>
                </div>
              ))}
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                🔔
              </div>
              <p style={{
                color: theme.textSecondary, fontSize: '15px', margin: 0
              }}>
                No pending friend requests
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              {pendingRequests.map(req => (
                <div key={req.id} style={{
                  ...card, padding: '16px',
                  display: 'flex', alignItems: 'center',
                  gap: '14px', flexWrap: 'wrap'
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #c44b8a)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '18px',
                    fontWeight: '700', color: 'white', flexShrink: 0
                  }}>
                    {req.fullName?.charAt(0).toUpperCase()}
                  </div>
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
                    <p style={{
                      color: theme.textMuted,
                      fontSize: '11px', margin: '2px 0 0'
                    }}>
                      Wants to be your friend
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleRespondToRequest(req.id, true)}
                      style={{
                        background: theme.greenBg,
                        border: `1px solid ${theme.greenBorder}`,
                        borderRadius: '10px', padding: '8px 16px',
                        fontSize: '13px', fontWeight: '600',
                        color: theme.greenLight, cursor: 'pointer'
                      }}
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(req.id, false)}
                      style={{
                        background: theme.redBg,
                        border: `1px solid ${theme.redBorder}`,
                        borderRadius: '10px', padding: '8px 16px',
                        fontSize: '13px', fontWeight: '600',
                        color: theme.redLight, cursor: 'pointer'
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

      {/* Create Group Modal */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title="Create New Group 👥"
      >
        <form onSubmit={handleCreateGroup}>
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Group Name</label>
            <input
              type="text" required
              placeholder="e.g. Goa Trip, Flat Mates"
              value={groupForm.name}
              onChange={e => setGroupForm({
                ...groupForm, name: e.target.value
              })}
              style={input}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. Trip to Goa 2026"
              value={groupForm.description}
              onChange={e => setGroupForm({
                ...groupForm, description: e.target.value
              })}
              style={input}
            />
          </div>

          {/* Icon Picker */}
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Group Icon</label>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '8px'
            }}>
              {GROUP_ICONS.map(icon => (
                <button
                  key={icon} type="button"
                  onClick={() => setGroupForm({ ...groupForm, icon })}
                  style={{
                    width: '40px', height: '40px',
                    background: groupForm.icon === icon
                      ? `${groupForm.color}20` : theme.bgInput,
                    border: groupForm.icon === icon
                      ? `1px solid ${groupForm.color}`
                      : `1px solid ${theme.border}`,
                    borderRadius: '10px', fontSize: '20px',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Group Color</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {GROUP_COLORS.map(color => (
                <div
                  key={color}
                  onClick={() => setGroupForm({ ...groupForm, color })}
                  style={{
                    width: '28px', height: '28px',
                    borderRadius: '50%', background: color,
                    cursor: 'pointer',
                    border: groupForm.color === color
                      ? '3px solid white' : '3px solid transparent',
                    boxShadow: groupForm.color === color
                      ? `0 0 0 2px ${color}` : 'none',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Add Members from friends */}
          {friends.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={label}>
                Add Members (optional)
              </label>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '6px',
                maxHeight: '180px', overflowY: 'auto'
              }}>
                {friends.map(friend => {
                  const isSelected = groupForm.memberIds
                    .includes(friend.userId)
                  return (
                    <div
                      key={friend.userId}
                      onClick={() => {
                        const ids = isSelected
                          ? groupForm.memberIds.filter(
                              id => id !== friend.userId)
                          : [...groupForm.memberIds, friend.userId]
                        setGroupForm({ ...groupForm, memberIds: ids })
                      }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        gap: '10px', padding: '10px 12px',
                        background: isSelected
                          ? `${groupForm.color}15` : theme.bgInput,
                        border: `1px solid ${isSelected
                          ? groupForm.color : theme.border}`,
                        borderRadius: '10px', cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '13px',
                        fontWeight: '700', color: 'white', flexShrink: 0
                      }}>
                        {friend.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          color: theme.textPrimary, fontSize: '13px',
                          fontWeight: '600', margin: 0
                        }}>
                          {friend.fullName}
                        </p>
                        <p style={{
                          color: theme.textSecondary,
                          fontSize: '11px', margin: 0
                        }}>
                          {friend.email}
                        </p>
                      </div>
                      <div style={{
                        width: '20px', height: '20px',
                        borderRadius: '50%',
                        background: isSelected
                          ? groupForm.color : theme.border,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                        transition: 'all 0.15s'
                      }}>
                        {isSelected && (
                          <span style={{
                            color: 'white', fontSize: '11px',
                            fontWeight: '700'
                          }}>✓</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Creating...' : 'Create Group 👥'}
          </button>
        </form>
      </Modal>

      {/* Add Friend Modal */}
      <Modal
        isOpen={isFriendModalOpen}
        onClose={() => setIsFriendModalOpen(false)}
        title="Add Friend 🤝"
      >
        <form onSubmit={handleSendFriendRequest}>
          <div style={{ marginBottom: '20px' }}>
            <label style={label}>Friend's Email</label>
            <input
              type="email" required
              placeholder="friend@gmail.com"
              value={friendEmail}
              onChange={e => setFriendEmail(e.target.value)}
              style={input}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />
            <p style={{
              color: theme.textSecondary,
              fontSize: '12px', margin: '6px 0 0'
            }}>
              They must have a Meri Gullak account
            </p>
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
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Sending...' : 'Send Friend Request 📧'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}
