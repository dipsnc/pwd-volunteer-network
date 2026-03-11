"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, User, Heart } from 'lucide-react'
import { useAccessibility } from './accessibility-provider'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { speak, playSound } = useAccessibility()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (label: string) => {
    speak(`Navigating to ${label}`)
    playSound('navigate')
    setIsOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-border py-2 shadow-soft' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => handleNavClick('Home')}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${scrolled ? 'bg-primary shadow-soft' : 'bg-white/10 backdrop-blur-md'}`}>
              <Heart className={`w-6 h-6 transition-colors ${scrolled ? 'text-primary-foreground' : 'text-white'}`} fill="currentColor" />
            </div>
            <span className={`font-black tracking-tighter text-xl transition-colors duration-300 ${scrolled ? 'text-foreground' : 'text-white'}`}>
              PWD Network
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {['Home', 'About', 'How it works'].map((item) => (
              <Link 
                key={item}
                href={item === 'Home' ? '/' : `/#${item.toLowerCase().replace(/ /g, '-')}`} 
                className={`text-sm font-bold transition-all hover:text-primary ${scrolled ? 'text-muted-foreground' : 'text-white/80 hover:text-white'}`}
                onClick={() => handleNavClick(item)}
              >
                {item}
              </Link>
            ))}
            <Link 
              href="/admin/login" 
              className={`text-xs font-black uppercase tracking-widest transition-all ${scrolled ? 'text-muted-foreground hover:text-primary' : 'text-white/40 hover:text-white'}`}
              onClick={() => handleNavClick('Admin login')}
            >
              Admin
            </Link>
            <Link 
              href="#who-are-you"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${scrolled ? 'bg-primary text-primary-foreground shadow-soft hover:bg-primary/90' : 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20'}`}
              onClick={() => handleNavClick('Login Portal')}
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          </div>

          <button
            onClick={() => {
              const next = !isOpen;
              setIsOpen(next);
              speak(next ? 'Opening menu' : 'Closing menu');
              playSound('click');
            }}
            className={`md:hidden p-2 rounded-xl transition-colors ${scrolled ? 'text-muted-foreground hover:bg-muted' : 'text-white hover:bg-white/10'}`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-border shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              {['Home', 'About', 'How it works'].map((item) => (
                <Link key={item} href={item === 'Home' ? '/' : `/#${item.toLowerCase().replace(/ /g, '-')}`} className="block text-2xl font-black text-[#1a202c] hover:text-primary transition-colors" onClick={() => handleNavClick(item)}>
                  {item}
                </Link>
              ))}
              <div className="pt-6 border-t border-border flex flex-col gap-4">
                <Link href="/auth/student" className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-soft" onClick={() => handleNavClick('Login')}>
                  <User className="w-5 h-5" /> Login Portal
                </Link>
                <Link href="/admin/login" className="text-center text-sm font-bold text-muted-foreground" onClick={() => handleNavClick('Admin login')}>
                  Admin Access
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
