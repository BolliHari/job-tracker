import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { logoutUser } from '../../store/authSlice.js'
import Logo from '../brand/Logo'

const SIDEBAR_STORAGE_KEY = 'sidebar_collapsed'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/vault', label: 'Job vault', icon: Briefcase, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

function getNavLinkClass(collapsed) {
  return ({ isActive }) => {
    const base = collapsed
      ? 'flex items-center justify-center rounded-xl p-2.5 text-sm font-medium text-charcoal transition-colors'
      : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal transition-colors'
    return isActive
      ? `${base} bg-sage text-white`
      : `${base} hover:bg-paper`
  }
}

function getStoredCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export default function PrivateLayout({ children }) {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(getStoredCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
    } catch {
      // ignore storage errors
    }
  }, [collapsed])

  function handleLogout() {
    dispatch(logoutUser())
    navigate('/login')
  }

  function toggleSidebar() {
    setCollapsed((prev) => !prev)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-paper text-charcoal">
      <aside
        className={`flex h-screen shrink-0 flex-col overflow-hidden border-r border-sand bg-white transition-[width] duration-200 ease-in-out ${
          collapsed ? 'w-[4.5rem]' : 'w-56 sm:w-64'
        }`}
      >
        <div
          className={`flex border-b border-sand py-4 ${
            collapsed
              ? 'flex-col items-center gap-2 px-2'
              : 'items-center justify-between gap-2 px-4 sm:px-5'
          }`}
        >
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <Link to="/dashboard" className="block">
                <Logo size="md" />
              </Link>
              {user?.name ? (
                <p className="mt-2 truncate pl-[2.75rem] text-sm text-charcoal/60">{user.name}</p>
              ) : user?.email ? (
                <p className="mt-2 truncate pl-[2.75rem] text-sm text-charcoal/60">{user.email}</p>
              ) : null}
            </div>
          ) : (
            <Link to="/dashboard" title="Job Tracker" className="shrink-0">
              <Logo size="sm" showWordmark={false} />
            </Link>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            className={`shrink-0 rounded-xl p-2 text-charcoal/60 transition-colors hover:bg-paper hover:text-charcoal ${
              collapsed ? 'mt-0' : ''
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} strokeWidth={1.75} />
            ) : (
              <PanelLeftClose size={18} strokeWidth={1.75} />
            )}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-4 sm:px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={getNavLinkClass(collapsed)}
            >
              <Icon size={18} strokeWidth={1.75} className="shrink-0" />
              {!collapsed ? <span>{label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sand px-2 py-4 sm:px-3">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Log out' : undefined}
            className={`flex w-full items-center rounded-xl text-sm font-medium text-charcoal/70 transition-colors hover:bg-paper ${
              collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <LogOut size={18} strokeWidth={1.75} className="shrink-0" />
            {!collapsed ? <span>Log out</span> : null}
          </button>
        </div>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
