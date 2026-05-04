import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { transferApi } from '../../api/transferApi'
import { accountApi } from '../../api/accountApi'
import useTheme from '../../hooks/useTheme'
import { getCardStyle, getInputStyle, getLabelStyle } from '../../utils/styles'
import toast from 'react-hot-toast'

export default function Transfer() {
  const { theme, isDark } = useTheme()
  const card = getCardStyle(theme)
  const input = getInputStyle(theme)
  const label = getLabelStyle(theme)

  const [transfers, setTransfers] = useState([])
  const [accounts, setAccounts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    fromAccountId: '', toAccountId: '',
    amount: '', note: '',
    transferDate: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [trRes, accRes] = await Promise.all([
        transferApi.getAll(),
        accountApi.getAll()
      ])
      setTransfers(trRes.data)
      setAccounts(accRes.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.fromAccountId === form.toAccountId) {
      toast.error('Cannot transfer to same account!')
      return
    }
    setLoading(true)
    try {
      await transferApi.create({
        ...form,
        fromAccountId: parseInt(form.fromAccountId),
        toAccountId: parseInt(form.toAccountId),
        amount: parseFloat(form.amount)
      })
      toast.success('Transfer successful! 🎉')
      setIsModalOpen(false)
      setForm({
        fromAccountId: '', toAccountId: '',
        amount: '', note: '',
        transferDate: new Date().toISOString().split('T')[0]
      })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  const getAccountName = (accountObj) =>
    accountObj?.accountName || 'Unknown'

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
            Transfers 🔄
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '14px', margin: '4px 0 0'
          }}>
            Move money between your accounts
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: theme.accentGradient,
            border: 'none', borderRadius: '12px',
            padding: '11px 20px', fontSize: '14px',
            fontWeight: '600', color: 'white', cursor: 'pointer'
          }}
        >
          + New Transfer
        </button>
      </div>

      {/* Account Cards */}
      <div style={{
        display: 'flex', gap: '12px',
        marginBottom: '24px', overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {accounts.map(acc => (
          <div key={acc.id} style={{
            ...card,
            minWidth: '160px', flexShrink: 0,
            borderTop: `3px solid ${acc.color || '#c44b8a'}`,
            padding: '14px 16px'
          }}>
            <p style={{
              color: theme.textSecondary,
              fontSize: '11px', margin: '0 0 4px'
            }}>
              {acc.accountName}
            </p>
            <p style={{
              color: theme.textPrimary,
              fontSize: '16px', fontWeight: '700', margin: 0
            }}>
              ₹{parseFloat(acc.balance).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Transfer History */}
      {fetching ? (
        <div style={{
          textAlign: 'center',
          color: theme.textSecondary, padding: '60px'
        }}>
          Loading transfers...
        </div>
      ) : transfers.length === 0 ? (
        <div style={{
          ...card, textAlign: 'center', padding: '60px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <p style={{ color: theme.textSecondary, fontSize: '15px', margin: 0 }}>
            No transfers yet!
          </p>
        </div>
      ) : (
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.border}`
          }}>
            <p style={{
              color: theme.textSecondary,
              fontSize: '13px', margin: 0, fontWeight: '600'
            }}>
              Transfer History ({transfers.length})
            </p>
          </div>
          {transfers.map((transfer, idx) => (
            <div
              key={transfer.id}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '16px 20px', gap: '14px',
                borderBottom: idx < transfers.length - 1
                  ? `1px solid ${theme.border}` : 'none',
                transition: 'background 0.2s'
              }}
              onMouseOver={e =>
                e.currentTarget.style.background = theme.bgHover}
              onMouseOut={e =>
                e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '42px', height: '42px',
                borderRadius: '12px', flexShrink: 0,
                background: theme.purpleBg,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px'
              }}>
                🔄
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  color: theme.textPrimary,
                  fontSize: '14px', fontWeight: '600', margin: 0
                }}>
                  {getAccountName(transfer.fromAccount)}
                  <span style={{
                    color: theme.textMuted, margin: '0 8px'
                  }}>→</span>
                  {getAccountName(transfer.toAccount)}
                </p>
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '12px', margin: '2px 0 0'
                }}>
                  {transfer.transferDate}
                  {transfer.note && ` • ${transfer.note}`}
                </p>
              </div>

              <p style={{
                color: theme.purple,
                fontSize: '16px', fontWeight: '700', margin: 0
              }}>
                ₹{parseFloat(transfer.amount).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Transfer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Transfer 🔄"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>From Account</label>
            <select
              required value={form.fromAccountId}
              onChange={e => setForm({ ...form, fromAccountId: e.target.value })}
              style={input}
            >
              <option value="">Select source account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.accountName} — ₹{parseFloat(a.balance).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>To Account</label>
            <select
              required value={form.toAccountId}
              onChange={e => setForm({ ...form, toAccountId: e.target.value })}
              style={input}
            >
              <option value="">Select destination account</option>
              {accounts
                .filter(a => a.id !== parseInt(form.fromAccountId))
                .map(a => (
                  <option key={a.id} value={a.id}>
                    {a.accountName} — ₹{parseFloat(a.balance).toLocaleString('en-IN')}
                  </option>
                ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Amount (₹)</label>
            <input
              type="number" required min="0.01" step="0.01"
              placeholder="0.00" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              style={input}
              onFocus={e => e.target.style.borderColor = '#c44b8a'}
              onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Date</label>
            <input
              type="date" required value={form.transferDate}
              onChange={e => setForm({ ...form, transferDate: e.target.value })}
              style={input}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={label}>Note (optional)</label>
            <input
              type="text" placeholder="e.g. Moving to PhonePe"
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              style={input}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%',
              background: loading ? theme.border
                : 'linear-gradient(135deg, #7c3aed, #c44b8a)',
              border: 'none', borderRadius: '12px',
              padding: '13px', fontSize: '14px',
              fontWeight: '700', color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Transferring...' : 'Transfer Now 🔄'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}