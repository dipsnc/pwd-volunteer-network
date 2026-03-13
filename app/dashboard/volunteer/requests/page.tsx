"use client"

import { useState } from 'react'
import Image from 'next/image'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Search, Bell, Settings, MapPin, Wifi, Clock, Filter, Home, PawPrint, BookOpen, Users } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import VolunteerApplicationModal from '@/components/volunteer-application-modal'
import VolunteerOpportunityCard from '@/components/volunteer-opportunity-card'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, limit } from 'firebase/firestore'
import { useEffect } from 'react'
import { type VolunteerRequest } from '@/lib/store'

type FilterType = 'all' | 'nearby' | 'remote' | 'urgent'

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Requests' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'remote', label: 'Remote' },
  { id: 'urgent', label: 'Urgent' },
]

const allRequests = [
  {
    id: 1,
    title: 'Community Garden Mulching',
    description: 'Help prepare our community gardens for the spring season. All tools provided.',
    duration: '3 hours',
    location: { address: 'Downtown Hub, City Center', lat: 0, lng: 0 },
    locationType: 'nearby',
    urgent: false,
    icon: Home,
  },
  {
    id: 2,
    title: 'Senior Tech Support',
    description: 'Help seniors navigate video calls and basic tablet settings from the comfort of home.',
    duration: '1 hour',
    location: { address: 'Remote Support, Digital', lat: 0, lng: 0 },
    locationType: 'remote',
    urgent: false,
    icon: Wifi,
  },
  {
    id: 3,
    title: 'Food Bank Sorting',
    description: 'Assist with organizing incoming food donations and preparing distribution packages.',
    duration: '4 hours',
    location: { address: 'West Side Center, Campus', lat: 0, lng: 0 },
    locationType: 'nearby',
    urgent: true,
    icon: Home,
  },
  {
    id: 4,
    title: 'Morning Dog Walking',
    description: 'Help our energetic shelter residents get their morning exercise and fresh air.',
    duration: '2 hours',
    location: { address: 'Happy Tails Shelter, Bark Park', lat: 0, lng: 0 },
    locationType: 'nearby',
    urgent: false,
    icon: PawPrint,
  },
  {
    id: 5,
    title: 'Online Tutoring - Math',
    description: 'Provide online tutoring support for high school algebra and geometry students.',
    duration: '2 hours',
    location: { address: 'Remote Support', lat: 0, lng: 0 },
    locationType: 'remote',
    urgent: false,
    icon: BookOpen,
  },
  {
    id: 6,
    title: 'Campus Accessibility Escort',
    description: 'Assist students with mobility needs navigating between campus buildings.',
    duration: '1.5 hours',
    location: { address: 'University Campus, Main Hall', lat: 0, lng: 0 },
    locationType: 'nearby',
    urgent: true,
    icon: Users,
  },
]

export default function VolunteerRequestsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [requests, setRequests] = useState<any[]>([])
  const [latestApplications, setLatestApplications] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const { user: firebaseUser } = useAuth()
  const [userData, setUserData] = useState<any>(null)
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

    // Listen to real-time updates for all open requests
    const q = query(
      collection(db, "requests"), 
      where("status", "==", "open"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbRequests = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          urgent: data.urgency === 'high',
          icon: data.locationType === 'remote' ? Wifi : Home,
          locationType: data.locationType || 'nearby',
          location: data.location || { address: 'Campus' },
          // Flatten some fields for consistency with OpportunityCard expectatations
          date: data.date || Date.now(),
          time: data.time || '10:00',
          duration: data.duration || '2 hours'
        };
      });
      
      const combined = [...allRequests, ...dbRequests];
      setRequests(combined);
    }, (error) => {
      console.error("Error fetching requests for volunteer:", error);
      setRequests(allRequests);
    });

    // Listen to volunteer's applications for 'Applied' status
    let unsubApps = () => {};
    if (firebaseUser) {
      const qApps = query(
        collection(db, "applications"),
        where("volunteerId", "==", firebaseUser.uid),
        limit(50)
      );
      unsubApps = onSnapshot(qApps, (snapshot) => {
        setLatestApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }

    return () => {
      unsubscribe();
      unsubApps();
    };
  }, [mounted]);

  if (!mounted) return null;

  const filteredRequests = activeFilter === 'all' 
    ? requests 
    : activeFilter === 'urgent'
    ? requests.filter((r: any) => r.urgent)
    : requests.filter((r: any) => r.locationType === activeFilter)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="volunteer" userName={userData?.fullName || "Volunteer"} userId={firebaseUser?.uid} />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h1 className="text-2xl font-bold text-foreground">Available Support Requests</h1>
              <p className="text-muted-foreground">Find opportunities to help students on campus.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-4 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search opportunities..." 
                  className="bg-transparent border-none outline-none text-sm w-40"
                />
              </div>
              <button>
                <Filter className='w-4 h-4 text-muted-foreground'/>
              </button>
            </div>
          </div>
        </header>



          {/* Requests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 my-6">
            {filteredRequests.map((request) => (
              <VolunteerOpportunityCard 
                key={request.id} 
                opp={request} 
                hasApplied={latestApplications.some(app => app.requestId === request.id)}
                onView={(opp) => {
                  const existingApp = latestApplications.find(app => app.requestId === opp.id);
                  if (existingApp) {
                    // Logic for editing? User said "add the pre application cards in this too"
                    // Pre-application card usually means the OpportunityCard (View mode).
                    // If they already applied, OpportunityCard shows "Applied" and disables clicking in dashboard.
                    // But in requests page, maybe we let them Edit? 
                    // Let's stick to OpportunityCard's hasApplied logic which blocks viewing.
                    // If they want to Edit, they can do it from Dashboard.
                    // Actually, let's make it consistent with the dashboard's B card.
                    setSelectedApplication(existingApp);
                  } else {
                    setSelectedApplication(null);
                  }
                  setSelectedRequest(opp);
                }}
              />
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No requests found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find more opportunities.</p>
            </div>
          )}

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
