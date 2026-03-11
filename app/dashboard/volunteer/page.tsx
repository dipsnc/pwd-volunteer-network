"use client"

import { useState } from 'react'
import Image from 'next/image'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Search, Bell, Settings, Star, Award, Clock, TrendingUp, MapPin, Wifi, Home, PawPrint, Plus, Trophy, Shield, HeartHandshake } from 'lucide-react'

const stats = [
  { label: 'Total Points', value: '2,450', icon: Star, badge: '+12% this mo', badgeColor: 'bg-primary/10 text-primary' },
  { label: 'Badges Earned', value: '12', icon: Award, badge: '+2 new', badgeColor: 'bg-primary/10 text-primary' },
  { label: 'Hours Volunteered', value: '86.5', icon: Clock, badge: '8h today', badgeColor: 'bg-muted text-muted-foreground' },
  { label: 'Global Rank', value: '#412', icon: TrendingUp, badge: 'Top 5%', badgeColor: 'bg-primary/10 text-primary' },
]

const opportunities = [
  {
    id: 1,
    title: 'Community Garden Mulching',
    description: 'Help prepare our community gardens for the spring season. All tools provided.',
    points: 350,
    duration: '3 hours',
    location: 'Downtown Hub',
    locationType: 'physical',
    image: '/images/garden-work.jpg',
  },
  {
    id: 2,
    title: 'Senior Tech Support',
    description: 'Help seniors navigate video calls and basic tablet settings from the comfort...',
    points: 150,
    duration: '1 hour',
    location: 'Remote Support',
    locationType: 'remote',
    image: '/images/tech-support.jpg',
  },
  {
    id: 3,
    title: 'Food Bank Sorting',
    description: 'Assist with organizing incoming food donations and preparing distribution...',
    points: 450,
    duration: '4 hours',
    location: 'West Side Center',
    locationType: 'physical',
    image: '/images/food-bank.jpg',
  },
  {
    id: 4,
    title: 'Morning Dog Walking',
    description: 'Help our energetic shelter residents get their morning exercise and fresh air.',
    points: 200,
    duration: '2 hours',
    location: 'Happy Tails Shelter',
    locationType: 'physical',
    image: '/images/dog-walking.jpg',
  },
]

const topContributors = [
  { rank: 1, name: 'Marcus Chen', points: 3890, hasGold: true },
  { rank: 2, name: 'Sarah Jenkins', points: 3420 },
  { rank: 3, name: 'David Miller', points: 3100 },
  { rank: 4, name: 'Elena Rodriguez', points: 2950 },
]

const certifications = [
  { name: 'First Aid Certified', status: 'Valid until Dec 2025', icon: Shield, completed: true },
  { name: 'Youth Mentorship', status: 'Level 2 Specialist', icon: HeartHandshake, completed: true },
  { name: 'Crisis Counselor', status: 'In Progress (75%)', icon: Award, completed: false },
]

export default function VolunteerDashboardPage() {
  const [isAvailable, setIsAvailable] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="volunteer" userName="Alex Rivera" userId="Level 12 Hero" />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12 flex-1 max-w-xl">
              <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search opportunities, events or members..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl hover:bg-muted transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">Alex Rivera</p>
                  <p className="text-xs text-primary">Level 12 Hero</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">AR</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.badgeColor}`}>
                    {stat.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Opportunities */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
                <button className="text-sm text-primary font-medium hover:underline">View all</button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40">
                      <Image
                        src={opp.image}
                        alt={opp.title}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                        {opp.points} pts
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs font-medium mb-2">
                        {opp.locationType === 'remote' ? (
                          <Wifi className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                        )}
                        <span className="text-primary uppercase">{opp.location}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{opp.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{opp.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {opp.duration}
                        </div>
                        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Top Contributors */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-foreground">Top Contributors</h3>
                </div>
                <div className="space-y-3">
                  {topContributors.map((user) => (
                    <div key={user.rank} className="flex items-center gap-3">
                      <span className={`w-6 text-center font-semibold ${
                        user.rank === 1 ? 'text-yellow-500' : 
                        user.rank === 2 ? 'text-gray-400' : 
                        user.rank === 3 ? 'text-amber-600' : 'text-muted-foreground'
                      }`}>
                        {user.rank}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.points.toLocaleString()} pts</p>
                      </div>
                      {user.hasGold && <Trophy className="w-4 h-4 text-yellow-500" />}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-primary mt-4 text-center">
                  You are currently ranked #412
                </p>
              </div>

              {/* Certifications */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Certifications</h3>
                </div>
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        cert.completed ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <cert.icon className={`w-5 h-5 ${cert.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2.5 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Certification
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="fixed bottom-6 left-6 lg:left-[17rem] bg-card rounded-2xl p-4 border border-border shadow-lg">
          <p className="text-xs font-medium text-primary uppercase mb-2">Availability Status</p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Ready for help</span>
            <button 
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-7 rounded-full transition-colors ${isAvailable ? 'bg-primary' : 'bg-muted'} relative`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
