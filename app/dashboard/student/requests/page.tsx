"use client"

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Search, Bell, Settings, Filter, FileText, Home, FileWarning, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect } from 'react'

type FilterType = 'all' | 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'

const filters: { id: FilterType; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All', icon: FileText },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'assigned', label: 'Assigned', icon: CheckCircle },
  { id: 'in-progress', label: 'In Progress', icon: FileWarning },
  { id: 'completed', label: 'Completed', icon: CheckCircle },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle },
]

const allRequests = [
  { id: 1, type: 'Exam Extension', description: 'CS101 - Midterm exam extra time request.', status: 'pending', date: '2 days ago', icon: FileText },
  { id: 2, type: 'Lab Aide', description: 'Chemistry Lab 4 assistance for wheelchair access.', status: 'assigned', date: 'Tomorrow, 10:00', icon: Home },
  { id: 3, type: 'Resource Access', description: 'Digital textbook accessibility format request.', status: 'in-progress', date: '5 days ago', icon: FileWarning },
  { id: 4, type: 'Note-Taking Support', description: 'Advanced Mathematics lecture notes assistance.', status: 'completed', date: 'Oct 15, 2023', icon: FileText },
  { id: 5, type: 'Mobility Assistance', description: 'Campus tour assistance for orientation week.', status: 'completed', date: 'Oct 10, 2023', icon: Home },
  { id: 6, type: 'Writing Support', description: 'Essay proofreading and formatting help.', status: 'cancelled', date: 'Oct 8, 2023', icon: FileText },
]

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-primary/10 text-primary',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function StudentRequestsPage() {
  const { user: firebaseUser } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "students", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };
    if (mounted) fetchUser();
  }, [firebaseUser, mounted])

  if (!mounted) return null

  const filteredRequests = activeFilter === 'all' 
    ? allRequests 
    : allRequests.filter(r => r.status === activeFilter)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="student" userName={userData?.fullName || "Student"} userId={firebaseUser?.uid} />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
              <p className="text-muted-foreground">View and manage all your assistance requests</p>
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
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}
          </div>

          {/* Requests Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-card rounded-2xl p-5 border border-border hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  request.status === 'pending' ? 'bg-yellow-100' : 
                  request.status === 'assigned' ? 'bg-blue-100' : 
                  request.status === 'completed' ? 'bg-green-100' :
                  request.status === 'cancelled' ? 'bg-red-100' : 'bg-primary/10'
                }`}>
                  <request.icon className={`w-5 h-5 ${
                    request.status === 'pending' ? 'text-yellow-600' : 
                    request.status === 'assigned' ? 'text-blue-600' : 
                    request.status === 'completed' ? 'text-green-600' :
                    request.status === 'cancelled' ? 'text-red-600' : 'text-primary'
                  }`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{request.type}</h3>
                <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${statusColors[request.status]}`}>
                    {request.status.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">{request.date}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <button className="flex-1 text-sm font-medium text-primary hover:underline">
                    View Details
                  </button>
                  {request.status === 'pending' && (
                    <button className="flex-1 text-sm font-medium text-destructive hover:underline">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No requests found</h3>
              <p className="text-muted-foreground">There are no requests matching this filter.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
