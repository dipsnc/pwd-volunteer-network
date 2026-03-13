"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAccessibility } from '@/components/accessibility-provider'

export default function AdminLoginPage() {
  const router = useRouter()
  const { playSound } = useAccessibility()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    const ADMIN_EMAIL = 'admin@assistly.com'
    const ADMIN_PASS = 'admin123'

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      localStorage.setItem('user', JSON.stringify({
        type: 'admin',
        email,
        name: 'Super Admin'
      }))
      playSound('success')
      router.push('/dashboard/admin')
    } else {
      setError('Invalid admin credentials. Hint: admin@assistly.com / admin123')
      playSound('error')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Admin Console Login</h1>
          <p className="text-muted-foreground mt-2">Sign in to access the management portal</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-2xl p-8 border border-border shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Login
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Admin accounts are created internally only.
          </p>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/" className="text-primary hover:underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
