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
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="bg-muted/30 p-6 rounded-[32px] border border-border max-w-sm">
          <p className="text-muted-foreground text-sm font-medium">
            This is the start of your conversation. Only you and the assigned user can view these messages.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {messages.map((message) => {
        const isMine = message.senderId === currentUserId

        return (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              isMine ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] md:max-w-[70%] rounded-[24px] px-5 py-3.5 shadow-soft",
                isMine 
                  ? "bg-primary text-primary-foreground rounded-br-sm" 
                  : "bg-muted/50 border border-border/50 text-foreground rounded-bl-sm"
              )}
            >
              <p className="text-[15px] leading-relaxed break-words">{message.text}</p>
              <p className={cn(
                "text-[10px] mt-2 font-bold uppercase tracking-widest opacity-70",
                isMine ? "text-right" : "text-left"
              )}>
                {message.createdAt?.seconds 
                  ? new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Sending...'}
              </p>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} className="h-1" />
    </div>
  )
}
