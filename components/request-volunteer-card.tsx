"use client"

import { Plus, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import CalmCard from './calm-card'

interface RequestVolunteerCardProps {
  onClick: () => void
}

export default function RequestVolunteerCard({ onClick }: RequestVolunteerCardProps) {
  return (
    <CalmCard className="relative overflow-hidden group cursor-pointer border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors" delay={0.1}>
      <div 
        onClick={onClick}
        className="flex flex-col items-center text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
          <Plus size={32} strokeWidth={3} />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-display font-black text-foreground leading-tight tracking-tight mb-2">
            Request a <span className="text-primary italic">Volunteer</span>
          </h3>
          <p className="text-xs text-muted-foreground font-bold opacity-80 max-w-[240px] mx-auto leading-relaxed">
            Need assistance with notes, lab work, or navigation?
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-primary px-5 py-3 bg-primary/10 rounded-xl border border-primary/20 shadow-soft uppercase tracking-widest">
          <Users size={14} strokeWidth={3} /> 50+ Qualified Volunteers
        </div>
      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
      <div className="absolute -left-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
    </CalmCard>
  )
}
