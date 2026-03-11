"use client"

import { motion } from "framer-motion"
import React from "react"
import { cn } from "@/lib/utils"

interface CalmCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

const CalmCard: React.FC<CalmCardProps> = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={cn(
      "rounded-2xl bg-card p-8 shadow-card border border-border/50",
      className
    )}
  >
    {children}
  </motion.div>
)

export default CalmCard
