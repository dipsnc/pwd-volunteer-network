"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Heart, CheckCircle } from "lucide-react";
import { useAccessibility } from "@/components/accessibility-provider";

export default function VolunteerPendingPage() {
  const { speak } = useAccessibility();

  return (
    <div className="min-h-screen gradient-calm flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="w-full max-w-md text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="h-20 w-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-soft">
          <Heart size={36} className="text-white" />
        </motion.div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-3">Thank You for Registering!</h1>
        <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
          Your compassion makes our community stronger. 💙
        </p>

        <div className="rounded-2xl bg-card p-6 shadow-card border border-border/50 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} className="text-warning" />
            <h3 className="font-display font-bold text-foreground">Verification in Progress</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your application has been sent to the admin for review. You'll be notified once your account is approved.
          </p>
          <div className="space-y-2">
            {["Application submitted", "Admin review pending", "Account activation"].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {i === 0 ? <CheckCircle size={16} className="text-success" /> : <div className="h-4 w-4 rounded-full border-2 border-border" />}
                <span className={i === 0 ? "text-foreground font-medium" : "text-muted-foreground text-foreground/60"}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground italic mb-6">
          "The best way to find yourself is to lose yourself in the service of others." — Mahatma Gandhi
        </p>

        <Link 
          href="/"
          onClick={() => speak("Navigating back to home")}
          aria-label="Back to home page"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            className="px-8 py-3 rounded-xl border-2 border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors shadow-sm"
          >
            Back to Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
