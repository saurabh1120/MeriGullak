import useThemeStore from '../store/themeStore'
import { getTheme } from '../theme'

export default function useTheme() {
  const { isDark, toggleTheme } = useThemeStore()
  const theme = getTheme(isDark)
  return { theme, isDark, toggleTheme }
}