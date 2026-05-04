import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { accountApi } from '../../api/accountApi'
import useAccountStore from '../../store/accountStore'
import toast from 'react-hot-toast'

const ACCOUNT_TYPES = [
  { value: 'SAVINGS_ACCOUNT', label: 'Savings Account', icon: '🏦' },
  { value: 'CURRENT_ACCOUNT', label: 'Current Account', icon: '🏢' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: '💳' },
  { value: 'UPI_WALLET', label: 'UPI Wallet', icon: '📱' },
  { value: 'CASH_WALLET', label: 'Cash Wallet', icon: '💵' },
]

const COLORS = ['#c44b8a', '#e8632a', '#2d3a8c', '#0f6e56', '#7c3aed', '#e8a020']

const initialForm = {
  accountName: '', accountType: 'SAVINGS_ACCOUNT',
  balance: '', bankName: '', accountNumber: '',
  color: '#c44b8a', icon: '🏦'
}

export default function Accounts() {
  const { accounts, setAccounts, addAccount, updateAccount, removeAccount } = useAccountStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editAccount, setEditAccount] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await accountApi.getAll()
      setAccounts(res.data)
    } catch {
      toast.error('Failed to load accounts')
    } finally {
      setFetching(false)
    }
  }

  const openAddModal = () => {
    setEditAccount(null)
    setForm(initialForm)
    setIsModalOpen(true)
  }

  const openEditModal = (account) => {
    setEditAccount(account)
    setForm({
      accountName: account.accountName,
      accountType: account.accountType,
      balance: account.balance,
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      color: account.color || '#c44b8a',
      icon: account.icon || '🏦'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editAccount) {
        const res = await accountApi.update(editAccount.id, form)
        updateAccount(res.data)
        toast.success('Account updated!')
      } else {
        const res = await accountApi.create({ ...form, balance: parseFloat(form.balance) })
        addAccount(res.data)
        toast.success('Account created!')
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return
    try {
      await accountApi.delete(id)
      removeAccount(id)
      toast.success('Account deleted!')
    } catch {
      toast.error('Failed to delete account')
    }
  }

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#f0eeff', fontSize: '24px', fontWeight: '700', margin: 0 }}>
            My Accounts
          </h1>
          <p style={{ color: '#7a7390', fontSize: '14px', margin: '4px 0 0' }}>
            Manage all your financial accounts
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
            border: 'none', borderRadius: '12px',
            padding: '11px 20px', fontSize: '14px',
            fontWeight: '600', color: 'white', cursor: 'pointer'
          }}
        >
          + Add Account
        </button>
      </div>

      {/* Total Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(196,75,138,0.15), rgba(232,99,42,0.15))',
        border: '0.5px solid rgba(196,75,138,0.3)',
        borderRadius: '16px', padding: '24px',
        marginBottom: '24px'
      }}>
        <p style={{ color: '#7a7390', fontSize: '13px', margin: '0 0 6px' }}>
          Total Balance Across All Accounts
        </p>
        <h2 style={{ color: '#f0eeff', fontSize: '36px', fontWeight: '800', margin: 0 }}>
          ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </h2>
        <p style={{ color: '#7a7390', fontSize: '12px', margin: '8px 0 0' }}>
          {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
        </p>
      </div>

      {/* Accounts Grid */}
      {fetching ? (
        <div style={{ textAlign: 'center', color: '#7a7390', padding: '60px' }}>
          Loading accounts...
        </div>
      ) : accounts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: '#1c1828', borderRadius: '16px',
          border: '0.5px solid #2a2535'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏦</div>
          <p style={{ color: '#7a7390', fontSize: '15px', margin: 0 }}>
            No accounts yet. Add your first account!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {accounts.map((account) => (
            <div key={account.id} style={{
              background: '#1c1828',
              border: `0.5px solid ${account.color || '#2a2535'}40`,
              borderRadius: '16px', padding: '20px',
              borderTop: `3px solid ${account.color || '#c44b8a'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${account.color || '#c44b8a'}20`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '20px'
                  }}>
                    {ACCOUNT_TYPES.find(t => t.value === account.accountType)?.icon || '🏦'}
                  </div>
                  <div>
                    <p style={{ color: '#f0eeff', fontWeight: '600', fontSize: '14px', margin: 0 }}>
                      {account.accountName}
                    </p>
                    <p style={{ color: '#7a7390', fontSize: '11px', margin: '2px 0 0' }}>
                      {ACCOUNT_TYPES.find(t => t.value === account.accountType)?.label}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => openEditModal(account)} style={{
                    background: '#2a2535', border: 'none',
                    borderRadius: '8px', padding: '6px 10px',
                    color: '#7a7390', cursor: 'pointer', fontSize: '12px'
                  }}>✏️</button>
                  <button onClick={() => handleDelete(account.id)} style={{
                    background: '#2a2535', border: 'none',
                    borderRadius: '8px', padding: '6px 10px',
                    color: '#7a7390', cursor: 'pointer', fontSize: '12px'
                  }}>🗑️</button>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <p style={{ color: '#7a7390', fontSize: '11px', margin: '0 0 3px' }}>Balance</p>
                <p style={{ color: '#f0eeff', fontSize: '22px', fontWeight: '700', margin: 0 }}>
                  ₹{parseFloat(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  flex: 1, background: '#13111a',
                  borderRadius: '8px', padding: '10px'
                }}>
                  <p style={{ color: '#3ecf8e', fontSize: '10px', margin: '0 0 2px' }}>Income</p>
                  <p style={{ color: '#f0eeff', fontSize: '13px', fontWeight: '600', margin: 0 }}>
                    ₹{parseFloat(account.totalIncome || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div style={{
                  flex: 1, background: '#13111a',
                  borderRadius: '8px', padding: '10px'
                }}>
                  <p style={{ color: '#e8632a', fontSize: '10px', margin: '0 0 2px' }}>Expense</p>
                  <p style={{ color: '#f0eeff', fontSize: '13px', fontWeight: '600', margin: 0 }}>
                    ₹{parseFloat(account.totalExpense || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {account.bankName && (
                <p style={{ color: '#4a4560', fontSize: '11px', margin: '10px 0 0' }}>
                  {account.bankName}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editAccount ? 'Edit Account' : 'Add New Account'}
      >
        <form onSubmit={handleSubmit}>
          {/* Account Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Account Name
            </label>
            <input
              type="text" required
              placeholder="e.g. SBI Savings Account"
              value={form.accountName}
              onChange={e => setForm({ ...form, accountName: e.target.value })}
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

          {/* Account Type */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Account Type
            </label>
            <select
              value={form.accountType}
              onChange={e => setForm({ ...form, accountType: e.target.value })}
              style={{
                width: '100%', background: '#13111a',
                border: '0.5px solid #2a2535', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px',
                color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
              }}
            >
              {ACCOUNT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>

          {/* Balance */}
          {!editAccount && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
                Opening Balance (₹)
              </label>
              <input
                type="number" min="0" required
                placeholder="0.00"
                value={form.balance}
                onChange={e => setForm({ ...form, balance: e.target.value })}
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
          )}

          {/* Bank Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Bank / Provider Name (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. State Bank of India"
              value={form.bankName}
              onChange={e => setForm({ ...form, bankName: e.target.value })}
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
              background: loading ? '#2a2535' : 'linear-gradient(135deg, #c44b8a, #e8632a)',
              border: 'none', borderRadius: '12px',
              padding: '13px', fontSize: '14px',
              fontWeight: '700', color: 'white', cursor: 'pointer'
            }}
          >
            {loading ? 'Saving...' : editAccount ? 'Update Account' : 'Add Account'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}