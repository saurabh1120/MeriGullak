import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import SubTabs from './SubTabs'
import useIsMobile from '../../hooks/useIsMobile'
import useThemeStore from '../../store/themeStore'
import { getTheme } from '../../theme'

export default function Layout({ children }) {
  const isMobile = useIsMobile()
  const { isDark } = useThemeStore()
  const theme = getTheme(isDark)

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      transition: 'background 0.3s'
    }}>
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Main content — pushed right by sidebar width */}
      <main style={{
        marginLeft: isMobile ? '0' : '220px', // ← key fix
        minHeight: '100vh',
        transition: 'margin 0.3s'
      }}>
        {/* Mobile SubTabs */}
        {isMobile && <SubTabs />}

        {/* Page content */}
        <div style={{
          padding: isMobile
            ? '16px 16px 90px'
            : '28px 32px',
        }}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && <BottomNav />}
    </div>
  )
}