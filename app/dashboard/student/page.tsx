"use client"

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Search, Bell, Settings, CheckCircle, FileWarning, Clock, Calendar, FileText, Home, MoreHorizontal, MapPin, Phone } from 'lucide-react'

const requestStatus = [
  { id: 1, label: 'Submitted', date: 'Oct 24, 09:30 AM', completed: true },
  { id: 2, label: 'Under Review', date: 'Oct 25, 02:15 PM', completed: true },
  { id: 3, label: 'Approval', date: 'In Progress', completed: false, active: true },
  { id: 4, label: 'Scheduled', date: 'Pending', completed: false },
]

const activeRequests = [
  {
    id: 1,
    type: 'Exam Extension',
    description: 'CS101 - Midterm exam extra time request.',
    status: 'PENDING',
    date: 'Created 2d ago',
    icon: FileText,
  },
  {
    id: 2,
    type: 'Lab Aide',
    description: 'Chemistry Lab 4 assistance for wheelchair access.',
    status: 'ASSIGNED',
    date: 'Tomorrow, 10:00',
    icon: Home,
  },
  {
    id: 3,
    type: 'Resource Access',
    description: 'Digital textbook accessibility format request.',
    status: 'IN PROGRESS',
    date: 'Created 5d ago',
    icon: FileWarning,
  },
]

const schedule = [
  {
    day: 'MON',
    date: '28',
    title: 'Advanced Mathematics',
    time: '10:00 AM - 11:30 AM',
    location: 'Hall B',
    tag: 'Note Taker Provided',
  },
  {
    day: 'MON',
    date: '28',
    title: 'Introduction to Sociology',
    time: '01:00 PM - 02:30 PM',
    location: 'Room 204',
  },
  {
    day: 'TUE',
    date: '29',
    title: 'Lab Session: Organic Chemistry',
    time: '09:00 AM - 12:00 PM',
    location: 'Science Wing',
    tag: 'Assistant Assigned',
  },
]

export default function StudentDashboardPage() {
  const [scheduleView, setScheduleView] = useState<'week' | 'month'>('week')

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="student" userName="Alex Johnson" userId="20240912" />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h1 className="text-2xl font-bold text-foreground">Welcome back, Alex</h1>
              <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your campus requests.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-4 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search requests..." 
                  className="bg-transparent border-none outline-none text-sm w-40"
                />
              </div>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Current Request Status */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Current Request Status: <span className="text-primary">Exam Accommodations</span>
            </h2>
            <div className="flex items-center justify-between">
              {requestStatus.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-primary' : step.active ? 'bg-primary/20 border-2 border-primary' : 'bg-muted'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5 text-primary-foreground" />
                      ) : step.active ? (
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                      ) : (
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <p className={`text-sm font-medium mt-2 ${step.active ? 'text-primary' : step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.date}</p>
                  </div>
                  {index < requestStatus.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Active Requests */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Active Requests</h2>
                <button className="text-sm text-primary font-medium hover:underline">View All</button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {activeRequests.map((request) => (
                  <div key={request.id} className="bg-card rounded-2xl p-5 border border-border hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                      request.status === 'PENDING' ? 'bg-yellow-100' : 
                      request.status === 'ASSIGNED' ? 'bg-blue-100' : 'bg-primary/10'
                    }`}>
                      <request.icon className={`w-5 h-5 ${
                        request.status === 'PENDING' ? 'text-yellow-600' : 
                        request.status === 'ASSIGNED' ? 'text-blue-600' : 'text-primary'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{request.type}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{request.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                        request.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' : 'bg-primary/10 text-primary'
                      }`}>
                        {request.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{request.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Schedule */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Weekly Schedule</h2>
                  <div className="flex bg-muted rounded-lg p-1">
                    <button 
                      onClick={() => setScheduleView('week')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        scheduleView === 'week' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      Week
                    </button>
                    <button 
                      onClick={() => setScheduleView('month')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        scheduleView === 'month' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {schedule.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="text-center border-l-4 border-primary pl-3">
                        <p className="text-xs text-muted-foreground font-medium">{item.day}</p>
                        <p className="text-2xl font-bold text-foreground">{item.date}</p>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.time} • {item.location}
                        </p>
                      </div>
                      {item.tag && (
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                          item.tag.includes('Assigned') ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'
                        }`}>
                          {item.tag}
                        </span>
                      )}
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Campus Location */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Campus Location</h3>
                <div className="aspect-video bg-muted rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwwLDAsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full shadow-lg animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Student Union Center</p>
                    <p className="text-sm text-muted-foreground">Central Hub • 0.2 miles away</p>
                  </div>
                  <button className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-foreground" />
                  </button>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm opacity-90 mb-4">
                  Our accessibility team is available 24/7 for urgent assistance.
                </p>
                <button className="w-full bg-card text-primary py-3 rounded-xl font-semibold hover:bg-card/90 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
