import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { dashboardApi } from '../../api/dashboardApi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = {
  FOOD: '🍔', SHOPPING: '🛍️', TRAVEL: '✈️',
  FUEL: '⛽', BILLS: '📄', ENTERTAINMENT: '🎬',
  RENT: '🏠', EMI: '🏦', HEALTHCARE: '💊',
  SALARY: '💰', INVESTMENT: '📈', OTHERS: '📦'
}

const PIE_COLORS = [
  '#c44b8a', '#e8632a', '#7c3aed',
  '#3ecf8e', '#f59e0b', '#2d3a8c',
  '#ef4444', '#06b6d4', '#84cc16'
]

const cardStyle = {
  background: '#1c1828',
  border: '0.5px solid #2a2535',
  borderRadius: '16px',
  padding: '20px'
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard() }, [])

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.get()
      setData(res.data)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🪙</div>
          <p style={{ color: '#7a7390' }}>Loading your dashboard...</p>
        </div>
      </div>
    </Layout>
  )

  const fmt = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN')}`

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#f0eeff', fontSize: '24px', fontWeight: '700', margin: 0 }}>
          Welcome back, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: '#7a7390', fontSize: '14px', margin: '4px 0 0' }}>
          Here's your financial overview
        </p>
      </div>

      {/* Top Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        {[
          {
            label: 'Total Balance', value: fmt(data?.totalBalance),
            color: '#f0eeff', bg: 'linear-gradient(135deg, rgba(196,75,138,0.15), rgba(232,99,42,0.15))',
            border: 'rgba(196,75,138,0.3)', icon: '💳'
          },
          {
            label: 'Monthly Income', value: fmt(data?.monthlyIncome),
            color: '#3ecf8e', bg: 'rgba(62,207,142,0.08)',
            border: 'rgba(62,207,142,0.2)', icon: '📥'
          },
          {
            label: 'Monthly Expense', value: fmt(data?.monthlyExpense),
            color: '#e8632a', bg: 'rgba(232,99,42,0.08)',
            border: 'rgba(232,99,42,0.2)', icon: '📤'
          },
          {
            label: 'Total Savings', value: fmt(data?.totalSavings),
            color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',
            border: 'rgba(124,58,237,0.2)', icon: '🪙'
          },
        ].map(({ label, value, color, bg, border, icon }) => (
          <div key={label} style={{
            background: bg,
            border: `0.5px solid ${border}`,
            borderRadius: '16px', padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#7a7390', fontSize: '12px', margin: '0 0 8px' }}>{label}</p>
                <p style={{ color, fontSize: '22px', fontWeight: '800', margin: 0 }}>{value}</p>
              </div>
              <span style={{ fontSize: '24px' }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row — Goals + Budget alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Active Goals', value: data?.activeGoals || 0, icon: '🎯', color: '#f59e0b' },
          { label: 'Completed Goals', value: data?.completedGoals || 0, icon: '✅', color: '#3ecf8e' },
          { label: 'Accounts', value: data?.totalAccounts || 0, icon: '🏦', color: '#c44b8a' },
          { label: 'Net Savings', value: fmt(data?.netSavings), icon: '💹', color: '#7c3aed' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ ...cardStyle }}>
            <p style={{ color: '#7a7390', fontSize: '11px', margin: '0 0 6px' }}>{icon} {label}</p>
            <p style={{ color, fontSize: '20px', fontWeight: '700', margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Budget Alerts */}
      {data?.budgetAlerts?.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#f0eeff', fontSize: '16px', fontWeight: '700', margin: '0 0 12px' }}>
            ⚠️ Budget Alerts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.budgetAlerts.map(alert => (
              <div key={alert.id} style={{
                background: alert.overBudget
                  ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                border: `0.5px solid ${alert.overBudget ? '#ef4444' : '#f59e0b'}`,
                borderRadius: '12px', padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <p style={{
                  color: alert.overBudget ? '#ef4444' : '#f59e0b',
                  fontSize: '13px', margin: 0
                }}>
                  {alert.alertMessage}
                </p>
                <span style={{
                  color: alert.overBudget ? '#ef4444' : '#f59e0b',
                  fontSize: '13px', fontWeight: '700'
                }}>
                  {alert.usagePercentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

        {/* Recent Transactions */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ color: '#f0eeff', fontSize: '16px', fontWeight: '700', margin: '0 0 16px' }}>
            Recent Transactions
          </h2>
          {data?.recentTransactions?.length === 0 ? (
            <p style={{ color: '#7a7390', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
              No transactions yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data?.recentTransactions?.slice(0, 6).map(tx => (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center',
                  gap: '12px', padding: '10px',
                  background: '#13111a', borderRadius: '10px'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: tx.transactionType === 'DEBIT'
                      ? 'rgba(232,99,42,0.15)' : 'rgba(62,207,142,0.15)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '16px', flexShrink: 0
                  }}>
                    {CATEGORY_ICONS[tx.category] || '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: '#f0eeff', fontSize: '13px',
                      fontWeight: '600', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {tx.description || tx.category}
                    </p>
                    <p style={{ color: '#7a7390', fontSize: '11px', margin: '1px 0 0' }}>
                      {tx.accountName} • {tx.expenseDate}
                    </p>
                  </div>
                  <p style={{
                    color: tx.transactionType === 'DEBIT' ? '#e8632a' : '#3ecf8e',
                    fontSize: '13px', fontWeight: '700', margin: 0, flexShrink: 0
                  }}>
                    {tx.transactionType === 'DEBIT' ? '-' : '+'}
                    ₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Gullaks */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ color: '#f0eeff', fontSize: '16px', fontWeight: '700', margin: '0 0 16px' }}>
            🪙 Savings Goals
          </h2>
          {data?.topGullaks?.length === 0 ? (
            <p style={{ color: '#7a7390', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
              No goals yet. Create your first Gullak!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data?.topGullaks?.map(gullak => (
                <div key={gullak.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{gullak.icon || '💰'}</span>
                      <p style={{ color: '#f0eeff', fontSize: '13px', fontWeight: '600', margin: 0 }}>
                        {gullak.goalName}
                      </p>
                    </div>
                    <p style={{ color: gullak.color || '#c44b8a', fontSize: '13px', fontWeight: '700', margin: 0 }}>
                      {gullak.progressPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div style={{ background: '#13111a', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(gullak.progressPercentage, 100)}%`,
                      background: gullak.status === 'COMPLETED'
                        ? 'linear-gradient(90deg, #3ecf8e, #20b070)'
                        : `linear-gradient(90deg, ${gullak.color || '#c44b8a'}, #e8632a)`,
                      borderRadius: '10px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <p style={{ color: '#7a7390', fontSize: '11px', margin: 0 }}>
                      ₹{parseFloat(gullak.savedAmount).toLocaleString('en-IN')} saved
                    </p>
                    <p style={{ color: '#4a4560', fontSize: '11px', margin: 0 }}>
                      of ₹{parseFloat(gullak.targetAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gamification */}
      {data?.gamification && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#f0eeff', fontSize: '16px', fontWeight: '700', margin: '0 0 16px' }}>
            🏆 Your Progress
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>

            {/* Level card */}
            <div style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(196,75,138,0.2))',
              border: '0.5px solid rgba(124,58,237,0.3)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>⭐</div>
                <p style={{ color: '#7c3aed', fontSize: '12px', margin: '0 0 4px' }}>Level {data.gamification.level}</p>
                <p style={{ color: '#f0eeff', fontSize: '16px', fontWeight: '700', margin: '0 0 12px' }}>
                  {data.gamification.levelName}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#7a7390', fontSize: '11px' }}>Points</span>
                  <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '700' }}>
                    {data.gamification.totalPoints}
                  </span>
                </div>
                <div style={{ background: '#13111a', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((data.gamification.totalPoints % 100), 100)}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #c44b8a)',
                    borderRadius: '10px'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#f59e0b', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                      🔥{data.gamification.currentStreak}
                    </p>
                    <p style={{ color: '#7a7390', fontSize: '10px', margin: '2px 0 0' }}>Day Streak</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#3ecf8e', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                      {data.gamification.noSpendDays}
                    </p>
                    <p style={{ color: '#7a7390', fontSize: '10px', margin: '2px 0 0' }}>No-Spend Days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div style={{ ...cardStyle }}>
              <p style={{ color: '#7a7390', fontSize: '12px', margin: '0 0 14px' }}>
                Badges ({data.gamification.badges.filter(b => b.unlocked).length}/{data.gamification.badges.length} unlocked)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {data.gamification.badges.map(badge => (
                  <div key={badge.name} style={{
                    textAlign: 'center', padding: '10px 6px',
                    background: badge.unlocked ? 'rgba(245,158,11,0.1)' : '#13111a',
                    border: `0.5px solid ${badge.unlocked ? '#f59e0b' : '#2a2535'}`,
                    borderRadius: '10px',
                    opacity: badge.unlocked ? 1 : 0.5
                  }}>
                    <div style={{
                      fontSize: '22px', marginBottom: '4px',
                      filter: badge.unlocked ? 'none' : 'grayscale(1)'
                    }}>
                      {badge.icon}
                    </div>
                    <p style={{
                      color: badge.unlocked ? '#f59e0b' : '#4a4560',
                      fontSize: '9px', fontWeight: '600', margin: 0,
                      lineHeight: '1.2'
                    }}>
                      {badge.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {data?.suggestions?.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#f0eeff', fontSize: '16px', fontWeight: '700', margin: '0 0 16px' }}>
            💡 Smart Suggestions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {data.suggestions.map((s, i) => (
              <div key={i} style={{
                background: '#1c1828',
                border: `0.5px solid ${s.color}30`,
                borderLeft: `3px solid ${s.color}`,
                borderRadius: '12px', padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>{s.icon}</span>
                  <p style={{ color: s.color, fontSize: '13px', fontWeight: '700', margin: 0 }}>
                    {s.title}
                  </p>
                </div>
                <p style={{ color: '#7a7390', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                  {s.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}