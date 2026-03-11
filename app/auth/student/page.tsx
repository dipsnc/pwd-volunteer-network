"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Heart, UserPlus, LogIn } from "lucide-react";
import { useAccessibility } from "@/components/accessibility-provider";

export default function StudentChoice() {
  const { speak } = useAccessibility();

  return (
    <div className="min-h-screen gradient-calm flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          onClick={() => speak("Going back")}
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
            <Heart size={24} className="text-primary-foreground" />
          </div>
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
          You're not alone.
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We're here to connect you with people who truly care and want to help.
        </p>

        <div className="space-y-4">
          <Link href="/auth/student/login">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer mb-4"
              onClick={() => speak("Login as existing user")}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <LogIn size={24} className="text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-lg font-bold text-foreground">Yes, Log me in</h3>
                <p className="text-sm text-muted-foreground">Sign in with your existing account</p>
              </div>
            </motion.div>
          </Link>

          <Link href="/auth/student/register">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer"
              onClick={() => speak("Register as new user")}
            >
              <div className="h-12 w-12 rounded-xl bg-accent/50 flex items-center justify-center shrink-0">
                <UserPlus size={24} className="text-accent-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-lg font-bold text-foreground">No, I'm new here</h3>
                <p className="text-sm text-muted-foreground">Register as a new user</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
