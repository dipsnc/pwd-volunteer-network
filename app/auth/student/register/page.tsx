"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Upload, FileCheck, Plus, X, Camera, User, Lock, Phone, Mail, MapPin } from "lucide-react";
import { useAccessibility } from "@/components/accessibility-provider";
import { saveStudent, setCurrentUser } from "@/lib/store";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

const DISABILITY_TYPES = [
  "Visual Impairment", "Hearing Impairment", "Locomotor Disability",
  "Intellectual Disability", "Mental Illness", "Cerebral Palsy",
  "Autism Spectrum Disorder", "Multiple Disabilities", "Other"
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function StudentRegisterPage() {
  const [step, setStep] = useState(1);
  const { speak } = useAccessibility();
  const router = useRouter();
  const govDocRef = useRef<HTMLInputElement>(null);
  const collegeIdRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [govDoc, setGovDoc] = useState<File | null>(null);

  // Step 2: Personal Details
  const [motherName, setMotherName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [parentPhones, setParentPhones] = useState<string[]>([""]);
  const [parentEmails, setParentEmails] = useState<string[]>([""]);
  const [bloodGroup, setBloodGroup] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [enrolledInCollege, setEnrolledInCollege] = useState(false);
  const [courseDetails, setCourseDetails] = useState("");
  const [collegeId, setCollegeId] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  // Step 3: Username/Password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 4: Disability
  const [disabilityType, setDisabilityType] = useState("");

  const totalSteps = 4;

  const addParentPhone = () => {
    setParentPhones(p => [...p, ""]);
    speak("Added another phone number field");
  };
  const removeParentPhone = (i: number) => {
    setParentPhones(p => p.filter((_, idx) => idx !== i));
    speak("Removed phone number field");
  };
  const updateParentPhone = (i: number, val: string) => setParentPhones(p => p.map((v, idx) => idx === i ? val : v));

  const addParentEmail = () => {
    setParentEmails(p => [...p, ""]);
    speak("Added another email field");
  };
  const removeParentEmail = (i: number) => {
    setParentEmails(p => p.filter((_, idx) => idx !== i));
    speak("Removed email field");
  };
  const updateParentEmail = (i: number, val: string) => setParentEmails(p => p.map((v, idx) => idx === i ? val : v));

  const nextStep = () => {
    if (step === 1) {
      if (!fullName || !phone || !email || !address) {
        toast.error("Required Fields Missing", { description: "Please fill in all basic information fields marked with *." });
        return;
      }
    }
    if (step === 2) {
      if (!bloodGroup || !age) {
        toast.error("Required Fields Missing", { description: "Please provide your blood group and age." });
        return;
      }
    }
    if (step === 3) {
      if (!username || !password) {
        toast.error("Account Setup Missing", { description: "Please set your username and password." });
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
    }
    setStep(s => Math.min(s + 1, totalSteps));
    speak(`Step ${step + 1} of ${totalSteps}`);
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
    speak(`Back to Step ${step - 1}`);
  };

  const handleSubmit = async () => {
    if (!disabilityType) {
      toast.error("Selection Missing", { description: "Please select your disability type." });
      return;
    }

    setLoading(true);
    try {
      // 0. Check if username is unique
      const q = query(collection(db, "students"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error("Username Taken", {
          description: "This username is already in use. Please choose another one.",
        });
        setLoading(false);
        return;
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData = {
        uid: firebaseUser.uid,
        type: 'student' as const,
        fullName,
        phone,
        email,
        address,
        govDocName: govDoc?.name,
        motherName,
        fatherName,
        guardianName,
        parentPhones: parentPhones.filter(Boolean),
        parentEmails: parentEmails.filter(Boolean),
        bloodGroup,
        age,
        weight,
        height,
        enrolledInCollege,
        courseDetails,
        collegeIdName: collegeId?.name,
        photoName: photo?.name,
        username,
        disabilityType,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      const cleanData = JSON.parse(JSON.stringify(userData, (key, value) => 
  value === undefined ? null : value
));

// Now call setDoc with cleanData
await setDoc(doc(db, "students", firebaseUser.uid), cleanData);

      // Legacy support (optional, but keeps existing pages working if they use lib/store)
      saveStudent({ ...userData, id: firebaseUser.uid, password }); 
      setCurrentUser({ ...userData, id: firebaseUser.uid, password });

      toast.success("Account Created!", {
        description: "Welcome to the community, " + fullName + "!",
      });
      speak("Registration complete! Welcome " + fullName);
      router.push("/auth/welcome");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Registration Failed", {
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors";
  const labelCls = "text-sm font-semibold text-foreground mb-1.5 block";

  return (
    <div className="min-h-screen gradient-calm flex items-center justify-center px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Link 
          href="/auth/student" 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          onClick={() => speak("Going back")}
          aria-label="Back to student choice"
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
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <header>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">Basic Information</h2>
                  <p className="text-sm text-muted-foreground mb-4">Let's start with your contact details</p>
                </header>

                <div>
                  <label htmlFor="fullName" className={labelCls}>Full Name *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      id="fullName"
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      className={inputCls + " pl-10"} 
                      placeholder="Enter your full name" 
                      required 
                      aria-label="Enter your full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className={labelCls}>Phone Number *</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        id="phone"
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        className={inputCls + " pl-10"} 
                        placeholder="+91..." 
                        required 
                        aria-label="Enter your phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className={labelCls}>Email *</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        id="email"
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className={inputCls + " pl-10"} 
                        placeholder="you@email.com" 
                        required 
                        aria-label="Enter your email address"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className={labelCls}>Address *</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-4 text-muted-foreground" />
                    <textarea 
                      id="address"
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      className={inputCls + " pl-10 resize-none"} 
                      rows={2} 
                      placeholder="Your full residential address" 
                      required 
                      aria-label="Enter your address"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Government ID (Aadhar / PAN / Ration Card) </label>
                  <input ref={govDocRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) { setGovDoc(e.target.files[0]); speak("Government ID uploaded: " + e.target.files[0].name); } }} className="hidden" aria-label="Upload Government ID" />
                  <motion.button 
                    type="button" 
                    whileHover={{ scale: 1.01 }} 
                    whileTap={{ scale: 0.99 }} 
                    onClick={() => govDocRef.current?.click()}
                    className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${govDoc ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/30"}`}
                    aria-label={govDoc ? `Government ID uploaded: ${govDoc.name}` : "Click to upload government ID"}
                  >
                    {govDoc ? <><FileCheck size={20} /><span className="text-sm font-semibold truncate max-w-[250px]">{govDoc.name}</span></> : <><Upload size={20} /><span className="text-sm font-semibold">Upload Government ID</span></>}
                  </motion.button>
                  <p className="text-xs text-muted-foreground mt-1.5 px-1">Acceptable formats: PDF, JPG, PNG (max 5MB)</p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Personal Details */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <header>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">Personal Details</h2>
                  <p className="text-sm text-muted-foreground mb-4">Family background and health vitals</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label htmlFor="motherName" className={labelCls}>Mother's Name</label><input id="motherName" value={motherName} onChange={e => setMotherName(e.target.value)} className={inputCls} placeholder="Mother's full name" aria-label="Enter mother's name" /></div>
                  <div><label htmlFor="fatherName" className={labelCls}>Father's Name</label><input id="fatherName" value={fatherName} onChange={e => setFatherName(e.target.value)} className={inputCls} placeholder="Father's full name" aria-label="Enter father's name" /></div>
                </div>
                <div><label htmlFor="guardianName" className={labelCls}>Guardian Name</label><input id="guardianName" value={guardianName} onChange={e => setGuardianName(e.target.value)} className={inputCls} placeholder="Guardian if applicable" aria-label="Enter guardian's name" /></div>

                {/* Parent/Guardian Contacts */}
                <div className="space-y-3">
                  <label className={labelCls}>Parent/Guardian Contact Numbers *</label>
                  {parentPhones.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="tel" 
                          value={p} 
                          onChange={e => updateParentPhone(i, e.target.value)} 
                          className={inputCls + " pl-10"} 
                          placeholder={`Phone number ${i + 1}`} 
                          aria-label={`Enter parent phone number ${i + 1}`}
                        />
                      </div>
                      {parentPhones.length > 1 && (
                        <button type="button" onClick={() => removeParentPhone(i)} className="p-2 text-muted-foreground hover:text-destructive transition-colors" aria-label={`Remove phone field ${i + 1}`}>
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addParentPhone} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-primary/20 text-xs font-bold text-primary hover:bg-primary/5 transition-all" aria-label="Add another parent phone field">
                    <Plus size={14} /> Add Phone
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bloodGroup" className={labelCls}>Blood Group *</label>
                    <select id="bloodGroup" value={bloodGroup} onChange={e => { setBloodGroup(e.target.value); speak(e.target.value + " selected as blood group"); }} className={inputCls} required aria-label="Select blood group">
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div><label htmlFor="age" className={labelCls}>Age *</label><input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} className={inputCls} placeholder="Years" required aria-label="Enter your age" /></div>
                </div>

                {/* College Info */}
                <div className="pt-2">
                  <span className={labelCls}>Currently Enrolled in University/College?</span>
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => { setEnrolledInCollege(true); speak("Yes, currently enrolled"); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${enrolledInCollege ? "bg-primary text-white shadow-soft" : "border-2 border-border text-muted-foreground hover:border-primary/30"}`} aria-label="I am currently enrolled in college">Yes</button>
                    <button type="button" onClick={() => { setEnrolledInCollege(false); speak("No, not currently enrolled"); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!enrolledInCollege ? "bg-primary text-white shadow-soft" : "border-2 border-border text-muted-foreground hover:border-primary/30"}`} aria-label="I am not currently enrolled in college">No</button>
                  </div>
                </div>

                {enrolledInCollege && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 pt-1">
                    <div><label htmlFor="courseDetails" className={labelCls}>Course & College Details</label><textarea id="courseDetails" value={courseDetails} onChange={e => setCourseDetails(e.target.value)} className={inputCls + " resize-none"} rows={2} placeholder="College Name, Branch, Year..." aria-label="Enter college and course details" /></div>
                    <div>
                      <label className={labelCls}>College ID Card</label>
                      <input ref={collegeIdRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) { setCollegeId(e.target.files[0]); speak("College ID uploaded: " + e.target.files[0].name); } }} className="hidden" />
                      <button type="button" onClick={() => collegeIdRef.current?.click()} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${collegeId ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`} aria-label={collegeId ? `College ID uploaded: ${collegeId.name}` : "Click to upload college ID"}>
                        {collegeId ? <><FileCheck size={18} /><span className="text-sm font-semibold truncate max-w-[200px]">{collegeId.name}</span></> : <><Upload size={18} /><span className="text-sm font-semibold">Upload ID Card</span></>}
                      </button>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className={labelCls}>Passport Size Photo</label>
                  <input ref={photoRef} type="file" accept=".jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) { setPhoto(e.target.files[0]); speak("Photo uploaded: " + e.target.files[0].name); } }} className="hidden" />
                  <button type="button" onClick={() => photoRef.current?.click()} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${photo ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`} aria-label={photo ? `Photo uploaded: ${photo.name}` : "Click to upload passport size photo"}>
                    {photo ? <><FileCheck size={18} /><span className="text-sm font-semibold truncate max-w-[200px]">{photo.name}</span></> : <><Camera size={18} /><span className="text-sm font-semibold">Upload Recent Photo</span></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Credentials */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <header>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">Create Your Account</h2>
                  <p className="text-sm text-muted-foreground mb-4">You'll use these to sign in later</p>
                </header>

                <div>
                  <label htmlFor="username" className={labelCls}>Username *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input id="username" value={username} onChange={e => setUsername(e.target.value)} className={inputCls + " pl-10"} placeholder="Choose a username" required aria-label="Enter a username" />
                  </div>
                </div>
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
              </motion.div>
            )}

            {/* STEP 4: Disability */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <header>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">Type of Disability</h2>
                  <p className="text-sm text-muted-foreground mb-4">Helps us find the right volunteer support for you</p>
                </header>

                <div className="grid grid-cols-1 gap-2.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {DISABILITY_TYPES.map(dt => (
                    <button 
                      key={dt} 
                      type="button" 
                      onClick={() => { setDisabilityType(dt); speak(dt + " selected"); }}
                      className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-bold transition-all ${disabilityType === dt ? "border-primary bg-primary/5 text-primary shadow-soft" : "border-border text-foreground hover:border-primary/30"}`}
                      aria-label={"Select " + dt}
                      aria-pressed={disabilityType === dt}
                    >
                      {dt}
                    </button>
                  ))}
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
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-display font-bold text-sm shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={loading ? "Completing registration..." : "Finish and complete registration"}
              >
                {loading ? "Registering..." : "Complete Registration"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
