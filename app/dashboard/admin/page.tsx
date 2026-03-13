"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { 
  Search, Bell, User, Users, FileCheck, ClipboardList, 
  AlertTriangle, TrendingUp, TrendingDown, Clock, School, 
  Megaphone, ChevronRight
} from 'lucide-react'
import { db } from "@/lib/firebase"
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore"
import { cn } from "@/lib/utils"

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    volunteers: 0,
    pendingVolunteers: 0,
    activeRequests: 0,
    openRequests: 0,
    totalStudents: 0
  })
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [criticalRequests, setCriticalRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for volunteers
    const unsubVolunteers = onSnapshot(collection(db, "volunteers"), (snapshot) => {
      const all = snapshot.size
      const pending = snapshot.docs.filter(doc => doc.data().status === 'pending').length
      setCounts(prev => ({ ...prev, volunteers: all, pendingVolunteers: pending }))
    })

    // Listen for students
    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setCounts(prev => ({ ...prev, totalStudents: snapshot.size }))
    })

    // Listen for requests
    const unsubRequests = onSnapshot(collection(db, "requests"), (snapshot) => {
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const active = all.filter((r: any) => r.status === 'assigned').length
      const open = all.filter((r: any) => r.status === 'open').length
      
      setCounts(prev => ({ ...prev, activeRequests: active, openRequests: open }))
      
      // Recent requests (top 3 for the table)
      const sorted = [...all].sort((a: any, b: any) => 
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      ).slice(0, 3)
      setRecentRequests(sorted)

      // Critical requests (high urgency)
      const critical = all.filter((r: any) => r.urgency === 'high').slice(0, 2)
      setCriticalRequests(critical)
      
      setLoading(false)
    })

    return () => {
      unsubVolunteers()
      unsubStudents()
      unsubRequests()
    }
  }, [])

  const stats = [
    { 
      label: 'Volunteers', 
      value: counts.volunteers.toLocaleString(), 
      change: 'Total', 
      up: true,
      icon: Users,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    { 
      label: 'Pending Approvals', 
      value: counts.pendingVolunteers.toString(), 
      change: 'Needs Action', 
      up: counts.pendingVolunteers > 0,
      icon: FileCheck,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    { 
      label: 'Active Missions', 
      value: counts.activeRequests.toString(), 
      change: 'Assigned', 
      up: true,
      icon: ClipboardList,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Open Requests', 
      value: counts.openRequests.toString(), 
      change: 'Unassigned', 
      up: true,
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
  ]

  const analyticsData = [
    { label: 'Active Coverage', value: counts.volunteers > 0 ? Math.round((counts.activeRequests / counts.volunteers) * 100) : 0, color: 'bg-primary' },
    { label: 'Student Engagement', value: counts.totalStudents > 0 ? Math.round((counts.activeRequests / counts.totalStudents) * 100) : 0, color: 'bg-blue-500' },
    { label: 'System Health', value: 98, color: 'bg-green-500' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="admin" userName="Admin User" />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Dashboard Overview</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-4 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-sm w-32 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <User className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${stat.up ? 'text-primary' : 'text-muted-foreground'}`}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activity */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Recent Platform Activity</h2>
                  <button className="text-sm text-primary font-medium hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 font-medium">NAME / TITLE</th>
                        <th className="pb-3 font-medium">TYPE</th>
                        <th className="pb-3 font-medium">STATUS</th>
                        <th className="pb-3 font-medium">CREATED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [1, 2, 3].map(i => (
                          <tr key={i} className="animate-pulse">
                            <td className="py-4"><div className="h-4 w-32 bg-muted rounded" /></td>
                            <td className="py-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                            <td className="py-4"><div className="h-6 w-16 bg-muted rounded-full" /></td>
                            <td className="py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                          </tr>
                        ))
                      ) : recentRequests.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">No recent requests</td>
                        </tr>
                      ) : recentRequests.map((item, index) => (
                        <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                <span className="text-sm font-bold text-primary">{item.studentName?.substring(0, 1) || 'R'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground truncate max-w-[200px]">{item.title}</span>
                                <span className="text-xs text-muted-foreground">{item.studentName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-semibold uppercase text-muted-foreground">{item.categoryTags?.[0] || 'Mission'}</td>
                          <td className="py-4">
                            <span className={cn(
                              "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                              item.status === 'open' ? "bg-orange-100 text-orange-700" :
                              item.status === 'assigned' ? "bg-blue-100 text-blue-700" :
                              "bg-green-100 text-green-700"
                            )}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 text-xs text-muted-foreground">
                            {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Critical Missions */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> High Urgency Missions
                </h2>
                <div className="space-y-4">
                  {criticalRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No critical missions currently active</p>
                  ) : criticalRequests.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.studentName} • {task.location?.address?.split(',')[0]}</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-soft hover:opacity-90 transition-all">
                        Intervene
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Analytics Overview */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <h3 className="font-semibold text-foreground mb-4">Operations Meta</h3>
                <div className="space-y-4">
                  {analyticsData.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{item.label}</span>
                        <span className="text-sm font-bold text-foreground">{item.value}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Update */}
              <div className="bg-primary rounded-[32px] p-8 text-primary-foreground shadow-soft relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Megaphone className="w-20 h-20" />
                </div>
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <Megaphone className="w-5 h-5" />
                  <h3 className="font-bold">System Pulse</h3>
                </div>
                <p className="text-sm opacity-90 mb-6 relative z-10 leading-relaxed">
                  The new mission rewards system is scaling up. Real-time auditing is now active for all assigned specialists.
                </p>
                <button className="w-full bg-card text-primary py-3 rounded-2xl font-bold text-xs shadow-soft hover:bg-card/90 transition-all relative z-10">
                  Internal Memo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
