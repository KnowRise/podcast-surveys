import { useTheme } from '../contexts/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '10px 20px',
        backgroundColor: theme === 'dark' ? '#444' : '#f0f0f0',
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '20px',
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

export default ThemeToggle
