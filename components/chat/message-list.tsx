"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { type Message } from "@/lib/chat-utils"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Abstract Mesh Gradient for premium feel */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent_50%)] pointer-events-none" />
        
        <div className="bg-card p-10 rounded-[40px] border border-border max-w-sm shadow-elevated relative z-10 scale-in duration-500">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <div className="w-8 h-8 bg-primary rounded-xl" />
          </div>
          <h3 className="text-xl font-display font-black text-foreground mb-3 tracking-tight">Direct Sanctuary</h3>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            This is the start of your secure conversation. Only you and your partner can see these messages.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative custom-scrollbar">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#0a0a0a] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-8 max-w-5xl mx-auto">
      {messages.map((message) => {
        const isMine = message.senderId === currentUserId

        return (
          <div
            key={message.id}
            className={cn(
              "flex w-full animate-in fade-in slide-in-from-bottom-4 duration-500",
              isMine ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] md:max-w-[75%] rounded-[32px] px-6 py-4 shadow-soft transition-all hover:scale-[1.01]",
                isMine 
                  ? "bg-primary text-primary-foreground rounded-br-sm shadow-primary/20" 
                  : "bg-card border border-border shadow-sm text-foreground rounded-bl-sm"
              )}
            >
              <p className="text-[15px] leading-relaxed break-words font-medium">{message.text}</p>
              <div className={cn(
                "flex items-center gap-2 mt-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-50",
                isMine ? "justify-end" : "justify-start"
              )}>
                {message.createdAt?.seconds 
                  ? new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Sending...'}
              </div>
            </div>
          </div>
        )
      })}
      </div>
      <div ref={bottomRef} className="h-4" />
    </div>
  )
}
