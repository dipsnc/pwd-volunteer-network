"use client";

import { User, MoreVertical, Edit2, Trash2, Plus, MessageSquare, Brain, Calendar, Clock, Timer } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface VolunteerApplicationCardProps {
  app: any;
  onEdit: (app: any) => void;
  onDelete: (id: string) => void;
}

export default function VolunteerApplicationCard({ app, onEdit, onDelete }: VolunteerApplicationCardProps) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-soft hover:shadow-elevated transition-all space-y-4 relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
            <User className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground line-clamp-1">{app.requestTitle}</h3>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 flex-wrap">
              <Plus size={10} className="text-primary" /> Applied to {app.studentName}
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="capitalize">{app.requestUrgency} Priority</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            app.status === 'accepted' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
            app.status === 'completed' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
            app.status === 'declined' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
            'bg-orange-500/10 text-orange-600 border-orange-500/20'
          }`}>
            {app.status}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl space-y-2 border border-border/50">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <MessageSquare size={10} className="text-primary" /> Your Pitch
          </p>
          <p className="text-xs text-foreground font-medium italic line-clamp-2">"{app.motivation}"</p>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl space-y-2 border border-border/50">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Brain size={10} className="text-primary" /> Relevant Skills
          </p>
          <p className="text-xs text-foreground font-medium line-clamp-2">{app.skills || "Not specified"}</p>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl space-y-2 border border-border/50 flex flex-col justify-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Calendar size={10} className="text-primary" /> Logistics
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-foreground/80">
            <span className="flex items-center gap-1">
              <Clock size={10} className="text-muted-foreground" /> {app.requestTime || 'TBD'}
            </span>
            <span className="flex items-center gap-1">
              <Timer size={10} className="text-muted-foreground" /> {app.requestDuration || 'TBD'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={10} className="text-muted-foreground" /> {app.requestDate ? new Date(app.requestDate).toLocaleDateString() : 'Flexible'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
