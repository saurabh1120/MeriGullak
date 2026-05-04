import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { budgetApi } from '../../api/budgetApi'
import useTheme from '../../hooks/useTheme'
import { getCardStyle, getInputStyle, getLabelStyle } from '../../utils/styles'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'FOOD', label: 'Food', icon: '🍔' },
  { value: 'SHOPPING', label: 'Shopping', icon: '🛍️' },
  { value: 'TRAVEL', label: 'Travel', icon: '✈️' },
  { value: 'FUEL', label: 'Fuel', icon: '⛽' },
  { value: 'BILLS', label: 'Bills', icon: '📄' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: '🎬' },
  { value: 'RENT', label: 'Rent', icon: '🏠' },
  { value: 'EMI', label: 'EMI', icon: '🏦' },
  { value: 'HEALTHCARE', label: 'Healthcare', icon: '💊' },
  { value: 'OTHERS', label: 'Others', icon: '📦' },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Budget() {
  const { theme } = useTheme()
  const card = getCardStyle(theme)
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)

  const now = new Date()
  const [budgets, setBudgets] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [form, setForm] = useState({
    category: 'FOOD',
    budgetAmount: '',
    month: now.getMonth() + 1,
    year: now.getFullYear()
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => { fetchBudgets() }, [selectedMonth, selectedYear])

  const fetchBudgets = async () => {
    setFetching(true)
    try {
      const res = await budgetApi.getByMonth(selectedMonth, selectedYear)
      setBudgets(res.data)
    } catch {
      toast.error('Failed to load budgets')
    } finally {
      setFetching(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await budgetApi.create({
        ...form,
        budgetAmount: parseFloat(form.budgetAmount),
        month: selectedMonth,
        year: selectedYear
      })
      setBudgets([...budgets, res.data])
      toast.success('Budget created!')
      setIsModalOpen(false)
      setForm({ ...form, budgetAmount: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create budget')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return
    try {
      await budgetApi.delete(id)
      setBudgets(budgets.filter(b => b.id !== id))
      toast.success('Budget deleted!')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const totalBudget = budgets.reduce(
    (s, b) => s + parseFloat(b.budgetAmount || 0), 0)
  const totalSpent = budgets.reduce(
    (s, b) => s + parseFloat(b.spentAmount || 0), 0)

  const getBarColor = (budget) => {
    if (budget.overBudget)
      return 'linear-gradient(90deg, #ef4444, #dc2626)'
    if (budget.nearLimit)
      return 'linear-gradient(90deg, #f59e0b, #d97706)'
    return 'linear-gradient(90deg, #3ecf8e, #16a34a)'
  }

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
            Budget Planner 📊
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '14px', margin: '4px 0 0'
          }}>
            Plan and track your monthly budgets
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
          + Add Budget
        </button>
      </div>

      {/* Month Selector */}
      <div style={{
        ...card, padding: '14px 20px', marginBottom: '20px',
        display: 'flex', alignItems: 'center',
        gap: '12px', flexWrap: 'wrap'
      }}>
        <span style={{
          color: theme.textSecondary, fontSize: '13px'
        }}>
          Viewing:
        </span>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(parseInt(e.target.value))}
          style={{ ...input, width: 'auto', padding: '7px 12px' }}
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
          style={{ ...input, width: 'auto', padding: '7px 12px' }}
        >
          {[2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <span style={{
          color: '#c44b8a', fontSize: '13px', fontWeight: '600'
        }}>
          {MONTHS[selectedMonth - 1]} {selectedYear}
        </span>
      </div>

      {/* Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        {[
          {
            label: 'Total Budget',
            value: `₹${totalBudget.toLocaleString('en-IN')}`,
            color: '#c44b8a'
          },
          {
            label: 'Total Spent',
            value: `₹${totalSpent.toLocaleString('en-IN')}`,
            color: '#e8632a'
          },
          {
            label: 'Remaining',
            value: `₹${Math.max(0, totalBudget - totalSpent)
              .toLocaleString('en-IN')}`,
            color: theme.greenLight
          },
          {
            label: 'Categories',
            value: budgets.length,
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
              color, fontSize: '20px', fontWeight: '700', margin: 0
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Budget List */}
      {fetching ? (
        <div style={{
          textAlign: 'center',
          color: theme.textSecondary, padding: '60px'
        }}>
          Loading budgets...
        </div>
      ) : budgets.length === 0 ? (
        <div style={{
          ...card, textAlign: 'center', padding: '60px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <p style={{
            color: theme.textSecondary, fontSize: '15px', margin: 0
          }}>
            No budgets for this month. Add your first budget!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          {budgets.map(budget => {
            const cat = CATEGORIES.find(c => c.value === budget.category)
            const progress = Math.min(budget.usagePercentage, 100)
            return (
              <div key={budget.id} style={{ ...card }}>
                {/* Alert */}
                {budget.alertMessage && (
                  <div style={{
                    background: budget.overBudget
                      ? theme.redBg : theme.yellowBg,
                    border: `1px solid ${budget.overBudget
                      ? theme.redBorder : theme.yellowBorder}`,
                    borderRadius: '8px', padding: '8px 12px',
                    marginBottom: '14px', fontSize: '12px',
                    color: budget.overBudget
                      ? theme.redLight : theme.yellowLight
                  }}>
                    {budget.alertMessage}
                  </div>
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px'
                }}>
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '12px',
                    background: theme.bgInput,
                    border: `1px solid ${theme.border}`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '22px',
                    flexShrink: 0
                  }}>
                    {cat?.icon || '📦'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between', marginBottom: '8px'
                    }}>
                      <div>
                        <p style={{
                          color: theme.textPrimary,
                          fontWeight: '600', fontSize: '14px', margin: 0
                        }}>
                          {cat?.label || budget.category}
                        </p>
                        <p style={{
                          color: theme.textSecondary,
                          fontSize: '12px', margin: '2px 0 0'
                        }}>
                          ₹{parseFloat(budget.spentAmount)
                            .toLocaleString('en-IN')} spent of ₹
                          {parseFloat(budget.budgetAmount)
                            .toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                        <span style={{
                          color: budget.overBudget
                            ? theme.redLight
                            : budget.nearLimit
                              ? theme.yellowLight
                              : theme.greenLight,
                          fontSize: '14px', fontWeight: '700'
                        }}>
                          {budget.usagePercentage.toFixed(1)}%
                        </span>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          style={{
                            background: 'transparent', border: 'none',
                            color: theme.textMuted, cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                      background: theme.bgInput,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '10px', height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', width: `${progress}%`,
                        background: getBarColor(budget),
                        borderRadius: '10px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <p style={{
                      color: theme.textMuted,
                      fontSize: '11px', margin: '6px 0 0'
                    }}>
                      ₹{parseFloat(budget.remainingAmount)
                        .toLocaleString('en-IN')} remaining
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Budget 📊"
      >
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Category</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px'
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value} type="button"
                  onClick={() => setForm({ ...form, category: cat.value })}
                  style={{
                    background: form.category === cat.value
                      ? theme.bgAccent : theme.bgInput,
                    border: form.category === cat.value
                      ? `1px solid #c44b8a`
                      : `1px solid ${theme.border}`,
                    borderRadius: '8px', padding: '8px 4px',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: '18px' }}>{cat.icon}</div>
                  <div style={{
                    fontSize: '9px', marginTop: '2px',
                    color: form.category === cat.value
                      ? '#c44b8a' : theme.textSecondary
                  }}>
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={label}>
              Budget Amount (₹) for {MONTHS[selectedMonth - 1]} {selectedYear}
            </label>
            <input
              type="number" required min="1"
              placeholder="e.g. 5000"
              value={form.budgetAmount}
              onChange={e => setForm({ ...form, budgetAmount: e.target.value })}
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
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Budget 📊'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}
