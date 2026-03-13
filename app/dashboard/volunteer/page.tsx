"use client"

import { useState } from 'react'
import Image from 'next/image'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Search, Bell, Settings, Star, Award, Clock, TrendingUp, MapPin, Wifi, Home, PawPrint, Plus, Trophy, Shield, HeartHandshake, CheckCircle2, Navigation, Calendar, Timer, User, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { deleteDoc } from 'firebase/firestore'
import VolunteerApplicationModal from '@/components/volunteer-application-modal'
import VolunteerApplicationCard from '@/components/volunteer-application-card'
import VolunteerOpportunityCard from '@/components/volunteer-opportunity-card'
import { useAuth } from '@/components/auth-provider'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, getDoc, doc, limit, orderBy } from 'firebase/firestore'
import { useEffect } from 'react'

const MOCK_OPPORTUNITIES = [
  {
    id: 1,
    title: 'Community Garden Mulching',
    description: 'Help prepare our community gardens for the spring season. All tools provided.',
    duration: '3 hours',
    location: { address: 'Downtown Hub, City Center', lat: 0, lng: 0 },
    locationType: 'physical',
  },
  {
    id: 2,
    title: 'Senior Tech Support',
    description: 'Help seniors navigate video calls and basic tablet settings from the comfort...',
    duration: '1 hour',
    location: { address: 'Remote Support, Digital', lat: 0, lng: 0 },
    locationType: 'remote',
  },
  {
    id: 3,
    title: 'Food Bank Sorting',
    description: 'Assist with organizing incoming food donations and preparing distribution...',
    duration: '4 hours',
    location: { address: 'West Side Center, Campus', lat: 0, lng: 0 },
    locationType: 'physical',
  },
  {
    id: 4,
    title: 'Morning Dog Walking',
    description: 'Help our energetic shelter residents get their morning exercise and fresh air.',
    duration: '2 hours',
    location: { address: 'Happy Tails Shelter, Bark Park', lat: 0, lng: 0 },
    locationType: 'physical',
  },
]

