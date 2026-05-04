import { useEffect } from 'react'
import useTheme from '../../hooks/useTheme'

export default function Modal({ isOpen, onClose, title, children, width = '480px' }) {
  const { theme } = useTheme()

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          width: '100%', maxWidth: width,
          maxHeight: '90vh', overflowY: 'auto',
          padding: '28px 24px',
          boxShadow: theme.shadowDropdown,
          animation: 'slideDown 0.2s ease'
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '20px'
        }}>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '18px', fontWeight: '700', margin: 0
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: theme.bgHover,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px', width: '32px', height: '32px',
              color: theme.textSecondary, fontSize: '18px',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  )
}