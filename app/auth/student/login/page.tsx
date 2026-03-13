"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Phone, LogIn } from "lucide-react";
import { useAccessibility } from "@/components/accessibility-provider";
import { setCurrentUser } from "@/lib/store";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";

export default function StudentLoginPage() {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { speak } = useAccessibility();
  const router = useRouter();
  const { googleSignIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let loginEmail = identifier;

      // 1. Lookup email if identifier is not an email
      if (!identifier.includes("@")) {
        const field = loginMethod === "phone" ? "phone" : "username";
        const q = query(collection(db, "students"), where(field, "==", identifier));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          toast.error("User not found", {
            description: `No student found with that ${field}.`,
          });
          setLoading(false);
          return;
        }
        
        const userData = querySnapshot.docs[0].data();
        loginEmail = userData.email;
      }

      // 2. Firebase Sign In
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
      const firebaseUser = userCredential.user;

      // 3. Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "students", firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Legacy support
        setCurrentUser({ ...userData as any, id: firebaseUser.uid, password });
        
        toast.success("Welcome back, " + userData.fullName + "!", {
          description: "You've been successfully signed in.",
        });
        speak("Welcome back " + userData.fullName);
        router.push("/dashboard/student");
      } else {
        toast.error("Profile not found", {
          description: "Please ensure you have completed your student registration.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let message = "Please check your login details and try again.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Incorrect email/username or password.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later.";
      }

      toast.error("Login Failed", {
        description: message,
      });
      speak("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (!result) return;
      
      const firebaseUser = result.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "students", firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({ ...(userData as any), id: firebaseUser.uid });
        toast.success("Welcome back, " + userData.fullName + "!");
        router.push("/dashboard/student");
      } else {
        toast.error("Account not found", {
          description: "Please register as a student first.",
        });
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error("Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-calm flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Link 
          href="/auth/student" 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          onClick={() => speak("Going back")}
          aria-label="Back to student choice"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="rounded-2xl bg-card p-8 shadow-card border border-border/50">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-sm text-muted-foreground">Sign in to your student account</p>
            </div>

            <button 
              onClick={handleGoogleSignIn} 
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-border bg-background text-foreground font-medium transition-all duration-300 hover:border-primary/30 hover:shadow-soft disabled:opacity-50"
              aria-label="Sign in with Google"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex rounded-xl bg-muted p-1 gap-1">
              <button 
                onClick={() => { setLoginMethod("email"); speak("Email method selected"); }} 
                className='flex-1 py-2.5 rounded-lg text-sm font-medium transition-all'
                aria-label="Login with Email or Username"
              >
                <Mail size={14} className="inline mr-1.5" /> Email / Username
              </button>
              
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="text-sm font-medium text-foreground mb-1.5 block">
                  {loginMethod === "email" ? "Email or Username" : "Phone Number"}
                </label>
                <div className="relative">
                  {loginMethod === "email" ? <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /> : <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
                  <input
                    id="identifier"
                    type={loginMethod === "email" ? "text" : "tel"}
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder={loginMethod === "email" ? "Email or username" : "+91 98765 43210"}
                    required
                    aria-label={loginMethod === "email" ? "Enter email or username" : "Enter phone number"}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                    aria-label="Enter password"
                  />
                  <button 
                    type="button" 
                    onClick={() => { setShowPassword(p => !p); speak(showPassword ? "Hiding password" : "Showing password"); }} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base transition-all duration-300 hover:shadow-elevated flex items-center justify-center gap-2 disabled:opacity-50"
                aria-label={loading ? "Signing in..." : "Sign in"}
              >
                {loading ? <span className="animate-pulse">Signing in...</span> : <><LogIn size={18} /> Sign In</>}
              </motion.button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/student/register" className="text-primary font-medium hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
