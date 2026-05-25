'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { 
  ScanLine, LayoutDashboard, User, History, 
  LogOut, Menu, X, Shield, TrendingUp,
  Heart, Users, FileText, Mail, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & stats' },
  { href: '/scan', label: 'Scan Product', icon: ScanLine, desc: 'Barcode & photo scan' },
  { href: '/history', label: 'Scan History', icon: History, desc: 'Past scans & trends' },
  { href: '/profile', label: 'My Profile', icon: User, desc: 'Health conditions & allergies' },
  { href: '/family', label: 'Family Profiles', icon: Users, desc: 'Manage family members' },
  { href: '/tracker', label: 'Health Tracker', icon: TrendingUp, desc: 'Weekly nutrition tracking' },
]

const legalItems = [
  { href: '/disclaimer', label: 'Medical Disclaimer', icon: Shield },
  { href: '/privacy', label: 'Privacy Policy', icon: FileText },
  { href: '/terms', label: 'Terms of Service', icon: FileText },
  { href: '/contact', label: 'Contact Us', icon: Mail },
]

export function Navbar() {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            {/* Left: Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                  <ScanLine className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">HealthScan</span>
              </Link>
            </div>

            {/* Right: Desktop nav quick links */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link href="/scan" className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/scan' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <ScanLine className="h-4 w-4" />Scan
                  </Link>
                  <Link href="/dashboard" className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <LayoutDashboard className="h-4 w-4" />Dashboard
                  </Link>
                  <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">{user.email?.[0]?.toUpperCase()}</span>
                    </div>
                    <button onClick={signOut} className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
                      <LogOut className="h-3 w-3" />Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign in</button>
                  </Link>
                  <Link href="/auth/login">
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors">Get Started Free</button>
                  </Link>
                </div>
              )}
              {/* Mobile menu button for non-logged in */}
              {!user && (
                <button onClick={() => setSidebarOpen(true)} className="sm:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600">
                  <Menu className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <ScanLine className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">HealthScan</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="px-5 py-4 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-semibold">{user.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.user_metadata?.full_name || 'My Account'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto py-3">
              <div className="px-3 mb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Features</p>
                {navItems.map(item => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors group ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>{item.label}</p>
                        <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-300'}`} />
                    </Link>
                  )
                })}
              </div>

              <div className="px-3 mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Legal & Info</p>
                {legalItems.map(item => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 text-gray-300" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Sidebar Footer */}
            {user && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => { signOut(); setSidebarOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
            {!user && (
              <div className="p-4 border-t border-gray-100">
                <Link href="/auth/login" onClick={() => setSidebarOpen(false)}>
                  <button className="w-full py-2.5 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors">
                    Sign In / Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
