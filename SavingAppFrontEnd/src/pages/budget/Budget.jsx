import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { budgetApi } from '../../api/budgetApi'
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
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
]

export default function Budget() {
  const now = new Date()
  const [budgets, setBudgets] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [form, setForm] = useState({
    category: 'FOOD', budgetAmount: '',
    month: now.getMonth() + 1, year: now.getFullYear()
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchBudgets()
  }, [selectedMonth, selectedYear])

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
    (sum, b) => sum + parseFloat(b.budgetAmount || 0), 0)
  const totalSpent = budgets.reduce(
    (sum, b) => sum + parseFloat(b.spentAmount || 0), 0)

  const getProgressColor = (budget) => {
    if (budget.overBudget) return '#ef4444'
    if (budget.nearLimit) return '#f59e0b'
    return '#3ecf8e'
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#f0eeff', fontSize: '24px', fontWeight: '700', margin: 0 }}>
            Budget Planner 📊
          </h1>
          <p style={{ color: '#7a7390', fontSize: '14px', margin: '4px 0 0' }}>
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
        background: '#1c1828', border: '0.5px solid #2a2535',
        borderRadius: '14px', padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '16px',
        flexWrap: 'wrap'
      }}>
        <span style={{ color: '#7a7390', fontSize: '13px' }}>Viewing:</span>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(parseInt(e.target.value))}
          style={{
            background: '#13111a', border: '0.5px solid #2a2535',
            borderRadius: '8px', padding: '8px 12px',
            color: '#c9c4e8', fontSize: '13px', outline: 'none'
          }}
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
          style={{
            background: '#13111a', border: '0.5px solid #2a2535',
            borderRadius: '8px', padding: '8px 12px',
            color: '#c9c4e8', fontSize: '13px', outline: 'none'
          }}
        >
          {[2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <span style={{ color: '#7a7390', fontSize: '13px' }}>
          {MONTHS[selectedMonth - 1]} {selectedYear}
        </span>
      </div>

      {/* Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        {[
          { label: 'Total Budget', value: `₹${totalBudget.toLocaleString('en-IN')}`, color: '#c44b8a' },
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, color: '#e8632a' },
          { label: 'Remaining', value: `₹${Math.max(0, totalBudget - totalSpent).toLocaleString('en-IN')}`, color: '#3ecf8e' },
          { label: 'Categories', value: budgets.length, color: '#7c3aed' },
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

      {/* Budget List */}
      {fetching ? (
        <div style={{ textAlign: 'center', color: '#7a7390', padding: '60px' }}>
          Loading budgets...
        </div>
      ) : budgets.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: '#1c1828', borderRadius: '16px',
          border: '0.5px solid #2a2535'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <p style={{ color: '#7a7390', fontSize: '15px', margin: 0 }}>
            No budgets for this month. Add your first budget!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {budgets.map(budget => {
            const cat = CATEGORIES.find(c => c.value === budget.category)
            const progress = Math.min(budget.usagePercentage, 100)
            const progressColor = getProgressColor(budget)
            return (
              <div key={budget.id} style={{
                background: '#1c1828', border: '0.5px solid #2a2535',
                borderRadius: '16px', padding: '20px'
              }}>
                {/* Alert */}
                {budget.alertMessage && (
                  <div style={{
                    background: budget.overBudget
                      ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    border: `0.5px solid ${budget.overBudget ? '#ef4444' : '#f59e0b'}`,
                    borderRadius: '8px', padding: '8px 12px',
                    marginBottom: '14px', fontSize: '12px',
                    color: budget.overBudget ? '#ef4444' : '#f59e0b'
                  }}>
                    {budget.alertMessage}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: '#13111a', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', flexShrink: 0
                  }}>
                    {cat?.icon || '📦'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <p style={{ color: '#f0eeff', fontWeight: '600', fontSize: '14px', margin: 0 }}>
                          {cat?.label || budget.category}
                        </p>
                        <p style={{ color: '#7a7390', fontSize: '12px', margin: '2px 0 0' }}>
                          ₹{parseFloat(budget.spentAmount).toLocaleString('en-IN')} spent of
                          ₹{parseFloat(budget.budgetAmount).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          color: progressColor,
                          fontSize: '14px', fontWeight: '700'
                        }}>
                          {budget.usagePercentage.toFixed(1)}%
                        </span>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          style={{
                            background: 'transparent', border: 'none',
                            color: '#4a4560', cursor: 'pointer', fontSize: '16px'
                          }}
                        >🗑️</button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                      background: '#13111a', borderRadius: '10px',
                      height: '8px', overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: budget.overBudget
                          ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                          : budget.nearLimit
                            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                            : 'linear-gradient(90deg, #3ecf8e, #20b070)',
                        borderRadius: '10px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>

                    <p style={{ color: '#4a4560', fontSize: '11px', margin: '6px 0 0' }}>
                      ₹{parseFloat(budget.remainingAmount).toLocaleString('en-IN')} remaining
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
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '8px' }}>
              Category
            </label>
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
                      ? 'rgba(196,75,138,0.2)' : '#13111a',
                    border: form.category === cat.value
                      ? '1px solid #c44b8a' : '0.5px solid #2a2535',
                    borderRadius: '8px', padding: '8px 4px',
                    cursor: 'pointer', textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '18px' }}>{cat.icon}</div>
                  <div style={{
                    fontSize: '9px', marginTop: '2px',
                    color: form.category === cat.value ? '#c44b8a' : '#7a7390'
                  }}>
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Budget Amount (₹) for {MONTHS[selectedMonth - 1]} {selectedYear}
            </label>
            <input
              type="number" required min="1"
              placeholder="e.g. 5000"
              value={form.budgetAmount}
              onChange={e => setForm({ ...form, budgetAmount: e.target.value })}
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
            {loading ? 'Creating...' : 'Create Budget 📊'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}