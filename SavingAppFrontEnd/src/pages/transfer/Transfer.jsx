import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import { transferApi } from '../../api/transferApi'
import { accountApi } from '../../api/accountApi'
import toast from 'react-hot-toast'

export default function Transfer() {
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

  const getAccountName = (id) =>
    accounts.find(a => a.id === id)?.accountName || 'Unknown'

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#f0eeff', fontSize: '24px', fontWeight: '700', margin: 0 }}>
            Transfers 🔄
          </h1>
          <p style={{ color: '#7a7390', fontSize: '14px', margin: '4px 0 0' }}>
            Move money between your accounts
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
          + New Transfer
        </button>
      </div>

      {/* Accounts Quick View */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '24px',
        overflowX: 'auto', paddingBottom: '4px'
      }}>
        {accounts.map(acc => (
          <div key={acc.id} style={{
            background: '#1c1828', border: '0.5px solid #2a2535',
            borderRadius: '12px', padding: '14px 18px',
            minWidth: '160px', flexShrink: 0,
            borderTop: `2px solid ${acc.color || '#c44b8a'}`
          }}>
            <p style={{ color: '#7a7390', fontSize: '11px', margin: '0 0 4px' }}>
              {acc.accountName}
            </p>
            <p style={{ color: '#f0eeff', fontSize: '16px', fontWeight: '700', margin: 0 }}>
              ₹{parseFloat(acc.balance).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Transfer History */}
      {fetching ? (
        <div style={{ textAlign: 'center', color: '#7a7390', padding: '60px' }}>
          Loading transfers...
        </div>
      ) : transfers.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: '#1c1828', borderRadius: '16px',
          border: '0.5px solid #2a2535'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <p style={{ color: '#7a7390', fontSize: '15px', margin: 0 }}>
            No transfers yet. Move money between accounts!
          </p>
        </div>
      ) : (
        <div style={{
          background: '#1c1828', border: '0.5px solid #2a2535',
          borderRadius: '16px', overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #2a2535' }}>
            <p style={{ color: '#7a7390', fontSize: '13px', margin: 0 }}>
              Transfer History ({transfers.length})
            </p>
          </div>
          {transfers.map((transfer, idx) => (
            <div key={transfer.id} style={{
              display: 'flex', alignItems: 'center',
              padding: '16px 20px', gap: '14px',
              borderBottom: idx < transfers.length - 1
                ? '0.5px solid #2a2535' : 'none'
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'rgba(124,58,237,0.15)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px', flexShrink: 0
              }}>
                🔄
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ color: '#f0eeff', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  {getAccountName(transfer.fromAccount?.id)}
                  <span style={{ color: '#7a7390', margin: '0 8px' }}>→</span>
                  {getAccountName(transfer.toAccount?.id)}
                </p>
                <p style={{ color: '#7a7390', fontSize: '12px', margin: '2px 0 0' }}>
                  {transfer.transferDate}
                  {transfer.note && ` • ${transfer.note}`}
                </p>
              </div>

              <p style={{ color: '#7c3aed', fontSize: '16px', fontWeight: '700', margin: 0 }}>
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
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              From Account
            </label>
            <select
              required value={form.fromAccountId}
              onChange={e => setForm({ ...form, fromAccountId: e.target.value })}
              style={{
                width: '100%', background: '#13111a',
                border: '0.5px solid #2a2535', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px',
                color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
              }}
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
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              To Account
            </label>
            <select
              required value={form.toAccountId}
              onChange={e => setForm({ ...form, toAccountId: e.target.value })}
              style={{
                width: '100%', background: '#13111a',
                border: '0.5px solid #2a2535', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px',
                color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
              }}
            >
              <option value="">Select destination account</option>
              {accounts.filter(a => a.id !== parseInt(form.fromAccountId)).map(a => (
                <option key={a.id} value={a.id}>
                  {a.accountName} — ₹{parseFloat(a.balance).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Amount (₹)
            </label>
            <input
              type="number" required min="0.01" step="0.01"
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

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Date
            </label>
            <input
              type="date" required
              value={form.transferDate}
              onChange={e => setForm({ ...form, transferDate: e.target.value })}
              style={{
                width: '100%', background: '#13111a',
                border: '0.5px solid #2a2535', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px',
                color: '#c9c4e8', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#7a7390', marginBottom: '5px' }}>
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Moving to PhonePe"
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
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
                : 'linear-gradient(135deg, #7c3aed, #c44b8a)',
              border: 'none', borderRadius: '12px',
              padding: '13px', fontSize: '14px',
              fontWeight: '700', color: 'white', cursor: 'pointer'
            }}
          >
            {loading ? 'Transferring...' : 'Transfer Now 🔄'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}