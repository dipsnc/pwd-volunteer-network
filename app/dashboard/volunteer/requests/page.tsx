"use client"

import { useState } from 'react'
import Image from 'next/image'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Search, Bell, Settings, MapPin, Wifi, Clock, Filter, Home, PawPrint, BookOpen, Users } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect } from 'react'

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
    points: 350,
    duration: '3 hours',
    location: 'Downtown Hub',
    locationType: 'nearby',
    urgent: false,
    image: '/images/garden-work.jpg',
    icon: Home,
  },
  {
    id: 2,
    title: 'Senior Tech Support',
    description: 'Help seniors navigate video calls and basic tablet settings from the comfort of home.',
    points: 150,
    duration: '1 hour',
    location: 'Remote Support',
    locationType: 'remote',
    urgent: false,
    image: '/images/tech-support.jpg',
    icon: Wifi,
  },
  {
    id: 3,
    title: 'Food Bank Sorting',
    description: 'Assist with organizing incoming food donations and preparing distribution packages.',
    points: 450,
    duration: '4 hours',
    location: 'West Side Center',
    locationType: 'nearby',
    urgent: true,
    image: '/images/food-bank.jpg',
    icon: Home,
  },
  {
    id: 4,
    title: 'Morning Dog Walking',
    description: 'Help our energetic shelter residents get their morning exercise and fresh air.',
    points: 200,
    duration: '2 hours',
    location: 'Happy Tails Shelter',
    locationType: 'nearby',
    urgent: false,
    image: '/images/dog-walking.jpg',
    icon: PawPrint,
  },
  {
    id: 5,
    title: 'Online Tutoring - Math',
    description: 'Provide online tutoring support for high school algebra and geometry students.',
    points: 300,
    duration: '2 hours',
    location: 'Remote',
    locationType: 'remote',
    urgent: false,
    image: '/images/tech-support.jpg',
    icon: BookOpen,
  },
  {
    id: 6,
    title: 'Campus Accessibility Escort',
    description: 'Assist students with mobility needs navigating between campus buildings.',
    points: 250,
    duration: '1.5 hours',
    location: 'University Campus',
    locationType: 'nearby',
    urgent: true,
    image: '/images/volunteers-group.jpg',
    icon: Users,
  },
]

export default function VolunteerRequestsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
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

  if (!mounted) return null;

  const filteredRequests = activeFilter === 'all' 
    ? allRequests 
    : activeFilter === 'urgent'
    ? allRequests.filter(r => r.urgent)
    : allRequests.filter(r => r.locationType === activeFilter)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="volunteer" userName={userData?.fullName || "Volunteer"} userId={userData?.uid?.substring(0, 8).toUpperCase() || "..." } />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h1 className="text-2xl font-bold text-foreground">Available Requests</h1>
              <p className="text-muted-foreground">Find opportunities to help and earn points</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>

          {/* Requests Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-40">
                  <Image
                    src={request.image}
                    alt={request.title}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                    {request.points} pts
                  </span>
                  {request.urgent && (
                    <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs font-medium mb-2">
                    {request.locationType === 'remote' ? (
                      <Wifi className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span className="text-primary uppercase">{request.location}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{request.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{request.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {request.duration}
                    </div>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                      Accept
                    </button>
                  </div>
                </div>
              </div>
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
        </div>
      </main>
    </div>
  )
}
