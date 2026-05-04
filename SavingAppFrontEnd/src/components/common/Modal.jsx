import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, width = '480px' }) {
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
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1c1828',
          border: '0.5px solid #2a2535',
          borderRadius: '20px',
          width: '100%', maxWidth: width,
          maxHeight: '90vh', overflowY: 'auto',
          padding: '28px 24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#f0eeff', fontSize: '18px', fontWeight: '700', margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#2a2535', border: 'none',
              borderRadius: '8px', width: '32px', height: '32px',
              color: '#7a7390', fontSize: '18px',
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