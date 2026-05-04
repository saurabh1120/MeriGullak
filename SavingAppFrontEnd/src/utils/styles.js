export const getInputStyle = (theme) => ({
  width: '100%',
  background: theme.inputBg,
  border: `1px solid ${theme.inputBorder}`,
  borderRadius: '10px',
  padding: '11px 14px',
  fontSize: '13px',
  color: theme.inputText,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
})

export const getCardStyle = (theme) => ({
  background: theme.bgCard,
  border: `1px solid ${theme.border}`,
  borderRadius: '16px',
  padding: '20px',
  boxShadow: theme.shadowCard,
  transition: 'all 0.3s'
})

export const getLabelStyle = (theme) => ({
  display: 'block',
  fontSize: '11px',
  color: theme.textSecondary,
  marginBottom: '5px',
  fontWeight: '500'
})

export const getButtonPrimary = () => ({
  width: '100%',
  background: 'linear-gradient(135deg, #c44b8a, #e8632a)',
  border: 'none',
  borderRadius: '12px',
  padding: '13px',
  fontSize: '14px',
  fontWeight: '700',
  color: '#ffffff',
  cursor: 'pointer'
})

export const getSelectStyle = (theme) => ({
  width: '100%',
  background: theme.inputBg,
  border: `1px solid ${theme.inputBorder}`,
  borderRadius: '10px',
  padding: '11px 14px',
  fontSize: '13px',
  color: theme.inputText,
  outline: 'none',
  boxSizing: 'border-box'
})