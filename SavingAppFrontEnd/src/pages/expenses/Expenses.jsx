import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { expenseApi } from '../../api/expenseApi'
import { accountApi } from '../../api/accountApi'
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
  const [expenses, setExpenses] = useState([])
  const [accounts, setAccounts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [expRes, accRes] = await Promise.all([
        expenseApi.getAll(),
        accountApi.getAll()
      ])
      setExpenses(expRes.data)
      setAccounts(accRes.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setFetching(false)
    }
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
      toast.error(err.response?.data?.error || 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await expenseApi.delete(id)
      setExpenses(expenses.filter(e => e.id !== id))
      toast.success('Transaction deleted!')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = filter === 'ALL' ? expenses
    : expenses.filter(e => e.transactionType === filter)

  const totalDebit = expenses
    .filter(e => e.transactionType === 'DEBIT')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)

  const totalCredit = expenses
    .filter(e => e.transactionType === 'CREDIT')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#f0eeff', fontSize: '24px', fontWeight: '700', margin: 0 }}>
            Transactions
          </h1>
          <p style={{ color: '#7a7390', fontSize: '14px', margin: '4px 0 0' }}>
            Track all your income & expenses
          </p>
        </div>
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

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Expenses', value: totalDebit, color: '#e8632a' },
          { label: 'Total Income', value: totalCredit, color: '#3ecf8e' },
          { label: 'Net Balance', value: totalCredit - totalDebit, color: totalCredit - totalDebit >= 0 ? '#3ecf8e' : '#e8632a' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#1c1828', border: '0.5px solid #2a2535',
            borderRadius: '14px', padding: '18px'
          }}>
            <p style={{ color: '#7a7390', fontSize: '12px', margin: '0 0 6px' }}>{label}</p>
            <p style={{ color, fontSize: '22px', fontWeight: '700', margin: 0 }}>
              ₹{Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['ALL', 'DEBIT', 'CREDIT'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f
                ? 'linear-gradient(135deg, #c44b8a, #e8632a)'
                : '#1c1828',
              border: '0.5px solid #2a2535',
              borderRadius: '10px', padding: '8px 18px',
              fontSize: '13px', fontWeight: '600',
              color: filter === f ? 'white' : '#7a7390',
              cursor: 'pointer'
            }}
          >
            {f === 'ALL' ? 'All' : f === 'DEBIT' ? '📤 Expenses' : '📥 Income'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {fetching ? (
        <div style={{ textAlign: 'center', color: '#7a7390', padding: '60px' }}>
          Loading transactions...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: '#1c1828', borderRadius: '16px',
          border: '0.5px solid #2a2535'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
          <p style={{ color: '#7a7390', fontSize: '15px', margin: 0 }}>
            No transactions yet. Add your first one!
          </p>
        </div>
      ) : (
        <div style={{
          background: '#1c1828', border: '0.5px solid #2a2535',
          borderRadius: '16px', overflow: 'hidden'
        }}>
          {filtered.map((expense, idx) => {
            const cat = CATEGORIES.find(c => c.value === expense.category)
            const isDebit = expense.transactionType === 'DEBIT'
            return (
              <div key={expense.id} style={{
                display: 'flex', alignItems: 'center',
                padding: '16px 20px', gap: '14px',
                borderBottom: idx < filtered.length - 1 ? '0.5px solid #2a2535' : 'none',
                transition: 'background 0.2s'
              }}
                onMouseOver={e => e.currentTarget.style.background = '#13111a'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: isDebit ? 'rgba(232,99,42,0.15)' : 'rgba(62,207,142,0.15)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '20px',
                  flexShrink: 0
                }}>
                  {cat?.icon || '📦'}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ color: '#f0eeff', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                    {expense.description || cat?.label || expense.category}
                  </p>
                  <p style={{ color: '#7a7390', fontSize: '12px', margin: '2px 0 0' }}>
                    {expense.accountName} • {expense.expenseDate}
                    {expense.merchant && ` • ${expense.merchant}`}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    color: isDebit ? '#e8632a' : '#3ecf8e',
                    fontSize: '16px', fontWeight: '700', margin: 0
                  }}>
                    {isDebit ? '-' : '+'}₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                  </p>
                  <p style={{ color: '#7a7390', fontSize: '11px', margin: '2px 0 0' }}>
                    {cat?.label}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(expense.id)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: '#4a4560', cursor: 'pointer',
                    fontSize: '16px', padding: '4px'
                  }}
                >🗑️</button>
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
          {/* Transaction Type Toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['DEBIT', 'CREDIT'].map(type => (
              <button
                key={type} type="button"
                onClick={() => setForm({ ...form, transactionType: type })}
                style={{
                  flex: 1,
                  background: form.transactionType === type
                    ? type === 'DEBIT'
                      ? 'rgba(232,99,42,0.2)'
                      : 'rgba(62,207,142,0.2)'
                    : '#13111a',
                  border: form.transactionType === type
                    ? `1px solid ${type === 'DEBIT' ? '#e8632a' : '#3ecf8e'}`
                    : '0.5px solid #2a2535',
                  borderRadius: '10px', padding: '10px',
                  color: form.transactionType === type
                    ? type === 'DEBIT' ? '#e8632a' : '#3ecf8e'
                    : '#7a7390',
                  fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {type === 'DEBIT' ? '📤 Expense' : '📥 Income'}
              </button>
            ))}
          </div>

          {/* Account */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Account
            </label>
            <select
              required value={form.accountId}
              onChange={e => setForm({ ...form, accountId: e.target.value })}
              style={{
                width: '100%', background: '#13111a',
                border: '0.5px solid #2a2535', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px',
                color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
              }}
            >
              <option value="">Select account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.accountName}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Amount (₹)
            </label>
            <input
              type="number" min="0.01" step="0.01" required
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
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

          {/* Category */}
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

          {/* Date */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Date
            </label>
            <input
              type="date" required
              value={form.expenseDate}
              onChange={e => setForm({ ...form, expenseDate: e.target.value })}
              style={{
                width: '100%', background: '#13111a',
                border: '0.5px solid #2a2535', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px',
                color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Description & Merchant */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
                Description
              </label>
              <input
                type="text" placeholder="e.g. Lunch"
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
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
                Merchant
              </label>
              <input
                type="text" placeholder="e.g. Zomato"
                value={form.merchant}
                onChange={e => setForm({ ...form, merchant: e.target.value })}
                style={{
                  width: '100%', background: '#13111a',
                  border: '0.5px solid #2a2535', borderRadius: '10px',
                  padding: '11px 14px', fontSize: '13px',
                  color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#2a2535' : 'linear-gradient(135deg, #c44b8a, #e8632a)',
              border: 'none', borderRadius: '12px',
              padding: '13px', fontSize: '14px',
              fontWeight: '700', color: 'white', cursor: 'pointer'
            }}
          >
            {loading ? 'Saving...' : 'Add Transaction'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}