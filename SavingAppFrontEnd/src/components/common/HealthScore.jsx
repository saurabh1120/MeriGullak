export default function HealthScore({ score, details }) {
  const getColor = (s) => {
    if (s >= 80) return '#3ecf8e'
    if (s >= 60) return '#f59e0b'
    if (s >= 40) return '#e8632a'
    return '#ef4444'
  }

  const getLabel = (s) => {
    if (s >= 80) return 'Excellent 🌟'
    if (s >= 60) return 'Good 👍'
    if (s >= 40) return 'Fair ⚠️'
    return 'Needs Work 🔴'
  }

  const color = getColor(score)
  const circumference = 2 * Math.PI * 45

  return (
    <div style={{
      background: '#1c1828', border: '0.5px solid #2a2535',
      borderRadius: '16px', padding: '20px'
    }}>
      <h3 style={{ color: '#f0eeff', fontSize: '15px', fontWeight: '700', margin: '0 0 20px' }}>
        💯 Financial Health Score
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Circle progress */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="45"
              fill="none" stroke="#2a2535" strokeWidth="8" />
            <circle cx="55" cy="55" r="45"
              fill="none" stroke={color} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (score / 100) * circumference}
              transform="rotate(-90 55 55)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color, fontSize: '22px', fontWeight: '800' }}>
              {score}
            </span>
            <span style={{ color: '#7a7390', fontSize: '10px' }}>/ 100</span>
          </div>
        </div>

        {/* Details */}
        <div style={{ flex: 1 }}>
          <p style={{ color, fontSize: '16px', fontWeight: '700', margin: '0 0 12px' }}>
            {getLabel(score)}
          </p>
          {details?.map((d, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ color: '#7a7390', fontSize: '11px' }}>{d.label}</span>
                <span style={{ color: d.color || '#f0eeff', fontSize: '11px', fontWeight: '600' }}>
                  {d.value}
                </span>
              </div>
              <div style={{ background: '#2a2535', borderRadius: '4px', height: '4px' }}>
                <div style={{
                  width: `${d.score}%`, height: '100%',
                  background: d.color || '#c44b8a',
                  borderRadius: '4px',
                  transition: 'width 1s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}