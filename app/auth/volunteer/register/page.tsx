"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Upload, FileCheck, User, Lock, Phone, Mail, FileText, MapPin, GraduationCap, Camera } from "lucide-react";
import { useAccessibility } from "@/components/accessibility-provider";
import {  } from "@/lib/store";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary-action";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const ASSISTANCE_TYPES = [
  "Reading Assistance", "Mobility Help", "Note Taking",
  "Medical Visit Support", "Daily Tasks Support", "Volunteer Safety / Admin"
];

export default function VolunteerRegisterPage() {
  const [step, setStep] = useState(1);
  const { speak } = useAccessibility();
  const router = useRouter();
  const studentIdRef = useRef<HTMLInputElement>(null);
  const govDocRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Identity + College
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [studentId, setStudentId] = useState<File | null>(null);
  const [govDoc, setGovDoc] = useState<File | null>(null);

  // Step 2: Personal
  const [parentGuardianName, setParentGuardianName] = useState("");
  const [parentGuardianPhone, setParentGuardianPhone] = useState("");
  const [alternativeContact, setAlternativeContact] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [skills, setSkills] = useState("");

  // Step 3: Volunteering Role
  const [assistanceTypes, setAssistanceTypes] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const totalSteps = 3;
  const inputCls = "w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors";
  const labelCls = "text-sm font-semibold text-foreground mb-1.5 block";

  const nextStep = () => {
    if (step === 1 && (!fullName || !username || !phone || !email || !collegeName || !course || !year)) {
      toast.error("Required Fields Missing", { description: "Please fill in all identity and college fields marked with *." });
      return;
    }
    if (step === 2 && (!bloodGroup || !age || !permanentAddress)) {
      toast.error("Required Fields Missing", { description: "Please provide your blood group, age, and permanent address." });
      return;
    }
    setStep(s => s + 1); 
    speak(`Step ${step + 1} of ${totalSteps}`);
  };

  const toggleAssistanceType = (at: string) => {
    setAssistanceTypes(prev => 
      prev.includes(at) ? prev.filter(t => t !== at) : [...prev, at]
    );
    speak(at + (assistanceTypes.includes(at) ? " removed" : " added") + " to selection");
  };

  const prevStep = () => { 
    setStep(s => s - 1); 
    speak(`Back to Step ${step - 1}`); 
  };

  const handleSubmit = async () => {
    if (assistanceTypes.length === 0 || !password) { 
      toast.error("Setup Missing", { description: "Please select assistance types and set your password." });
      return; 
    }
    if (password !== confirmPassword) { 
      toast.error("Passwords Don't Match", { description: "The passwords you entered do not match." });
      return; 
    }
    if (password.length < 6) { 
      toast.error("Password Too Short", { description: "Password must be at least 6 characters long." });
      return; 
    }

    setLoading(true);
    try {
      // 0. Check if username is unique
      const q = query(collection(db, "volunteers"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error("Username Taken", {
          description: "This username is already in use. Please choose another one.",
        });
        setLoading(false);
        return;
      }

      // 1. Upload files to Cloudinary first
      let profilePhotoUrl = null;
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        profilePhotoUrl = await uploadImageToCloudinary(formData, `volunteer/profile-photos/${username}`);
      }

      let studentIdUrl = null;
      if (studentId) {
        const formData = new FormData();
        formData.append("file", studentId);
        studentIdUrl = await uploadImageToCloudinary(formData, `volunteer/college-ids/${username}`);
      }

      let govIdUrl = null;
      if (govDoc) {
        const formData = new FormData();
        formData.append("file", govDoc);
        govIdUrl = await uploadImageToCloudinary(formData, `volunteer/gov-ids/${username}`);
      }

      // 2. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData = {
        uid: firebaseUser.uid,
        type: 'volunteer' as const,
        fullName,
        username,
        email,
        phone,
        collegeName,
        course,
        year,
        reason,
        profilePhotoUrl,
        studentIdUrl,
        govIdUrl,
        parentGuardianName,
        parentGuardianPhone,
        alternativeContact,
        permanentAddress,
        locationPreference,
        bloodGroup,
        age: Number(age),
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        skills,
        assistanceTypes,
        status: 'pending' as const,
        verificationStatus: 'pending' as const,
        lastActiveAt: new Date().toISOString(),
        completedMissions: 0,
        rating: null,
        createdAt: new Date().toISOString()
      };

      // 3. Save to Firestore
      const cleanData = JSON.parse(JSON.stringify(userData, (key, value) => 
        value === undefined ? null : value
      ));

      await setDoc(doc(db, "volunteers", firebaseUser.uid), cleanData);

      toast.success("Application Submitted!", {
        description: "Admin will review your volunteer application shortly.",
      });
      speak("Registration complete! Your request has been sent to admin for approval.");
      router.push("/auth/volunteer/pending");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Registration Failed", { description: error.message || "Could not complete registration." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-calm flex items-center justify-center px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Link 
          href="/auth/volunteer" 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          onClick={() => speak("Going back")}
          aria-label="Back to volunteer choice"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6" aria-hidden="true">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-4 font-medium">Step {step} of {totalSteps}</p>

        <div className="rounded-2xl bg-card p-6 shadow-card border border-border/50">
          <AnimatePresence mode="wait">
            {/* STEP 1: Basic & College */}
            {step === 1 && (
              <motion.div key="v1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <header>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">Basic & College Info</h2>
                  <p className="text-sm text-muted-foreground mb-4">Introduce yourself to the community</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className={labelCls}>Full Name *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls + " pl-10"} placeholder="Your full name" required aria-label="Enter your full name" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="username" className={labelCls}>Username *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input id="username" value={username} onChange={e => setUsername(e.target.value)} className={inputCls + " pl-10"} placeholder="Create a username" required aria-label="Enter a username" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className={labelCls}>Phone *</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls + " pl-10"} placeholder="+91..." required aria-label="Enter phone number" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className={labelCls}>Email *</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls + " pl-10"} placeholder="email@example.com" required aria-label="Enter email address" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="reason" className={labelCls}>Reason to Volunteer</label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-3 top-4 text-muted-foreground" />
                    <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} className={inputCls + " pl-10 resize-none text-sm"} rows={2} placeholder="What motivates you to help?" aria-label="Enter reason for volunteering" />
                  </div>
                </div>

                <h3 className="font-display font-bold text-foreground pt-2 flex items-center gap-2">
                  <GraduationCap size={20} className="text-primary" /> College Details *
                </h3>
                <div>
                  <label htmlFor="collegeName" className={labelCls}>College Name *</label>
                  <input id="collegeName" value={collegeName} onChange={e => setCollegeName(e.target.value)} className={inputCls} placeholder="University or College name" required aria-label="Enter college name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="course" className={labelCls}>Course *</label><input id="course" value={course} onChange={e => setCourse(e.target.value)} className={inputCls} placeholder="e.g. B.Tech, BA" required aria-label="Enter course name" /></div>
                  <div><label htmlFor="year" className={labelCls}>Year *</label><input id="year" value={year} onChange={e => setYear(e.target.value)} className={inputCls} placeholder="e.g. 2nd Year" required aria-label="Enter current year of study" /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Profile Photo</label>
                    <input ref={photoRef} type="file" accept=".jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) { setPhoto(e.target.files[0]); speak("Photo uploaded: " + e.target.files[0].name); } }} className="hidden" />
                    <button type="button" onClick={() => photoRef.current?.click()} className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${photo ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`} aria-label={photo ? `Photo uploaded: ${photo.name}` : "Click to upload profile photo"}>
                      {photo ? <><FileCheck size={18} /><span className="text-sm font-semibold truncate max-w-[80px]">{photo.name}</span></> : <><Camera size={18} /><span className="text-sm font-semibold">Photo</span></>}
                    </button>
                  </div>
                  <div>
                    <label className={labelCls}>Student ID</label>
                    <input ref={studentIdRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) { setStudentId(e.target.files[0]); speak("Student ID uploaded: " + e.target.files[0].name); }}} className="hidden" />
                    <button type="button" onClick={() => studentIdRef.current?.click()} className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${studentId ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`} aria-label={studentId ? `Student ID uploaded: ${studentId.name}` : "Click to upload student ID"}>
                      {studentId ? <><FileCheck size={18} /><span className="text-sm font-semibold truncate max-w-[80px]">{studentId.name}</span></> : <><Upload size={18} /><span className="text-sm font-semibold">College ID</span></>}
                    </button>
                  </div>
                  <div>
                    <label className={labelCls}>Gov ID</label>
                    <input ref={govDocRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) { setGovDoc(e.target.files[0]); speak("Government ID uploaded: " + e.target.files[0].name); }}} className="hidden" />
                    <button type="button" onClick={() => govDocRef.current?.click()} className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${govDoc ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`} aria-label={govDoc ? `Government ID uploaded: ${govDoc.name}` : "Click to upload government ID"}>
                      {govDoc ? <><FileCheck size={18} /><span className="text-sm font-semibold truncate max-w-[80px]">{govDoc.name}</span></> : <><Upload size={18} /><span className="text-sm font-semibold">Gov ID</span></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Personal */}
            {step === 2 && (
              <motion.div key="v2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <header>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">Personal Information</h2>
                  <p className="text-sm text-muted-foreground mb-4">Background and availability details</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label htmlFor="guardianName" className={labelCls}>Parent/Guardian</label><input id="guardianName" value={parentGuardianName} onChange={e => setParentGuardianName(e.target.value)} className={inputCls} placeholder="Name" aria-label="Enter parent or guardian name" /></div>
                  <div><label htmlFor="guardianPhone" className={labelCls}>Contact Number</label><input id="guardianPhone" type="tel" value={parentGuardianPhone} onChange={e => setParentGuardianPhone(e.target.value)} className={inputCls} placeholder="Phone" aria-label="Enter emergency phone number" /></div>
                  <div><label htmlFor="altContact" className={labelCls}>Alternative Contact</label><input id="altContact" value={alternativeContact} onChange={e => setAlternativeContact(e.target.value)} className={inputCls} placeholder="Name/Phone" aria-label="Enter alternative contact" /></div>
                </div>
                
                <div><label htmlFor="location" className={labelCls}>Preferred Working Areas</label><input id="location" value={locationPreference} onChange={e => setLocationPreference(e.target.value)} className={inputCls} placeholder="e.g. Near Hubballi, Online..." aria-label="Enter location preferences" /></div>
                
                <div>
                  <label htmlFor="address" className={labelCls}>Permanent Address *</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-4 text-muted-foreground" />
                    <textarea id="address" value={permanentAddress} onChange={e => setPermanentAddress(e.target.value)} className={inputCls + " pl-10 resize-none"} rows={2} placeholder="Enter your full home address" required aria-label="Enter permanent address" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="bloodGroup" className={labelCls}>Blood *</label>
                    <select id="bloodGroup" value={bloodGroup} onChange={e => { setBloodGroup(e.target.value); speak(e.target.value + " selected as blood group"); }} className={inputCls} aria-label="Select blood group">
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div><label htmlFor="age" className={labelCls}>Age *</label><input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} className={inputCls} placeholder="Age" required aria-label="Enter your age" /></div>
                  <div><label htmlFor="weight" className={labelCls}>Weight</label><input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} placeholder="kg" aria-label="Enter weight in kilograms" /></div>
                </div>
                
                <div><label htmlFor="skills" className={labelCls}>Skills & Competencies</label><textarea id="skills" value={skills} onChange={e => setSkills(e.target.value)} className={inputCls + " resize-none"} rows={3} placeholder="Tell us about specific tasks you can help with..." aria-label="Describe your skills" /></div>
              </motion.div>
            )}

            {/* STEP 3: Assistance & Account */}
            {step === 3 && (
              <motion.div key="v3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <header>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">Primary Support Role</h2>
                  <p className="text-sm text-muted-foreground mb-4">Choose your main area of focus</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {ASSISTANCE_TYPES.map(at => (
                    <button 
                      key={at} 
                      type="button" 
                      onClick={() => toggleAssistanceType(at)}
                      className={`text-left px-5 py-3.5 rounded-xl border-2 text-sm font-bold transition-all ${assistanceTypes.includes(at) ? "border-primary bg-primary/5 text-primary shadow-soft" : "border-border text-foreground hover:border-primary/30"}`}
                      aria-pressed={assistanceTypes.includes(at)}
                    >
                      {at}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-border/50">
                  <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                    <Lock size={18} className="text-primary" /> Create Password
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="password" className={labelCls}>Password *</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls + " pl-10"} placeholder="Minimum 6 characters" required aria-label="Enter password" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className={labelCls}>Confirm Password *</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls + " pl-10"} placeholder="Repeat password" required aria-label="Confirm password" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            {step > 1 ? (
              <button 
                onClick={prevStep} 
                className="flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary transition-all group"
                aria-label="Previous Step"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Previous
              </button>
            ) : <div />}
            
            {step < totalSteps ? (
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-display font-bold text-sm shadow-md hover:shadow-elevated transition-all"
                aria-label="Continue to next step"
              >
                Next Step <ArrowRight size={18} />
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-display font-bold text-sm shadow-lg hover:shadow-elevated transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                aria-label="Submit volunteer application"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
