import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { dashboardApi } from '../../api/dashboardApi'
import useAuthStore from '../../store/authStore'
import useTheme from '../../hooks/useTheme'
import useIsMobile from '../../hooks/useIsMobile'
import { getCardStyle } from '../../utils/styles'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = {
  FOOD: '🍔', SHOPPING: '🛍️', TRAVEL: '✈️',
  FUEL: '⛽', BILLS: '📄', ENTERTAINMENT: '🎬',
  RENT: '🏠', EMI: '🏦', HEALTHCARE: '💊',
  SALARY: '💰', INVESTMENT: '📈', OTHERS: '📦'
}

const PIE_COLORS = [
  '#c44b8a', '#e8632a', '#7c3aed', '#3ecf8e',
  '#f59e0b', '#2d3a8c', '#ef4444', '#06b6d4'
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const { theme, isDark } = useTheme()
  const isMobile = useIsMobile()
  const card = getCardStyle(theme)
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
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', height: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🪙</div>
          <p style={{ color: theme.textSecondary }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    </Layout>
  )

  const fmt = (val) =>
    `₹${parseFloat(val || 0).toLocaleString('en-IN')}`

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          color: theme.textPrimary,
          fontSize: '24px', fontWeight: '700', margin: 0
        }}>
          Welcome back, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p style={{
          color: theme.textSecondary,
          fontSize: '14px', margin: '4px 0 0'
        }}>
          Here's your financial overview
        </p>
      </div>

      {/* Top Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile
          ? '1fr 1fr'
          : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        {[
          {
            label: 'Total Balance',
            value: fmt(data?.totalBalance),
            color: theme.textPrimary,
            bg: isDark
              ? 'linear-gradient(135deg, rgba(196,75,138,0.15), rgba(232,99,42,0.15))'
              : 'linear-gradient(135deg, rgba(196,75,138,0.08), rgba(232,99,42,0.06))',
            border: isDark
              ? 'rgba(196,75,138,0.3)' : 'rgba(196,75,138,0.2)',
            icon: '💳'
          },
          {
            label: 'Monthly Income',
            value: fmt(data?.monthlyIncome),
            color: theme.greenLight,
            bg: theme.greenBg,
            border: isDark ? 'rgba(62,207,142,0.2)' : 'rgba(22,163,74,0.15)',
            icon: '📥'
          },
          {
            label: 'Monthly Expense',
            value: fmt(data?.monthlyExpense),
            color: '#e8632a',
            bg: theme.redBg,
            border: isDark ? 'rgba(232,99,42,0.2)' : 'rgba(220,38,38,0.15)',
            icon: '📤'
          },
          {
            label: 'Total Savings',
            value: fmt(data?.totalSavings),
            color: theme.purple,
            bg: theme.purpleBg,
            border: isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.15)',
            icon: '💰₹'
          },
        ].map(({ label, value, color, bg, border, icon }) => (
          <div key={label} style={{
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: '16px', padding: '20px',
            boxShadow: theme.shadowCard,
            transition: 'all 0.3s'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  color: theme.textSecondary,
                  fontSize: '12px', margin: '0 0 8px'
                }}>
                  {label}
                </p>
                <p style={{
                  color,
                  fontSize: isMobile ? '16px' : '22px',
                  fontWeight: '800', margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {value}
                </p>
              </div>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>
                {icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile
          ? '1fr 1fr'
          : 'repeat(4, 1fr)',
        gap: '16px', marginBottom: '24px'
      }}>
        {[
          { label: 'Active Goals', value: data?.activeGoals || 0, icon: '🎯', color: theme.yellowLight },
          { label: 'Completed Goals', value: data?.completedGoals || 0, icon: '✅', color: theme.greenLight },
          { label: 'Accounts', value: data?.totalAccounts || 0, icon: '🏦', color: '#c44b8a' },
          { label: 'Net Savings', value: fmt(data?.netSavings), icon: '💹', color: theme.purple },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ ...card }}>
            <p style={{
              color: theme.textSecondary,
              fontSize: '11px', margin: '0 0 6px'
            }}>
              {icon} {label}
            </p>
            <p style={{
              color,
              fontSize: isMobile ? '15px' : '20px',
              fontWeight: '700', margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Budget Alerts */}
      {data?.budgetAlerts?.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '16px', fontWeight: '700',
            margin: '0 0 12px'
          }}>
            ⚠️ Budget Alerts
          </h2>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            {data.budgetAlerts.map(alert => (
              <div key={alert.id} style={{
                background: alert.overBudget
                  ? theme.redBg : theme.yellowBg,
                border: `1px solid ${alert.overBudget
                  ? theme.redBorder : theme.yellowBorder}`,
                borderRadius: '12px', padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', gap: '8px'
              }}>
                <p style={{
                  color: alert.overBudget
                    ? theme.redLight : theme.yellowLight,
                  fontSize: '13px', margin: 0, flex: 1
                }}>
                  {alert.alertMessage}
                </p>
                <span style={{
                  color: alert.overBudget
                    ? theme.redLight : theme.yellowLight,
                  fontSize: '13px', fontWeight: '700', flexShrink: 0
                }}>
                  {alert.usagePercentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content grid
          Desktop: side by side (1fr 1fr)
          Mobile: stacked (1fr) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '20px', marginBottom: '24px'
      }}>
        {/* Recent Transactions */}
        <div style={{ ...card }}>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '16px', fontWeight: '700',
            margin: '0 0 16px'
          }}>
            Recent Transactions
          </h2>
          {!data?.recentTransactions?.length ? (
            <p style={{
              color: theme.textSecondary,
              fontSize: '13px', textAlign: 'center',
              padding: '20px 0'
            }}>
              No transactions yet
            </p>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              {data.recentTransactions.slice(0, 6).map(tx => (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center',
                  gap: '12px', padding: '10px',
                  background: theme.bgInput,
                  borderRadius: '10px',
                  border: `1px solid ${theme.border}`
                }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '10px', flexShrink: 0,
                    background: tx.transactionType === 'DEBIT'
                      ? theme.redBg : theme.greenBg,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '16px'
                  }}>
                    {CATEGORY_ICONS[tx.category] || '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: theme.textPrimary, fontSize: '13px',
                      fontWeight: '600', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {tx.description || tx.category}
                    </p>
                    <p style={{
                      color: theme.textSecondary,
                      fontSize: '11px', margin: '1px 0 0'
                    }}>
                      {tx.accountName} • {tx.expenseDate}
                    </p>
                  </div>
                  <p style={{
                    color: tx.transactionType === 'DEBIT'
                      ? '#e8632a' : theme.greenLight,
                    fontSize: '13px', fontWeight: '700',
                    margin: 0, flexShrink: 0
                  }}>
                    {tx.transactionType === 'DEBIT' ? '-' : '+'}
                    ₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings Goals
            KEY FIX: on mobile, goal name won't overflow
            because we use flex properly */}
        <div style={{ ...card }}>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '16px', fontWeight: '700',
            margin: '0 0 16px'
          }}>
            🎯 Savings Goals
          </h2>
          {!data?.topGullaks?.length ? (
            <p style={{
              color: theme.textSecondary,
              fontSize: '13px', textAlign: 'center',
              padding: '20px 0'
            }}>
              No goals yet. Create your first Gullak!
            </p>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              {data.topGullaks.map(gullak => (
                <div key={gullak.id}>
                  {/* Row 1: icon + name + % — all in one row with ellipsis */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '6px', marginBottom: '6px',
                    width: '100%', overflow: 'hidden'
                  }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>
                      {gullak.icon || '💰'}
                    </span>
                    <p style={{
                      color: theme.textPrimary, fontSize: '13px',
                      fontWeight: '600', margin: 0,
                      flex: 1, minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {gullak.goalName}
                    </p>
                    <span style={{
                      color: gullak.color || '#c44b8a',
                      fontSize: '12px', fontWeight: '700',
                      flexShrink: 0, marginLeft: '4px'
                    }}>
                      {gullak.progressPercentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress bar — full width */}
                  <div style={{
                    background: theme.bgInput,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '10px', height: '8px',
                    overflow: 'hidden', marginBottom: '4px',
                    width: '100%'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(gullak.progressPercentage, 100)}%`,
                      background: gullak.status === 'COMPLETED'
                        ? 'linear-gradient(90deg, #3ecf8e, #16a34a)'
                        : `linear-gradient(90deg, ${gullak.color || '#c44b8a'}, #e8632a)`,
                      borderRadius: '10px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>

                  {/* Saved / Target amounts */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    width: '100%'
                  }}>
                    <p style={{
                      color: theme.textSecondary,
                      fontSize: '11px', margin: 0
                    }}>
                      ₹{parseFloat(gullak.savedAmount)
                        .toLocaleString('en-IN')} saved
                    </p>
                    <p style={{
                      color: theme.textMuted,
                      fontSize: '11px', margin: 0
                    }}>
                      of ₹{parseFloat(gullak.targetAmount)
                        .toLocaleString('en-IN')}
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
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '16px', fontWeight: '700',
            margin: '0 0 16px'
          }}>
            🏆 Your Progress
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
            gap: '16px'
          }}>
            {/* Level card */}
            <div style={{
              ...card,
              background: isDark
                ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(196,75,138,0.2))'
                : 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(196,75,138,0.06))',
              border: isDark
                ? '1px solid rgba(124,58,237,0.3)'
                : '1px solid rgba(124,58,237,0.2)'
            }}>
              {/* On mobile: horizontal layout */}
              <div style={{
                display: isMobile ? 'flex' : 'block',
                alignItems: 'center', gap: '16px'
              }}>
                <div style={{
                  textAlign: 'center', flexShrink: 0
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>⭐</div>
                  <p style={{
                    color: theme.purple, fontSize: '12px', margin: '0 0 4px'
                  }}>
                    Level {data.gamification.level}
                  </p>
                  <p style={{
                    color: theme.textPrimary,
                    fontSize: '16px', fontWeight: '700',
                    margin: isMobile ? 0 : '0 0 12px'
                  }}>
                    {data.gamification.levelName}
                  </p>
                </div>

                <div style={{ flex: 1, marginTop: isMobile ? 0 : '12px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <span style={{ color: theme.textSecondary, fontSize: '11px' }}>
                      Points
                    </span>
                    <span style={{
                      color: theme.yellowLight,
                      fontSize: '11px', fontWeight: '700'
                    }}>
                      {data.gamification.totalPoints}
                    </span>
                  </div>
                  <div style={{
                    background: theme.bgInput, borderRadius: '10px',
                    height: '6px', overflow: 'hidden',
                    border: `1px solid ${theme.border}`
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(
                        data.gamification.totalPoints % 100, 100)}%`,
                      background: 'linear-gradient(90deg, #7c3aed, #c44b8a)',
                      borderRadius: '10px'
                    }} />
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-around',
                    marginTop: '12px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{
                        color: theme.yellowLight,
                        fontSize: '18px', fontWeight: '700', margin: 0
                      }}>
                        🔥{data.gamification.currentStreak}
                      </p>
                      <p style={{
                        color: theme.textSecondary,
                        fontSize: '10px', margin: '2px 0 0'
                      }}>
                        Day Streak
                      </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{
                        color: theme.greenLight,
                        fontSize: '18px', fontWeight: '700', margin: 0
                      }}>
                        {data.gamification.noSpendDays}
                      </p>
                      <p style={{
                        color: theme.textSecondary,
                        fontSize: '10px', margin: '2px 0 0'
                      }}>
                        No-Spend Days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div style={{ ...card }}>
              <p style={{
                color: theme.textSecondary,
                fontSize: '12px', margin: '0 0 14px'
              }}>
                Badges ({data.gamification.badges
                  .filter(b => b.unlocked).length}/
                {data.gamification.badges.length} unlocked)
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'
              }}>
                {data.gamification.badges.map(badge => (
                  <div key={badge.name} style={{
                    textAlign: 'center', padding: '10px 6px',
                    background: badge.unlocked
                      ? theme.yellowBg : theme.bgInput,
                    border: `1px solid ${badge.unlocked
                      ? theme.yellowBorder : theme.border}`,
                    borderRadius: '10px',
                    opacity: badge.unlocked ? 1 : 0.5,
                    transition: 'all 0.3s'
                  }}>
                    <div style={{
                      fontSize: '22px', marginBottom: '4px',
                      filter: badge.unlocked ? 'none' : 'grayscale(1)'
                    }}>
                      {badge.icon}
                    </div>
                    <p style={{
                      color: badge.unlocked
                        ? theme.yellowLight : theme.textMuted,
                      fontSize: '9px', fontWeight: '600',
                      margin: 0, lineHeight: '1.2'
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
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '16px', fontWeight: '700',
            margin: '0 0 16px'
          }}>
            💡 Smart Suggestions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px'
          }}>
            {data.suggestions.map((s, i) => (
              <div key={i} style={{
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                borderLeft: `3px solid ${s.color}`,
                borderRadius: '12px', padding: '16px',
                boxShadow: theme.shadowCard
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '8px', marginBottom: '6px'
                }}>
                  <span style={{ fontSize: '18px' }}>{s.icon}</span>
                  <p style={{
                    color: s.color, fontSize: '13px',
                    fontWeight: '700', margin: 0
                  }}>
                    {s.title}
                  </p>
                </div>
                <p style={{
                  color: theme.textSecondary, fontSize: '12px',
                  margin: 0, lineHeight: '1.5'
                }}>
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
