import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { analyticsApi } from '../../api/analyticsApi'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid
} from 'recharts'
import useTheme from '../../hooks/useTheme'
import useIsMobile from '../../hooks/useIsMobile'
import { getCardStyle } from '../../utils/styles'
import toast from 'react-hot-toast'

const PIE_COLORS = [
  '#c44b8a', '#e8632a', '#7c3aed', '#3ecf8e',
  '#f59e0b', '#2d3a8c', '#ef4444', '#06b6d4', '#84cc16'
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Analytics() {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const card = getCardStyle(theme)

  const now = new Date()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  useEffect(() => { fetchAnalytics() }, [selectedMonth, selectedYear])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await analyticsApi.get(selectedMonth, selectedYear)
      setData(res.data)
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px', padding: '10px 14px',
          boxShadow: theme.shadowDropdown
        }}>
          <p style={{
            color: theme.textPrimary, fontSize: '12px',
            margin: '0 0 4px', fontWeight: '600'
          }}>
            {label}
          </p>
          {payload.map((p, i) => (
            <p key={i} style={{
              color: p.color, fontSize: '12px', margin: 0
            }}>
              ₹{parseFloat(p.value).toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const monthlyData = data
    ? Object.entries(data.monthlyTrend).map(
      ([month, amount]) => ({ month, amount })
    )
    : []

  const weeklyData = data
    ? Object.entries(data.weeklyTrend).map(
      ([day, amount]) => ({ day, amount })
    )
    : []

  const pieData = data?.categoryBreakdown
    ?.filter(c => c.amount > 0)
    .map(c => ({
      name: `${c.icon} ${c.category}`,
      value: c.amount,
      percentage: c.percentage
    })) || []

  const accountData = data
    ? Object.entries(data.accountWiseSpending || {}).map(
      ([name, amount]) => ({ name, amount })
    )
    : []

  const selectStyle = {
    background: theme.bgInput,
    border: `1px solid ${theme.border}`,
    borderRadius: '10px', padding: '9px 14px',
    color: theme.textPrimary, fontSize: '13px',
    outline: 'none'
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
            Analytics 📈
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '14px', margin: '4px 0 0'
          }}>
            Deep insights into your finances
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
            style={selectStyle}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>
                {isMobile ? m.slice(0, 3) : m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            style={selectStyle}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr 1fr'
            : 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px', marginBottom: '24px'
        }}>
          {[
            {
              label: 'Total Expense',
              value: `₹${data.totalExpenseThisMonth.toLocaleString('en-IN')}`,
              color: '#e8632a'
            },
            {
              label: 'Total Income',
              value: `₹${data.totalIncomeThisMonth.toLocaleString('en-IN')}`,
              color: theme.greenLight
            },
            {
              label: 'Savings Rate',
              value: `${data.savingsRate}%`,
              color: theme.purple
            },
            {
              label: 'Top Category',
              value: data.highestSpendingCategory,
              color: '#c44b8a'
            },
            {
              label: 'Most Used Account',
              value: data.mostUsedAccount,
              color: theme.yellowLight
            },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ ...card }}>
              <p style={{
                color: theme.textSecondary,
                fontSize: '11px', margin: '0 0 6px'
              }}>
                {label}
              </p>
              <p style={{
                color, fontSize: '16px',
                fontWeight: '700', margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{
          textAlign: 'center',
          color: theme.textSecondary, padding: '60px'
        }}>
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Charts Row 1
              Desktop: side by side (1fr 1fr)
              Mobile: stacked (1fr) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '20px', marginBottom: '20px'
          }}>
            {/* Monthly Trend */}
            <div style={{ ...card }}>
              <h3 style={{
                color: theme.textPrimary,
                fontSize: '15px', fontWeight: '700',
                margin: '0 0 20px'
              }}>
                📊 Monthly Spending Trend
              </h3>
              {monthlyData.length === 0 ? (
                <p style={{
                  color: theme.textSecondary,
                  textAlign: 'center', padding: '40px 0'
                }}>
                  No data available
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="month"
                      tick={{ fill: theme.textSecondary, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: theme.textSecondary, fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      width={50}
                      tickFormatter={v =>
                        `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c44b8a" />
                        <stop offset="100%" stopColor="#e8632a" />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="amount"
                      fill="url(#barGrad)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category Pie Chart */}
            <div style={{ ...card }}>
              <h3 style={{
                color: theme.textPrimary,
                fontSize: '15px', fontWeight: '700',
                margin: '0 0 20px'
              }}>
                🍕 Spending by Category
              </h3>
              {pieData.length === 0 ? (
                <p style={{
                  color: theme.textSecondary,
                  textAlign: 'center', padding: '40px 0'
                }}>
                  No expenses this month
                </p>
              ) : (
                // Mobile: pie on top, legend below
                // Desktop: pie left, legend right
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center', gap: '16px'
                }}>
                  <ResponsiveContainer
                    width={isMobile ? '100%' : '50%'}
                    height={200}
                  >
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={3} dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={value => [
                          `₹${value.toLocaleString('en-IN')}`, ''
                        ]}
                        contentStyle={{
                          background: theme.bgCard,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '8px',
                          color: theme.textPrimary
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div style={{
                    flex: 1, width: '100%',
                    display: 'flex', flexDirection: 'column', gap: '6px'
                  }}>
                    {pieData.slice(0, 6).map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center',
                        gap: '8px', padding: '5px 8px',
                        background: theme.bgInput,
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{
                          width: '8px', height: '8px',
                          borderRadius: '50%', flexShrink: 0,
                          background: PIE_COLORS[i % PIE_COLORS.length]
                        }} />
                        <p style={{
                          color: theme.textPrimary,
                          fontSize: '11px', margin: 0, flex: 1,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.name}
                        </p>
                        <p style={{
                          color: PIE_COLORS[i % PIE_COLORS.length],
                          fontSize: '11px', fontWeight: '700',
                          margin: 0, flexShrink: 0
                        }}>
                          {item.percentage}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Charts Row 2
              Desktop: side by side (1fr 1fr)
              Mobile: stacked (1fr) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '20px', marginBottom: '20px'
          }}>
            {/* Weekly Trend */}
            <div style={{ ...card }}>
              <h3 style={{
                color: theme.textPrimary,
                fontSize: '15px', fontWeight: '700',
                margin: '0 0 20px'
              }}>
                📉 Weekly Spending (Last 7 Days)
              </h3>
              {weeklyData.length === 0 ? (
                <p style={{
                  color: theme.textSecondary,
                  textAlign: 'center', padding: '40px 0'
                }}>
                  No data
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={weeklyData}
                    margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.border}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: theme.textSecondary, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: theme.textSecondary, fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      width={50}
                      tickFormatter={v =>
                        `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone" dataKey="amount"
                      stroke="#c44b8a" strokeWidth={2.5}
                      dot={{ fill: '#c44b8a', r: 4 }}
                      activeDot={{ r: 6, fill: '#e8632a' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Account Wise Spending */}
            <div style={{ ...card }}>
              <h3 style={{
                color: theme.textPrimary,
                fontSize: '15px', fontWeight: '700',
                margin: '0 0 20px'
              }}>
                🏦 Account-wise Spending
              </h3>
              {accountData.length === 0 ? (
                <p style={{
                  color: theme.textSecondary,
                  textAlign: 'center', padding: '40px 0'
                }}>
                  No spending data
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={accountData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fill: theme.textSecondary, fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v =>
                        `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <YAxis
                      type="category" dataKey="name"
                      tick={{ fill: theme.textSecondary, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                      width={isMobile ? 80 : 100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <defs>
                      <linearGradient
                        id="accGrad" x1="0" y1="0" x2="1" y2="0"
                      >
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#c44b8a" />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="amount"
                      fill="url(#accGrad)"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category Breakdown Table */}
          {data?.categoryBreakdown?.length > 0 && (
            <div style={{ ...card }}>
              <h3 style={{
                color: theme.textPrimary,
                fontSize: '15px', fontWeight: '700',
                margin: '0 0 16px'
              }}>
                📋 Category Breakdown
              </h3>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '10px'
              }}>
                {data.categoryBreakdown.map((cat, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    gap: '14px', padding: '12px',
                    background: theme.bgInput, borderRadius: '10px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>
                      {cat.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '5px', flexWrap: 'wrap', gap: '4px'
                      }}>
                        <p style={{
                          color: theme.textPrimary, fontSize: '13px',
                          fontWeight: '600', margin: 0
                        }}>
                          {cat.category}
                        </p>
                        <div style={{
                          display: 'flex', gap: '10px', alignItems: 'center'
                        }}>
                          <p style={{
                            color: theme.textSecondary,
                            fontSize: '11px', margin: 0
                          }}>
                            {cat.transactionCount} txns
                          </p>
                          <p style={{
                            color: '#e8632a',
                            fontSize: '13px', fontWeight: '700', margin: 0
                          }}>
                            ₹{cat.amount.toLocaleString('en-IN')}
                          </p>
                          <p style={{
                            color: PIE_COLORS[i % PIE_COLORS.length],
                            fontSize: '12px', fontWeight: '700', margin: 0
                          }}>
                            {cat.percentage}%
                          </p>
                        </div>
                      </div>
                      <div style={{
                        background: theme.border, borderRadius: '10px',
                        height: '6px', overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%', width: `${cat.percentage}%`,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                          borderRadius: '10px'
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
