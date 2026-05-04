import { useState } from 'react'
import useTheme from '../../hooks/useTheme'

export default function SearchBar({ onSearch, placeholder = 'Search...' }) {
  const { theme } = useTheme()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const handleChange = (e) => {
    setQuery(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
      <span style={{
        position: 'absolute', left: '12px', top: '50%',
        transform: 'translateY(-50%)', fontSize: '15px',
        color: theme.textSecondary, pointerEvents: 'none'
      }}>
        🔍
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          background: theme.bgCard,
          border: `1px solid ${focused ? '#c44b8a' : theme.border}`,
          borderRadius: '12px',
          padding: '10px 14px 10px 38px',
          fontSize: '13px',
          color: theme.textPrimary,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
          boxShadow: theme.shadow
        }}
      />
      {query && (
        <button
          onClick={() => { setQuery(''); onSearch('') }}
          style={{
            position: 'absolute', right: '10px', top: '50%',
            transform: 'translateY(-50%)',
            background: theme.bgHover,
            border: 'none', borderRadius: '50%',
            width: '20px', height: '20px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            color: theme.textSecondary,
            fontSize: '12px', cursor: 'pointer',
            lineHeight: 1
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
