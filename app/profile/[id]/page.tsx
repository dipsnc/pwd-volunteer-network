"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Award, BookOpen, ShieldCheck } from "lucide-react"
import { getStudents, getVolunteers, type StudentUser, type VolunteerUser } from "@/lib/store"
import CalmCard from "@/components/calm-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import CalmButton from "@/components/calm-button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<StudentUser | VolunteerUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = params.id as string
    const student = getStudents().find(s => s.id === userId)
    const volunteer = getVolunteers().find(v => v.id === userId)
    
    setProfile(student || volunteer || null)
    setLoading(false)
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Spinner className="w-12 h-12 text-primary" />
      <p className="font-display font-bold text-muted-foreground animate-pulse uppercase tracking-widest text-xs">Loading Profile...</p>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 text-destructive">
        <User size={40} />
      </div>
      <h1 className="text-4xl font-display font-black text-foreground mb-4 uppercase tracking-tight">User Not Found</h1>
      <p className="text-muted-foreground mb-10 max-w-md mx-auto font-medium">The profile you are looking for doesn't exist or has been removed from our network.</p>
      <CalmButton onClick={() => router.back()} variant="outline" className="px-10">
        Go Back
      </CalmButton>
    </div>
  )

  const isStudent = profile.type === 'student'

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <CalmButton 
          variant="outline"
          onClick={() => router.back()} 
          className="mb-12 border-none px-4 py-2 hover:bg-muted"
          icon={<ArrowLeft size={16} />}
          audioLabel="Go back to dashboard"
        >
          Back to Dashboard
        </CalmButton>

        <div className="relative">
          {/* Header Card */}
          <CalmCard className="p-10 mb-8 border-none bg-card/40 backdrop-blur-2xl shadow-elevated overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <Avatar className="w-32 h-32 border-4 border-background shadow-soft">
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-black">
                  {profile.fullName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-5xl font-display font-black tracking-tighter text-foreground leading-[0.9]">{profile.fullName}</h1>
                  <Badge className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                    isStudent ? "bg-primary/10 text-primary border-primary/20" : "bg-accent/10 text-accent-foreground border-accent/20"
                  )}>
                     {isStudent ? "STUDENT" : "VOLUNTEER"}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-bold flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest text-[10px] mt-1 opacity-70">
                  <MapPin size={14} className="text-primary" /> Campus Location: Mumbai
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                  <div className="px-5 py-2.5 bg-background/50 rounded-2xl border border-border/50 text-[11px] font-black uppercase tracking-widest shadow-soft flex items-center gap-2">
                    <Calendar size={14} className="text-primary" /> Joined {new Date(profile.createdAt).getFullYear()}
                  </div>
                  {!isStudent && (
                    <div className="px-5 py-2.5 bg-primary/10 rounded-2xl border border-primary/20 text-[11px] font-black text-primary uppercase tracking-widest shadow-soft flex items-center gap-2">
                      <ShieldCheck size={14} /> VERIFIED VOLUNTEER
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Background Accent */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          </CalmCard>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="space-y-6">
              <CalmCard className="p-8 border-border/50 bg-card/60">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 border-b border-border/50 pb-4">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-soft">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-70">Email Address</p>
                      <p className="text-sm font-bold text-foreground">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-soft">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-70">Phone Number</p>
                      <p className="text-sm font-bold text-foreground">{profile.phone}</p>
                    </div>
                  </div>
                </div>
              </CalmCard>

              {isStudent && (
                <div className="p-8 rounded-3xl bg-primary text-primary-foreground shadow-elevated relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-90">Support Profile</h3>
                    <div className="space-y-4">
                      <p className="text-lg font-display font-black flex items-center gap-2">
                        <ShieldCheck size={20} /> {(profile as StudentUser).disabilityType}
                      </p>
                      <p className="text-xs leading-relaxed font-medium opacity-90">
                        Looking for dedicated assistance with note-taking, complex campus navigation, and exam support.
                      </p>
                    </div>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                </div>
              )}
            </div>

            {/* Center Content */}
            <div className="md:col-span-2 space-y-8">
              <CalmCard className="p-10 border-border/50 bg-card/60">
                <h3 className="text-2xl font-display font-black text-foreground mb-8 flex items-center gap-3 uppercase tracking-tighter">
                   <BookOpen className="text-primary" /> 
                   {isStudent ? "Course & Curriculum" : "Skills & Capability"}
                </h3>
                
                {isStudent ? (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
                       <p className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-2">Current Curriculum</p>
                       <p className="text-foreground font-bold leading-relaxed">
                         {(profile as StudentUser).courseDetails}
                       </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl bg-background border border-border/50">
                          <p className="text-[10px] font-black text-muted-foreground uppercase">College Status</p>
                          <p className="text-sm font-bold">{(profile as StudentUser).enrolledInCollege ? "Enrolled" : "Not Enrolled"}</p>
                       </div>
                       <div className="p-4 rounded-xl bg-background border border-border/50">
                          <p className="text-[10px] font-black text-muted-foreground uppercase">Blood Group</p>
                          <p className="text-sm font-bold">{(profile as StudentUser).bloodGroup}</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
                       <p className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-3">Skills</p>
                       <div className="flex flex-wrap gap-2">
                         {(profile as VolunteerUser).skills.split(',').map(skill => (
                           <Badge key={skill} variant="secondary" className="bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-default">
                             {skill.trim()}
                           </Badge>
                         ))}
                       </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
                       <p className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-2">University Affiliation</p>
                       <p className="text-foreground font-bold">{(profile as VolunteerUser).collegeName}</p>
                       <p className="text-xs text-muted-foreground mt-1">{(profile as VolunteerUser).course} • Year {(profile as VolunteerUser).year}</p>
                    </div>
                  </div>
                )}
              </CalmCard>

              {/* Badges/Achievements Section */}
              <CalmCard className="p-8">
                <h3 className="text-xl font-display font-black text-foreground mb-6 flex items-center gap-3">
                   <Award className="text-primary" /> Badges & Achievements
                </h3>
                <div className="grid grid-cols-4 gap-4">
                   {[1, 2, 3, 4].map(b => (
                     <div key={b} className="aspect-square rounded-2xl bg-muted animate-pulse border border-border/50 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-background opacity-50" />
                     </div>
                   ))}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-6 font-medium">Achievements will unlock as they complete community tasks.</p>
              </CalmCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
