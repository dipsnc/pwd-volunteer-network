"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, ArrowRight, Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/store";
import { useAccessibility } from "@/components/accessibility-provider";

export default function WelcomePage() {
  const user = getCurrentUser();
  const { speak } = useAccessibility();

  return (
    <div className="min-h-screen gradient-calm flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shadow-soft">
            <CheckCircle size={48} className="text-primary" />
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground mb-4">
          Welcome, {user?.fullName || "Friend"}!
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Your account has been created successfully. We're so glad to have you with us.
        </p>

        <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-soft mb-8">
          <div className="flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-accent/50 flex items-center justify-center shrink-0">
              <Heart size={24} className="text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Getting Started</h3>
              <p className="text-sm text-muted-foreground">Complete your profile to get the most out of our platform.</p>
            </div>
          </div>
        </div>

        <Link 
          href={user?.type === 'volunteer' ? "/dashboard/volunteer" : "/dashboard/student"}
          onClick={() => speak("Navigating to your dashboard")}
          aria-label="Go to your dashboard"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            className="w-full py-4 rounded-xl bg-primary text-white font-display font-bold text-lg flex items-center justify-center gap-2 shadow-elevated"
          >
            Go to Dashboard <ArrowRight size={20} />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
