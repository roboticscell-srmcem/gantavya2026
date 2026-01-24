"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, LayoutDashboard, Calendar, Users, CreditCard, QrCode } from 'lucide-react'
import Link from 'next/link'

const navLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Teams', href: '/admin/teams', icon: Users },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Scan', href: '/admin/scan', icon: QrCode },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('admin_user')
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
    setLoading(false)
  }, [router])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const signOut = () => {
    localStorage.removeItem('admin_user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-neutral-800 bg-neutral-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/admin" className="text-lg sm:text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
                Gantavya Admin
              </Link>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {/* Nav Links */}
              <div className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href || 
                    (link.href !== '/admin' && pathname?.startsWith(link.href))
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="h-6 w-px bg-neutral-700" />

              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <User className="w-4 h-4" />
                  <span className="max-w-[150px] truncate">{user.username || user.email}</span>
                  {user.role && (
                    <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                      {user.role}
                    </span>
                  )}
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-neutral-400 hover:text-white rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-800 bg-neutral-900 px-4 py-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-2 text-sm text-neutral-400 pb-3 border-b border-neutral-800">
              <User className="w-4 h-4" />
              <span className="truncate flex-1">{user.username || user.email}</span>
              {user.role && (
                <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                  {user.role}
                </span>
              )}
            </div>

            {/* Nav Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href || 
                  (link.href !== '/admin' && pathname?.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-500/10 text-orange-500'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Sign Out */}
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </div>
    </div>
  )
}
