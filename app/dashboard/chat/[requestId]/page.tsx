"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore"
import Link from "next/link"
import { ArrowLeft, Loader2, ShieldCheck, Phone, Mail, ExternalLink } from "lucide-react"
import type { Message } from "@/lib/chat-utils"
import { createChat } from "@/lib/chat-utils"
import CalmButton from "@/components/calm-button"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.requestId as string
  const { user, loading: authLoading } = useAuth()
  
  const [request, setRequest] = useState<any>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  const [partnerProfile, setPartnerProfile] = useState<any>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch request details and verify access
  useEffect(() => {
    async function verifyAccess() {
      if (!user) return
      
      try {
        const reqDoc = await getDoc(doc(db, "requests", requestId))
        if (!reqDoc.exists()) {
          setError("Mission not found")
          setLoading(false)
          return
        }

        const reqData = reqDoc.data()
        
        // Ensure request is assigned
        if (reqData.status !== 'assigned' && reqData.status !== 'completed') {
          setError("Chat is only available for assigned or completed missions.")
          setLoading(false)
          return
        }

        const isStudentRole = reqData.studentId === user.uid
        const isAssignedVolunteer = reqData.volunteerId === user.uid
        
        if (!isStudentRole && !isAssignedVolunteer) {
          setError("You do not have permission to view this chat.")
          setLoading(false)
          return
        }

        setRequest(reqData)
        
        // Fetch Current User Profile for Sidebar
        const userColl = isStudentRole ? "students" : "volunteers"
        const userSnap = await getDoc(doc(db, userColl, user.uid))
        if (userSnap.exists()) {
          setCurrentUserProfile(userSnap.data())
        }

        // Fetch Partner Profile for Contact Details
        const partnerId = isStudentRole ? reqData.volunteerId : reqData.studentId
        const partnerColl = isStudentRole ? "volunteers" : "students"
        const partnerSnap = await getDoc(doc(db, partnerColl, partnerId))
        if (partnerSnap.exists()) {
          setPartnerProfile(partnerSnap.data())
        }
        
        // Find existing chat or create if missing
        const chatQuery = query(collection(db, "chats"), where("requestId", "==", requestId))
        const chatSnapshot = await getDocs(chatQuery)
        
        let foundChatId = ""
        if (chatSnapshot.empty) {
          foundChatId = await createChat(requestId, reqData.studentId, reqData.volunteerId)
        } else {
          foundChatId = chatSnapshot.docs[0].id
        }
        
        setChatId(foundChatId)
        setLoading(false)

      } catch (err) {
        console.error("Error verifying chat access:", err)
        setError("Failed to load chat data.")
        setLoading(false)
      }
    }

    if (!authLoading) {
      verifyAccess()
    }
  }, [requestId, user, authLoading])

  // Listen for messages
  useEffect(() => {
    if (!chatId) return

    const messagesQuery = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt")
    )

    const unsub = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]
      setMessages(msgs)
    })

    return () => unsub()
  }, [chatId])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <DashboardSidebar type="student" userName="Loading..." />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <DashboardSidebar type="student" userName={user?.displayName || "User"} />
        <main className="flex-1 lg:ml-64 flex items-center justify-center p-6">
          <div className="bg-card p-8 rounded-[32px] border border-border max-w-md text-center shadow-soft">
            <h2 className="text-xl font-bold text-foreground mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-8">{error || "Please sign in."}</p>
            <button 
              onClick={() => router.back()}
              className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-soft"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    )
  }

  const isStudent = request.studentId === user.uid
  const chatPartnerName = isStudent ? request.volunteerName : request.studentName

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row h-screen">
      {/* Sidebar with fetched user details */}
      <DashboardSidebar 
        type={isStudent ? "student" : "volunteer"} 
        userName={currentUserProfile?.fullName || user.displayName || "User"} 
        userId={user.uid}
        userAvatar={currentUserProfile?.profileImage}
      />
      
      <main className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="shrink-0 bg-card border-b border-border px-6 py-5 sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-all hover:scale-105 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-black text-foreground truncate tracking-tight">
                  {chatPartnerName}
                </h1>
                <div className="bg-primary/10 text-primary p-1 rounded-lg shrink-0" title="Verified Session">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] truncate opacity-80">
                  Mission: {request.title}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {partnerProfile?.phone && (
              <a 
                href={`tel:${partnerProfile.phone}`}
                className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-500/20 transition-all hover:scale-105"
                title="Call Partner"
              >
                <Phone size={18} />
              </a>
            )}
            {partnerProfile?.email && (
              <a 
                href={`mailto:${partnerProfile.email}`}
                className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center hover:bg-blue-500/20 transition-all hover:scale-105"
                title="Email Partner"
              >
                <Mail size={18} />
              </a>
            )}
            <Link 
              href={`/profile/${isStudent ? request.volunteerId : request.studentId}`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted text-xs font-black uppercase tracking-widest rounded-xl transition-all"
            >
              View Profile
            </Link>
          </div>
        </header>


        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-muted/10 overflow-hidden relative">
          <MessageList messages={messages} currentUserId={user.uid} />
          {chatId && (
            <MessageInput chatId={chatId} currentUserId={user.uid} />
          )}
        </div>
      </main>
    </div>
  )
}
