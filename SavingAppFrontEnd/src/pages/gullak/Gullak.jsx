import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { gullakApi } from '../../api/gullakApi'
import useTheme from '../../hooks/useTheme'
import { getCardStyle, getInputStyle, getLabelStyle } from '../../utils/styles'
import toast from 'react-hot-toast'

const GOAL_ICONS = [
  '🏍️', '📱', '💻', '🚗', '✈️', '🏠',
  '💍', '🎓', '🏋️', '📷', '🎮', '💰'
]

const COLORS = [
  '#c44b8a', '#e8632a', '#2d3a8c',
  '#0f6e56', '#7c3aed', '#e8a020'
]

const initialForm = {
  goalName: '', targetAmount: '',
  targetDate: '', icon: '💰',
  color: '#c44b8a', description: ''
}

export default function Gullak() {
  const { theme } = useTheme()
  const card = getCardStyle(theme)
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)

  const [gullaks, setGullaks] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isTxOpen, setIsTxOpen] = useState(false)
  const [selectedGullak, setSelectedGullak] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [txForm, setTxForm] = useState({
    amount: '', type: 'DEPOSIT', note: ''
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => { fetchGullaks() }, [])

  const fetchGullaks = async () => {
    try {
      const res = await gullakApi.getAll()
      setGullaks(res.data)
    } catch {
      toast.error('Failed to load gullaks')
    } finally {
      setFetching(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await gullakApi.create({
        ...form,
        targetAmount: parseFloat(form.targetAmount),
        targetDate: form.targetDate || null
      })
      setGullaks([res.data, ...gullaks])
      toast.success('Gullak created! 🪙')
      setIsCreateOpen(false)
      setForm(initialForm)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  const handleTransaction = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await gullakApi.transaction(selectedGullak.id, {
        ...txForm,
        amount: parseFloat(txForm.amount)
      })
      setGullaks(gullaks.map(g =>
        g.id === selectedGullak.id ? res.data : g
      ))
      if (res.data.status === 'COMPLETED') {
        toast.success('🎉 Goal Completed! Congratulations!')
      } else {
        toast.success(
          txForm.type === 'DEPOSIT' ? 'Savings added! 💰' : 'Withdrawal done!'
        )
      }
      setIsTxOpen(false)
      setTxForm({ amount: '', type: 'DEPOSIT', note: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Gullak?')) return
    try {
      await gullakApi.delete(id)
      setGullaks(gullaks.filter(g => g.id !== id))
      toast.success('Gullak deleted!')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const openTx = (gullak, type) => {
    setSelectedGullak(gullak)
    setTxForm({ amount: '', type, note: '' })
    setIsTxOpen(true)
  }

  const totalSaved = gullaks.reduce(
    (sum, g) => sum + parseFloat(g.savedAmount || 0), 0)
  const totalTarget = gullaks.reduce(
    (sum, g) => sum + parseFloat(g.targetAmount || 0), 0)

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
            fontSize: '24px', fontWeight: '700', margin: 0
          }}>
            My Gullak 🐷
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '14px', margin: '4px 0 0'
          }}>
            Your savings goals
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
            border: 'none', borderRadius: '12px',
            padding: '11px 20px', fontSize: '14px',
            fontWeight: '600', color: 'white', cursor: 'pointer'
          }}
        >
          + New Gullak
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        {[
          {
            label: 'Total Saved',
            value: `₹${totalSaved.toLocaleString('en-IN')}`,
            color: theme.greenLight
          },
          {
            label: 'Total Target',
            value: `₹${totalTarget.toLocaleString('en-IN')}`,
            color: '#c44b8a'
          },
          {
            label: 'Active Goals',
            value: gullaks.filter(g => g.status === 'ACTIVE').length,
            color: theme.yellowLight
          },
          {
            label: 'Completed',
            value: gullaks.filter(g => g.status === 'COMPLETED').length,
            color: theme.purple
          },
        ].map(({ label: lbl, value, color }) => (
          <div key={lbl} style={{ ...card }}>
            <p style={{
              color: theme.textSecondary,
              fontSize: '12px', margin: '0 0 6px'
            }}>
              {lbl}
            </p>
            <p style={{
              color, fontSize: '22px', fontWeight: '700', margin: 0
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Gullak Cards */}
      {fetching ? (
        <div style={{
          textAlign: 'center',
          color: theme.textSecondary, padding: '60px'
        }}>
          Loading gullaks...
        </div>
      ) : gullaks.length === 0 ? (
        <div style={{
          ...card, textAlign: 'center', padding: '60px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🪙</div>
          <p style={{
            color: theme.textSecondary, fontSize: '15px', margin: 0
          }}>
            No gullaks yet. Create your first savings goal!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {gullaks.map(gullak => {
            const progress = Math.min(gullak.progressPercentage, 100)
            const isCompleted = gullak.status === 'COMPLETED'
            return (
              <div key={gullak.id} style={{
                ...card,
                borderTop: `3px solid ${gullak.color || '#c44b8a'}`,
                position: 'relative', overflow: 'hidden'
              }}>
                {/* Completed badge */}
                {isCompleted && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: theme.greenBg,
                    border: `1px solid ${theme.greenBorder}`,
                    borderRadius: '20px', padding: '3px 10px',
                    fontSize: '11px', color: theme.greenLight,
                    fontWeight: '600'
                  }}>
                    ✅ Completed!
                  </div>
                )}

                {/* Goal info */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '12px', marginBottom: '16px'
                }}>
                  <div style={{
                    width: '48px', height: '48px',
                    borderRadius: '14px',
                    background: `${gullak.color || '#c44b8a'}20`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '24px'
                  }}>
                    {gullak.icon || '💰'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      color: theme.textPrimary,
                      fontWeight: '700', fontSize: '16px', margin: 0
                    }}>
                      {gullak.goalName}
                    </p>
                    {gullak.description && (
                      <p style={{
                        color: theme.textSecondary,
                        fontSize: '12px', margin: '2px 0 0'
                      }}>
                        {gullak.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between', marginBottom: '12px'
                }}>
                  <div>
                    <p style={{
                      color: theme.textSecondary,
                      fontSize: '11px', margin: '0 0 2px'
                    }}>
                      Saved
                    </p>
                    <p style={{
                      color: theme.greenLight,
                      fontSize: '18px', fontWeight: '700', margin: 0
                    }}>
                      ₹{parseFloat(gullak.savedAmount)
                        .toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      color: theme.textSecondary,
                      fontSize: '11px', margin: '0 0 2px'
                    }}>
                      Target
                    </p>
                    <p style={{
                      color: theme.textPrimary,
                      fontSize: '18px', fontWeight: '700', margin: 0
                    }}>
                      ₹{parseFloat(gullak.targetAmount)
                        .toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      color: theme.textSecondary, fontSize: '11px'
                    }}>
                      Progress
                    </span>
                    <span style={{
                      color: gullak.color || '#c44b8a',
                      fontSize: '12px', fontWeight: '700'
                    }}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{
                    background: theme.bgInput,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '10px', height: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%', width: `${progress}%`,
                      background: isCompleted
                        ? 'linear-gradient(90deg, #3ecf8e, #16a34a)'
                        : `linear-gradient(90deg, ${gullak.color || '#c44b8a'}, #e8632a)`,
                      borderRadius: '10px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  {gullak.remainingAmount > 0 && (
                    <p style={{
                      color: theme.textMuted,
                      fontSize: '11px', margin: '6px 0 0'
                    }}>
                      ₹{parseFloat(gullak.remainingAmount)
                        .toLocaleString('en-IN')} remaining
                    </p>
                  )}
                </div>

                {/* Target date */}
                {gullak.targetDate && (
                  <p style={{
                    color: theme.textMuted,
                    fontSize: '11px', marginBottom: '14px'
                  }}>
                    🗓️ Target: {new Date(gullak.targetDate)
                      .toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                  </p>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openTx(gullak, 'DEPOSIT')}
                    style={{
                      flex: 1,
                      background: theme.greenBg,
                      border: `1px solid ${theme.greenBorder}`,
                      borderRadius: '10px', padding: '9px',
                      fontSize: '12px', fontWeight: '600',
                      color: theme.greenLight, cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => openTx(gullak, 'WITHDRAWAL')}
                    style={{
                      flex: 1,
                      background: theme.redBg,
                      border: `1px solid ${theme.redBorder}`,
                      borderRadius: '10px', padding: '9px',
                      fontSize: '12px', fontWeight: '600',
                      color: theme.redLight, cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    - Withdraw
                  </button>
                  <button
                    onClick={() => handleDelete(gullak.id)}
                    style={{
                      background: theme.bgHover,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '10px', padding: '9px 12px',
                      color: theme.textMuted, cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Gullak Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Gullak 🪙"
      >
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Goal Name</label>
            <input
              type="text" required
              placeholder="e.g. New Bike, iPhone, Trip to Goa"
              value={form.goalName}
              onChange={e => setForm({ ...form, goalName: e.target.value })}
              style={input}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Target Amount (₹)</label>
            <input
              type="number" required min="1"
              placeholder="e.g. 80000"
              value={form.targetAmount}
              onChange={e => setForm({ ...form, targetAmount: e.target.value })}
              style={input}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Target Date (optional)</label>
            <input
              type="date"
              value={form.targetDate}
              onChange={e => setForm({ ...form, targetDate: e.target.value })}
              style={input}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. Saving for my dream bike"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={input}
            />
          </div>

          {/* Icon Picker */}
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Goal Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {GOAL_ICONS.map(icon => (
                <button
                  key={icon} type="button"
                  onClick={() => setForm({ ...form, icon })}
                  style={{
                    width: '40px', height: '40px',
                    background: form.icon === icon
                      ? theme.bgAccent : theme.bgInput,
                    border: form.icon === icon
                      ? `1px solid #c44b8a`
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
          <div style={{ marginBottom: '20px' }}>
            <label style={label}>Card Color</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {COLORS.map(color => (
                <div
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  style={{
                    width: '28px', height: '28px',
                    borderRadius: '50%', background: color,
                    cursor: 'pointer',
                    border: form.color === color
                      ? '3px solid white' : '3px solid transparent',
                    boxShadow: form.color === color
                      ? `0 0 0 2px ${color}` : 'none',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
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
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Gullak 🪙'}
          </button>
        </form>
      </Modal>

      {/* Transaction Modal */}
      <Modal
        isOpen={isTxOpen}
        onClose={() => setIsTxOpen(false)}
        title={txForm.type === 'DEPOSIT'
          ? '💰 Add Savings' : '💸 Withdraw Savings'}
      >
        {selectedGullak && (
          <div>
            {/* Gullak info */}
            <div style={{
              background: theme.bgInput,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px', padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{
                color: theme.textPrimary,
                fontWeight: '600', fontSize: '15px', margin: '0 0 8px'
              }}>
                {selectedGullak.icon} {selectedGullak.goalName}
              </p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <p style={{
                    color: theme.textSecondary,
                    fontSize: '11px', margin: '0 0 2px'
                  }}>
                    Saved
                  </p>
                  <p style={{
                    color: theme.greenLight,
                    fontWeight: '700', fontSize: '14px', margin: 0
                  }}>
                    ₹{parseFloat(selectedGullak.savedAmount)
                      .toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p style={{
                    color: theme.textSecondary,
                    fontSize: '11px', margin: '0 0 2px'
                  }}>
                    Target
                  </p>
                  <p style={{
                    color: theme.textPrimary,
                    fontWeight: '700', fontSize: '14px', margin: 0
                  }}>
                    ₹{parseFloat(selectedGullak.targetAmount)
                      .toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p style={{
                    color: theme.textSecondary,
                    fontSize: '11px', margin: '0 0 2px'
                  }}>
                    Progress
                  </p>
                  <p style={{
                    color: selectedGullak.color || '#c44b8a',
                    fontWeight: '700', fontSize: '14px', margin: 0
                  }}>
                    {selectedGullak.progressPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleTransaction}>
              {/* Type toggle */}
              <div style={{
                display: 'flex', gap: '8px', marginBottom: '16px'
              }}>
                {['DEPOSIT', 'WITHDRAWAL'].map(type => (
                  <button
                    key={type} type="button"
                    onClick={() => setTxForm({ ...txForm, type })}
                    style={{
                      flex: 1,
                      background: txForm.type === type
                        ? type === 'DEPOSIT'
                          ? theme.greenBg : theme.redBg
                        : theme.bgInput,
                      border: txForm.type === type
                        ? `1px solid ${type === 'DEPOSIT'
                          ? theme.greenBorder : theme.redBorder}`
                        : `1px solid ${theme.border}`,
                      borderRadius: '10px', padding: '10px',
                      color: txForm.type === type
                        ? type === 'DEPOSIT'
                          ? theme.greenLight : theme.redLight
                        : theme.textSecondary,
                      fontWeight: '600', fontSize: '13px',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {type === 'DEPOSIT' ? '💰 Add' : '💸 Withdraw'}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={label}>Amount (₹)</label>
                <input
                  type="number" required min="0.01" step="0.01"
                  placeholder="0.00"
                  value={txForm.amount}
                  onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                  style={input}
                  onFocus={e => e.target.style.borderColor = '#c44b8a'}
                  onBlur={e => e.target.style.borderColor = theme.inputBorder}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={label}>Note (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly savings"
                  value={txForm.note}
                  onChange={e => setTxForm({ ...txForm, note: e.target.value })}
                  style={input}
                />
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? theme.border
                    : txForm.type === 'DEPOSIT'
                      ? 'linear-gradient(135deg, #3ecf8e, #16a34a)'
                      : 'linear-gradient(135deg, #e8632a, #c44b8a)',
                  border: 'none', borderRadius: '12px',
                  padding: '13px', fontSize: '14px',
                  fontWeight: '700', color: 'white', cursor: 'pointer'
                }}
              >
                {loading ? 'Processing...'
                  : txForm.type === 'DEPOSIT'
                    ? 'Add Savings 💰' : 'Withdraw 💸'}
              </button>
            </form>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
