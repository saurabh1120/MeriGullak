import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import SearchBar from '../../components/common/SearchBar'
import { expenseApi } from '../../api/expenseApi'
import { accountApi } from '../../api/accountApi'
import { exportToCSV, formatExpensesForExport } from '../../utils/exportUtils'
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
  { value: 'SALARY', label: 'Salary', icon: '💰' },
  { value: 'INVESTMENT', label: 'Investment', icon: '📈' },
  { value: 'OTHERS', label: 'Others', icon: '📦' },
]

const initialForm = {
  accountId: '',
  amount: '',
  category: 'FOOD',
  expenseDate: new Date().toISOString().split('T')[0],
  description: '',
  merchant: '',
  transactionType: 'DEBIT'
}

export default function Expenses() {
  const { theme } = useTheme()
  const card = getCardStyle(theme)
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)

  const [expenses, setExpenses] = useState([])
  const [accounts, setAccounts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    let result = expenses
    if (filter !== 'ALL') {
      result = result.filter(e => e.transactionType === filter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(e =>
        e.description?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.accountName?.toLowerCase().includes(q) ||
        e.merchant?.toLowerCase().includes(q) ||
        e.amount?.toString().includes(q)
      )
    }
    setFiltered(result)
  }, [expenses, filter, searchQuery])

  const fetchAll = async () => {
    try {
      const [expRes, accRes] = await Promise.all([
        expenseApi.getAll(),
        accountApi.getAll()
      ])
      setExpenses(expRes.data)
      setFiltered(expRes.data)
      setAccounts(accRes.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setFetching(false)
    }
  }

  const handleSearch = (query) => setSearchQuery(query)

  const handleExport = () => {
    if (expenses.length === 0) {
      toast.error('No transactions to export!')
      return
    }
    exportToCSV(
      formatExpensesForExport(
        filtered.length > 0 ? filtered : expenses
      ),
      'merigullak_transactions'
    )
    toast.success('Exported successfully! 📥')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await expenseApi.add({
        ...form,
        amount: parseFloat(form.amount),
        accountId: parseInt(form.accountId)
      })
      setExpenses([res.data, ...expenses])
      toast.success('Transaction added!')
      setIsModalOpen(false)
      setForm(initialForm)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await expenseApi.delete(id)
      setExpenses(expenses.filter(e => e.id !== id))
      toast.success('Deleted!')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const totalDebit = expenses
    .filter(e => e.transactionType === 'DEBIT')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)

  const totalCredit = expenses
    .filter(e => e.transactionType === 'CREDIT')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)

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
            Transactions
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '14px', margin: '4px 0 0'
          }}>
            Track all your income & expenses
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            style={{
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px', padding: '11px 16px',
              fontSize: '13px', fontWeight: '600',
              color: theme.textSecondary, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => { setForm(initialForm); setIsModalOpen(true) }}
            style={{
              background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
              border: 'none', borderRadius: '12px',
              padding: '11px 20px', fontSize: '14px',
              fontWeight: '600', color: 'white', cursor: 'pointer'
            }}
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px', marginBottom: '20px'
      }}>
        {[
          { label: 'Total Expenses', value: totalDebit, color: '#e8632a' },
          { label: 'Total Income', value: totalCredit, color: theme.greenLight },
          {
            label: 'Net',
            value: totalCredit - totalDebit,
            color: totalCredit - totalDebit >= 0
              ? theme.greenLight : '#e8632a'
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
              color, fontSize: '18px', fontWeight: '700', margin: 0
            }}>
              ₹{Math.abs(value).toLocaleString('en-IN', {
                minimumFractionDigits: 2
              })}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '20px',
        flexWrap: 'wrap', alignItems: 'center'
      }}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by name, category, account..."
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'DEBIT', 'CREDIT'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f
                  ? 'linear-gradient(135deg, #c44b8a, #e8632a)'
                  : theme.bgCard,
                border: `1px solid ${filter === f
                  ? 'transparent' : theme.border}`,
                borderRadius: '10px', padding: '8px 14px',
                fontSize: '12px', fontWeight: '600',
                color: filter === f ? 'white' : theme.textSecondary,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {f === 'ALL' ? 'All'
                : f === 'DEBIT' ? '📤 Expense' : '📥 Income'}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      {fetching ? (
        <div style={{
          textAlign: 'center',
          color: theme.textSecondary, padding: '60px'
        }}>
          Loading transactions...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          ...card, textAlign: 'center', padding: '60px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {searchQuery ? '🔍' : '💸'}
          </div>
          <p style={{
            color: theme.textSecondary, fontSize: '15px', margin: 0
          }}>
            {searchQuery
              ? `No results for "${searchQuery}"`
              : 'No transactions yet. Add your first one!'}
          </p>
        </div>
      ) : (
        <div style={{
          ...card, padding: 0, overflow: 'hidden'
        }}>
          {/* Count bar */}
          <div style={{
            padding: '12px 20px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center',
            background: theme.bgInput
          }}>
            <p style={{
              color: theme.textSecondary,
              fontSize: '12px', margin: 0
            }}>
              {filtered.length} transaction
              {filtered.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            {filtered.length > 0 && (
              <button
                onClick={handleExport}
                style={{
                  background: 'transparent', border: 'none',
                  color: '#c44b8a', fontSize: '12px',
                  cursor: 'pointer', textDecoration: 'underline'
                }}
              >
                Export {filtered.length} results
              </button>
            )}
          </div>

          {/* Rows */}
          {filtered.map((expense, idx) => {
            const cat = CATEGORIES.find(c => c.value === expense.category)
            const isDebit = expense.transactionType === 'DEBIT'
            return (
              <div
                key={expense.id}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '14px 20px', gap: '14px',
                  borderBottom: idx < filtered.length - 1
                    ? `1px solid ${theme.border}` : 'none',
                  transition: 'background 0.2s',
                  background: 'transparent'
                }}
                onMouseOver={e =>
                  e.currentTarget.style.background = theme.bgHover}
                onMouseOut={e =>
                  e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '42px', height: '42px',
                  borderRadius: '12px', flexShrink: 0,
                  background: isDebit ? theme.redBg : theme.greenBg,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '20px'
                }}>
                  {cat?.icon || '📦'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    color: theme.textPrimary, fontSize: '14px',
                    fontWeight: '600', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {expense.description || cat?.label || expense.category}
                  </p>
                  <p style={{
                    color: theme.textSecondary,
                    fontSize: '12px', margin: '2px 0 0'
                  }}>
                    {expense.accountName} • {expense.expenseDate}
                    {expense.merchant && ` • ${expense.merchant}`}
                  </p>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{
                    color: isDebit ? '#e8632a' : theme.greenLight,
                    fontSize: '15px', fontWeight: '700', margin: 0
                  }}>
                    {isDebit ? '-' : '+'}
                    ₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                  </p>
                  <p style={{
                    color: theme.textSecondary,
                    fontSize: '11px', margin: '2px 0 0'
                  }}>
                    {cat?.label}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(expense.id)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: theme.textMuted, cursor: 'pointer',
                    fontSize: '16px', flexShrink: 0, padding: '4px'
                  }}
                >
                  🗑️
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Transaction"
      >
        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['DEBIT', 'CREDIT'].map(type => (
              <button
                key={type} type="button"
                onClick={() => setForm({ ...form, transactionType: type })}
                style={{
                  flex: 1,
                  background: form.transactionType === type
                    ? type === 'DEBIT' ? theme.redBg : theme.greenBg
                    : theme.bgInput,
                  border: form.transactionType === type
                    ? `1px solid ${type === 'DEBIT'
                      ? theme.redBorder : theme.greenBorder}`
                    : `1px solid ${theme.border}`,
                  borderRadius: '10px', padding: '10px',
                  color: form.transactionType === type
                    ? type === 'DEBIT' ? theme.redLight : theme.greenLight
                    : theme.textSecondary,
                  fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {type === 'DEBIT' ? '📤 Expense' : '📥 Income'}
              </button>
            ))}
          </div>

          {/* Account */}
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Account</label>
            <select
              required value={form.accountId}
              onChange={e => setForm({ ...form, accountId: e.target.value })}
              style={input}
            >
              <option value="">Select account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.accountName}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Amount (₹)</label>
            <input
              type="number" min="0.01" step="0.01" required
              placeholder="0.00" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              style={input}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />
          </div>

          {/* Category Grid */}
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

          {/* Date */}
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Date</label>
            <input
              type="date" required value={form.expenseDate}
              onChange={e => setForm({ ...form, expenseDate: e.target.value })}
              style={input}
            />
          </div>

          {/* Description + Merchant */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px', marginBottom: '20px'
          }}>
            <div>
              <label style={label}>Description</label>
              <input
                type="text" placeholder="e.g. Lunch"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={input}
              />
            </div>
            <div>
              <label style={label}>Merchant</label>
              <input
                type="text" placeholder="e.g. Zomato"
                value={form.merchant}
                onChange={e => setForm({ ...form, merchant: e.target.value })}
                style={input}
              />
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
            {loading ? 'Saving...' : 'Add Transaction'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}
