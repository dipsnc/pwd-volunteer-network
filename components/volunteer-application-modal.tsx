"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Calendar, MessageSquare, Brain, Timer, User, CheckCircle2, Navigation } from "lucide-react";
import { type VolunteerRequest } from "@/lib/store";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import CalmButton from "./calm-button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import('./location-picker'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground font-display font-bold text-xs uppercase tracking-widest">Loading Map...</div>
});

interface VolunteerApplicationModalProps {
  request: VolunteerRequest;
  volunteerProfile?: any;
  onClose: () => void;
  onApply: (data: any) => void;
  applicationId?: string;
  initialData?: any;
}

export default function VolunteerApplicationModal({ 
  request, 
  volunteerProfile, 
  onClose, 
  onApply,
  applicationId,
  initialData
}: VolunteerApplicationModalProps) {
  const { user: firebaseUser } = useAuth();
  const [mode, setMode] = useState<"view" | "apply">(initialData ? "apply" : "view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    motivation: initialData?.motivation || "",
    skills: initialData?.skills || "",
    flexibility: initialData?.flexibility || "flexible",
    bio: initialData?.bio || volunteerProfile?.reason || volunteerProfile?.skills || ""
  });
  
  useEffect(() => {
    // Delay map for animation
    const timer = setTimeout(() => setShowMap(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const formattedDate = new Date(request.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const urgencyStyles = {
    low: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    high: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  const handleSubmit = async () => {
    if (!firebaseUser) return;
    setIsSubmitting(true);
    try {
      if (applicationId) {
        // Update existing application
        const appRef = doc(db, "applications", applicationId);
        await updateDoc(appRef, {
          motivation: formData.motivation,
          skills: formData.skills,
          flexibility: formData.flexibility,
          bio: formData.bio,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new application
        const applicationData = {
          requestId: request.uid,
          requestTitle: request.title,
          studentId: request.studentId,
          studentName: request.studentName,
          volunteerId: firebaseUser.uid,
          volunteerName: volunteerProfile?.fullName || "Volunteer",
          motivation: formData.motivation,
          skills: formData.skills,
          flexibility: formData.flexibility,
          bio: formData.bio,
          status: 'pending',
          createdAt: serverTimestamp(),
          // Metadata for editing
          requestUrgency: request.urgency,
          requestCategoryTags: request.categoryTags,
          requestLocation: request.location,
          requestDate: request.date,
          requestTime: request.time,
          requestDuration: request.duration,
          requestDescription: request.description
        };

        await addDoc(collection(db, "applications"), applicationData);
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        onApply(formData);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card p-12 rounded-[32px] border border-border shadow-elevated text-center space-y-6 max-w-sm w-full"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-primary w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {applicationId ? "Application Updated!" : "Application Sent!"}
            </h2>
            <p className="text-muted-foreground font-medium">The student will be notified of your interest. Good luck!</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card w-full max-w-2xl rounded-[32px] border border-border shadow-elevated overflow-hidden my-8 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="py-4 px-6 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 shadow-sm overflow-hidden">
               {request.studentAvatar ? (
                 <img src={request.studentAvatar} alt="" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-primary font-bold">
                   {request?.studentName ? request.studentName.substring(0, 2).toUpperCase() : "??"}
                 </span>
               )}
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-lg leading-none mb-1">{request?.studentName || "Unknown Student"}</h3>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <MapPin size={12} className="text-primary" /> {request.location?.address?.split(',')[0] || 'Campus'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 space-y-4 overflow-y-auto custom-scrollbar">
          {mode === "view" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Request Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={urgencyStyles[request.urgency]}>
                    {request.urgency.toUpperCase()}
                  </Badge>
                  <div className="flex flex-wrap gap-2">
                    {request.categoryTags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-3 py-1 bg-muted rounded-full text-muted-foreground border border-border/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground leading-tight tracking-tight">{request.title}</h2>
                <p className="text-muted-foreground leading-relaxed font-medium">{request.description}</p>
              </div>

              {/* Logistics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-soft border border-border/50">
                    <Calendar className="text-primary" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">DATE</p>
                    <p className="text-sm font-bold text-foreground">{formattedDate}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-soft border border-border/50">
                    <Timer className="text-primary" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">TIME & DURATION</p>
                    <p className="text-sm font-bold text-foreground">{request.time} • {request.duration}</p>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-sm font-display font-bold flex items-center gap-2">
                    <Navigation className="text-primary" size={16} /> Meeting Location
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium">{request.location?.address || 'Campus Location'}</p>
                </div>
                <div className="rounded-3xl border border-border overflow-hidden h-40 shadow-soft bg-muted/20">
                   {showMap ? (
                     <LocationPicker 
                      key={request.uid}
                      currentLocation={request.location} 
                      disabled={true} 
                      hideSearch={true}
                      onLocationSelect={() => {}}
                    />
                   ) : (
                     <div className="h-full w-full flex items-center justify-center text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">
                       Initializing Map...
                     </div>
                   )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">Applying for: {request.title}</p>
                    <p className="text-[11px] text-primary/70 font-medium">Please provide some details for the student to review.</p>
                  </div>
                </div>

              {/* 1. Motivation */}
              <div className="space-y-3">
                <label className="text-sm font-display font-bold flex items-center gap-2 px-1">
                  <MessageSquare className="text-primary" size={16} /> Why do you want to help with this specific request?
                </label>
                <Textarea 
                  placeholder="e.g., I'm a fast typist and free during this slot."
                  className="rounded-2xl border-2 border-border focus:border-primary transition-all font-medium py-3 px-4 min-h-[100px]"
                  value={formData.motivation}
                  onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                />
              </div>

              {/* 2. Skills */}
              <div className="space-y-3">
                <label className="text-sm font-display font-bold flex items-center gap-2 px-1">
                  <Brain className="text-primary" size={16} /> Relevant experience or skills?
                </label>
                <Input 
                  placeholder="e.g., Proficient in LaTeX, chemistry symbols, etc."
                  className="rounded-2xl border-2 border-border focus:border-primary transition-all font-medium h-12 px-4"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                />
              </div>

              {/* 3. Flexibility */}
              <div className="space-y-4">
                <label className="text-sm font-display font-bold flex items-center gap-2 px-1">
                  <Clock className="text-primary" size={16} /> Arrival & Flexibility
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'strict', label: 'Strict', desc: 'Exact duration only', icon: Clock },
                    { id: 'flexible', label: 'Flexible', desc: '30 mins extra', icon: Timer },
                    { id: 'early', label: 'Arrive Early', desc: '10 mins coordination', icon: Navigation },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFormData({...formData, flexibility: item.id})}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-start gap-2 transition-all ${
                        formData.flexibility === item.id 
                        ? 'bg-primary/5 border-primary shadow-soft' 
                        : 'border-border hover:border-primary/30 text-muted-foreground'
                      }`}
                    >
                      <item.icon size={18} className={formData.flexibility === item.id ? 'text-primary' : ''} />
                      <div className="text-left">
                        <p className={`text-xs font-bold ${formData.flexibility === item.id ? 'text-primary' : 'text-foreground'}`}>{item.label}</p>
                        <p className="text-[10px] font-medium opacity-80">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Bio Shortcut */}
              <div className="space-y-3">
                <label className="text-sm font-display font-bold flex items-center gap-2 px-1">
                  <User className="text-primary" size={16} /> A quick note about yourself
                </label>
                <Textarea 
                  placeholder="Tell the student a bit about yourself..."
                  className="rounded-2xl border-2 border-border focus:border-primary transition-all font-medium py-3 px-4 min-h-[80px]"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
                <p className="text-[10px] text-muted-foreground px-1">This field is pre-filled from your profile but can be edited.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-border bg-muted/10 shrink-0 flex gap-4">
          {mode === "view" ? (
            <>
              <CalmButton variant="outline" className="flex-1 rounded-2xl py-2" onClick={onClose}>
                Close
              </CalmButton>
              <CalmButton className="flex-2 rounded-2xl py-2" onClick={() => setMode("apply")}>
                Apply Now
              </CalmButton>
            </>
          ) : (
            <>
              <CalmButton variant="outline" className="flex-1 rounded-2xl py-2" onClick={() => setMode("view")}>
                Back to Details
              </CalmButton>
            <div className="flex-2 flex gap-4">
              <CalmButton 
                className="flex-1 rounded-2xl py-2" 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.motivation.trim()}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </CalmButton>
            </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
