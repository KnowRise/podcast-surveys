import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  colors: {
    bg: string
    cardBg: string
    border: string
    text: string
    textSecondary: string
    statsBg: string
    filterBg: string
    inputBg: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'light'
  )

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.body.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#efefef'
    document.body.style.color = theme === 'dark' ? '#efefef' : '#000000'
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const colors = {
    bg: theme === 'dark' ? '#1a1a1a' : '#efefef',
    cardBg: theme === 'dark' ? '#2d2d2d' : '#efefef',
    border: theme === 'dark' ? '#444' : '#ccc',
    text: theme === 'dark' ? '#efefef' : '#000000',
    textSecondary: theme === 'dark' ? '#aaa' : '#666',
    statsBg: theme === 'dark' ? '#2d2d2d' : '#f8f9fa',
    filterBg: theme === 'dark' ? '#2d2d2d' : '#f8f9fa',
    inputBg: theme === 'dark' ? '#2d2d2d' : '#efefef',
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
