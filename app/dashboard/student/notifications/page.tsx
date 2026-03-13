"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Bell, CheckCircle2, UserPlus, Info, MoreVertical, Search, Filter } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getCurrentUser } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface Notification {
  id: string
  title: string
  message: string
  type: "success" | "volunteer_interest" | "info"
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Request Approved",
    message: "Your request 'Scribe for Mathematics Exam' has been approved by the administration.",
    type: "success",
    time: "2 hours ago",
    read: false
  },
  {
    id: "2",
    title: "Volunteer Interest",
    message: "Siddharth Malhotra is interested in assisting with your 'Lab Assistant' request.",
    type: "volunteer_interest",
    time: "5 hours ago",
    read: false
  },
  {
    id: "3",
    title: "Accessibility Update",
    message: "The elevator in Block C is now operational after maintenance.",
    type: "info",
    time: "1 day ago",
    read: true
  },
  {
    id: "4",
    title: "Reminder",
    message: "Don't forget to submit your feedback for the volunteer assistant who helped you yesterday.",
    type: "info",
    time: "2 days ago",
    read: true
  }
]

export default function NotificationsPage() {
  const { user: firebaseUser } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  useEffect(() => {
    const fetchUser = async () => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "students", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser({ ...docSnap.data(), uid: firebaseUser.uid });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };
    fetchUser();
  }, [firebaseUser])

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <DashboardSidebar 
        type="student" 
        userName={user?.fullName || "Student"} 
        userId={firebaseUser?.uid}
      />

      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground">View and manage your notifications</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-4 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search notifications..." 
                  className="bg-transparent border-none outline-none text-sm w-40"
                />
              </div>
            </div>
          </div>
        </header>


        <div className="max-w-4xl mx-auto space-y-6 my-6">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "relative group bg-card rounded-3xl p-6 border transition-all hover:shadow-elevated",
                  notif.read ? "border-border opacity-80" : "border-primary/20 bg-primary/5 ring-1 ring-primary/5"
                )}
                onClick={() => markAsRead(notif.id)}
              >
                {!notif.read && (
                  <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-primary rounded-full animate-soft-glow" />
                )}
                
                <div className="flex gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border",
                    notif.type === "success" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                    notif.type === "volunteer_interest" ? "bg-primary/10 text-primary border-primary/20" :
                    "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  )}>
                    {notif.type === "success" && <CheckCircle2 className="w-7 h-7" />}
                    {notif.type === "volunteer_interest" && <UserPlus className="w-7 h-7" />}
                    {notif.type === "info" && <Info className="w-7 h-7" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "text-lg font-display font-bold text-foreground",
                        !notif.read && "text-primary"
                      )}>{notif.title}</h3>
                      <span className="text-xs text-muted-foreground font-medium">{notif.time}</span>
                    </div>
                    <p className="text-sm text-foreground/80 font-medium leading-relaxed max-w-2xl">
                      {notif.message}
                    </p>
                    
                    <div className="pt-3 flex items-center gap-4">
                      {notif.type === "volunteer_interest" && (
                        <button className="text-xs font-bold text-primary hover:underline transition-all">View Profiles</button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                        className="text-xs font-bold text-muted-foreground hover:text-destructive transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {notifications.length === 0 && (
            <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-3xl">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-bold text-foreground text-xl">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-2">No new notifications for you right now.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
