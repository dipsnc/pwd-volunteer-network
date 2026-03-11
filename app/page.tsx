"use client"

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { CheckCircle, Zap, Heart, ArrowRight, BookOpen, Users, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAccessibility } from '@/components/accessibility-provider'

export default function HomePage() {
  const { speak } = useAccessibility()

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Inclusive campus life with students and volunteers"
            fill
            className="object-cover transition-transform duration-[10s] hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight"
          >
            PWD Volunteer Network
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl font-display font-bold text-[#4fd1c5] tracking-wide"
          >
            Support for the people, by the people
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="text-base md:text-lg text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Join our community to bridge the gap and foster inclusivity through dedicated 
            service and mutual support. Together, we make accessibility a reality.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              asChild 
              onClick={() => speak("Getting started, choosing your role.")}
              audioLabel="Get started" 
              size="lg" 
              className="rounded-full px-10 py-4 text-lg h-auto bg-[#4fd1c5] hover:bg-[#38b2ac] text-[#1a202c] font-black shadow-2xl transition-all hover:scale-110 active:scale-95"
              aria-label="Get Started and select your role"
            >
              <Link href="#who-are-you">
                Get Started
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Role Selection section */}
      <section id="who-are-you" className="py-24 px-6 relative z-20 -mt-12 md:-mt-32">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-16 border border-border/10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-[#1a202c] mb-4">
                Who are you?
              </h2>
              <div className="w-20 h-1.5 bg-[#4fd1c5] mx-auto rounded-full" aria-hidden="true" />
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Student Role */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-[#f0f4f1] rounded-3xl overflow-hidden px-6 py-2 md:p-8 flex flex-col md:flex-row gap-8 items-center border border-[#e2e8f0] transition-all"
              >
                <div className="relative w-48 h-48 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-soft flex-shrink-0">
                  <Image src="/images/student-studying.jpg" alt="Student Studying" fill className="object-cover" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="flex items-center justify-center md:justify-start gap-2 text-[#38b2ac] text-xs font-black uppercase tracking-widest mb-2">
                    <BookOpen size={16} /> Request Help
                  </span>
                  <h3 className="text-3xl font-black text-[#1a202c] mb-4">Student</h3>
                  <p className="text-[#4a5568] text-sm md:text-base leading-relaxed mb-6">
                    Request assistance for your daily needs, academic support, or 
                    navigating campus life. We&apos;re here to help you succeed.
                  </p>
                  <Button asChild audioLabel="Login as student" 
                    className="w-full md:w-auto bg-[#1a202c] hover:bg-black text-white rounded-xl px-8 py-6 font-bold flex items-center justify-center gap-2"
                    aria-label="Register or login as a student"
                    onClick={() => speak("Heading to student login")}
                  >
                    <Link href="/auth/student">
                      Register/Login <LogIn size={18} />
                    </Link>
                  </Button>
                </div>
              </motion.div>

              {/* Volunteer Role */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-[#f0f4f1] rounded-3xl overflow-hidden px-6 py-2 md:p-8 flex flex-col md:flex-row gap-8 items-center border border-[#e2e8f0] transition-all"
              >
                <div className="relative w-48 h-48 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-soft flex-shrink-0">
                  <Image src="/images/volunteers-group.jpg" alt="Volunteers Team" fill className="object-cover" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="flex items-center justify-center md:justify-start gap-2 text-[#38b2ac] text-xs font-black uppercase tracking-widest mb-2">
                    <Users size={16} /> Offer Help
                  </span>
                  <h3 className="text-3xl font-black text-[#1a202c] mb-4">Volunteer</h3>
                  <p className="text-[#4a5568] text-sm md:text-base leading-relaxed mb-6">
                    Offer your time, skills, and empathy to help people with 
                    disabilities lead more independent and fulfilling lives.
                  </p>
                  <Button asChild audioLabel="Login as volunteer" 
                    className="w-full md:w-auto bg-[#1a202c] hover:bg-black text-white rounded-xl px-8 py-6 font-bold flex items-center justify-center gap-2"
                    aria-label="Register or login as a volunteer"
                    onClick={() => speak("Heading to volunteer login")}
                  >
                    <Link href="/auth/volunteer">
                      Register/Login <LogIn size={18} />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Impact Section */}
      <section id="how-it-works" className="pb-10 px-6 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#1a202c] mb-4">
              Why PWD Volunteer Network?
            </h2>
            <div className="w-16 h-1 bg-[#4fd1c5] mx-auto rounded-full" aria-hidden="true" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Verified Members", 
                desc: "All our volunteers undergo background checks to ensure a safe environment.",
                icon: <CheckCircle className="text-[#10b981]" />,
                speak: "Every volunteer is verified for safety."
              },
              { 
                title: "Quick Matching", 
                desc: "Our algorithm connects students and volunteers based on proximity and skills.",
                icon: <Zap className="text-[#f59e0b]" />,
                speak: "Smart matching connects you quickly."
              },
              { 
                title: "Impactful Work", 
                desc: "Join a network that focuses on building lasting relationships and real impact.",
                icon: <Heart className="text-[#ef4444]" />,
                speak: "Creating real human connections."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-3xl border border-gray-100 shadow-soft hover:shadow-lg transition-all text-center md:text-left"
                aria-label={feature.title + ": " + feature.desc}
                onMouseEnter={() => speak(feature.speak)}
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm mx-auto md:mx-0">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-[#1a202c] mb-3">{feature.title}</h3>
                <p className="text-[#4a5568] leading-relaxed text-sm md:text-base">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-[#1a202c] text-white py-6 px-6">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4fd1c5] rounded-xl flex items-center justify-center shadow-lg">
                <Users size={24} className="text-[#1a202c]" />
              </div>
              <span className="text-xl font-black tracking-tighter">PWD Volunteer Network</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-400">
              <Link href="#" className="hover:text-[#4fd1c5] transition-colors" onClick={() => speak("Reviewing Privacy Policy")}>Privacy Policy</Link>
              <Link href="#" className="hover:text-[#4fd1c5] transition-colors" onClick={() => speak("Reviewing Terms of Service")}>Terms of Service</Link>
              <Link href="#" className="hover:text-[#4fd1c5] transition-colors" onClick={() => speak("Contacting us")}>Contact Us</Link>
              <Link href="/dev" className="text-white/20 hover:text-white transition-colors">Developer Portal</Link>
            </nav>
            <div className="text-gray-400 text-sm font-bold">
              © 2024 PWD Volunteer Network. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
