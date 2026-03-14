"use client"

import { motion } from "framer-motion"
import { useAccessibility } from "@/components/accessibility-provider"
import React from "react"
import { cn } from "@/lib/utils"

interface CalmButtonProps {
  children: React.ReactNode
  icon?: React.ReactNode
  variant?: "primary" | "secondary" | "emergency" | "outline"
  audioLabel?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
}

const variantClasses = {
  primary: "gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated",
  secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
  emergency: "bg-emergency text-emergency-foreground shadow-soft animate-soft-glow",
  outline: "border-2 border-primary text-primary hover:bg-primary/5",
}

const CalmButton: React.FC<CalmButtonProps> = ({ children, icon, variant = "primary", audioLabel, onClick, className = "", type = "button", disabled = false }) => {
  const { speak } = useAccessibility()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (audioLabel) speak(audioLabel)
    onClick?.(e)
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.3 }}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-display font-semibold text-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        className
      )}
      aria-label={audioLabel || undefined}
    >
      {icon}
      {children}
    </motion.button>
  )
}

export default CalmButton
