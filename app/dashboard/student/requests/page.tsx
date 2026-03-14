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
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { playAudioMessage } from '@/lib/audio'

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
        uid: doc.id,
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
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-2 h-22">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="lg:ml-0 ml-12 sm:ml-0">
              <h1 className="text-xl sm:text-3xl font-display font-black text-foreground tracking-tight leading-tight">
                My <span className="text-primary">Requests</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5 sm:mt-1 opacity-80">
                Manage your help postings and volunteer applications.
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
              <div className="hidden md:flex items-center gap-2 bg-muted/40 rounded-2xl px-5 py-3 border border-border/40 focus-within:border-primary/30 transition-all">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search requests..." 
                  className="bg-transparent border-none outline-none text-sm w-36 sm:w-48 placeholder:text-muted-foreground/50 font-medium"
                />
              </div>
              
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Quick Stats / Feedback */}
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-card p-5 sm:p-8 rounded-3xl border border-border shadow-soft flex items-center gap-4 sm:gap-6 group hover:border-primary/20 transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-70">Total</p>
                <h3 className="text-xl sm:text-2xl font-display font-black text-foreground tracking-tight">{requests.length} Requests</h3>
              </div>
            </div>
            <div className="bg-card p-5 sm:p-8 rounded-3xl border border-border shadow-soft flex items-center gap-4 sm:gap-6 group hover:border-orange-500/20 transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-orange-500/5 flex items-center justify-center border border-orange-500/10 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-70">Open</p>
                <h3 className="text-xl sm:text-2xl font-display font-black text-foreground tracking-tight">{requests.filter(r => r.status === 'open').length} Active</h3>
              </div>
            </div>
            <div className="bg-card p-5 sm:p-8 rounded-3xl border border-border shadow-soft flex items-center gap-4 sm:gap-6 group hover:border-green-500/20 transition-all sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-green-500/5 flex items-center justify-center border border-green-500/10 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-70">Filled</p>
                <h3 className="text-xl sm:text-2xl font-display font-black text-foreground tracking-tight">{requests.filter(r => r.status === 'assigned' || r.status === 'completed').length} Successful</h3>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[32px] border border-border shadow-soft p-5 sm:p-8 space-y-6 sm:space-y-8">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-3 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide no-scrollbar -mx-2 px-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => { setActiveFilter(filter.id); playAudioMessage(`Filter set to ${filter.label}`); }}
                    aria-label={`Filter by ${filter.label}`}
                    className={`flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                      activeFilter === filter.id
                        ? 'bg-primary border-primary text-primary-foreground shadow-soft'
                        : 'bg-muted/30 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <filter.icon className={cn("w-4 h-4", activeFilter === filter.id ? "text-primary-foreground" : "text-primary/60")} />
                    {filter.label}
                  </button>
                ))}
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
                <div className="text-center py-20 bg-muted/10 rounded-[40px] border-2 border-dashed border-border/50 group hover:border-primary/20 transition-all duration-500">
                  <div className="w-24 h-24 bg-card rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-soft group-hover:scale-110 transition-transform duration-500">
                    <FileText className="w-10 h-10 text-primary/40 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-foreground mb-3 tracking-tight ">No Requests <span className="text-primary not-italic">Found</span></h3>
                  <p className="text-muted-foreground max-w-xs mx-auto font-bold opacity-60 uppercase text-[10px] tracking-[0.2em]">There are no requests matching your current filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredRequests.map((request) => (
                    <VolunteerRequestCard 
                      key={request.uid} 
                      request={request}
                      isStudentView={true}
                      applicantCount={applicantCounts[request.uid] || 0}
                      onClick={() => { setSelectedRequestForReview(request); playAudioMessage("Opening request details"); }}
                      aria-label={`View details for request ${request.title}`}
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
