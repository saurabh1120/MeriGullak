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

const SPLIT_TYPES = [
  { id: 'EQUAL', icon: '⚖️', label: 'Equal', desc: 'Split equally' },
  { id: 'CUSTOM', icon: '✏️', label: 'Custom', desc: 'Who paid what' },
  { id: 'SHARES', icon: '📊', label: 'Shares', desc: 'By ratio' },
]

const getEmptyForm = (userId) => ({
  title: '',
  description: '',
  totalAmount: '',
  paidById: userId || '',
  splitType: 'EQUAL',
  expenseDate: new Date().toISOString().split('T')[0],
  customShares: {},
  memberShares: {},
})

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
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('expenses')

  // Expense modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [expenseForm, setExpenseForm] = useState(getEmptyForm(user?.id))
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Settle modal
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false)
  const [settleTarget, setSettleTarget] = useState(null)
  const [settleAmount, setSettleAmount] = useState('')
  const [settling, setSettling] = useState(false)

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    try {
      const [groupRes, expenseRes, balanceRes, historyRes] =
        await Promise.all([
          splitApi.getGroupById(id),
          splitApi.getGroupExpenses(id),
          splitApi.getGroupBalances(id),
          splitApi.getGroupHistory(id),
        ])
      setGroup(groupRes.data)
      setExpenses(expenseRes.data)
      setBalances(balanceRes.data)
      setHistory(historyRes.data)

      const memberShares = {}
      const customShares = {}
      groupRes.data.members?.forEach(m => {
        memberShares[m.userId] = 1
        customShares[m.userId] = ''
      })
      setExpenseForm(prev => ({
        ...prev, paidById: user?.id || '',
        memberShares, customShares
      }))
    } catch {
      toast.error('Failed to load group')
      navigate('/split')
    } finally {
      setLoading(false)
    }
  }

  const refreshAll = async () => {
    const [balanceRes, historyRes] = await Promise.all([
      splitApi.getGroupBalances(id),
      splitApi.getGroupHistory(id),
    ])
    setBalances(balanceRes.data)
    setHistory(historyRes.data)
  }

  // ── Open Add Modal ───────────────────────────────────
  const openAddModal = () => {
    setEditingExpense(null)
    const memberShares = {}
    const customShares = {}
    group?.members?.forEach(m => {
      memberShares[m.userId] = 1
      customShares[m.userId] = ''
    })
    setExpenseForm({
      ...getEmptyForm(user?.id), memberShares, customShares
    })
    setIsExpenseModalOpen(true)
  }

  // ── Open Edit Modal ──────────────────────────────────
  const openEditModal = (expense) => {
    setEditingExpense(expense)
    const customShares = {}
    const memberShares = {}
    group?.members?.forEach(m => {
      customShares[m.userId] = ''
      memberShares[m.userId] = 1
    })
    expense.shares?.forEach(s => {
      customShares[s.userId] = s.paidAmount != null
        ? s.paidAmount.toString()
        : s.shareAmount.toString()
      memberShares[s.userId] = 1
    })
    setExpenseForm({
      title: expense.title || '',
      description: expense.description || '',
      totalAmount: expense.totalAmount?.toString() || '',
      paidById: expense.paidById?.toString() || '',
      splitType: expense.splitType || 'EQUAL',
      expenseDate: expense.expenseDate || '',
      customShares, memberShares,
    })
    setIsExpenseModalOpen(true)
  }

  // ── Open Settle Modal ────────────────────────────────
  const openSettleModal = (balance) => {
    setSettleTarget(balance)
    setSettleAmount(
      Math.abs(parseFloat(balance.amount)).toString())
    setIsSettleModalOpen(true)
  }

  // ── Custom share auto-fill ───────────────────────────
  const handleCustomShareChange = (userId, value) => {
    const members = group?.members || []
    const total = parseFloat(expenseForm.totalAmount) || 0
    const newShares = {
      ...expenseForm.customShares, [userId]: value
    }
    if (members.length === 2) {
      const otherId = members.find(
        m => m.userId !== userId)?.userId
      if (otherId !== undefined) {
        const entered = parseFloat(value) || 0
        const remaining = Math.round(
          (total - entered) * 100) / 100
        if (remaining >= 0) newShares[otherId] = remaining.toString()
      }
    }
    setExpenseForm({ ...expenseForm, customShares: newShares })
  }

  const getShareAmount = (userId) => {
    const totalShares = Object.values(expenseForm.memberShares)
      .reduce((sum, s) => sum + (parseInt(s) || 0), 0)
    const myShares = parseInt(
      expenseForm.memberShares[userId]) || 0
    const total = parseFloat(expenseForm.totalAmount) || 0
    if (totalShares === 0) return 0
    return Math.round(
      (total / totalShares) * myShares * 100) / 100
  }

  const getCustomTotal = () =>
    Object.values(expenseForm.customShares)
      .reduce((sum, v) => sum + (parseFloat(v) || 0), 0)

  const getSharesTotal = () =>
    Object.values(expenseForm.memberShares)
      .reduce((sum, v) => sum + (parseInt(v) || 0), 0)

  // ── Submit expense ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const total = parseFloat(expenseForm.totalAmount)

    if (expenseForm.splitType === 'CUSTOM') {
      const customTotal = getCustomTotal()
      if (Math.abs(customTotal - total) > 0.01) {
        toast.error(
          `Amounts ₹${customTotal.toFixed(2)} ≠ total ₹${total.toFixed(2)}`)
        return
      }
    }
    if (expenseForm.splitType === 'SHARES'
      && getSharesTotal() === 0) {
      toast.error('Please set shares for each person')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        groupId: parseInt(id),
        title: expenseForm.title,
        description: expenseForm.description,
        totalAmount: total,
        paidById: parseInt(expenseForm.paidById),
        splitType: expenseForm.splitType,
        expenseDate: expenseForm.expenseDate,
      }

      if (expenseForm.splitType === 'CUSTOM') {
        const customShares = {}
        group?.members?.forEach(m => {
          customShares[m.userId] =
            parseFloat(expenseForm.customShares[m.userId]) || 0
        })
        payload.customShares = customShares
      }

      if (expenseForm.splitType === 'SHARES') {
        const memberShares = {}
        Object.entries(expenseForm.memberShares).forEach(([k, v]) => {
          if (parseInt(v) > 0)
            memberShares[parseInt(k)] = parseInt(v)
        })
        payload.memberShares = memberShares
      }

      let res
      if (editingExpense) {
        res = await splitApi.updateExpense(editingExpense.id, payload)
        setExpenses(expenses.map(e =>
          e.id === editingExpense.id ? res.data : e))
        toast.success('Expense updated! ✅')
      } else {
        res = await splitApi.addExpense(payload)
        setExpenses([res.data, ...expenses])
        toast.success('Expense added! 💸')
      }

      await refreshAll()
      setIsExpenseModalOpen(false)
      setEditingExpense(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete expense ───────────────────────────────────
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm(
      'Delete this expense? Balances will recalculate.'))
      return
    setDeletingId(expenseId)
    try {
      await splitApi.deleteExpense(expenseId)
      setExpenses(expenses.filter(e => e.id !== expenseId))
      await refreshAll()
      toast.success('Expense deleted!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Partial Settle ───────────────────────────────────
  const handlePartialSettle = async (e) => {
    e.preventDefault()
    const amount = parseFloat(settleAmount)
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setSettling(true)
    try {
      const res = await splitApi.partialSettle(
        id, settleTarget.userId, amount)
      setBalances(res.data)
      await refreshAll()
      toast.success(`₹${amount} recorded! Balance updated ✅`)
      setIsSettleModalOpen(false)
      setSettleAmount('')
      setSettleTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setSettling(false)
    }
  }

  // ── Format date ──────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return (
    <Layout>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', height: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>
            👥
          </div>
          <p style={{ color: theme.textSecondary }}>
            Loading group...
          </p>
        </div>
      </div>
    </Layout>
  )

  const myBalance = parseFloat(balances?.netBalance || 0)
  const isPositive = myBalance >= 0

  return (
    <Layout>
      {/* Back */}
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
        background: `linear-gradient(135deg,
          ${group?.color || '#c44b8a'}20,
          ${group?.color || '#e8632a'}10)`,
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
              justifyContent: 'center', fontSize: '28px', flexShrink: 0
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
            onClick={openAddModal}
            style={{
              background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
              border: 'none', borderRadius: '12px',
              padding: '10px 18px', fontSize: '13px',
              fontWeight: '600', color: 'white',
              cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            + Add Expense
          </button>
        </div>

        {/* Members */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '8px', marginTop: '16px', flexWrap: 'wrap'
        }}>
          <p style={{
            color: theme.textSecondary, fontSize: '12px', margin: 0
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

      {/* Balance Cards — always 3 columns */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isMobile ? '8px' : '14px', marginBottom: '20px'
      }}>
        {[
          {
            label: 'You Owe',
            value: `₹${parseFloat(
              balances?.totalYouOwe || 0).toLocaleString('en-IN')}`,
            color: '#e8632a', bg: theme.redBg, border: theme.redBorder
          },
          {
            label: 'Owed to You',
            value: `₹${parseFloat(
              balances?.totalOwedToYou || 0).toLocaleString('en-IN')}`,
            color: theme.greenLight,
            bg: theme.greenBg, border: theme.greenBorder
          },
          {
            label: 'Net Balance',
            value: `${isPositive ? '+' : ''}₹${Math.abs(
              myBalance).toLocaleString('en-IN')}`,
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
              margin: '0 0 4px', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {lbl}
            </p>
            <p style={{
              color, fontSize: isMobile ? '14px' : '20px',
              fontWeight: '800', margin: 0, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── TABS — 3 tabs now ── */}
      <div style={{
        display: 'flex', gap: '0', marginBottom: '20px',
        borderBottom: `1px solid ${theme.border}`,
        overflowX: 'auto'
      }}>
        {[
          { id: 'expenses', label: '💸 Expenses',
            count: expenses.length },
          { id: 'balances', label: '⚖️ Balances',
            count: balances?.balances?.length || 0 },
          { id: 'history', label: '📋 History',
            count: history.length },
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
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center',
              gap: '6px', whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id
                  ? '#c44b8a' : theme.bgHover,
                color: activeTab === tab.id
                  ? 'white' : theme.textSecondary,
                borderRadius: '20px', padding: '1px 6px',
                fontSize: '10px', fontWeight: '700'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── EXPENSES TAB ── */}
      {activeTab === 'expenses' && (
        expenses.length === 0 ? (
          <div style={{
            ...card, textAlign: 'center', padding: '60px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              💸
            </div>
            <p style={{
              color: theme.textPrimary, fontSize: '16px',
              fontWeight: '600', margin: '0 0 16px'
            }}>
              No expenses yet!
            </p>
            <button
              onClick={openAddModal}
              style={{
                background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
                border: 'none', borderRadius: '12px',
                padding: '11px 24px', fontSize: '14px',
                fontWeight: '600', color: 'white', cursor: 'pointer'
              }}
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {expenses.map((expense, idx) => (
              <div key={expense.id} style={{
                padding: '16px 20px',
                borderBottom: idx < expenses.length - 1
                  ? `1px solid ${theme.border}` : 'none'
              }}>
                {/* Title + Amount + Actions */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px', gap: '8px'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: theme.textPrimary, fontSize: '14px',
                      fontWeight: '700', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {expense.title}
                    </p>
                    <p style={{
                      color: theme.textSecondary,
                      fontSize: '12px', margin: '2px 0 0'
                    }}>
                      {expense.splitType === 'EQUAL' ? '⚖️'
                        : expense.splitType === 'CUSTOM' ? '✏️'
                        : '📊'} {expense.splitType}
                      {' '}• {expense.expenseDate}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '8px', flexShrink: 0
                  }}>
                    <p style={{
                      color: theme.textPrimary, fontSize: '16px',
                      fontWeight: '800', margin: 0
                    }}>
                      ₹{parseFloat(expense.totalAmount)
                        .toLocaleString('en-IN')}
                    </p>
                    <button
                      onClick={() => openEditModal(expense)}
                      style={{
                        background: theme.bgInput,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px', padding: '6px 8px',
                        color: theme.textSecondary,
                        cursor: 'pointer', fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background =
                          'rgba(196,75,138,0.1)'
                        e.currentTarget.style.borderColor = '#c44b8a'
                        e.currentTarget.style.color = '#c44b8a'
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = theme.bgInput
                        e.currentTarget.style.borderColor = theme.border
                        e.currentTarget.style.color = theme.textSecondary
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      disabled={deletingId === expense.id}
                      style={{
                        background: theme.bgInput,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px', padding: '6px 8px',
                        color: theme.textSecondary,
                        cursor: deletingId === expense.id
                          ? 'not-allowed' : 'pointer',
                        fontSize: '14px', transition: 'all 0.2s',
                        opacity: deletingId === expense.id ? 0.5 : 1
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = theme.redBg
                        e.currentTarget.style.borderColor = theme.redBorder
                        e.currentTarget.style.color = theme.redLight
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = theme.bgInput
                        e.currentTarget.style.borderColor = theme.border
                        e.currentTarget.style.color = theme.textSecondary
                      }}
                    >
                      {deletingId === expense.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>

                {/* Share details */}
                {expense.splitType === 'CUSTOM' ? (
                  <div>
                    <p style={{
                      color: theme.textMuted, fontSize: '10px',
                      fontWeight: '700', margin: '0 0 5px',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      Who paid at spot:
                    </p>
                    <div style={{
                      display: 'flex', flexWrap: 'wrap',
                      gap: '6px', marginBottom: '8px'
                    }}>
                      {expense.shares?.map(share => (
                        <div key={share.userId + '_p'} style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          background: theme.bgInput,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '20px',
                          padding: '4px 10px', fontSize: '11px'
                        }}>
                          <span style={{
                            color: theme.textPrimary, fontWeight: '600'
                          }}>
                            {share.userName?.split(' ')[0]}
                          </span>
                          <span style={{ color: theme.textSecondary }}>
                            paid
                          </span>
                          <span style={{
                            color: '#7c3aed', fontWeight: '700'
                          }}>
                            ₹{parseFloat(share.paidAmount || 0)
                              .toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p style={{
                      color: theme.textMuted, fontSize: '10px',
                      fontWeight: '700', margin: '0 0 5px',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      Balance:
                    </p>
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '6px'
                    }}>
                      {expense.shares?.map(share => (
                        <div key={share.userId + '_o'} style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          background: share.settled
                            ? theme.greenBg : theme.redBg,
                          border: `1px solid ${share.settled
                            ? theme.greenBorder : theme.redBorder}`,
                          borderRadius: '20px',
                          padding: '4px 10px', fontSize: '11px'
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
                            {share.settled ? 'settled ✅'
                              : `owes ₹${parseFloat(share.shareAmount)
                                  .toLocaleString('en-IN')} ⏳`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '6px', marginBottom: '6px'
                    }}>
                      <span style={{
                        color: theme.textMuted, fontSize: '10px',
                        fontWeight: '700', textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Paid by:
                      </span>
                      <span style={{
                        color: '#c44b8a', fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {expense.paidByName} (₹{parseFloat(
                          expense.totalAmount).toLocaleString('en-IN')})
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '6px'
                    }}>
                      {expense.shares?.map(share => (
                        <div key={share.userId} style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          background: share.settled
                            ? theme.greenBg : theme.redBg,
                          border: `1px solid ${share.settled
                            ? theme.greenBorder : theme.redBorder}`,
                          borderRadius: '20px',
                          padding: '4px 10px', fontSize: '11px'
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
                          <span>{share.settled ? '✅' : '⏳'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── BALANCES TAB ── */}
      {activeTab === 'balances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!balances?.balances?.length ? (
            <div style={{
              ...card, textAlign: 'center', padding: '60px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                🎉
              </div>
              <p style={{
                color: theme.textPrimary, fontSize: '16px',
                fontWeight: '600', margin: '0 0 6px'
              }}>
                All settled up!
              </p>
              <p style={{
                color: theme.textSecondary, fontSize: '13px', margin: 0
              }}>
                No pending balances
              </p>
            </div>
          ) : (
            <>
              <div style={{
                background: `rgba(196,75,138,0.08)`,
                border: '1px solid rgba(196,75,138,0.2)',
                borderRadius: '12px', padding: '12px 16px'
              }}>
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '12px', margin: 0, lineHeight: '1.5'
                }}>
                  💡 Paid cash outside the app? Click{' '}
                  <strong style={{ color: '#c44b8a' }}>
                    Record Payment
                  </strong>{' '}
                  to update the balance.
                </p>
              </div>

              {balances.balances.map(balance => {
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
                    <div style={{ flex: 1, minWidth: '100px' }}>
                      <p style={{
                        color: theme.textPrimary, fontSize: '14px',
                        fontWeight: '600', margin: 0
                      }}>
                        {balance.userName}
                      </p>
                      <p style={{
                        color: owesYou ? theme.greenLight : '#e8632a',
                        fontSize: '14px', fontWeight: '700',
                        margin: '2px 0 0'
                      }}>
                        {owesYou
                          ? `Owes you ₹${Math.abs(amount)
                              .toLocaleString('en-IN')}`
                          : `You owe ₹${Math.abs(amount)
                              .toLocaleString('en-IN')}`}
                      </p>
                    </div>
                    <button
                      onClick={() => openSettleModal(balance)}
                      style={{
                        background: theme.bgCard,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '10px', padding: '9px 14px',
                        fontSize: '12px', fontWeight: '600',
                        color: theme.textSecondary,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.borderColor = '#c44b8a'
                        e.currentTarget.style.color = '#c44b8a'
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.borderColor = theme.border
                        e.currentTarget.style.color = theme.textSecondary
                      }}
                    >
                      💵 Record Payment
                    </button>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        history.length === 0 ? (
          <div style={{
            ...card, textAlign: 'center', padding: '60px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              📋
            </div>
            <p style={{
              color: theme.textPrimary, fontSize: '16px',
              fontWeight: '600', margin: '0 0 6px'
            }}>
              No history yet
            </p>
            <p style={{
              color: theme.textSecondary, fontSize: '13px', margin: 0
            }}>
              All expenses and payments will appear here
            </p>
          </div>
        ) : (
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              padding: '12px 20px',
              background: theme.bgInput,
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex', justifyContent: 'space-between'
            }}>
              <p style={{
                color: theme.textSecondary,
                fontSize: '12px', margin: 0, fontWeight: '600'
              }}>
                All transactions ({history.length})
              </p>
              <p style={{
                color: theme.textMuted, fontSize: '11px', margin: 0
              }}>
                Newest first
              </p>
            </div>

            {history.map((item, idx) => {
              const isSettlement = item.type === 'SETTLEMENT'
              return (
                <div key={item.type + item.id} style={{
                  display: 'flex', alignItems: 'center',
                  gap: '14px', padding: '14px 20px',
                  borderBottom: idx < history.length - 1
                    ? `1px solid ${theme.border}` : 'none',
                  transition: 'background 0.2s'
                }}
                  onMouseOver={e =>
                    e.currentTarget.style.background = theme.bgHover}
                  onMouseOut={e =>
                    e.currentTarget.style.background = 'transparent'}
                >
                  {/* Icon */}
                  <div style={{
                    width: '42px', height: '42px',
                    borderRadius: '12px', flexShrink: 0,
                    background: isSettlement
                      ? theme.greenBg
                      : `rgba(196,75,138,0.1)`,
                    border: `1px solid ${isSettlement
                      ? theme.greenBorder
                      : 'rgba(196,75,138,0.2)'}`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '20px'
                  }}>
                    {item.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: theme.textPrimary, fontSize: '13px',
                      fontWeight: '700', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.title}
                    </p>

                    {isSettlement ? (
                      <p style={{
                        color: theme.textSecondary,
                        fontSize: '12px', margin: '2px 0 0'
                      }}>
                        <span style={{
                          color: '#c44b8a', fontWeight: '600'
                        }}>
                          {item.fromName?.split(' ')[0]}
                        </span>
                        {' '}paid cash to{' '}
                        <span style={{
                          color: '#7c3aed', fontWeight: '600'
                        }}>
                          {item.toName?.split(' ')[0]}
                        </span>
                      </p>
                    ) : (
                      <p style={{
                        color: theme.textSecondary,
                        fontSize: '12px', margin: '2px 0 0'
                      }}>
                        Paid by{' '}
                        <span style={{
                          color: '#c44b8a', fontWeight: '600'
                        }}>
                          {item.fromName?.split(' ')[0]}
                        </span>
                        {item.splitType && (
                          <span style={{ color: theme.textMuted }}>
                            {' '}• {item.splitType === 'EQUAL' ? '⚖️'
                              : item.splitType === 'CUSTOM' ? '✏️' : '📊'}
                            {' '}{item.splitType}
                          </span>
                        )}
                      </p>
                    )}

                    <p style={{
                      color: theme.textMuted,
                      fontSize: '11px', margin: '2px 0 0'
                    }}>
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  {/* Amount + Type badge */}
                  <div style={{
                    textAlign: 'right', flexShrink: 0
                  }}>
                    <p style={{
                      color: isSettlement
                        ? theme.greenLight : theme.textPrimary,
                      fontSize: '15px', fontWeight: '800', margin: 0
                    }}>
                      {isSettlement ? '💵 ' : ''}
                      ₹{parseFloat(item.amount)
                        .toLocaleString('en-IN')}
                    </p>
                    <div style={{
                      display: 'inline-block',
                      background: isSettlement
                        ? theme.greenBg : theme.bgInput,
                      border: `1px solid ${isSettlement
                        ? theme.greenBorder : theme.border}`,
                      borderRadius: '20px', padding: '2px 8px',
                      fontSize: '10px', fontWeight: '600',
                      color: isSettlement
                        ? theme.greenLight : theme.textMuted,
                      marginTop: '4px'
                    }}>
                      {isSettlement ? 'Cash' : 'Expense'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ── ADD/EDIT EXPENSE MODAL ── */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false)
          setEditingExpense(null)
        }}
        title={editingExpense
          ? '✏️ Edit Expense' : '💸 Add Group Expense'}
      >
        <form onSubmit={handleSubmit}>
          {editingExpense && (
            <div style={{
              background: theme.yellowBg,
              border: `1px solid ${theme.yellowBorder}`,
              borderRadius: '10px', padding: '10px 14px',
              marginBottom: '16px'
            }}>
              <p style={{
                color: theme.yellowLight, fontSize: '12px', margin: 0
              }}>
                ⚠️ Editing will recalculate all balances.
              </p>
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Expense Title</label>
            <input
              type="text" required
              placeholder="e.g. Dinner, Parking, Rent"
              value={expenseForm.title}
              onChange={e => setExpenseForm({
                ...expenseForm, title: e.target.value
              })}
              style={input}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e =>
                e.target.style.borderColor = theme.inputBorder}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Description (optional)</label>
            <input
              type="text" placeholder="e.g. Monthly charges"
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
                ...expenseForm,
                totalAmount: e.target.value, customShares: {}
              })}
              style={input}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e =>
                e.target.style.borderColor = theme.inputBorder}
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
                  {m.userId === user?.id ? ' (You)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Date</label>
            <input
              type="date" required value={expenseForm.expenseDate}
              onChange={e => setExpenseForm({
                ...expenseForm, expenseDate: e.target.value
              })}
              style={input}
            />
          </div>

          {/* Split Type */}
          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Split Type</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {SPLIT_TYPES.map(type => (
                <button
                  key={type.id} type="button"
                  onClick={() => setExpenseForm({
                    ...expenseForm, splitType: type.id
                  })}
                  style={{
                    background: expenseForm.splitType === type.id
                      ? 'rgba(196,75,138,0.15)' : theme.bgInput,
                    border: expenseForm.splitType === type.id
                      ? '1px solid #c44b8a'
                      : `1px solid ${theme.border}`,
                    borderRadius: '10px', padding: '10px 6px',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: '18px' }}>{type.icon}</div>
                  <div style={{
                    color: expenseForm.splitType === type.id
                      ? '#c44b8a' : theme.textPrimary,
                    fontSize: '12px', fontWeight: '600',
                    margin: '2px 0 0'
                  }}>
                    {type.label}
                  </div>
                  <div style={{
                    color: theme.textMuted, fontSize: '10px'
                  }}>
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Equal preview */}
          {expenseForm.splitType === 'EQUAL'
            && expenseForm.totalAmount
            && group?.members?.length > 0 && (
            <div style={{
              background: theme.bgInput,
              border: `1px solid ${theme.border}`,
              borderRadius: '10px', padding: '12px', marginBottom: '16px'
            }}>
              <p style={{
                color: theme.textSecondary, fontSize: '12px',
                fontWeight: '600', margin: '0 0 8px'
              }}>
                Each person pays:
              </p>
              {group.members.map(m => (
                <div key={m.userId} style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    color: theme.textPrimary, fontSize: '12px'
                  }}>
                    {m.fullName?.split(' ')[0]}
                    {m.userId === user?.id ? ' (You)' : ''}
                  </span>
                  <span style={{
                    color: '#c44b8a', fontSize: '12px', fontWeight: '700'
                  }}>
                    ₹{(parseFloat(expenseForm.totalAmount) /
                      group.members.length).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Custom split */}
          {expenseForm.splitType === 'CUSTOM' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                background: `rgba(124,58,237,0.08)`,
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '10px', padding: '10px 12px',
                marginBottom: '12px'
              }}>
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '12px', margin: 0, lineHeight: '1.6'
                }}>
                  💡 Enter{' '}
                  <strong style={{ color: theme.textPrimary }}>
                    what each person actually paid
                  </strong>{' '}
                  at the spot. App auto-calculates who owes whom.
                </p>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <label style={label}>Amount paid by each</label>
                <span style={{
                  color: Math.abs(
                    getCustomTotal() -
                    (parseFloat(expenseForm.totalAmount) || 0)
                  ) < 0.01
                    ? theme.greenLight : '#e8632a',
                  fontSize: '11px', fontWeight: '700'
                }}>
                  ₹{getCustomTotal().toFixed(2)} /
                  ₹{parseFloat(expenseForm.totalAmount || 0).toFixed(2)}
                </span>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                {group?.members?.map(m => (
                  <div key={m.userId} style={{
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '13px',
                      fontWeight: '700', color: 'white'
                    }}>
                      {m.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <p style={{
                      color: theme.textPrimary, fontSize: '13px',
                      margin: 0, width: '80px', flexShrink: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', fontWeight: '500'
                    }}>
                      {m.fullName?.split(' ')[0]}
                    </p>
                    <input
                      type="number" min="0" step="0.01"
                      placeholder="0.00"
                      value={expenseForm.customShares[m.userId] || ''}
                      onChange={e => handleCustomShareChange(
                        m.userId, e.target.value)}
                      style={{ ...input, flex: 1 }}
                      onFocus={e =>
                        e.target.style.borderColor = '#c44b8a'}
                      onBlur={e =>
                        e.target.style.borderColor = theme.inputBorder}
                    />
                  </div>
                ))}
              </div>
              <p style={{
                color: theme.textMuted, fontSize: '11px', margin: '8px 0 0'
              }}>
                💡 2 members: enter one amount, other auto-fills
              </p>
            </div>
          )}

          {/* Shares split */}
          {expenseForm.splitType === 'SHARES' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                background: `rgba(196,75,138,0.08)`,
                border: '1px solid rgba(196,75,138,0.2)',
                borderRadius: '10px', padding: '10px 12px',
                marginBottom: '10px'
              }}>
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '12px', margin: 0, lineHeight: '1.5'
                }}>
                  💡 2 shares + 1 share = you pay 2/3,
                  friend pays 1/3 of total.
                </p>
              </div>
              <label style={label}>
                Shares per person{' '}
                {expenseForm.totalAmount && (
                  <span style={{
                    color: theme.textMuted, fontSize: '10px'
                  }}>
                    (₹{getSharesTotal() > 0
                      ? (parseFloat(expenseForm.totalAmount) /
                        getSharesTotal()).toFixed(2)
                      : '0'}/share)
                  </span>
                )}
              </label>
              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: '8px', marginTop: '8px'
              }}>
                {group?.members?.map((m, i) => (
                  <div key={m.userId} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px', background: theme.bgInput,
                    borderRadius: '10px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <div style={{
                      width: '28px', height: '28px',
                      borderRadius: '50%', flexShrink: 0,
                      background: `hsl(${(i * 60) % 360}, 60%, 50%)`,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '12px',
                      fontWeight: '700', color: 'white'
                    }}>
                      {m.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        color: theme.textPrimary, fontSize: '13px',
                        fontWeight: '600', margin: '0 0 2px'
                      }}>
                        {m.fullName?.split(' ')[0]}
                        {m.userId === user?.id ? ' (You)' : ''}
                      </p>
                      {expenseForm.totalAmount && (
                        <p style={{
                          color: '#c44b8a', fontSize: '11px',
                          margin: 0, fontWeight: '600'
                        }}>
                          = ₹{getShareAmount(m.userId).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <button type="button"
                        onClick={() => {
                          const curr = parseInt(
                            expenseForm.memberShares[m.userId]) || 0
                          if (curr > 0) setExpenseForm({
                            ...expenseForm, memberShares: {
                              ...expenseForm.memberShares,
                              [m.userId]: curr - 1
                            }
                          })
                        }}
                        style={{
                          width: '28px', height: '28px',
                          borderRadius: '8px', background: theme.bgCard,
                          border: `1px solid ${theme.border}`,
                          color: theme.textPrimary, fontSize: '16px',
                          cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontWeight: '700'
                        }}
                      >−</button>
                      <div style={{
                        width: '32px', textAlign: 'center',
                        color: '#c44b8a', fontSize: '16px', fontWeight: '800'
                      }}>
                        {expenseForm.memberShares[m.userId] || 0}
                      </div>
                      <button type="button"
                        onClick={() => {
                          const curr = parseInt(
                            expenseForm.memberShares[m.userId]) || 0
                          setExpenseForm({
                            ...expenseForm, memberShares: {
                              ...expenseForm.memberShares,
                              [m.userId]: curr + 1
                            }
                          })
                        }}
                        style={{
                          width: '28px', height: '28px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
                          border: 'none', color: 'white',
                          fontSize: '16px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: '700'
                        }}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
              {expenseForm.totalAmount && getSharesTotal() > 0 && (
                <div style={{
                  background: theme.greenBg,
                  border: `1px solid ${theme.greenBorder}`,
                  borderRadius: '10px', padding: '10px 12px',
                  marginTop: '10px'
                }}>
                  {group?.members?.map(m => (
                    <p key={m.userId} style={{
                      color: theme.textSecondary,
                      fontSize: '11px', margin: '2px 0'
                    }}>
                      {m.fullName?.split(' ')[0]}:{' '}
                      {expenseForm.memberShares[m.userId] || 0} shares
                      → ₹{getShareAmount(m.userId).toFixed(2)}
                    </p>
                  ))}
                </div>
              )}
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
            {submitting
              ? (editingExpense ? 'Updating...' : 'Adding...')
              : (editingExpense ? 'Update Expense ✅' : 'Add Expense 💸')}
          </button>
        </form>
      </Modal>

      {/* ── RECORD CASH PAYMENT MODAL ── */}
      <Modal
        isOpen={isSettleModalOpen}
        onClose={() => {
          setIsSettleModalOpen(false)
          setSettleTarget(null)
          setSettleAmount('')
        }}
        title="💵 Record Cash Payment"
      >
        {settleTarget && (
          <form onSubmit={handlePartialSettle}>
            {/* Who info */}
            <div style={{
              background: theme.bgInput,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px', padding: '16px', marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '12px', marginBottom: '12px'
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #c44b8a)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '16px',
                  fontWeight: '700', color: 'white'
                }}>
                  {settleTarget.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{
                    color: theme.textPrimary, fontSize: '14px',
                    fontWeight: '700', margin: 0
                  }}>
                    {settleTarget.userName}
                  </p>
                  <p style={{
                    color: parseFloat(settleTarget.amount) > 0
                      ? theme.greenLight : '#e8632a',
                    fontSize: '13px', fontWeight: '600', margin: '2px 0 0'
                  }}>
                    {parseFloat(settleTarget.amount) > 0
                      ? `Owes you ₹${Math.abs(parseFloat(
                          settleTarget.amount)).toLocaleString('en-IN')}`
                      : `You owe ₹${Math.abs(parseFloat(
                          settleTarget.amount)).toLocaleString('en-IN')}`}
                  </p>
                </div>
              </div>
              <div style={{
                background: `rgba(196,75,138,0.08)`,
                border: '1px solid rgba(196,75,138,0.15)',
                borderRadius: '8px', padding: '10px'
              }}>
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '12px', margin: 0, lineHeight: '1.5'
                }}>
                  💡 Enter amount paid/received in cash.
                  Partial payments are allowed — remaining
                  balance updates automatically.
                </p>
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Cash Amount (₹)</label>
              <input
                type="number" required min="0.01" step="0.01"
                placeholder="Enter amount"
                value={settleAmount}
                onChange={e => setSettleAmount(e.target.value)}
                style={{
                  ...input, fontSize: '18px', fontWeight: '700'
                }}
                onFocus={e => e.target.style.borderColor = '#c44b8a'}
                onBlur={e =>
                  e.target.style.borderColor = theme.inputBorder}
                autoFocus
              />
            </div>

            {/* Quick buttons */}
            <div style={{
              display: 'flex', gap: '8px',
              marginBottom: '20px', flexWrap: 'wrap'
            }}>
              {[25, 50, 75, 100].map(pct => {
                const totalOwed = Math.abs(
                  parseFloat(settleTarget.amount))
                const amt = Math.round(
                  totalOwed * pct / 100 * 100) / 100
                return (
                  <button
                    key={pct} type="button"
                    onClick={() => setSettleAmount(amt.toString())}
                    style={{
                      background: theme.bgInput,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px', padding: '6px 12px',
                      fontSize: '11px', fontWeight: '600',
                      color: theme.textSecondary, cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = '#c44b8a'
                      e.currentTarget.style.color = '#c44b8a'
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = theme.border
                      e.currentTarget.style.color = theme.textSecondary
                    }}
                  >
                    {pct}% (₹{amt})
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setSettleAmount(
                  Math.abs(parseFloat(settleTarget.amount)).toString())}
                style={{
                  background: theme.greenBg,
                  border: `1px solid ${theme.greenBorder}`,
                  borderRadius: '8px', padding: '6px 12px',
                  fontSize: '11px', fontWeight: '600',
                  color: theme.greenLight, cursor: 'pointer'
                }}
              >
                Full (₹{Math.abs(parseFloat(settleTarget.amount))
                  .toLocaleString('en-IN')})
              </button>
            </div>

            <button
              type="submit" disabled={settling}
              style={{
                width: '100%',
                background: settling
                  ? theme.border
                  : 'linear-gradient(135deg, #3ecf8e, #16a34a)',
                border: 'none', borderRadius: '12px',
                padding: '13px', fontSize: '14px',
                fontWeight: '700', color: 'white',
                cursor: settling ? 'not-allowed' : 'pointer'
              }}
            >
              {settling
                ? 'Recording...'
                : `Record ₹${parseFloat(settleAmount || 0)
                    .toLocaleString('en-IN')} Payment ✅`}
            </button>
          </form>
        )}
      </Modal>
    </Layout>
  )
}