export default function VolunteerDashboardPage() {
  const [isAvailable, setIsAvailable] = useState(true)
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [latestApplications, setLatestApplications] = useState<any[]>([])
  const [stats, setStats] = useState({ hours: 0, missions: 0, nextMission: null as any })
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const { user: firebaseUser } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "volunteers", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching volunteer data:", error);
        }
      }
    };
    if (mounted) fetchUserData();
  }, [firebaseUser, mounted]);

  useEffect(() => {
    if (!mounted) return;

    // PART B: Recommended Opportunities
    const qRec = query(
      collection(db, "requests"),
      where("status", "==", "open"),
      orderBy("createdAt", "desc"),
      limit(3)
    );

    const unsubRec = onSnapshot(qRec, (snapshot) => {
      const dbRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOpportunities(dbRequests);
    });

    // PART A: Latest Applications
    let unsubApps = () => {};
    if (firebaseUser) {
      const qApps = query(
        collection(db, "applications"),
        where("volunteerId", "==", firebaseUser.uid),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      unsubApps = onSnapshot(qApps, (snapshot) => {
        setLatestApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // PART C: Stats (Mocked or derived)
      const qStats = query(
        collection(db, "applications"),
        where("volunteerId", "==", firebaseUser.uid),
        where("status", "in", ["accepted", "completed"])
      );
      onSnapshot(qStats, (snapshot) => {
        const missions = snapshot.docs.map(d => d.data());
        const completed = missions.filter(m => m.status === 'completed');
        setStats({
          hours: completed.length * 2 + (missions.length - completed.length) * 0.5, // 2h for completed, 0.5h for ongoing
          missions: completed.length,
          nextMission: missions.find(m => m.status === 'accepted') || null
        });
      });
    }

    return () => {
      unsubRec();
      unsubApps();
    };
  }, [mounted, firebaseUser]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="volunteer" userName={userData?.fullName || "Volunteer"} userId={firebaseUser?.uid} />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h1 className="text-2xl font-bold text-foreground">Welcome back, {userData?.fullName?.split(' ')[0] || "Student"}</h1>
              <p className="text-muted-foreground">Manage your requests and campus support.</p>
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
            </div>
          </div>
        </header>

        <div className="p-6 space-y-8">
          {/* Main Feed Section */}
        <div className="space-y-10 max-w-7xl mx-auto">
          {/* PART C: Stats & Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-soft flex items-center gap-6 group hover:shadow-elevated transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Impact</p>
                <h3 className="text-3xl font-display font-bold text-foreground">{stats.hours} <span className="text-sm font-medium text-muted-foreground">Hours</span></h3>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-soft flex items-center gap-6 group hover:shadow-elevated transition-all">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/5 flex items-center justify-center border border-orange-500/10 group-hover:bg-orange-500/10 transition-colors">
                <Trophy className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Missions</p>
                <h3 className="text-3xl font-display font-bold text-foreground">{stats.missions} <span className="text-sm font-medium text-muted-foreground">Completed</span></h3>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 shadow-soft flex items-center gap-6 group hover:shadow-elevated transition-all border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Latest Update</p>
                <h3 className="text-sm font-bold text-foreground truncate">
                  {stats.nextMission?.requestTitle || "No upcoming missions"}
                </h3>
                <p className="text-[11px] font-medium text-primary/70 truncate">
                  {stats.nextMission?.status === 'accepted' ? 'Mission is active' : 'Awaiting approval'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* PART A: Latest Applied Applications (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  <HeartHandshake className="text-primary" size={20} /> Latest Applied
                </h2>
                <button className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">History</button>
              </div>

              <div className="space-y-4">
                {latestApplications.slice(0, 2).map((app) => (
                  <VolunteerApplicationCard 
                    key={app.id} 
                    app={app} 
                    onEdit={(application) => {
                      setSelectedRequest({
                        id: application.requestId,
                        title: application.requestTitle,
                        studentName: application.studentName,
                        location: application.requestLocation || { address: 'Campus' },
                        urgency: application.requestUrgency || 'medium',
                        categoryTags: application.requestCategoryTags || [],
                        date: application.requestDate || Date.now(),
                        time: application.requestTime || '10:00',
                        duration: application.requestDuration || '2 hours',
                        description: application.requestDescription || 'No description available.'
                      });
                      setSelectedApplication(application);
                    }}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}

                {latestApplications.length === 0 && (
                  <div className="py-12 border-2 border-dashed border-border rounded-[32px] text-center space-y-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                      <Shield className="text-muted-foreground" size={24} />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">You haven't applied to any missions yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* PART B: Recommended Opportunities (1/3 width) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  <Star className="text-primary" size={20} /> For You
                </h2>
                <button className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">All</button>
              </div>

              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <VolunteerOpportunityCard 
                    key={opp.id} 
                    opp={opp} 
                    hasApplied={latestApplications.some(app => app.requestId === opp.id)}
                    onView={(selected) => setSelectedRequest(selected)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="rounded-[32px] border-border bg-card shadow-elevated p-8">
            <AlertDialogHeader className="space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <AlertDialogTitle className="text-2xl font-display font-bold">Withdraw Application?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground font-medium">
                  Are you sure you want to withdraw your help? This action cannot be undone, and the student will no longer see your application.
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-4 sm:justify-center">
              <AlertDialogCancel className="rounded-2xl border-2 py-6 min-w-[120px] font-bold">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-500 hover:bg-red-600 rounded-2xl py-6 min-w-[120px] font-bold shadow-soft"
                onClick={async () => {
                  if (deleteId) {
                    try {
                      await deleteDoc(doc(db, "applications", deleteId));
                    } catch (error) {
                      console.error("Error deleting application:", error);
                    }
                  }
                  setDeleteId(null);
                }}
              >
                Yes, Withdraw
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>

        {/* Application Modal */}
        {selectedRequest && (
          <VolunteerApplicationModal
            request={selectedRequest}
            volunteerProfile={userData}
            applicationId={selectedApplication?.id}
            initialData={selectedApplication}
            onClose={() => {
              setSelectedRequest(null);
              setSelectedApplication(null);
            }}
            onApply={(data) => {
              setSelectedRequest(null);
              setSelectedApplication(null);
            }}
          />
        )}
      </main>
    </div>
  )
}
