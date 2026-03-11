"use client";

import Link from 'next/link'
import { Heart, Users } from 'lucide-react'
import { useAccessibility } from './accessibility-provider'

export function Footer() {
  const { speak } = useAccessibility()

  return (
    <footer className="bg-[#1a202c] text-white py-16 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 group transition-transform hover:scale-105">
            <div className="w-12 h-12 bg-[#4fd1c5] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
              <Users size={28} className="text-[#1a202c]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">PWD NETWORK</span>
              <span className="text-[10px] font-bold text-[#4fd1c5] tracking-[0.2em] uppercase mt-1">Volunteer Network</span>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-bold text-gray-400">
            {[
              { label: 'Privacy Policy', path: '#' },
              { label: 'Terms of Service', path: '#' },
              { label: 'Contact Us', path: '#' },
              { label: 'Developer Portal', path: '/dev' }
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.path} 
                className="hover:text-[#4fd1c5] transition-all relative group"
                onClick={() => speak("Navigating to " + link.label)}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4fd1c5] transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className="text-gray-500 text-xs font-bold text-center md:text-right">
            <p>© 2024 PWD Volunteer Network. All rights reserved.</p>
            <p className="mt-1 flex items-center justify-center md:justify-end gap-1.5 opacity-50">
              Made with <Heart size={12} className="text-[#ef4444] fill-current" /> for the community
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
