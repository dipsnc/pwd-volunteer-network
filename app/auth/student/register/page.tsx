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
import { uploadImageToCloudinary } from "@/lib/cloudinary-action";

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
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [govDoc, setGovDoc] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  // Step 2: Personal Details
  const [managedByGuardian, setManagedByGuardian] = useState(false);
  const [motherName, setMotherName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [parentPhones, setParentPhones] = useState<string[]>([""]);
  const [parentEmails, setParentEmails] = useState<string[]>([""]);
  const [bloodGroup, setBloodGroup] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  // Step 3: Education
  const [enrolledInCollege, setEnrolledInCollege] = useState(false);
  const [courseDetails, setCourseDetails] = useState("");
  const [collegeId, setCollegeId] = useState<File | null>(null);

  // Step 4: Disability & Credentials
  const [disabilityTypes, setDisabilityTypes] = useState<string[]>([]);
  const [assistanceNeeds, setAssistanceNeeds] = useState("");
  const [disabilityCert, setDisabilityCert] = useState<File | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const disabilityCertRef = useRef<HTMLInputElement>(null);

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
      if (!fullName || !username || !phone || !email || !address) {
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
      if (enrolledInCollege && !courseDetails) {
        toast.error("Required Fields Missing", { description: "Please provide your course details." });
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

  const toggleDisability = (dt: string) => {
    setDisabilityTypes(prev => 
      prev.includes(dt) ? prev.filter(t => t !== dt) : [...prev, dt]
    );
    speak(dt + (disabilityTypes.includes(dt) ? " removed" : " added") + " to selection");
  };

  const handleSubmit = async () => {
    if (disabilityTypes.length === 0) {
      toast.error("Selection Missing", { description: "Please select at least one disability type." });
      return;
    }

      if (!password || password !== confirmPassword || password.length < 6) {
        toast.error("Invalid Password", { description: "Please provide a valid password of at least 6 characters that matches the confirmation." });
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

      // 1. Upload files to Cloudinary first (using unique username for folder path)
      let profilePhotoUrl = null;
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        profilePhotoUrl = await uploadImageToCloudinary(formData, `profile-images/${username}`);
      }

      let govIdUrl = null;
      if (govDoc) {
        const formData = new FormData();
        formData.append("file", govDoc);
        govIdUrl = await uploadImageToCloudinary(formData, `gov-ids/${username}`);
      }

      let collegeIdUrl = null;
      if (collegeId) {
        const formData = new FormData();
        formData.append("file", collegeId);
        collegeIdUrl = await uploadImageToCloudinary(formData, `college-ids/${username}`);
      }

      let disabilityCertificateUrl = null;
      if (disabilityCert) {
        const formData = new FormData();
        formData.append("file", disabilityCert);
        disabilityCertificateUrl = await uploadImageToCloudinary(formData, `disability-certificates/${username}`);
      }

      // 2. Create Firebase user AFTER uploads succeed
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;


      const userData = {
        uid: firebaseUser.uid,
        type: 'student' as const,
        fullName,
        username,
        email,
        phone,
        address,
        profilePhotoUrl,
        govIdUrl,
        managedByGuardian,
        motherName,
        fatherName,
        guardianName,
        parentPhones: parentPhones.filter(Boolean),
        parentEmails: parentEmails.filter(Boolean),
        bloodGroup,
        age: Number(age),
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        enrolledInCollege,
        courseDetails,
        collegeIdUrl,
        disabilityTypes,
        disabilityCertificateUrl,
        assistanceNeeds,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      const cleanData = JSON.parse(JSON.stringify(userData, (key, value) => 
  value === undefined ? null : value
));

// Now call setDoc with cleanData
await setDoc(doc(db, "students", firebaseUser.uid), cleanData);

      // Legacy support (optional, but keeps existing pages working if they use lib/store)
      saveStudent({ ...userData, age: String(userData.age), id: firebaseUser.uid, password } as any); 
      setCurrentUser({ ...userData, age: String(userData.age), id: firebaseUser.uid, password } as any);

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                  <div>
                    <label htmlFor="username" className={labelCls}>Username *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        id="username"
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        className={inputCls + " pl-10"} 
                        placeholder="Choose a username" 
                        required 
                        aria-label="Choose a username"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className={labelCls}>Profile Photo</label>
                    <input ref={photoRef} type="file" accept=".jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) { setPhoto(e.target.files[0]); speak("Photo uploaded: " + e.target.files[0].name); } }} className="hidden" />
                    <button type="button" onClick={() => photoRef.current?.click()} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${photo ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`} aria-label={photo ? `Photo uploaded: ${photo.name}` : "Click to upload profile photo"}>
                      {photo ? <><FileCheck size={18} /><span className="text-sm font-semibold truncate max-w-[150px]">{photo.name}</span></> : <><Camera size={18} /><span className="text-sm font-semibold">Upload Photo</span></>}
                    </button>
                  </div>
                  <div>
                    <label className={labelCls}>Gov ID (Aadhar / PAN)</label>
                    <input ref={govDocRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) { setGovDoc(e.target.files[0]); speak("Government ID uploaded: " + e.target.files[0].name); } }} className="hidden" aria-label="Upload Government ID" />
                    <motion.button 
                      type="button" 
                      whileHover={{ scale: 1.01 }} 
                      whileTap={{ scale: 0.99 }} 
                      onClick={() => govDocRef.current?.click()}
                      className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${govDoc ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/30"}`}
                      aria-label={govDoc ? `Government ID uploaded: ${govDoc.name}` : "Click to upload government ID"}
                    >
                      {govDoc ? <><FileCheck size={18} /><span className="text-sm font-semibold truncate max-w-[150px]">{govDoc.name}</span></> : <><Upload size={18} /><span className="text-sm font-semibold">Upload Gov ID</span></>}
                    </motion.button>
                  </div>
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

                <div className="flex items-center gap-3 mb-4 p-4 rounded-xl border-2 border-border/50 bg-muted/20">
                  <input 
                    type="checkbox" 
                    id="managedByGuardian" 
                    checked={managedByGuardian} 
                    onChange={e => { setManagedByGuardian(e.target.checked); speak(e.target.checked ? "Account managed by parent selected" : "Account managed by parent deselected"); }}
                    className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-primary transition-colors cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="managedByGuardian" className="text-sm font-bold text-foreground cursor-pointer select-none">Account Managed by Parent/Guardian</label>
                    <span className="text-xs text-muted-foreground">Check this if a guardian is filling out this form</span>
                  </div>
                </div>
                {managedByGuardian && (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    🛡 Account Managed by Parent
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div><label htmlFor="motherName" className={labelCls}>Mother's Name</label><input id="motherName" value={motherName} onChange={e => setMotherName(e.target.value)} className={inputCls} placeholder="Mother's full name" aria-label="Enter mother's name" /></div>
                  <div><label htmlFor="fatherName" className={labelCls}>Father's Name</label><input id="fatherName" value={fatherName} onChange={e => setFatherName(e.target.value)} className={inputCls} placeholder="Father's full name" aria-label="Enter father's name" /></div>
                </div>
                <div><label htmlFor="guardianName" className={labelCls}>Guardian Name (if applicable)</label><input id="guardianName" value={guardianName} onChange={e => setGuardianName(e.target.value)} className={inputCls} placeholder="Guardian's full name" aria-label="Enter guardian's name" /></div>

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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="bloodGroup" className={labelCls}>Blood Group *</label>
                    <select id="bloodGroup" value={bloodGroup} onChange={e => { setBloodGroup(e.target.value); speak(e.target.value + " selected as blood group"); }} className={inputCls} required aria-label="Select blood group">
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div><label htmlFor="age" className={labelCls}>Age *</label><input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} className={inputCls} placeholder="Years" required aria-label="Enter your age" /></div>
                  <div><label htmlFor="weight" className={labelCls}>Weight (kg)</label><input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} placeholder="Optional" aria-label="Enter your weight" /></div>
                  <div><label htmlFor="height" className={labelCls}>Height (cm)</label><input id="height" type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} placeholder="Optional" aria-label="Enter your height" /></div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Education */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <header>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">Education Details</h2>
                  <p className="text-sm text-muted-foreground mb-4">Tell us about your current academic status</p>
                </header>

                <div className="pt-2">
                  <span className={labelCls}>Currently Enrolled in University/College?</span>
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => { setEnrolledInCollege(true); speak("Yes, currently enrolled"); }} className={`flex-1 py-3 items-center justify-center rounded-xl text-sm font-bold transition-all ${enrolledInCollege ? "bg-primary text-primary-foreground shadow-soft" : "border-2 border-border text-muted-foreground hover:border-primary/30"}`} aria-label="I am currently enrolled in college">Yes</button>
                    <button type="button" onClick={() => { setEnrolledInCollege(false); speak("No, not currently enrolled"); }} className={`flex-1 py-3 items-center justify-center rounded-xl text-sm font-bold transition-all ${!enrolledInCollege ? "bg-primary text-primary-foreground shadow-soft" : "border-2 border-border text-muted-foreground hover:border-primary/30"}`} aria-label="I am not currently enrolled in college">No</button>
                  </div>
                </div>

                {enrolledInCollege && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 pt-1">
                    <div>
                      <label htmlFor="courseDetails" className={labelCls}>Course & College Details *</label>
                      <textarea id="courseDetails" value={courseDetails} onChange={e => setCourseDetails(e.target.value)} className={inputCls + " resize-none"} rows={2} placeholder="College Name, Branch, Year..." aria-label="Enter college and course details" />
                    </div>
                    <div>
                      <label className={labelCls}>College ID Card</label>
                      <input ref={collegeIdRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) { setCollegeId(e.target.files[0]); speak("College ID uploaded: " + e.target.files[0].name); } }} className="hidden" />
                      <button type="button" onClick={() => collegeIdRef.current?.click()} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${collegeId ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`} aria-label={collegeId ? `College ID uploaded: ${collegeId.name}` : "Click to upload college ID"}>
                        {collegeId ? <><FileCheck size={18} /><span className="text-sm font-semibold truncate max-w-[200px]">{collegeId.name}</span></> : <><Upload size={18} /><span className="text-sm font-semibold">Upload ID Card</span></>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 4: Disability & Account Details */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <header>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">Finish Submitting</h2>
                  <p className="text-sm text-muted-foreground mb-4">Help us find the right volunteer support, and set your password</p>
                </header>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Type of Disability *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {DISABILITY_TYPES.map(dt => (
                        <button 
                          key={dt} 
                          type="button" 
                          onClick={() => toggleDisability(dt)}
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${disabilityTypes.includes(dt) ? "border-primary bg-primary/5 text-primary shadow-soft" : "border-border text-foreground hover:border-primary/30"}`}
                          aria-pressed={disabilityTypes.includes(dt)}
                        >
                          {dt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="assistanceNeeds" className={labelCls}>Assistance Needs</label>
                    <textarea 
                      id="assistanceNeeds"
                      value={assistanceNeeds} 
                      onChange={e => setAssistanceNeeds(e.target.value)} 
                      className={inputCls + " resize-none"} 
                      rows={2} 
                      placeholder="e.g., Note taking, reading assistance, navigation help..." 
                      aria-label="Enter your specific assistance needs"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Disability Certificate</label>
                    <input ref={disabilityCertRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) { setDisabilityCert(e.target.files[0]); speak("Disability certificate uploaded"); } }} className="hidden" aria-label="Upload Disability Certificate" />
                    <button type="button" onClick={() => disabilityCertRef.current?.click()} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${disabilityCert ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`} aria-label={disabilityCert ? `Certificate uploaded: ${disabilityCert.name}` : "Click to upload disability certificate"}>
                      {disabilityCert ? <><FileCheck size={18} /><span className="text-sm font-semibold truncate max-w-[200px]">{disabilityCert.name}</span></> : <><Upload size={18} /><span className="text-sm font-semibold">Upload Certificate</span></>}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 space-y-4">
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
