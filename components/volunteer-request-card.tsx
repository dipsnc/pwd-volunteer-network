"use client"

import { MapPin, Users, Calendar, Clock, ListTodo } from 'lucide-react'
import { motion } from 'framer-motion'
import { type VolunteerRequest } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface VolunteerRequestCardProps {
  request: VolunteerRequest
  onClick: () => void
  applicantCount?: number
  isStudentView?: boolean
}

export default function VolunteerRequestCard({ request, onClick, applicantCount = 0, isStudentView = false }: VolunteerRequestCardProps) {
  const urgencyStyles = {
    low: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    high: "bg-red-500/10 text-red-500 border-red-500/20"
  }

  const formattedDate = new Date(request.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group bg-card rounded-3xl p-6 border border-border hover:border-primary/30 hover:shadow-elevated transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="relative z-10 flex gap-6">
        {/* Left Side: Category Icon / Visual */}
        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 group-hover:bg-primary/10 transition-colors">
           <Users className="w-8 h-8 text-primary" />
        </div>

        {/* Middle: Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[9px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider", 
                    request.status === 'open' ? 'bg-primary/10 text-primary border-primary/20' : 
                    request.status === 'assigned' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                    'bg-green-500/10 text-green-500 border-green-500/20'
                  )}>
                    {request.status}
                  </Badge>
                  <Badge variant="outline" className={cn("text-[8px] font-black px-1.5 py-0 rounded-md border uppercase tracking-widest", urgencyStyles[request.urgency])}>
                    {request.urgency}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 ml-1">
                    <Calendar size={10} /> {formattedDate} • <Clock size={10} /> {request.time}
                  </span>
                </div>
               <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                 {request.title}
               </h3>
               <p className="text-sm text-muted-foreground font-medium line-clamp-1 opacity-80">
                 {request.description}
               </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {request.categoryTags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-bold px-3 py-1 bg-muted rounded-full text-muted-foreground border border-border/50">
                {tag}
              </span>
            ))}
            {request.categoryTags.length > 3 && (
              <span className="text-[10px] font-bold px-3 py-1 bg-muted rounded-full text-muted-foreground border border-border/50">
                +{request.categoryTags.length - 3}
              </span>
            )}
          </div>

          <div className="pt-4 border-t border-border/50 flex items-center justify-between">
             <div className="flex items-center gap-3">
                {isStudentView && applicantCount > 0 ? (
                  <Link 
                    href="/dashboard/student/requests" 
                    className="flex -space-x-2 overflow-hidden hover:opacity-80 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[...Array(Math.min(applicantCount, 3))].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                    {applicantCount > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-black text-muted-foreground">
                        +{applicantCount - 3}
                      </div>
                    )}
                    <div className="flex items-center ml-4">
                      <p className="text-xs font-bold text-primary hover:underline transition-all">
                        {applicantCount} {applicantCount === 1 ? 'person has' : 'people have'} applied
                      </p>
                    </div>
                  </Link>
                ) : (
                  <>
                    <Avatar className="w-8 h-8 border-2 border-background shadow-soft shrink-0">
                       <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                         {request.studentName.substring(0,2).toUpperCase()}
                       </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <p className="text-xs font-bold text-foreground">{request.studentName}</p>
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <MapPin size={10} /> {request.location.address.split(',')[0]}
                      </p>
                    </div>
                  </>
                )}
             </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                <ListTodo size={14} className="text-primary" />
                <span>{request.tasks.length} {request.tasks.length === 1 ? 'Task' : 'Tasks'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
    </motion.div>
  )
}
