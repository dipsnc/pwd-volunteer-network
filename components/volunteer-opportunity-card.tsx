"use client";

import { MapPin, Clock, Calendar, Timer, CheckCircle2 } from 'lucide-react';

interface VolunteerOpportunityCardProps {
  opp: any;
  hasApplied?: boolean;
  onView: (opp: any) => void;
}

export default function VolunteerOpportunityCard({ opp, hasApplied, onView }: VolunteerOpportunityCardProps) {
  return (
    <div 
      className={`group bg-card p-5 rounded-2xl border border-border shadow-soft transition-all ${
        hasApplied ? 'opacity-70 grayscale-[0.5]' : 'hover:border-primary/30 cursor-pointer'
      }`}
      onClick={() => !hasApplied && onView(opp)}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] font-black px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
            <MapPin size={10} /> {opp.location?.address?.split(',')[0] || 'Campus'}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            <Clock size={10} /> {opp.duration}
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight flex-1">
            {opp.title}
          </h4>
          {opp.urgent && (
            <span className="shrink-0 text-xs tracking-wider font-black px-2 py-0.5 bg-red-500/10 text-red-600 rounded-lg border border-red-500/20 uppercase tracking-tighter">
              Urgent
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground/60">
           <span className="flex items-center gap-1">
             <Calendar size={10} /> 
             {opp.date ? new Date(opp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Flexible'}
           </span>
           <span className="flex items-center gap-1">
             <Timer size={10} /> 
             {opp.time || 'TBD'}
           </span>
        </div>

        {hasApplied ? (
          <div className="w-full py-2 bg-muted/50 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
            <CheckCircle2 size={12} className="text-green-500" /> Applied
          </div>
        ) : (
          <button className="w-full py-2 bg-muted/50 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
            View Mission
          </button>
        )}
      </div>
    </div>
  );
}
