"use client"

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Search, Bell, Settings, Filter, FileText, Home, FileWarning, CheckCircle, Clock, XCircle, Plus } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import VolunteerRequestCard from '@/components/volunteer-request-card'
import { type VolunteerRequest } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import ApplicantReviewModal from '@/components/applicant-review-modal'

type FilterType = 'all' | 'open' | 'assigned' | 'completed' | 'cancelled'

const filters: { id: FilterType; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Requests', icon: FileText },
  { id: 'open', label: 'Open', icon: Clock },
  { id: 'assigned', label: 'Assigned', icon: CheckCircle },
  { id: 'completed', label: 'Completed', icon: CheckCircle },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle },
]

export default function StudentRequestsPage() {
  const { user: firebaseUser } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [requests, setRequests] = useState<VolunteerRequest[]>([])
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<VolunteerRequest | null>(null)

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
            setUserData({ ...docSnap.data(), id: firebaseUser.uid });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };
    if (mounted) fetchUser();
  }, [firebaseUser, mounted])

  useEffect(() => {
    if (!userData || !mounted) return;

    const q = query(
      collection(db, "requests"),
      where("studentId", "==", userData.uid || userData.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VolunteerRequest[];
      setRequests(dbRequests);
      setLoading(false);
    });

    const qApps = query(
      collection(db, "applications"),
      where("studentId", "==", userData.uid || userData.id)
    );

    const unsubscribeApps = onSnapshot(qApps, (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        counts[data.requestId] = (counts[data.requestId] || 0) + 1;
      });
      setApplicantCounts(counts);
    });

    return () => {
      unsubscribe();
      unsubscribeApps();
    };
  }, [userData?.id, userData?.uid, mounted]);

  if (!mounted) return null

  const filteredRequests = activeFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === activeFilter)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar type="student" userName={userData?.fullName || "Student"} userId={firebaseUser?.uid} />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
              <p className="text-muted-foreground">Manage your help postings and volunteer applications.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-2xl px-5 py-2.5 border border-border/50">
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

        <div className="p-8 space-y-8">
          {/* Quick Stats / Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-3xl border border-border shadow-soft flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                <h3 className="text-2xl font-bold text-foreground">{requests.length} Requests</h3>
              </div>
            </div>
            <div className="bg-card p-6 rounded-3xl border border-border shadow-soft flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/5 flex items-center justify-center border border-orange-500/10">
                <Clock className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Open</p>
                <h3 className="text-2xl font-bold text-foreground">{requests.filter(r => r.status === 'open').length} Active</h3>
              </div>
            </div>
            <div className="bg-card p-6 rounded-3xl border border-border shadow-soft flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-green-500/5 flex items-center justify-center border border-green-500/10">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Filled</p>
                <h3 className="text-2xl font-bold text-foreground">{requests.filter(r => r.status === 'assigned' || r.status === 'completed').length} Successful</h3>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[32px] border border-border shadow-soft p-8 space-y-8">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeFilter === filter.id
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'bg-muted/30 border border-border/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <filter.icon className="w-3.5 h-3.5" />
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 px-5 py-3 bg-muted/30 rounded-2xl border border-border/50 text-xs font-bold text-muted-foreground hover:text-foreground transition-all">
                   <Filter className="w-3.5 h-3.5" /> Sort By: Newest
                 </button>
              </div>
            </div>

            {/* Requests Grid */}
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 w-full bg-muted rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-muted/10 rounded-[40px] border-2 border-dashed border-border/50">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">No Requests Found</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto font-medium">There are no requests matching your current filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredRequests.map((request) => (
                    <VolunteerRequestCard 
                      key={request.id} 
                      request={request}
                      isStudentView={true}
                      applicantCount={applicantCounts[request.id] || 0}
                      onClick={() => setSelectedRequestForReview(request)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedRequestForReview && (
          <ApplicantReviewModal 
            request={selectedRequestForReview} 
            onClose={() => setSelectedRequestForReview(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
