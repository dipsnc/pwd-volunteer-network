"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CheckCircle, Zap, Heart, ArrowRight, BookOpen, Users } from 'lucide-react'
import { useAccessibility } from '@/components/accessibility-provider'

export default function HomePage() {
  const { playSound } = useAccessibility()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Volunteers assisting students on campus"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 text-balance">
            PWD Volunteer Network
          </h1>
          <p className="text-xl md:text-2xl text-primary-light mb-4">
            Support for the people, by the people
          </p>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto text-pretty">
            Join our community to bridge the gap and foster inclusivity through dedicated 
            service and mutual support. Together, we make accessibility a reality.
          </p>
          <Link
            href="#who-are-you"
            onClick={() => playSound('navigate')}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105 shadow-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Who Are You Section */}
      <section id="who-are-you" className="py-20 px-4 -mt-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Who are you?
              </h2>
              <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Student Card */}
              <div className="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/student-studying.jpg"
                      alt="Student studying"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-1">
                      <BookOpen className="w-4 h-4" />
                      REQUEST HELP
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Student</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Request assistance for your daily needs, academic support, or 
                      navigating campus life. We&apos;re here to help you succeed.
                    </p>
                    <Link
                      href="/register/student"
                      onClick={() => playSound('navigate')}
                      className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                    >
                      Register/Login
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Volunteer Card */}
              <div className="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/volunteers-group.jpg"
                      alt="Group of volunteers"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-1">
                      <Users className="w-4 h-4" />
                      OFFER HELP
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Volunteer</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Offer your time, skills, and empathy to help people with 
                      disabilities lead more independent and fulfilling lives.
                    </p>
                    <Link
                      href="/register/volunteer"
                      onClick={() => playSound('navigate')}
                      className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                    >
                      Register/Login
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Why PWD Volunteer Network?
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Verified Members</h3>
              <p className="text-muted-foreground">
                All our volunteers undergo background checks to ensure a safe environment.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Quick Matching</h3>
              <p className="text-muted-foreground">
                Our algorithm connects students and volunteers based on proximity and skills.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Impactful Work</h3>
              <p className="text-muted-foreground">
                Join a network that focuses on building lasting relationships and real impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
