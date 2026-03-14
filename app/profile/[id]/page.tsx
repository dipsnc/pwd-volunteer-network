"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Award, 
  BookOpen, ShieldCheck, Settings, Star, MessageSquare, 
  Clock, Heart, GraduationCap, Trash2,
  Pencil
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { 
  doc, getDoc, collection, query, where, 
  onSnapshot, addDoc, serverTimestamp, deleteDoc,
  orderBy, updateDoc
} from "firebase/firestore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import CalmButton from "@/components/calm-button"
import CalmCard from "@/components/calm-card"
import { Spinner } from "@/components/ui/spinner"
  import { cn } from "@/lib/utils"
  import { toast } from "sonner"

type TabType = 'about' | 'education' | 'reviews' | 'location'

export default function UniversalProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: firebaseUser } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [viewerData, setViewerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('about')
  const [stats, setStats] = useState({ missions: 0, hours: 0 })
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [editedBio, setEditedBio] = useState("")
  const [isSavingBio, setIsSavingBio] = useState(false)

  const userId = params.id as string
  const isOwner = firebaseUser?.uid === userId

  useEffect(() => {
    const fetchViewerData = async () => {
      if (!firebaseUser) return
      try {
        const studentRef = doc(db, "students", firebaseUser.uid)
        const studentSnap = await getDoc(studentRef)
        if (studentSnap.exists()) {
          setViewerData({ ...studentSnap.data(), id: firebaseUser.uid, type: 'student' })
        } else {
          const volunteerRef = doc(db, "volunteers", firebaseUser.uid)
          const volunteerSnap = await getDoc(volunteerRef)
          if (volunteerSnap.exists()) {
            setViewerData({ ...volunteerSnap.data(), id: firebaseUser.uid, type: 'volunteer' })
          }
        }
      } catch (error) {
        console.error("Error fetching viewer data:", error)
      }
    }
    if (firebaseUser) fetchViewerData()
  }, [firebaseUser])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Try students collection
        let docRef = doc(db, "students", userId)
        let docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setProfile({ ...docSnap.data(), id: docSnap.id, type: 'student' })
        } else {
          // Try volunteers collection
          docRef = doc(db, "volunteers", userId)
          docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setProfile({ ...docSnap.data(), id: docSnap.id, type: 'volunteer' })
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchProfile()
  }, [userId])

  useEffect(() => {
    if (profile?.bio) {
      setEditedBio(profile.bio)
    }
  }, [profile])

  useEffect(() => {
    if (!profile || profile.type !== 'volunteer') return

    const q = query(
      collection(db, "applications"),
      where("volunteerId", "==", userId),
      where("status", "==", "completed")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const completedMissions = snapshot.size
      // Rough calc: each mission is 2 hours for now
      setStats({ missions: completedMissions, hours: completedMissions * 2 })
    })

    return () => unsubscribe()
  }, [profile, userId])

  useEffect(() => {
    if (!userId) return

    const q = query(
      collection(db, "comments"),
      where("profileId", "==", userId),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return () => unsubscribe()
  }, [userId])

  const handleAddComment = async () => {
    if (!firebaseUser || !newComment.trim()) return

    try {
      // Get viewer name for comment
      let viewerName = firebaseUser.displayName || "Anonymous"
      const studentRef = doc(db, "students", firebaseUser.uid)
      const studentSnap = await getDoc(studentRef)
      if (studentSnap.exists()) {
        viewerName = studentSnap.data().fullName
      } else {
        const volunteerRef = doc(db, "volunteers", firebaseUser.uid)
        const volunteerSnap = await getDoc(volunteerRef)
        if (volunteerSnap.exists()) {
          viewerName = volunteerSnap.data().fullName
        }
      }

      await addDoc(collection(db, "comments"), {
        profileId: userId,
        authorId: firebaseUser.uid,
        authorName: viewerName,
        content: newComment.trim(),
        createdAt: serverTimestamp()
      })
      setNewComment("")
      toast.success("Comment posted!")
    } catch (error) {
      console.error("Error posting comment:", error)
      toast.error("Failed to post comment")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, "comments", commentId))
      toast.success("Comment deleted")
    } catch (error) {
      toast.error("Failed to delete comment")
    }
  }

  const handleSaveBio = async () => {
    if (!profile || !editedBio.trim() || isSavingBio) return
    
    setIsSavingBio(true)
    try {
      const collectionName = profile.type === 'student' ? 'students' : 'volunteers'
      await updateDoc(doc(db, collectionName, userId), {
        bio: editedBio.trim(),
        updatedAt: serverTimestamp()
      })
      
      setProfile({ ...profile, bio: editedBio.trim() })
      setIsEditingBio(false)
      toast.success("Bio updated successfully!")
    } catch (error) {
      console.error("Error updating bio:", error)
      toast.error("Failed to update bio")
    } finally {
      setIsSavingBio(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Spinner className="w-12 h-12 text-primary" />
      <p className="font-display font-bold text-muted-foreground animate-pulse uppercase tracking-widest text-xs">Accessing Profile...</p>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 text-destructive">
        <User size={40} />
      </div>
      <h1 className="text-4xl font-display font-black text-foreground mb-4 uppercase tracking-tight">Record Not Found</h1>
      <p className="text-muted-foreground mb-10 max-w-md mx-auto font-medium">This profile is private or does not exist in our volunteer network.</p>
      <CalmButton onClick={() => router.back()} variant="outline" className="px-10">Go Back</CalmButton>
    </div>
  )

  const isStudent = profile.type === 'student'

  const tabs: { id: TabType, label: string, icon: any }[] = [
    { id: 'about', label: 'About', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar 
        type={viewerData?.type || 'volunteer'} 
        userName={viewerData?.fullName || "Loading..."} 
        userId={viewerData?.id || firebaseUser?.uid}
      />

      <main className="lg:ml-64 min-h-screen pb-12">
        {/* Top Header/Banner */}
        <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 relative group">
           {isOwner && (
             <button 
              onClick={() => router.push(`/dashboard/${profile.type}/profile`)}
              className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-foreground hover:bg-white/40 transition-all shadow-elevated z-20 group-hover:scale-110"
             >
               <Settings className="w-6 h-6" />
             </button>
           )}
        </div>

        <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-10">
          {/* Main Profile Card */}
          <CalmCard className="p-8 md:p-12 border-none bg-card/80 backdrop-blur-2xl shadow-elevated rounded-[40px] overflow-hidden">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              
              <div className="relative group/avatar">
                <Avatar className="w-40 h-40 border-8 border-card shadow-soft outline-2 outline-primary  transition-transform duration-500 group-hover/avatar:scale-105">
                  <AvatarFallback className="bg-primary text-primary-foreground text-5xl font-black">
                    {profile.profilePhotoUrl ? (
                      <img src={profile.profilePhotoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                    ) : (
                      profile.fullName?.substring(0, 2).toUpperCase()
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 p-3 bg-primary rounded-2xl shadow-lg shadow-primary/30 text-white">
                  {isStudent ? <Heart size={20} /> : <ShieldCheck size={20} />}
                </div>
              </div>
              

              <div className="flex-1 text-center md:text-left pt-2">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-center md:justify-start">
                  <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-foreground line-clamp-1">{profile.fullName}</h1>
                  <Badge className={cn(
                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap",
                    isStudent ? "bg-primary/20 text-primary border-primary/30" : "bg-blue-500/20 text-blue-600 border-blue-500/30"
                  )}>
                    {isStudent ? "Student" : "Volunteer"}
                  </Badge>
                  <Badge className={cn(
                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap",
                    profile.managedByGuardian ? "bg-primary/20 text-primary border-primary/30" : "bg-blue-500/20 text-blue-600 border-blue-500/30"
                  )}>
                    {profile.managedByGuardian ? "Managed by Guardian" : "Individual Support"}
                  </Badge>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-xl text-xs font-bold text-muted-foreground border border-border/50">
                    <MapPin size={14} className="text-primary" /> Mumbai, India
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-xl text-xs font-bold text-muted-foreground border border-border/50">
                    <Calendar size={14} className="text-primary" /> Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                  {isStudent ? (
                    <>
                      <StatItem 
                        label="Disability" 
                        value={
                          profile.disabilityType || 
                          profile.disabilityTypes?.[0] || 
                          "—"
                        } 
                        icon={ShieldCheck} 
                      />
                      <StatItem label="Age" value={profile.age || "—"} icon={User} />
                      <StatItem label="Blood" value={profile.bloodGroup || "—"} icon={Heart} />
                    </>
                  ) : (
                    <>
                      <StatItem label="Impact" value={`${stats.missions} Missions`} icon={Award} />
                      <StatItem label="Experience" value={`${stats.hours} Hours`} icon={Clock} />
                      <StatItem label="Rating" value="5.0" icon={Star} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </CalmCard>

          {/* Tab Navigation */}
          <div className="mt-12 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-border/50 px-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all shrink-0",
                  activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Content Area */}
          <div className="mt-8 px-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'about' && (
                  <CalmCard className="p-10 space-y-8 bg-card/60 backdrop-blur-xl border-border/40">
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Biography</h3>
                        {isOwner && !isEditingBio && (
                          <button 
                            onClick={() => {
                              setEditedBio(profile.bio || `Dedicated ${profile.type} focused on building a more accessible campus community. Passionate about ${isStudent ? "inclusive education" : "social impact"} and peer-to-peer support systems. Always looking for new ways to contribute to the university network.`)
                              setIsEditingBio(true)
                            }}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                      
                      {isEditingBio ? (
                        <div className="space-y-4">
                          <textarea 
                            className="w-full bg-background/50 border-2 border-border/50 rounded-2xl p-4 text-sm font-medium focus:border-primary outline-none transition-all resize-none min-h-[150px]"
                            value={editedBio}
                            onChange={(e) => setEditedBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                          />
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => setIsEditingBio(false)}
                              className="px-6 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-all"
                            >
                              Cancel
                            </button>
                            <CalmButton 
                              onClick={handleSaveBio}
                              disabled={isSavingBio || !editedBio.trim()}
                              className="px-6 py-2 rounded-xl text-xs"
                            >
                              {isSavingBio ? "Saving..." : "Save Bio"}
                            </CalmButton>
                          </div>
                        </div>
                      ) : (
                        <p className="text-foreground/80 leading-relaxed font-medium">
                          {profile.bio || (
                            <>
                              Dedicated {profile.type} focused on building a more accessible campus community. 
                              Passionate about {isStudent ? "inclusive education" : "social impact"} and peer-to-peer support systems.
                              Always looking for new ways to contribute to the university network.
                            </>
                          )}
                        </p>
                      )}
                    </section>
                    
                    <section className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border/30">
                      <div>
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Contact Details</h3>
                        <div className="space-y-4">
                          <ContactInfo icon={Mail} label="Email" value={profile.email} />
                          <ContactInfo icon={Phone} label="Mobile" value={profile.phone} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Preferences</h3>
                        <div className="flex flex-wrap gap-2">
                          {isStudent ? (
                            profile.assistanceNeeds?.split(',').map((s: string) => (
                              <Badge key={s} variant="secondary" className="px-3 py-1 font-bold">{s.trim()}</Badge>
                            ))
                          ) : (
                            profile.skills?.split(',').map((s: string) => (
                              <Badge key={s} variant="secondary" className="px-3 py-1 font-bold">{s.trim()}</Badge>
                            ))
                          )}
                        </div>
                      </div>
                    </section>
                  </CalmCard>
                )}

                {activeTab === 'education' && (
                  <CalmCard className="p-10 space-y-8 bg-card/60 backdrop-blur-xl border-border/40">
                    <div className="flex items-start gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-8 h-8 text-primary" />
                       </div>
                       <div>
                          <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Education</h3>
                          <p className="text-muted-foreground font-bold">{isStudent ? profile.courseDetails : `${profile.course} • Year ${profile.year}`}</p>
                          <p className="text-sm font-medium text-foreground/70 mt-4 leading-relaxed">
                            Currently enrolled at {isStudent ? "Mumbai University" : profile.collegeName}. 
                            Specializing in {isStudent ? profile.courseDetails: profile.course} with a focus on practical application.
                          </p>
                       </div>
                    </div>
                  </CalmCard>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Add Comment */}
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Add Reviews</h3>
                    {firebaseUser && (
                      <CalmCard className="p-6 border-primary/20 bg-primary/5">
                        <div className="flex gap-4">
                          <Avatar className="w-12 h-12 shadow-soft">
                            <AvatarImage src={firebaseUser.photoURL || ""} alt={firebaseUser.displayName || ""} className="object-cover" />
                            <AvatarFallback className="bg-primary text-primary-foreground font-black text-sm">
                              {(firebaseUser.displayName || firebaseUser.email || "??").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-4">
                            <textarea 
                              placeholder="Write a message or testimonial..."
                              className="w-full bg-background/50 border-2 border-border/50 rounded-2xl p-4 text-sm font-medium focus:border-primary outline-none transition-all resize-none min-h-[100px]"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end">
                              <CalmButton 
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="px-8 py-3 rounded-xl shadow-lg shadow-primary/20"
                              >
                                Post Message
                              </CalmButton>
                            </div>
                          </div>
                        </div>
                      </CalmCard>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.length === 0 ? (
                        <div className="text-center py-20 bg-card/30 rounded-[40px] border-2 border-dashed border-border/50">
                          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground font-bold">No messages yet. Be the first to say something!</p>
                        </div>
                      ) : (
                        comments.map(comment => (
                          <motion.div 
                            key={comment.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <CalmCard className="p-6 relative group/comment">
                              <div className="flex gap-4">
                                <Avatar className="w-12 h-12 shadow-soft">
                                  <AvatarFallback className="bg-muted text-muted-foreground font-black">
                                    {comment.authorName?.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-foreground text-sm">{comment.authorName}</h4>
                                    <span className="text-[10px] text-muted-foreground font-black uppercase">
                                      {comment.createdAt?.toDate().toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-foreground/80 leading-relaxed">{comment.content}</p>
                                </div>
                              </div>
                              
                              {(isOwner || firebaseUser?.uid === comment.authorId) && (
                                <button 
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover/comment:opacity-100 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </CalmCard>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatItem({ label, value, icon: Icon }: any) {
  return (
    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-primary" />
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground line-clamp-1">{value || "—"}</p>
    </div>
  )
}

function ContactInfo({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-primary shadow-soft">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}
