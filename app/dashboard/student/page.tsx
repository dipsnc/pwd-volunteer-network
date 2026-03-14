"use client"

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Search, Bell, Settings, CheckCircle, FileWarning, Clock, Calendar, FileText, Home, MoreHorizontal, MapPin, Phone, Users, ShieldCheck, BookOpen } from 'lucide-react'
import { getVolunteerRequests, type VolunteerRequest } from '@/lib/store'
import RequestVolunteerCard from '@/components/request-volunteer-card'
import VolunteerRequestCard from '@/components/volunteer-request-card'
import VolunteerRequestForm from '@/components/volunteer-request-form'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {motion, AnimatePresence} from 'framer-motion'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { getBrowserLocation } from '@/lib/location'
import { useAuth } from '@/components/auth-provider'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, doc, getDoc, orderBy } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { playAudioMessage } from '@/lib/audio'



export default function StudentDashboardPage() {
  const [scheduleView, setScheduleView] = useState<'week' | 'month'>('week')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<VolunteerRequest | undefined>(undefined)
  const [selectedStatusRequestId, setSelectedStatusRequestId] = useState<string | null>(null)
  const [requests, setRequests] = useState<VolunteerRequest[]>([])
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({})
  const router = useRouter()
  const { user: firebaseUser, loading: authLoading } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "students", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData({ ...docSnap.data(), id: firebaseUser.uid });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    if (mounted) fetchUserData();
  }, [firebaseUser, mounted]);

  useEffect(() => {
    if (!userData || !mounted) return;

    // Listen to real-time updates for this student's requests
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
      
      const combined = [...dbRequests];
      setRequests(combined);
      
      if (combined.length > 0 && !selectedStatusRequestId) {
        setSelectedStatusRequestId(combined[0].uid);
      }
    }, (error) => {
      console.error("Error fetching requests:", error);
      setRequests([]);
    });

    // Listen to applications to count them
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

  const refreshRequests = () => {
    // This is now handled by onSnapshot, but we keep the prop for compatibility
    setShowRequestForm(false)
    setSelectedRequest(undefined)
  }

  const handleOpenForm = (request?: VolunteerRequest) => {
    setSelectedRequest(request)
    setShowRequestForm(true)
    playAudioMessage(request ? "Viewing request details" : "Creating new volunteer request")
  }
const [userLoc, setUserLoc] = useState({ lat: 19.0760, lng: 72.8777 }); // Default
useEffect(() => {
  getBrowserLocation().then(coords => setUserLoc(coords)).catch(console.error);
}, []);

