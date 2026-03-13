"use client"

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Search, Bell, Settings, Calendar, HeartHandshake, CheckCircle2, Clock, MapPin, Trash2 } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, orderBy, limit, doc, deleteDoc, getDoc } from 'firebase/firestore'
import VolunteerApplicationCard from '@/components/volunteer-application-card'
import VolunteerApplicationModal from '@/components/volunteer-application-modal'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function VolunteerSchedulePage() {
  const [mounted, setMounted] = useState(false)
  const { user: firebaseUser } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [missions, setMissions] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
    if (!mounted || !firebaseUser) return;

    const q = query(
      collection(db, "applications"),
      where("volunteerId", "==", firebaseUser.uid),
      where("status", "in", ["accepted", "completed"]),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbMissions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMissions(dbMissions);
    });

    return () => unsubscribe();
  }, [mounted, firebaseUser]);

  if (!mounted) return null;

  // Group missions by date
  const groupedMissions = missions.reduce((acc: any, mission: any) => {
    const dateStr = mission.requestDate ? new Date(mission.requestDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) : 'Upcoming';
    
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(mission);
    return acc;
  }, {});

  const dateKeys = Object.keys(groupedMissions);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="volunteer" userName={userData?.fullName || "Volunteer"} userId={firebaseUser?.uid} />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h1 className="text-2xl font-bold text-foreground">My Mission Schedule</h1>
              <p className="text-muted-foreground font-medium">Your upcoming commitments and completed impacts.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-12 max-w-5xl mx-auto">
          {missions.length === 0 ? (
            <div className="text-center py-20 space-y-6">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-border group-hover:bg-primary/5 transition-colors">
                <Calendar className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-foreground">No missions scheduled yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">Once a student accepts your application, it will appear here in your timeline.</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />

              <div className="space-y-12">
                {dateKeys.map((date, index) => (
                  <div key={date} className="relative space-y-8">
                    {/* Date Header - Sticky and Prominent */}
                    <div className="sticky top-[89px] z-20 -mx-6 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 hidden md:flex">
                         <Calendar className="text-primary-foreground w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-foreground uppercase tracking-widest">{date}</h3>
                        <p className="text-xs text-muted-foreground font-bold">{groupedMissions[date].length} {groupedMissions[date].length === 1 ? 'Mission' : 'Missions'} scheduled</p>
                      </div>
                    </div>

                    {/* Missions for this date */}
                    <div className="md:ml-20 space-y-6 pb-8">
                      {groupedMissions[date].map((mission: any) => (
                        <VolunteerApplicationCard 
                          key={mission.id} 
                          app={mission} 
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="rounded-[32px] border-border bg-card shadow-elevated p-8">
            <AlertDialogHeader className="space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <AlertDialogTitle className="text-2xl font-display font-bold">Withdraw Commitment?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground font-medium">
                  Are you sure you want to withdraw from this mission? The student has already accepted you, and canceling now might affect their schedule.
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

        {/* Application Modal (Editing) */}
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
