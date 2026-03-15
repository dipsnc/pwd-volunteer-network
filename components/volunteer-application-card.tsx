"use client";

import { User, MoreVertical, Edit2, Trash2, Plus, MessageSquare, Brain, Calendar, Clock, Timer } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface VolunteerApplicationCardProps {
  app: any;
  onEdit: (app: any) => void;
  onDelete: (id: string) => void;
}

export default function VolunteerApplicationCard({ app, onEdit, onDelete }: VolunteerApplicationCardProps) {
  const router = useRouter();
  return (
    <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-soft hover:shadow-elevated transition-all space-y-4 relative group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
            <User className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground line-clamp-1">{app.requestTitle}</h3>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 flex-wrap">
              <Plus size={10} className="text-primary" /> Applied to <span className="text-primary font-bold cursor-pointer" onClick={() => router.push(`/profile/${app.studentId}`)}>{app.studentName}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="capitalize">{app.requestUrgency} Priority</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {(app.status === 'accepted' || app.status === 'completed') && (
            <Link 
              href={`/dashboard/chat/${app.requestId}`}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/90 transition-colors shadow-soft flex items-center gap-1.5"
            >
              <MessageSquare size={12} /> Chat
            </Link>
          )}
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
            app.status === 'accepted' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
            app.status === 'completed' ? 'bg-blue-500/5 text-blue-500 border-blue-500/20' :
            app.status === 'declined' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
            'bg-orange-500/10 text-orange-600 border-orange-500/20'
          }`}>
            {app.status === 'completed' ? 'Mission Finished' : app.status}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-border">
              <DropdownMenuItem 
                className="gap-2 font-bold text-xs"
                onClick={() => onEdit(app)}
              >
                <Edit2 size={14} /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 font-bold text-xs text-red-500 focus:text-red-500"
                onClick={() => onDelete(app.id)}
              >
                <Trash2 size={14} /> Withdraw Application
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {app.requestCategoryTags?.slice(0, 3).map((tag: string) => (
          <span key={tag} className="px-2 py-0.5 rounded-lg bg-muted text-[9px] font-bold text-muted-foreground border border-border/50 uppercase">
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-muted/30 p-4 rounded-xl space-y-2 border border-border/50">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <MessageSquare size={10} className="text-primary" /> Your Pitch
          </p>
          <p className="text-xs text-foreground font-medium line-clamp-2 leading-relaxed">"{app.motivation}"</p>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl space-y-2 border border-border/50">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Brain size={10} className="text-primary" /> Relevant Skills
          </p>
          <p className="text-xs text-foreground font-medium line-clamp-2">{app.skills || "Not specified"}</p>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl space-y-2 border border-border/50 flex flex-col justify-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Calendar size={10} className="text-primary" /> Logistics
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-foreground/80">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Clock size={12} className="text-primary/60" /> {app.requestTime || 'TBD'}
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Timer size={12} className="text-primary/60" /> {app.requestDuration || 'TBD'}
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Calendar size={12} className="text-primary/60" /> {app.requestDate ? new Date(app.requestDate).toLocaleDateString() : 'Flexible'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
