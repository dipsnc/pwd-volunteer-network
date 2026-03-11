"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, User } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="font-bold text-foreground">PWD Volunteer Network</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link 
              href="/admin/login" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
            <Link 
              href="/dashboard/student"
              className="flex items-center gap-1 px-4 py-2 rounded-full border border-border hover:bg-muted transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">Profile</span>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className="block text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link href="/#about" className="block text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              About
            </Link>
            <Link href="/#how-it-works" className="block text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              How It Works
            </Link>
            <Link href="/admin/login" className="block text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              Admin Login
            </Link>
            <Link 
              href="/dashboard/student"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
