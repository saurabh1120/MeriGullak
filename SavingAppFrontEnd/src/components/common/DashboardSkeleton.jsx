import Skeleton from './Skeleton'
import Layout from '../layout/Layout'
import useIsMobile from '../../hooks/useIsMobile'

export default function DashboardSkeleton() {
  const isMobile = useIsMobile()
  return (
    <Layout>
      <div style={{ marginBottom: '28px' }}>
        <Skeleton width="200px" height="28px" style={{ marginBottom: '8px' }} />
        <Skeleton width="160px" height="16px" />
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: '16px', marginBottom: '24px'
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            background: '#1c1828', border: '0.5px solid #2a2535',
            borderRadius: '16px', padding: '20px'
          }}>
            <Skeleton width="80px" height="12px" style={{ marginBottom: '8px' }} />
            <Skeleton width="120px" height="24px" />
          </div>
        ))}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '20px'
      }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            background: '#1c1828', border: '0.5px solid #2a2535',
            borderRadius: '16px', padding: '20px'
          }}>
            <Skeleton width="150px" height="18px" style={{ marginBottom: '16px' }} />
            {[1, 2, 3, 4].map(j => (
              <div key={j} style={{
                display: 'flex', gap: '12px',
                marginBottom: '12px', alignItems: 'center'
              }}>
                <Skeleton width="36px" height="36px" borderRadius="10px" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="140px" height="13px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="100px" height="11px" />
                </div>
                <Skeleton width="70px" height="13px" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Layout>
  )
}