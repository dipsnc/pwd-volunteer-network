import { useState } from 'react'
import { MapPin, Users, Calendar, Clock, ListTodo, MessageSquare, CheckCircle2 as CheckCircleIcon, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { type VolunteerRequest } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore'
import { toast } from 'sonner'
import CalmButton from './calm-button'

interface VolunteerRequestCardProps {
  request: VolunteerRequest
  onClick: () => void
  applicantCount?: number
  isStudentView?: boolean
}

export default function VolunteerRequestCard({ request, onClick, applicantCount = 0, isStudentView = false }: VolunteerRequestCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      const reqId = request.uid || request.id;
      if (!reqId) return;

      await updateDoc(doc(db, "requests", reqId), {
        status: 'completed',
        updatedAt: serverTimestamp()
      });

      // Synchronize with applications
      const appsRef = collection(db, "applications");
      const q = query(appsRef, where("requestId", "==", reqId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        let count = 0;
        querySnapshot.docs.forEach((docSnap) => {
          const appData = docSnap.data();
          if (appData.status === 'accepted') {
            batch.update(docSnap.ref, { 
              status: 'completed',
              updatedAt: serverTimestamp()
            });
            count++;
          }
        });
        if (count > 0) {
          await batch.commit();
        }
      }

      toast.success("Mission Mark as Complete!", {
        description: "The request has been successfully closed and volunteer stats updated.",
      });
    } catch (error) {
      console.error("Error completing request:", error);
      toast.error("Failed to complete request.");
    } finally {
      setIsUpdating(false);
    }
  };
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
      className="group bg-card rounded-3xl p-5 sm:p-6 border border-border hover:border-primary/30 hover:shadow-elevated transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="relative z-10 flex gap-4 sm:gap-6">
        {/* Left Side: Category Icon / Visual */}
        <div className="hidden md:flex w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 group-hover:bg-primary/10 transition-colors">
           <Users className="w-8 h-8 text-primary" />
        </div>

        {/* Middle: Content */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn("text-[10px] font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-[0.15em] transition-all", 
                    request.status === 'open' ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 
                    request.status === 'assigned' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' : 
                    'bg-green-500/10 text-green-500 border-green-500/30'
                  )}>
                    {request.status === 'open' ? 'Matching' : 
                     request.status === 'assigned' ? 'Assigned' : 
                     request.status === 'completed' ? 'Completed' : 
                     request.status === 'rejected' ? 'Cancelled' : 
                     request.status}
                  </Badge>
                  <Badge variant="outline" className={cn("text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-[0.2em]", urgencyStyles[request.urgency])}>
                    {request.urgency}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 ml-1 opacity-70">
                    <Calendar size={12} className="text-primary/60" /> {formattedDate} • <Clock size={12} className="text-primary/60" /> {request.time}
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
              <span key={tag} className="text-[10px] font-black px-3.5 py-1.5 bg-muted/60 rounded-full text-muted-foreground border border-border/40 uppercase tracking-widest">
                {tag}
              </span>
            ))}
            {request.categoryTags.length > 3 && (
              <span className="text-[10px] font-black px-3.5 py-1.5 bg-muted/60 rounded-full text-muted-foreground border border-border/40 uppercase tracking-widest">
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
                    <Avatar className="w-10 h-10 border-2 border-background shadow-soft shrink-0">
                       <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                         {request.studentName.substring(0,2).toUpperCase()}
                       </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <p className="text-sm font-black text-foreground tracking-tight">{request.studentName}</p>
                      <p className="text-xs text-muted-foreground font-bold flex items-center gap-1 opacity-70">
                        <MapPin size={12} className="text-primary/60" /> {request.location.address.split(',')[0]}
                      </p>
                    </div>
                  </>
                )}
             </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                <ListTodo size={16} className="text-primary/60" />
                <span>{request.tasks.length} {request.tasks.length === 1 ? 'Task' : 'Tasks'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Area for Assigned or Completed Missions */}
      {(request.status === 'assigned' || request.status === 'completed') && (
        <div className="mt-4 sm:mt-6 pt-4 border-t border-border flex flex-wrap gap-2.5 sm:gap-3 items-center justify-end relative z-20">
          <Link 
            href={`/dashboard/chat/${request.uid}`}
            className="flex-1 sm:flex-none"
            onClick={(e) => e.stopPropagation()}
          >
            <CalmButton className="w-full flex items-center justify-center gap-2 py-2 px-6 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all shadow-none">
              <MessageSquare size={16} /> 
              <span className="text-xs font-black uppercase tracking-widest leading-none">Open Chat</span>
            </CalmButton>
          </Link>
          
          {request.status === 'assigned' && (
            <CalmButton 
              onClick={handleComplete}
              disabled={isUpdating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-6 bg-green-500 text-white hover:bg-green-600 rounded-xl transition-all shadow-soft"
            >
              {isUpdating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircleIcon size={16} />
              )}
              <span className="text-xs font-black uppercase tracking-widest leading-none">
                {isUpdating ? "Finishing..." : "Mark as Complete"}
              </span>
            </CalmButton>
          )}
        </div>
      )}

      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
    </motion.div>
  )
}
