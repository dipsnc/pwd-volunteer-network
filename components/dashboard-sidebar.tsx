"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, FileText, BarChart3, Calendar, MapPin, History, 
  Accessibility, User, ArrowLeft, LogOut, Menu, X, Award, Trophy, 
  Clock, Users, Settings, Bell, Shield, Gift, Megaphone, CheckSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { clearCurrentUser } from '@/lib/store'

interface SidebarLink {
  href: string
  label: string
  icon: React.ElementType
}

interface DashboardSidebarProps {
  type: 'student' | 'volunteer' | 'admin'
  userName?: string
  userId?: string
  userAvatar?: string
}

const studentLinks: SidebarLink[] = [
  { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/student/requests', label: 'My Requests', icon: FileText },
  { href: '/dashboard/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/student/profile', label: 'Profile', icon: User },
]

const volunteerLinks: SidebarLink[] = [
  { href: '/dashboard/volunteer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/volunteer/requests', label: 'Available Requests', icon: CheckSquare },
  { href: '/dashboard/volunteer/schedule', label: 'My Schedule', icon: Calendar },
  { href: '/dashboard/volunteer/profile', label: 'Profile', icon: User },
]

const adminLinks: SidebarLink[] = [
  { href: '/dashboard/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/students', label: 'Manage Students', icon: Users },
  { href: '/dashboard/admin/volunteers', label: 'Approve Volunteers', icon: Shield },
  { href: '/dashboard/admin/requests', label: 'Monitor Requests', icon: FileText },
  { href: '/dashboard/admin/disputes', label: 'Resolve Disputes', icon: Bell },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar({ type, userName, userId, userAvatar }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  const links = type === 'student' ? studentLinks : type === 'volunteer' ? volunteerLinks : adminLinks
  const brandName = type === 'student' ? 'Student Portal' : type === 'volunteer' ? 'ImpactPortal' : 'Admin Console'
  const subtitle = type === 'student' ? 'University Access' : type === 'volunteer' ? 'Volunteer Network' : 'Management Portal'

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-card rounded-lg border border-border shadow-sm"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 flex flex-col transition-transform duration-200",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Brand */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              {type === 'student' ? (
                <FileText className="w-5 h-5 text-primary-foreground" />
              ) : type === 'volunteer' ? (
                <Users className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Shield className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <h1 className="font-bold text-foreground">{brandName}</h1>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <button
            onClick={() => {
              clearCurrentUser()
              window.location.href = '/'
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* User Info */}
        {userName && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{userName}</p>
                {userId && <p className="text-xs text-muted-foreground">ID: {userId}</p>}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
