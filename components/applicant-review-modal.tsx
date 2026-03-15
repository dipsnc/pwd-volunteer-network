"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, MessageSquare, Brain, Clock, CheckCircle2, ChevronRight, MapPin, Calendar, Timer } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { type VolunteerRequest } from "@/lib/store";
import CalmButton from "./calm-button";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { createChat } from "@/lib/chat-utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { playAudioMessage } from "@/lib/audio";


interface ApplicantReviewModalProps {
  request: VolunteerRequest;
  onClose: () => void;
}

export default function ApplicantReviewModal({ request, onClose }: ApplicantReviewModalProps) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    playAudioMessage("Review applicants modal opened.");
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "applications"),
      where("requestId", "==", request.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplicants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [request.uid]);

  const handleAcceptVolunteer = async (app: any) => {
    setIsProcessing(true);
    try {
      // 1. Update application status
      await updateDoc(doc(db, "applications", app.id), {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });

      // 2. Update request status
      await updateDoc(doc(db, "requests", request.uid), {
        status: 'assigned',
        volunteerId: app.volunteerId,
        volunteerName: app.volunteerName,
        updatedAt: serverTimestamp()
      });

      // 3. Decline other pending applications for this request
      const otherApps = applicants.filter(a => a.id !== app.id && a.status === 'pending');
      for (const other of otherApps) {
        await updateDoc(doc(db, "applications", other.id), {
          status: 'declined',
          updatedAt: serverTimestamp()
        });
      }

      // 4. Create chat session
      await createChat(request.uid, request.studentId, app.volunteerId);

      toast.success("Volunteer Accepted!", {
        description: `${app.volunteerName} has been assigned to this mission.`,
      });
      playAudioMessage(`Volunteer ${app.volunteerName} has been accepted.`);
      onClose();
    } catch (error) {
      console.error("Error accepting volunteer:", error);
      toast.error("Failed to accept volunteer.");
      playAudioMessage("Failed to accept volunteer.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedApplicant = applicants.find(a => a.id === selectedApplicantId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card w-full max-w-4xl rounded-[32px] border border-border shadow-elevated overflow-hidden my-8 flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Side: Applicant List */}
        <div className="w-full md:w-80 border-r border-border bg-muted/10 flex flex-col h-full overflow-hidden shrink-0">
          <div className="p-6 border-b border-border bg-card/50">
            <h3 className="font-display font-black text-foreground text-xl tracking-tight">Applicants</h3>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1 opacity-80">
              {loading ? "Loading..." : `${applicants.length} PEOPLE APPLIED`}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {applicants.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  setSelectedApplicantId(app.id);
                  playAudioMessage(`Viewing applicant ${app.volunteerName}`);
                }}
                aria-label={`View applicant ${app.volunteerName}`}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left group ${
                  selectedApplicantId === app.id 
                    ? 'bg-primary shadow-soft text-primary-foreground' 
                    : 'hover:bg-muted bg-transparent text-foreground'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                  selectedApplicantId === app.id ? 'bg-primary-foreground/10 border-primary-foreground/20' : 'bg-primary/5 border-primary/10'
                }`}>
                  <User size={18} className={selectedApplicantId === app.id ? 'text-primary-foreground' : 'text-primary'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{app.volunteerName}</p>
                  <p className={`text-[10px] font-medium truncate uppercase tracking-wider ${
                    selectedApplicantId === app.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {app.status}
                  </p>
                </div>
                <ChevronRight size={14} className={selectedApplicantId === app.id ? 'text-primary-foreground/50' : 'text-muted-foreground/30 group-hover:translate-x-1 transition-transform'} />
              </button>
            ))}

            {!loading && applicants.length === 0 && (
              <div className="py-12 text-center space-y-3 opacity-50">
                <User className="mx-auto text-muted-foreground" size={24} />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No applicants yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Applicant Details */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <button 
            onClick={() => { playAudioMessage("Closing applicant review modal"); onClose(); }} 
            aria-label="Close applicant review modal"
            className="absolute top-6 right-6 p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground z-10"
          >
            <X size={20} />
          </button>

          {selectedApplicant ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-8 pt-10 custom-scrollbar space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                 <div className="w-24 h-24 rounded-[40px] bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-soft shrink-0 group-hover:scale-105 transition-transform duration-500">
                    <User className="text-primary w-12 h-12" />
                 </div>
                 <div className="space-y-3 pt-2">
                    <h2 className="text-3xl sm:text-4xl font-display font-black text-foreground tracking-tight">
                      {selectedApplicant.volunteerName.split(' ')[0]} <span className="text-primary not-italic">{selectedApplicant.volunteerName.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                       <Badge variant="outline" className="text-[10px] font-black border-primary/30 bg-primary/5 text-primary tracking-[0.2em] uppercase px-3 py-1">
                         Volunteer Proposal
                       </Badge>
                       <span className="text-xs font-bold text-muted-foreground flex items-center gap-2 sm:border-l sm:border-border sm:pl-3 opacity-70">
                         <Calendar size={14} className="text-primary/60" /> Applied {new Date(selectedApplicant.createdAt?.seconds * 1000).toLocaleDateString()}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 space-y-3">
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                     <MessageSquare size={14} /> The Pitch
                   </p>
                   <p className="text-sm font-medium text-foreground italic leading-relaxed">
                     "{selectedApplicant.motivation}"
                   </p>
                 </div>
                 <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 space-y-3">
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                     <Brain size={14} /> Why they're a fit
                   </p>
                   <p className="text-sm font-medium text-foreground leading-relaxed">
                     {selectedApplicant.skills || "No specific skills mentioned."}
                   </p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em] px-1 opacity-60">Logistics & Flexibility</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-3xl bg-muted/30 border border-border/50 group hover:border-primary/20 transition-all">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-70">FLEXIBILITY</p>
                       <p className="text-sm font-black text-foreground tracking-tight capitalize">{selectedApplicant.flexibility}</p>
                    </div>
                    <div className="p-5 rounded-3xl bg-muted/30 border border-border/50 group hover:border-primary/20 transition-all">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-70">AVAILABILITY</p>
                       <p className="text-sm font-black text-foreground tracking-tight text-primary">Matches Schedule</p>
                    </div>
                    <div className="p-5 rounded-3xl bg-muted/30 border border-border/50 group hover:border-primary/20 transition-all">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-70">STATUS</p>
                       <p className={cn("text-sm font-black tracking-tight capitalize", 
                         selectedApplicant.status === 'pending' ? 'text-orange-500' : 'text-green-500'
                       )}>
                         {selectedApplicant.status}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <h4 className="text-sm font-display font-bold text-foreground px-1">Quick Bio</h4>
                 <div className="p-6 rounded-3xl bg-muted/10 border border-border/50">
                   <p className="text-sm text-foreground font-medium leading-relaxed opacity-80">
                      {selectedApplicant.bio || "No bio available for this volunteer."}
                   </p>
                 </div>
              </div>

              {/* Action */}
              <div className="pt-6 border-t border-border mt-auto">
                {(selectedApplicant.status === 'accepted' || selectedApplicant.status === 'completed') ? (
                  <Link href={`/dashboard/chat/${request.uid}`} className="block w-full" aria-label={`Open chat with ${selectedApplicant.volunteerName.split(' ')[0]}`} onClick={() => playAudioMessage("Opening chat")}>
                    <CalmButton className="w-full py-6 rounded-2xl text-base bg-blue-600 hover:bg-blue-700">
                      Open Chat with {selectedApplicant.volunteerName.split(' ')[0]}
                    </CalmButton>
                  </Link>
                ) : (
                  <CalmButton 
                    className="w-full py-6 rounded-2xl text-base"
                    disabled={selectedApplicant.status !== 'pending' || isProcessing}
                    onClick={() => handleAcceptVolunteer(selectedApplicant)}
                    aria-label={`Accept ${selectedApplicant.volunteerName.split(' ')[0]} as volunteer`}
                  >
                    {isProcessing ? "Processing..." : 
                     selectedApplicant.status === 'declined' ? "Declined" :
                     `Accept ${selectedApplicant.volunteerName.split(' ')[0]}`}
                  </CalmButton>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
               <div className="w-20 h-20 bg-muted rounded-[32px] flex items-center justify-center mx-auto opacity-30 animate-pulse">
                 <User className="w-10 h-10" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-display font-bold text-foreground">Select an Applicant</h3>
                 <p className="text-sm text-muted-foreground max-w-xs font-medium">Click on a volunteer from the list to review their proposal and background.</p>
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
