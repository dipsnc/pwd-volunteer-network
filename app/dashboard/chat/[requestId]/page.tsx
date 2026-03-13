"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import type { Message } from "@/lib/chat-utils"
import { createChat } from "@/lib/chat-utils"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.requestId as string
  const { user, loading: authLoading } = useAuth()
  
  const [request, setRequest] = useState<any>(null)
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
        if (reqData.status !== 'assigned') {
          setError("Chat is only available for assigned missions.")
          setLoading(false)
          return
        }

        // Determine user role and check access
        const isStudent = reqData.studentId === user.uid
        const isAssignedVolunteer = reqData.volunteerId === user.uid
        
        if (!isStudent && !isAssignedVolunteer) {
          setError("You do not have permission to view this chat.")
          setLoading(false)
          return
        }

        setRequest(reqData)
        
        // Find existing chat or create if missing (for backwards compatibility)
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
  const chatPartnerName = isStudent ? request.assignedVolunteerName : request.studentName

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* We guess the sidebar type based on if they are the student or volunteer for this request */}
      <DashboardSidebar type={isStudent ? "student" : "volunteer"} userName={user.displayName || "User"} />
      
      <main className="flex-1 lg:ml-64 flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Header */}
        <header className="shrink-0 bg-card border-b border-border p-4 md:p-6 sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">
                  {chatPartnerName}
                </h1>
                <div className="bg-green-100 text-green-700 p-1 rounded-md" title="Verified Session">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                Mission: {request.title}
              </p>
            </div>
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
