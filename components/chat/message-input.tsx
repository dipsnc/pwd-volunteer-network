"use client"

import { useState } from "react"
import { SendHorizonal } from "lucide-react"
import { sendMessage } from "@/lib/chat-utils"

interface MessageInputProps {
  chatId: string
  currentUserId: string
}

export function MessageInput({ chatId, currentUserId }: MessageInputProps) {
  const [text, setText] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!text.trim() || isSending) return

    setIsSending(true)
    try {
      await sendMessage(chatId, currentUserId, text)
      setText("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <form 
      onSubmit={handleSend}
      className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-t border-border shrink-0 relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3 p-2.5 rounded-[32px] border border-border bg-muted/30 focus-within:border-primary/40 focus-within:bg-card focus-within:shadow-elevated transition-all duration-300">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your message here..."
            className="flex-1 bg-transparent border-none outline-none resize-none min-h-[48px] max-h-40 px-5 py-3.5 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60 transition-all"
            rows={1}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!text.trim() || isSending}
            className="w-12 h-12 shrink-0 bg-primary text-primary-foreground rounded-[20px] flex items-center justify-center disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-primary/25 shadow-lg mr-1 mb-1"
          >
            {isSending ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <SendHorizonal className="w-5 h-5 -ml-0.5" />}
          </button>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] opacity-40">
            Secure Entry Room
          </p>
          <div className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] opacity-40">
            Press Enter to Send
          </p>
        </div>
      </div>
    </form>
  )
}
