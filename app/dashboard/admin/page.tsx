"use client"

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Search, Bell, User, Users, FileCheck, ClipboardList, AlertTriangle, TrendingUp, TrendingDown, Clock, School, Megaphone } from 'lucide-react'

const stats = [
  { 
    label: 'Volunteers', 
    value: '1,284', 
    change: '+12%', 
    up: true,
    icon: Users,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  { 
    label: 'Pending Approvals', 
    value: '42', 
    change: '+5%', 
    up: true,
    icon: FileCheck,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  { 
    label: 'Active Tasks', 
    value: '156', 
    change: '-2%', 
    up: false,
    icon: ClipboardList,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  { 
    label: 'Open Disputes', 
    value: '8', 
    change: '+1%', 
    up: true,
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600'
  },
]

const recentApprovals = [
  { name: 'John Doe', initials: 'JD', role: 'Volunteer', status: 'Pending', statusColor: 'bg-yellow-100 text-yellow-700', date: '2023-10-24', action: 'Review' },
  { name: 'Jane Smith', initials: 'JS', role: 'Student', status: 'Approved', statusColor: 'bg-green-100 text-green-700', date: '2023-10-23', action: 'View' },
  { name: 'Alex Johnson', initials: 'AJ', role: 'Volunteer', status: 'Flagged', statusColor: 'bg-red-100 text-red-700', date: '2023-10-22', action: 'Resolve' },
]

const criticalTasks = [
  { 
    title: 'Community Park Cleanup',
    subtitle: 'Overdue by 2 hours • 12 Volunteers assigned',
    urgent: true,
    icon: School,
    action: 'Contact Leads'
  },
  { 
    title: 'After-school Tutoring Session',
    subtitle: 'Starts in 30 mins • 4 Students waiting',
    urgent: false,
    icon: Clock,
    action: 'View Details'
  },
]

const analyticsData = [
  { label: 'Student Engagement', value: 85, color: 'bg-primary' },
  { label: 'Volunteer Retention', value: 62, color: 'bg-blue-500' },
  { label: 'Dispute Resolution Rate', value: 94, color: 'bg-red-400' },
]

const chartData = [
  { day: 'MON', value: 60 },
  { day: 'TUE', value: 45 },
  { day: 'WED', value: 80 },
  { day: 'THU', value: 70 },
  { day: 'FRI', value: 90 },
  { day: 'SAT', value: 75 },
  { day: 'SUN', value: 55 },
]

export default function AdminDashboardPage() {
  const maxChartValue = Math.max(...chartData.map(d => d.value))

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="admin" userName="Admin User" />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
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
                <div className={`flex items-center gap-1 text-sm ${stat.up ? 'text-primary' : 'text-red-500'}`}>
                  {stat.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Approvals */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Recent Approvals & Monitoring</h2>
                  <button className="text-sm text-primary font-medium hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 font-medium">NAME</th>
                        <th className="pb-3 font-medium">ROLE</th>
                        <th className="pb-3 font-medium">STATUS</th>
                        <th className="pb-3 font-medium">DATE</th>
                        <th className="pb-3 font-medium">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApprovals.map((item, index) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm font-medium text-foreground">{item.initials}</span>
                              </div>
                              <span className="font-medium text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-muted-foreground">{item.role}</td>
                          <td className="py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.statusColor}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 text-muted-foreground">{item.date}</td>
                          <td className="py-4">
                            <button className="text-primary font-medium text-sm hover:underline">
                              {item.action}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Critical Tasks */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Critical Task Monitoring</h2>
                <div className="space-y-4">
                  {criticalTasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          task.urgent ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <task.icon className={`w-6 h-6 ${task.urgent ? 'text-red-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.subtitle}</p>
                        </div>
                      </div>
                      <button className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        task.urgent 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'border border-border text-foreground hover:bg-muted'
                      }`}>
                        {task.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Analytics Overview */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Analytics Overview</h3>
                <div className="space-y-4">
                  {analyticsData.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Growth */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Monthly Growth Activity</h3>
                <div className="flex items-end justify-between h-32 gap-2">
                  {chartData.map((d) => (
                    <div key={d.day} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-primary/20 rounded-t-md transition-all hover:bg-primary/30"
                        style={{ height: `${(d.value / maxChartValue) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Update */}
              <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
                <div className="flex items-center gap-2 mb-3">
                  <Megaphone className="w-5 h-5" />
                  <h3 className="font-semibold">System Update</h3>
                </div>
                <p className="text-sm opacity-90 mb-4">
                  We are rolling out the new reward system this weekend. All pending points will be migrated automatically.
                </p>
                <button className="w-full bg-card text-primary py-3 rounded-xl font-semibold hover:bg-card/90 transition-colors">
                  Read Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
