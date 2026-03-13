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
    const q = query(
      collection(db, "applications"),
      where("requestId", "==", request.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplicants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [request.id]);

  const handleAcceptVolunteer = async (app: any) => {
    setIsProcessing(true);
    try {
      // 1. Update application status
      await updateDoc(doc(db, "applications", app.id), {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });

      // 2. Update request status
      await updateDoc(doc(db, "requests", request.id), {
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

      toast.success("Volunteer Accepted!", {
        description: `${app.volunteerName} has been assigned to this mission.`,
      });
      onClose();
    } catch (error) {
      console.error("Error accepting volunteer:", error);
      toast.error("Failed to accept volunteer.");
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
          <div className="p-6 border-b border-border space-y-1">
            <h3 className="font-display font-bold text-foreground text-lg">Applicants</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {loading ? "Loading..." : `${applicants.length} PEOPLE APPLIED`}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {applicants.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedApplicantId(app.id)}
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
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground z-10"
          >
            <X size={20} />
          </button>

          {selectedApplicant ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-8 pt-10 custom-scrollbar space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Profile Header */}
              <div className="flex items-start gap-6">
                 <div className="w-20 h-20 rounded-[32px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-soft">
                   <User className="text-primary w-10 h-10" />
                 </div>
                 <div className="space-y-2 pt-1">
                    <h2 className="text-3xl font-display font-bold text-foreground">{selectedApplicant.volunteerName}</h2>
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="text-[10px] font-black border-primary/20 bg-primary/5 text-primary tracking-widest uppercase">
                         Volunteer Proposal
                       </Badge>
                       <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 border-l border-border pl-3">
                         <Calendar size={12} className="text-primary" /> Applied on {new Date(selectedApplicant.createdAt?.seconds * 1000).toLocaleDateString()}
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
                 <h4 className="text-sm font-display font-bold text-foreground px-1">Logistics & Flexibility</h4>
                 <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">FLEXIBILITY</p>
                       <p className="text-xs font-bold text-foreground capitalize">{selectedApplicant.flexibility}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">AVAILABILITY</p>
                       <p className="text-xs font-bold text-foreground">Matches Schedule</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">STATUS</p>
                       <p className={`text-xs font-bold ${selectedApplicant.status === 'pending' ? 'text-orange-500' : 'text-green-500'} capitalize`}>
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
                <CalmButton 
                  className="w-full py-6 rounded-2xl text-base"
                  disabled={selectedApplicant.status !== 'pending' || isProcessing}
                  onClick={() => handleAcceptVolunteer(selectedApplicant)}
                >
                  {isProcessing ? "Processing..." : 
                   selectedApplicant.status === 'accepted' ? "Already Accepted" :
                   selectedApplicant.status === 'declined' ? "Declined" :
                   `Accept ${selectedApplicant.volunteerName.split(' ')[0]}`}
                </CalmButton>
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
