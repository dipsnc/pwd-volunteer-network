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
      className="p-4 md:p-6 bg-card border-t border-border shrink-0"
    >
      <div className="max-w-4xl mx-auto flex items-end gap-3 p-2 rounded-[32px] border border-border bg-muted/30 focus-within:border-primary/50 focus-within:bg-muted/10 transition-colors shadow-soft">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none outline-none resize-none min-h-[44px] max-h-32 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
          rows={1}
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="w-11 h-11 shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-soft mr-1 mb-1"
        >
          <SendHorizonal className="w-5 h-5 -ml-0.5" />
        </button>
      </div>
      <p className="text-center mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Press Enter to send • Shift + Enter for new line
      </p>
    </form>
  )
}
