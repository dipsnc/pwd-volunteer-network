"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Globe, Type, Lock, Phone, Mail, LogOut, Moon, Eye, Save, Edit2, Brain, GraduationCap } from "lucide-react"
import { useAccessibility } from "@/components/accessibility-provider"
import { clearCurrentUser } from "@/lib/store"
import { toast } from "sonner"
import CalmButton from "@/components/calm-button"
import CalmCard from "@/components/calm-card"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { deleteUser } from "firebase/auth"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AlertTriangle, Trash2 } from "lucide-react"

const LANGUAGES = ["English", "Hindi", "Marathi"]

export default function VolunteerProfileSettingsPage() {
  const router = useRouter()
  const { 
    speak, 
    darkMode, 
    setDarkMode, 
    highContrast, 
    setHighContrast, 
    textSize, 
    setTextSize 
  } = useAccessibility()
  const { user: firebaseUser, logout } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [activeSection, setActiveSection] = useState<string>("profile")
  const [language, setLanguage] = useState("English")
  const [newPassword, setNewPassword] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newSkills, setNewSkills] = useState("")

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "volunteers", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData(data);
            setNewPhone(data.phone || "");
            setNewEmail(data.email || "");
            setNewSkills(data.skills || "");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile data");
        } finally {
          setLoadingProfile(false);
        }
      } else if (mounted) {
        setLoadingProfile(false);
      }
    };

    if (mounted) fetchProfile();
  }, [firebaseUser, mounted]);

  if (!mounted || loadingProfile) return <div className="min-h-screen bg-background flex items-center justify-center font-bold">Loading Settings...</div>
  if (!firebaseUser || !profileData) return null

  const handleSignOut = async () => {
    if (logout) await logout()
    clearCurrentUser()
    if (speak) speak("Signed out")
    router.push("/")
  }

  const handleContactUpdate = async () => {
    try {
      await updateDoc(doc(db, "volunteers", firebaseUser.uid), {
        phone: newPhone,
        email: newEmail,
        skills: newSkills
      });
      setProfileData({ ...profileData, phone: newPhone, email: newEmail, skills: newSkills });
      toast.success("Profile updated successfully")
      if (speak) speak("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile");
    }
  }

  const handleDeleteAccount = async () => {
    if (!firebaseUser) return;
    
    try {
      // 1. Delete Firestore document
      await deleteDoc(doc(db, "volunteers", firebaseUser.uid));
      
      // 2. Clear local store
      clearCurrentUser();
      
      // 3. Delete Auth user
      await deleteUser(firebaseUser);
      
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error("Please re-authenticate to delete your account.");
      } else {
        toast.error("Failed to delete account. Please try again later.");
      }
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors font-medium"

  const sections = [
    { id: "profile", icon: <User size={18} />, label: "My Profile" },
    { id: "language", icon: <Globe size={18} />, label: "Language" },
    { id: "display", icon: <Type size={18} />, label: "Appearance" },
    { id: "security", icon: <Lock size={18} />, label: "Security" },
    { id: "contact", icon: <Phone size={18} />, label: "Contact & Skills" },
    { id: "danger", icon: <AlertTriangle size={18} className="text-destructive" />, label: "Danger Zone" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground lg:ml-64 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <header className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-4xl font-black text-foreground tracking-tight mb-2">Profile Settings</h1>
              <p className="text-muted-foreground font-medium">Manage your volunteer presence and account security.</p>
            </div>
            <button 
              onClick={() => router.push(`/profile/${firebaseUser.uid}`)}
              className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-soft"
            >
              <User size={18} /> View Public Profile
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
              {sections.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeSection === s.id 
                    ? "bg-primary text-primary-foreground shadow-soft" 
                    : "bg-card border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1">
            <CalmCard className="shadow-elevated border-none bg-card/50 backdrop-blur-xl p-8">
              {activeSection === "profile" && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">Volunteer Identity</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ProfileField label="Full Name" value={profileData.fullName} icon={<User className="w-4 h-4" />} />
                      <ProfileField label="Role" value="Impact Specialist" icon={<Award size={16} />} />
                      <ProfileField label="Phone" value={profileData.phone} icon={<Phone className="w-4 h-4" />} />
                      <ProfileField label="Email" value={profileData.email} icon={<Mail className="w-4 h-4" />} />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border/50">
                    <h3 className="font-display text-xl font-bold text-foreground mb-6">Academic Background</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ProfileField label="College/University" value={profileData.collegeName} icon={<GraduationCap size={16} />} />
                      <ProfileField label="Course" value={profileData.course} />
                      <ProfileField label="Current Year" value={`Year ${profileData.year}`} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "language" && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">Preferred Language</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {LANGUAGES.map(l => (
                      <button 
                        key={l} 
                        onClick={() => setLanguage(l)}
                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-between ${
                          language === l 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {l}
                        {language === l && <CheckCircle size={18} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === "display" && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">Visual Appearance</h2>
                  <div className="space-y-4">
                    <ToggleSwitch 
                      label="Dark Mode" 
                      description="Switch to a darker interface for reduced eye strain."
                      icon={<Moon size={18} className="text-muted-foreground" />} 
                      enabled={darkMode} 
                      onToggle={() => setDarkMode(!darkMode)} 
                    />
                    <ToggleSwitch 
                      label="High Contrast" 
                      description="Increase clarity for better readability."
                      icon={<Eye size={18} className="text-muted-foreground" />} 
                      enabled={highContrast} 
                      onToggle={() => setHighContrast(!highContrast)} 
                    />
                  </div>
                </motion.div>
              )}

              {activeSection === "security" && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">Security & Privacy</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-foreground mb-2 block font-display">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        className={inputCls} 
                        placeholder="Min 6 characters" 
                      />
                    </div>
                    <CalmButton className="w-full">Update Password</CalmButton>
                  </div>
                </motion.div>
              )}

              {activeSection === "contact" && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">Professional Information</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-2">
                         <Brain size={16} className="text-primary" /> Expertise & Skills (Comma separated)
                      </label>
                      <textarea 
                        value={newSkills} 
                        onChange={e => setNewSkills(e.target.value)} 
                        className={cn(inputCls, "min-h-[100px] resize-none")}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-2">
                           <Phone size={14} className="text-primary" /> Mobile Number
                        </label>
                        <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-2">
                           <Mail size={14} className="text-primary" /> Public Email
                        </label>
                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <CalmButton 
                      onClick={handleContactUpdate}
                      className="w-full mt-4"
                      variant="primary"
                    >
                      Save Changes
                    </CalmButton>
                  </div>
                </motion.div>
              )}

              {activeSection === "danger" && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="font-display text-2xl font-bold text-destructive mb-6 border-b border-border pb-4">Danger Zone</h2>
                  <div className="p-6 rounded-2xl border-2 border-destructive/20 bg-destructive/5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Delete your account</h3>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                          This action is permanent and cannot be undone. All your profile data, achievements, and messages will be permanently removed.
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="px-6 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold text-sm hover:bg-destructive/90 transition-all flex items-center gap-2">
                            <Trash2 size={16} /> Delete Account Permanently
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[32px] border-border bg-card shadow-elevated p-8">
                          <AlertDialogHeader className="space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                              <AlertTriangle size={32} />
                            </div>
                            <div className="text-center space-y-2">
                              <AlertDialogTitle className="text-2xl font-display font-bold">Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground font-medium">
                                Do you really want to delete your volunteer account? This will permanently remove all your contributions and profile data.
                              </AlertDialogDescription>
                            </div>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-8 gap-4 sm:justify-center">
                            <AlertDialogCancel className="rounded-2xl border-2 py-6 min-w-[120px] font-bold">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteAccount}
                              className="bg-red-600 hover:bg-red-700 rounded-2xl py-6 min-w-[120px] font-bold shadow-soft"
                            >
                              Yes, Delete Everything
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              )}
            </CalmCard>

            <button 
              onClick={handleSignOut}
              className="w-full mt-6 py-4 rounded-2xl bg-destructive/10 text-destructive font-display font-black text-sm flex items-center justify-center gap-2 hover:bg-destructive hover:text-white transition-all active:scale-95 border border-destructive/20"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileField({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest block">{label}</label>
      <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-muted/20 border border-border/50 text-foreground font-bold text-sm">
        {icon && <span className="text-primary/60">{icon}</span>}
        {value}
      </div>
    </div>
  )
}

function ToggleSwitch({ label, description, icon, enabled, onToggle }: { label: string, description: string, icon: React.ReactNode, enabled: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-background border border-border/50 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-base font-bold text-foreground leading-none mb-1">{label}</p>
          <p className="text-xs text-muted-foreground font-medium">{description}</p>
        </div>
      </div>
      <button 
        onClick={onToggle} 
        className={`w-14 h-7 rounded-full transition-all duration-300 relative ${enabled ? "bg-primary shadow-soft" : "bg-border/60"}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 shadow-sm ${enabled ? "right-1" : "left-1"}`} />
      </button>
    </div>
  )
}

function CheckCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function Award({ size }: { size: number }) {
  return <AwardIcon size={size} />;
}

import { Award as AwardIcon } from "lucide-react";import { cn } from "@/lib/utils"

