"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, Users, UserCog, Home, Database, Globe } from "lucide-react";
import { useAccessibility } from "@/components/accessibility-provider";

export default function DevPortalPage() {
  const { speak } = useAccessibility();

  const devLinks = [
    { name: "Student Dashboard", path: "/dashboard/student", icon: <Globe className="text-primary" />, desc: "Access the student-facing dashboard." },
    { name: "Volunteer Dashboard", path: "/dashboard/volunteer", icon: <Users className="text-accent-foreground" />, desc: "Access the volunteer management dashboard." },
    { name: "Admin Dashboard", path: "/dashboard/admin", icon: <UserCog className="text-destructive" />, desc: "Full administrative controls." },
  ];

  const helperLinks = [
    { name: "Landing Page", path: "/", icon: <Home className="text-muted-foreground" /> },
    { name: "Authentication Choice", path: "/auth", icon: <Database className="text-muted-foreground" /> },
  ];

  return (
    <div className="min-h-screen gradient-calm flex flex-col items-center justify-center p-6 pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display text-4xl font-black text-foreground mb-4">Dev Portal</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Developer quick links to bypass authentication and jump straight into dashboards.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
        {devLinks.map((link, i) => (
          <motion.div 
            key={link.name}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
          >
            <Link 
              href={link.path}
              onClick={() => speak("Heading to " + link.name)}
              className="group block h-full p-8 rounded-3xl bg-card border-2 border-border shadow-soft hover:shadow-elevated hover:border-primary/50 transition-all"
            >
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {link.icon}
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">{link.name}</h2>
              <p className="text-sm text-muted-foreground">{link.desc}</p>
              <div className="mt-6 flex items-center text-primary font-bold text-sm gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Jump In <LayoutDashboard size={16} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-4"
      >
        {helperLinks.map(link => (
          <Link 
            key={link.name}
            href={link.path} 
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border bg-card text-sm font-bold text-foreground hover:bg-muted transition-all"
          >
            {link.icon} {link.name}
          </Link>
        ))}
      </motion.div>

      <footer className="mt-20 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          PROPRIETARY DEVELOPER TOOLS // GOOGLE DEEPMIND ANTIGRAVITY
        </p>
      </footer>
    </div>
  );
}
