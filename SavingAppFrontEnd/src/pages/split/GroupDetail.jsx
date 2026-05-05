import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { splitApi } from '../../api/splitApi'
import useTheme from '../../hooks/useTheme'
import useIsMobile from '../../hooks/useIsMobile'
import useAuthStore from '../../store/authStore'
import { getCardStyle, getInputStyle, getLabelStyle } from '../../utils/styles'
import toast from 'react-hot-toast'

const initialExpenseForm = {
  title: '',
  description: '',
  totalAmount: '',
  paidById: '',
  splitType: 'EQUAL',
  expenseDate: new Date().toISOString().split('T')[0],
  customShares: {}
}

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const card = getCardStyle(theme)
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)

  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('expenses')
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm)
  const [submitting, setSubmitting] = useState(false)
  const [settlingUserId, setSettlingUserId] = useState(null)

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    try {
      const [groupRes, expenseRes, balanceRes] = await Promise.all([
        splitApi.getGroupById(id),
        splitApi.getGroupExpenses(id),
        splitApi.getGroupBalances(id)
      ])
      setGroup(groupRes.data)
      setExpenses(expenseRes.data)
      setBalances(balanceRes.data)

      // Set default paidBy to current user
      setExpenseForm(prev => ({
        ...prev,
        paidById: user?.id || ''
      }))
    } catch (err) {
      toast.error('Failed to load group details')
      navigate('/split')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        groupId: parseInt(id),
        title: expenseForm.title,
        description: expenseForm.description,
        totalAmount: parseFloat(expenseForm.totalAmount),
        paidById: parseInt(expenseForm.paidById),
        splitType: expenseForm.splitType,
        expenseDate: expenseForm.expenseDate,
      }

      if (expenseForm.splitType === 'CUSTOM') {
        const customShares = {}
        Object.entries(expenseForm.customShares).forEach(([k, v]) => {
          if (v) customShares[parseInt(k)] = parseFloat(v)
        })
        payload.customShares = customShares
      }

      const res = await splitApi.addExpense(payload)
      setExpenses([res.data, ...expenses])

      // Refresh balances
      const balanceRes = await splitApi.getGroupBalances(id)
      setBalances(balanceRes.data)

      toast.success('Expense added! 💸')
      setIsExpenseModalOpen(false)
      setExpenseForm({
        ...initialExpenseForm,
        paidById: user?.id || ''
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSettleUp = async (userId) => {
    setSettlingUserId(userId)
    try {
      const res = await splitApi.settleUp(id, userId)
      toast.success(res.data)
      const balanceRes = await splitApi.getGroupBalances(id)
      setBalances(balanceRes.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Settlement failed')
    } finally {
      setSettlingUserId(null)
    }
  }

  if (loading) return (
    <Layout>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', height: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
          <p style={{ color: theme.textSecondary }}>Loading group...</p>
        </div>
      </div>
    </Layout>
  )

  const myBalance = balances?.netBalance || 0
  const isPositive = parseFloat(myBalance) >= 0

  return (
    <Layout>
      {/* Back button */}
      <button
        onClick={() => navigate('/split')}
        style={{
          background: 'transparent', border: 'none',
          color: theme.textSecondary, cursor: 'pointer',
          fontSize: '13px', padding: '0 0 16px',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}
      >
        ← Back to Split
      </button>

      {/* Group Header */}
      <div style={{
        ...card,
        background: `linear-gradient(135deg, ${group?.color || '#c44b8a'}20, ${group?.color || '#e8632a'}10)`,
        border: `1px solid ${group?.color || '#c44b8a'}30`,
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: `${group?.color || '#c44b8a'}30`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '28px'
            }}>
              {group?.icon || '👥'}
            </div>
            <div>
              <h1 style={{
                color: theme.textPrimary,
                fontSize: isMobile ? '18px' : '22px',
                fontWeight: '800', margin: 0
              }}>
                {group?.name}
              </h1>
              {group?.description && (
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '13px', margin: '2px 0 0'
                }}>
                  {group.description}
                </p>
              )}
              <p style={{
                color: theme.textMuted,
                fontSize: '12px', margin: '4px 0 0'
              }}>
                Created by {group?.createdByName} •{' '}
                {group?.members?.length} members
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
              border: 'none', borderRadius: '12px',
              padding: '10px 18px', fontSize: '13px',
              fontWeight: '600', color: 'white', cursor: 'pointer'
            }}
          >
            + Add Expense
          </button>
        </div>

        {/* Members avatars */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '8px', marginTop: '16px', flexWrap: 'wrap'
        }}>
          <p style={{
            color: theme.textSecondary,
            fontSize: '12px', margin: 0
          }}>
            Members:
          </p>
          {group?.members?.map((m, i) => (
            <div key={m.userId} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: theme.bgInput,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px', padding: '4px 10px'
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: `hsl(${(i * 60) % 360}, 60%, 50%)`,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '10px',
                fontWeight: '700', color: 'white'
              }}>
                {m.fullName?.charAt(0).toUpperCase()}
              </div>
              <span style={{
                color: theme.textPrimary,
                fontSize: '12px', fontWeight: '500'
              }}>
                {m.fullName?.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* My Balance Summary — always 3 columns even on mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isMobile ? '8px' : '14px',
        marginBottom: '20px'
      }}>
        {[
          {
            label: 'You Owe',
            value: `₹${parseFloat(balances?.totalYouOwe || 0)
              .toLocaleString('en-IN')}`,
            color: '#e8632a',
            bg: theme.redBg,
            border: theme.redBorder
          },
          {
            label: 'Owed to You',
            value: `₹${parseFloat(balances?.totalOwedToYou || 0)
              .toLocaleString('en-IN')}`,
            color: theme.greenLight,
            bg: theme.greenBg,
            border: theme.greenBorder
          },
          {
            label: 'Net Balance',
            value: `${isPositive ? '+' : ''}₹${parseFloat(myBalance)
              .toLocaleString('en-IN')}`,
            color: isPositive ? theme.greenLight : '#e8632a',
            bg: isPositive ? theme.greenBg : theme.redBg,
            border: isPositive ? theme.greenBorder : theme.redBorder
          },
        ].map(({ label: lbl, value, color, bg, border }) => (
          <div key={lbl} style={{
            background: bg, border: `1px solid ${border}`,
            borderRadius: '12px',
            padding: isMobile ? '10px 8px' : '16px'
          }}>
            <p style={{
              color: theme.textSecondary,
              fontSize: isMobile ? '10px' : '12px',
              margin: '0 0 4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {lbl}
            </p>
            <p style={{
              color,
              fontSize: isMobile ? '14px' : '20px',
              fontWeight: '800', margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '20px',
        borderBottom: `1px solid ${theme.border}`
      }}>
        {[
          { id: 'expenses', label: '💸 Expenses' },
          { id: 'balances', label: '⚖️ Balances' },
        ].map(tab => (
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
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── EXPENSES TAB ── */}
      {activeTab === 'expenses' && (
        <>
          {expenses.length === 0 ? (
            <div style={{
              ...card, textAlign: 'center', padding: '60px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                💸
              </div>
              <p style={{
                color: theme.textPrimary, fontSize: '16px',
                fontWeight: '600', margin: '0 0 8px'
              }}>
                No expenses yet!
              </p>
              <p style={{
                color: theme.textSecondary,
                fontSize: '13px', margin: '0 0 20px'
              }}>
                Add your first group expense
              </p>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
                  border: 'none', borderRadius: '12px',
                  padding: '11px 24px', fontSize: '14px',
                  fontWeight: '600', color: 'white', cursor: 'pointer'
                }}
              >
                + Add Expense
              </button>
            </div>
          ) : (
            <div style={{
              ...card, padding: 0, overflow: 'hidden'
            }}>
              {expenses.map((expense, idx) => (
                <div key={expense.id} style={{
                  padding: '16px 20px',
                  borderBottom: idx < expenses.length - 1
                    ? `1px solid ${theme.border}` : 'none'
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '10px',
                    flexWrap: 'wrap', gap: '8px'
                  }}>
                    <div>
                      <p style={{
                        color: theme.textPrimary, fontSize: '14px',
                        fontWeight: '700', margin: 0
                      }}>
                        {expense.title}
                      </p>
                      <p style={{
                        color: theme.textSecondary,
                        fontSize: '12px', margin: '2px 0 0'
                      }}>
                        Paid by{' '}
                        <span style={{
                          color: '#c44b8a', fontWeight: '600'
                        }}>
                          {expense.paidByName}
                        </span>
                        {' '}• {expense.expenseDate}
                      </p>
                    </div>
                    <p style={{
                      color: theme.textPrimary, fontSize: '18px',
                      fontWeight: '800', margin: 0
                    }}>
                      ₹{parseFloat(expense.totalAmount)
                        .toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Shares */}
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '6px'
                  }}>
                    {expense.shares?.map(share => (
                      <div key={share.userId} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: share.settled
                          ? theme.greenBg : theme.redBg,
                        border: `1px solid ${share.settled
                          ? theme.greenBorder : theme.redBorder}`,
                        borderRadius: '20px', padding: '4px 10px',
                        fontSize: '11px'
                      }}>
                        <span style={{
                          color: share.settled
                            ? theme.greenLight : theme.redLight,
                          fontWeight: '600'
                        }}>
                          {share.userName?.split(' ')[0]}
                        </span>
                        <span style={{
                          color: share.settled
                            ? theme.greenLight : theme.redLight
                        }}>
                          ₹{parseFloat(share.shareAmount)
                            .toLocaleString('en-IN')}
                        </span>
                        <span>
                          {share.settled ? '✅' : '⏳'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── BALANCES TAB ── */}
      {activeTab === 'balances' && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          {!balances?.balances?.length ? (
            <div style={{
              ...card, textAlign: 'center', padding: '60px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                ⚖️
              </div>
              <p style={{
                color: theme.textSecondary, fontSize: '15px', margin: 0
              }}>
                All settled up! 🎉
              </p>
            </div>
          ) : (
            balances.balances.map(balance => {
              const amount = parseFloat(balance.amount)
              const owesYou = amount > 0
              return (
                <div key={balance.userId} style={{
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
                    {balance.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <p style={{
                      color: theme.textPrimary, fontSize: '14px',
                      fontWeight: '600', margin: 0
                    }}>
                      {balance.userName}
                    </p>
                    <p style={{
                      color: owesYou ? theme.greenLight : '#e8632a',
                      fontSize: '13px', fontWeight: '700',
                      margin: '2px 0 0'
                    }}>
                      {owesYou
                        ? `Owes you ₹${Math.abs(amount).toLocaleString('en-IN')}`
                        : `You owe ₹${Math.abs(amount).toLocaleString('en-IN')}`}
                    </p>
                  </div>
                  {!owesYou && (
                    <button
                      onClick={() => handleSettleUp(balance.userId)}
                      disabled={settlingUserId === balance.userId}
                      style={{
                        background: 'linear-gradient(135deg, #3ecf8e, #16a34a)',
                        border: 'none', borderRadius: '10px',
                        padding: '9px 16px', fontSize: '12px',
                        fontWeight: '700', color: 'white',
                        cursor: settlingUserId === balance.userId
                          ? 'not-allowed' : 'pointer',
                        opacity: settlingUserId === balance.userId ? 0.7 : 1
                      }}
                    >
                      {settlingUserId === balance.userId
                        ? 'Settling...' : '✅ Settle Up'}
                    </button>
                  )}
                  {owesYou && (
                    <div style={{
                      background: theme.greenBg,
                      border: `1px solid ${theme.greenBorder}`,
                      borderRadius: '10px', padding: '9px 16px',
                      fontSize: '12px', fontWeight: '700',
                      color: theme.greenLight
                    }}>
                      💰 They owe you
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Add Group Expense 💸"
      >
        <form onSubmit={handleAddExpense}>
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Expense Title</label>
            <input
              type="text" required
              placeholder="e.g. Hotel booking, Dinner"
              value={expenseForm.title}
              onChange={e => setExpenseForm({
                ...expenseForm, title: e.target.value
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
              placeholder="e.g. 2 nights stay"
              value={expenseForm.description}
              onChange={e => setExpenseForm({
                ...expenseForm, description: e.target.value
              })}
              style={input}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Total Amount (₹)</label>
            <input
              type="number" required min="0.01" step="0.01"
              placeholder="0.00"
              value={expenseForm.totalAmount}
              onChange={e => setExpenseForm({
                ...expenseForm, totalAmount: e.target.value
              })}
              style={input}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Paid By</label>
            <select
              required value={expenseForm.paidById}
              onChange={e => setExpenseForm({
                ...expenseForm, paidById: e.target.value
              })}
              style={input}
            >
              <option value="">Select who paid</option>
              {group?.members?.map(m => (
                <option key={m.userId} value={m.userId}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Date</label>
            <input
              type="date" required
              value={expenseForm.expenseDate}
              onChange={e => setExpenseForm({
                ...expenseForm, expenseDate: e.target.value
              })}
              style={input}
            />
          </div>

          {/* Split Type */}
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Split Type</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['EQUAL', 'CUSTOM'].map(type => (
                <button
                  key={type} type="button"
                  onClick={() => setExpenseForm({
                    ...expenseForm, splitType: type
                  })}
                  style={{
                    flex: 1,
                    background: expenseForm.splitType === type
                      ? 'rgba(196,75,138,0.15)' : theme.bgInput,
                    border: expenseForm.splitType === type
                      ? '1px solid #c44b8a'
                      : `1px solid ${theme.border}`,
                    borderRadius: '10px', padding: '10px',
                    color: expenseForm.splitType === type
                      ? '#c44b8a' : theme.textSecondary,
                    fontWeight: '600', fontSize: '13px',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {type === 'EQUAL' ? '⚖️ Split Equally' : '✏️ Custom Split'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Split inputs */}
          {expenseForm.splitType === 'CUSTOM' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={label}>Custom Amounts per person</label>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                {group?.members?.map(m => (
                  <div key={m.userId} style={{
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <p style={{
                      color: theme.textPrimary, fontSize: '13px',
                      fontWeight: '500', margin: 0, width: '100px',
                      flexShrink: 0, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {m.fullName?.split(' ')[0]}
                    </p>
                    <input
                      type="number" min="0" step="0.01"
                      placeholder="0.00"
                      value={expenseForm.customShares[m.userId] || ''}
                      onChange={e => setExpenseForm({
                        ...expenseForm,
                        customShares: {
                          ...expenseForm.customShares,
                          [m.userId]: e.target.value
                        }
                      })}
                      style={{ ...input, flex: 1 }}
                      onFocus={e => e.target.style.borderColor = '#c44b8a'}
                      onBlur={e =>
                        e.target.style.borderColor = theme.inputBorder}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equal split preview */}
          {expenseForm.splitType === 'EQUAL'
            && expenseForm.totalAmount
            && group?.members?.length > 0 && (
            <div style={{
              background: theme.bgInput,
              border: `1px solid ${theme.border}`,
              borderRadius: '10px', padding: '12px',
              marginBottom: '16px'
            }}>
              <p style={{
                color: theme.textSecondary, fontSize: '12px', margin: 0
              }}>
                Each person pays:{' '}
                <span style={{
                  color: '#c44b8a', fontWeight: '700'
                }}>
                  ₹{(parseFloat(expenseForm.totalAmount) /
                    group.members.length).toFixed(2)}
                </span>
                {' '}per person ({group.members.length} members)
              </p>
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
            {submitting ? 'Adding...' : 'Add Expense 💸'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}