const MiniMap = dynamic(() => import('@/components/minimap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse" /> 
})

  if (!mounted) return <div className="min-h-screen bg-background" />

  const selectedReqForStatus = requests.find(r => r.uid === selectedStatusRequestId);

  



  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar type="student" userName={userData?.fullName || "Student"} userId={firebaseUser?.uid} />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="lg:ml-0 ml-10 sm:ml-0">
              <h1 className="text-xl sm:text-3xl font-display font-black text-foreground tracking-tight leading-tight">
                Welcome back, <span className="text-primary">{userData?.fullName?.split(' ')[0] || "Student"}</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5 sm:mt-1 opacity-80">
                Manage your campus support and active requests.
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
              <button 
                className="hidden md:flex p-3 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all duration-300 border border-border/50 group"
                onClick={() => { playAudioMessage("Opening profile settings"); router.push(`/profile/${firebaseUser?.uid}`); }}
                title="Profile Settings"
                aria-label="Profile Settings"
              >
                <Settings className="w-5 h-5 text-muted-foreground group-hover:rotate-45 transition-transform" />
              </button>
            </div>
          </div>
        </header>


        <div className="p-4 sm:p-8 space-y-6 sm:space-y-10">
          {/* Top Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <RequestVolunteerCard onClick={() => handleOpenForm()} />
             
             {/* Current Status Widget */}
              <div className="lg:col-span-2 bg-card rounded-3xl p-5 sm:p-8 border border-border shadow-soft flex flex-col justify-center relative overflow-hidden group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 relative z-10">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-display font-black text-foreground leading-tight tracking-tight">
                        Live Support <span className="text-primary">Status</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1.5 font-bold opacity-70">Tracking progress for your active requests</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <select 
                        value={selectedStatusRequestId || ''} 
                        onChange={(e) => setSelectedStatusRequestId(e.target.value)}
                        className="flex-1 sm:flex-none bg-muted/50 border border-border rounded-xl px-4 py-2 text-[10px] sm:text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer min-w-0"
                      >
                        {requests.length > 0 ? (
                          requests.map(r => (
                            <option key={r.uid} value={r.uid}>{r.title}</option>
                          ))
                        ) : (
                          <option value="">No requests found</option>
                        )}
                      </select>
                      <Badge variant="outline" className="text-xs font-black text-primary border-primary/20 bg-primary/5 px-4 py-2 shrink-0 uppercase tracking-widest">
                        {selectedReqForStatus?.status === 'open' ? 'Matching' : 
                         selectedReqForStatus?.status === 'assigned' ? 'Active Support' : 
                         selectedReqForStatus?.status === 'completed' ? 'Completed' :
                         selectedReqForStatus?.status || 'No Active Request'}
                      </Badge>
                    </div>
                  </div>

                <div className="flex items-center">
                  {[
                    { id: 1, label: 'Submitted' },
                    { id: 2, label: 'Approval' },
                    { id: 3, label: 'Matching' },
                    { id: 4, label: 'Active' },
                  ].map((step, index, array) => {
                    const isCompleted = selectedReqForStatus ? (
                      (step.id === 1) || // Submitted is always done if request exists
                      (step.id === 2 && selectedReqForStatus.status !== 'pending') || // Approval done if not pending
                      (step.id === 3 && (selectedReqForStatus.status === 'assigned' || selectedReqForStatus.status === 'completed')) || // Matching done if assigned/complete
                      (step.id === 4 && selectedReqForStatus.status === 'completed') // Active done if complete
                    ) : false;

                    const isActive = selectedReqForStatus ? (
                      (step.id === 2 && selectedReqForStatus.status === 'pending') || // Approval active if pending
                      (step.id === 3 && selectedReqForStatus.status === 'open') || // Matching active if open
                      (step.id === 4 && selectedReqForStatus.status === 'assigned') // Active active if assigned
                    ) : false;

                    return (
                      <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500",
                            isCompleted ? "bg-primary shadow-soft text-primary-foreground" : 
                            isActive ? "bg-primary/10 border-2 border-primary animate-soft-glow text-primary" : 
                            "bg-muted/30 text-muted-foreground/40 border border-border/50"
                          )}>
                            {isCompleted ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : 
                             isActive ? <Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" /> : 
                             <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
                          </div>
                          <p className={cn(
                            "text-[8px] sm:text-xs font-black mt-3 sm:mt-4 uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-colors duration-500 text-center",
                            isCompleted || isActive ? "text-foreground" : "text-muted-foreground/50"
                          )}>
                            {step.label}
                          </p>
                        </div>
                        {index < array.length - 1 && (
                          <div className="flex-1 px-1 sm:px-4 mb-6 sm:mb-8">
                             <div className={cn(
                               "h-0.5 sm:h-1 rounded-full transition-all duration-700",
                               isCompleted ? "bg-primary" : "bg-border/30"
                             )} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             {/* Active Requests List */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-3xl font-display font-black text-foreground tracking-tight">
                      My Volunteer <span className="text-primary">Requests</span>
                    </h2>
                    <p className="text-[10px] sm:text-sm text-muted-foreground font-bold mt-1 sm:mt-1.5 opacity-60 uppercase tracking-widest leading-none">
                      Found {requests.length} open postings
                    </p>
                  </div>
                  <Link href="/dashboard/student/requests">
                    <button 
                      onClick={() => playAudioMessage("Viewing history")} 
                      aria-label="View request history"
                      className="text-xs font-black text-primary hover:underline transition-all uppercase tracking-widest"
                    >
                      View History
                    </button>
                  </Link>
                </div>
              
              <div className="space-y-4">
                {requests.length === 0 ? (
                  <div className="bg-muted/20 border-2 border-dashed border-border rounded-3xl p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                       <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-bold text-foreground">No active requests yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Post a request to find a campus volunteer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <VolunteerRequestCard 
                        key={request.uid} 
                        request={request}
                        onClick={() => handleOpenForm(request)}
                        isStudentView={true}
                        applicantCount={applicantCounts[request.uid] || 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column / Quick Help */}
            <div className="space-y-8">
              {/* Campus Location */}
              <div className="bg-card rounded-3xl p-5 sm:p-8 border border-border shadow-soft overflow-hidden relative z-10">
                <h3 className="text-sm sm:text-base font-display font-black text-foreground uppercase tracking-wider mb-4 sm:mb-6">Current Location</h3>
                <div className="aspect-square bg-muted rounded-2xl mb-6 overflow-hidden relative group">
                  <MiniMap lat={userLoc.lat} lng={userLoc.lng} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">Mumbai Campus</p>
                    <p className="text-xs text-muted-foreground font-medium">Main Admin Block • Center Zone</p>
                  </div>
                  <button 
                    onClick={() => playAudioMessage("Refreshing current location")}
                    aria-label="Refresh current location"
                    className="w-12 h-12 gradient-primary rounded-2xl shadow-soft flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <MapPin className="w-6 h-6 text-primary-foreground" />
                  </button>
                </div>
              </div>

              {/* Need Help CTA */}
              <div className="gradient-primary rounded-3xl p-6 sm:p-8 text-primary-foreground shadow-elevated relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-display text-xl sm:text-2xl font-black mb-2 sm:mb-3">24/7 Support</h3>
                  <p className="text-sm font-medium opacity-90 mb-6 leading-relaxed">
                    Experiencing any difficulty? Call the National Emergency Number.
                  </p>
                  <a 
                    href="tel:112"
                    aria-label="Call Emergency Contact 112"
                    onClick={() => playAudioMessage("Calling Emergency Contact number 112")}
                    className="w-full bg-white text-primary py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 no-underline"
                  >
                    <Phone className="w-4 h-4" />
                    Emergency Contact
                  </a>
                </div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showRequestForm && (
          <VolunteerRequestForm 
            onClose={() => { setShowRequestForm(false); setSelectedRequest(undefined); }} 
            onSuccess={refreshRequests}
            request={selectedRequest}
            readOnly={!!selectedRequest}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
