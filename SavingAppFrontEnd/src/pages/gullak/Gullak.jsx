import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { gullakApi } from '../../api/gullakApi'
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
  const [gullaks, setGullaks] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isTxOpen, setIsTxOpen] = useState(false)
  const [selectedGullak, setSelectedGullak] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [txForm, setTxForm] = useState({ amount: '', type: 'DEPOSIT', note: '' })
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
        toast.success(txForm.type === 'DEPOSIT'
          ? 'Savings added! 💰' : 'Withdrawal done!')
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#f0eeff', fontSize: '24px', fontWeight: '700', margin: 0 }}>
            My Gullak 🪙
          </h1>
          <p style={{ color: '#7a7390', fontSize: '14px', margin: '4px 0 0' }}>
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

      {/* Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        {[
          { label: 'Total Saved', value: `₹${totalSaved.toLocaleString('en-IN')}`, color: '#3ecf8e' },
          { label: 'Total Target', value: `₹${totalTarget.toLocaleString('en-IN')}`, color: '#c44b8a' },
          { label: 'Active Goals', value: gullaks.filter(g => g.status === 'ACTIVE').length, color: '#f59e0b' },
          { label: 'Completed', value: gullaks.filter(g => g.status === 'COMPLETED').length, color: '#7c3aed' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#1c1828', border: '0.5px solid #2a2535',
            borderRadius: '14px', padding: '18px'
          }}>
            <p style={{ color: '#7a7390', fontSize: '12px', margin: '0 0 6px' }}>{label}</p>
            <p style={{ color, fontSize: '22px', fontWeight: '700', margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Gullak Cards */}
      {fetching ? (
        <div style={{ textAlign: 'center', color: '#7a7390', padding: '60px' }}>
          Loading gullaks...
        </div>
      ) : gullaks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: '#1c1828', borderRadius: '16px',
          border: '0.5px solid #2a2535'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🪙</div>
          <p style={{ color: '#7a7390', fontSize: '15px', margin: 0 }}>
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
                background: '#1c1828',
                border: `0.5px solid ${gullak.color || '#2a2535'}40`,
                borderRadius: '20px', padding: '22px',
                borderTop: `3px solid ${gullak.color || '#c44b8a'}`,
                position: 'relative', overflow: 'hidden'
              }}>
                {/* Completed badge */}
                {isCompleted && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: 'rgba(62,207,142,0.2)',
                    border: '0.5px solid #3ecf8e',
                    borderRadius: '20px', padding: '3px 10px',
                    fontSize: '11px', color: '#3ecf8e', fontWeight: '600'
                  }}>
                    ✅ Completed!
                  </div>
                )}

                {/* Goal info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: `${gullak.color || '#c44b8a'}20`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '24px'
                  }}>
                    {gullak.icon || '💰'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#f0eeff', fontWeight: '700', fontSize: '16px', margin: 0 }}>
                      {gullak.goalName}
                    </p>
                    {gullak.description && (
                      <p style={{ color: '#7a7390', fontSize: '12px', margin: '2px 0 0' }}>
                        {gullak.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <p style={{ color: '#7a7390', fontSize: '11px', margin: '0 0 2px' }}>Saved</p>
                    <p style={{ color: '#3ecf8e', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                      ₹{parseFloat(gullak.savedAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#7a7390', fontSize: '11px', margin: '0 0 2px' }}>Target</p>
                    <p style={{ color: '#f0eeff', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                      ₹{parseFloat(gullak.targetAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#7a7390', fontSize: '11px' }}>Progress</span>
                    <span style={{
                      color: gullak.color || '#c44b8a',
                      fontSize: '12px', fontWeight: '700'
                    }}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{
                    background: '#13111a', borderRadius: '10px',
                    height: '10px', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: isCompleted
                        ? 'linear-gradient(90deg, #3ecf8e, #20b070)'
                        : `linear-gradient(90deg, ${gullak.color || '#c44b8a'}, #e8632a)`,
                      borderRadius: '10px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  {gullak.remainingAmount > 0 && (
                    <p style={{ color: '#4a4560', fontSize: '11px', margin: '6px 0 0' }}>
                      ₹{parseFloat(gullak.remainingAmount).toLocaleString('en-IN')} remaining
                    </p>
                  )}
                </div>

                {/* Target date */}
                {gullak.targetDate && (
                  <p style={{ color: '#4a4560', fontSize: '11px', marginBottom: '14px' }}>
                    🗓️ Target: {new Date(gullak.targetDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openTx(gullak, 'DEPOSIT')}
                    style={{
                      flex: 1, background: 'rgba(62,207,142,0.1)',
                      border: '0.5px solid #3ecf8e', borderRadius: '10px',
                      padding: '9px', fontSize: '12px', fontWeight: '600',
                      color: '#3ecf8e', cursor: 'pointer'
                    }}
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => openTx(gullak, 'WITHDRAWAL')}
                    style={{
                      flex: 1, background: 'rgba(232,99,42,0.1)',
                      border: '0.5px solid #e8632a', borderRadius: '10px',
                      padding: '9px', fontSize: '12px', fontWeight: '600',
                      color: '#e8632a', cursor: 'pointer'
                    }}
                  >
                    - Withdraw
                  </button>
                  <button
                    onClick={() => handleDelete(gullak.id)}
                    style={{
                      background: '#2a2535', border: 'none',
                      borderRadius: '10px', padding: '9px 12px',
                      color: '#7a7390', cursor: 'pointer', fontSize: '14px'
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
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Goal Name
            </label>
            <input
              type="text" required
              placeholder="e.g. New Bike, iPhone, Trip to Goa"
              value={form.goalName}
              onChange={e => setForm({ ...form, goalName: e.target.value })}
              style={{
                width: '100%', background: '#13111a',
                border: '0.5px solid #2a2535', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px',
                color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e => e.target.style.borderColor = '#2a2535'}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Target Amount (₹)
            </label>
            <input
              type="number" required min="1"
              placeholder="e.g. 80000"
              value={form.targetAmount}
              onChange={e => setForm({ ...form, targetAmount: e.target.value })}
              style={{
                width: '100%', background: '#13111a',
                border: '0.5px solid #2a2535', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px',
                color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e => e.target.style.borderColor = '#2a2535'}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Target Date (optional)
            </label>
            <input
              type="date"
              value={form.targetDate}
              onChange={e => setForm({ ...form, targetDate: e.target.value })}
              style={{
                width: '100%', background: '#13111a',
                border: '0.5px solid #2a2535', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px',
                color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Description (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Saving for my dream bike"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{
                width: '100%', background: '#13111a',
                border: '0.5px solid #2a2535', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px',
                color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Icon Picker */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '8px' }}>
              Goal Icon
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {GOAL_ICONS.map(icon => (
                <button
                  key={icon} type="button"
                  onClick={() => setForm({ ...form, icon })}
                  style={{
                    width: '40px', height: '40px',
                    background: form.icon === icon
                      ? 'rgba(196,75,138,0.2)' : '#13111a',
                    border: form.icon === icon
                      ? '1px solid #c44b8a' : '0.5px solid #2a2535',
                    borderRadius: '10px', fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '8px' }}>
              Card Color
            </label>
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
                    transition: 'border 0.2s'
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#2a2535'
                : 'linear-gradient(135deg, #c44b8a, #e8632a)',
              border: 'none', borderRadius: '12px',
              padding: '13px', fontSize: '14px',
              fontWeight: '700', color: 'white', cursor: 'pointer'
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
              background: '#13111a', borderRadius: '12px',
              padding: '16px', marginBottom: '20px'
            }}>
              <p style={{ color: '#f0eeff', fontWeight: '600', fontSize: '15px', margin: '0 0 8px' }}>
                {selectedGullak.icon} {selectedGullak.goalName}
              </p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <p style={{ color: '#7a7390', fontSize: '11px', margin: '0 0 2px' }}>Saved</p>
                  <p style={{ color: '#3ecf8e', fontWeight: '700', fontSize: '14px', margin: 0 }}>
                    ₹{parseFloat(selectedGullak.savedAmount).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#7a7390', fontSize: '11px', margin: '0 0 2px' }}>Target</p>
                  <p style={{ color: '#f0eeff', fontWeight: '700', fontSize: '14px', margin: 0 }}>
                    ₹{parseFloat(selectedGullak.targetAmount).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#7a7390', fontSize: '11px', margin: '0 0 2px' }}>Progress</p>
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
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['DEPOSIT', 'WITHDRAWAL'].map(type => (
                  <button
                    key={type} type="button"
                    onClick={() => setTxForm({ ...txForm, type })}
                    style={{
                      flex: 1,
                      background: txForm.type === type
                        ? type === 'DEPOSIT'
                          ? 'rgba(62,207,142,0.2)'
                          : 'rgba(232,99,42,0.2)'
                        : '#13111a',
                      border: txForm.type === type
                        ? `1px solid ${type === 'DEPOSIT' ? '#3ecf8e' : '#e8632a'}`
                        : '0.5px solid #2a2535',
                      borderRadius: '10px', padding: '10px',
                      color: txForm.type === type
                        ? type === 'DEPOSIT' ? '#3ecf8e' : '#e8632a'
                        : '#7a7390',
                      fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                    }}
                  >
                    {type === 'DEPOSIT' ? '💰 Add' : '💸 Withdraw'}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
                  Amount (₹)
                </label>
                <input
                  type="number" required min="0.01" step="0.01"
                  placeholder="0.00"
                  value={txForm.amount}
                  onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                  style={{
                    width: '100%', background: '#13111a',
                    border: '0.5px solid #2a2535', borderRadius: '10px',
                    padding: '11px 14px', fontSize: '13px',
                    color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#c44b8a'}
                  onBlur={e => e.target.style.borderColor = '#2a2535'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
                  Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly savings"
                  value={txForm.note}
                  onChange={e => setTxForm({ ...txForm, note: e.target.value })}
                  style={{
                    width: '100%', background: '#13111a',
                    border: '0.5px solid #2a2535', borderRadius: '10px',
                    padding: '11px 14px', fontSize: '13px',
                    color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#2a2535'
                    : txForm.type === 'DEPOSIT'
                      ? 'linear-gradient(135deg, #3ecf8e, #20b070)'
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