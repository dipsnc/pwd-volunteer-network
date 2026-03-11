"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, AtSign, Info, Upload, CheckCircle, Mail } from 'lucide-react'
import { useAccessibility } from '@/components/accessibility-provider'

const assistanceTypes = [
  { id: 'mobility', label: 'Mobility' },
  { id: 'note-taking', label: 'Note-taking' },
  { id: 'writing', label: 'Writing' },
  { id: 'reading', label: 'Reading' },
  { id: 'tutoring', label: 'Tutoring' },
  { id: 'sign-language', label: 'Sign Language' },
  { id: 'other', label: 'Other' },
]

export default function StudentRegistrationPage() {
  const router = useRouter()
  const { playSound } = useAccessibility()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [selectedAssistance, setSelectedAssistance] = useState<string[]>([])
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const toggleAssistance = (id: string) => {
    setSelectedAssistance(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
    playSound('click')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      playSound('success')
    }
  }

  const handleSubmit = () => {
    // Save to localStorage for demo
    localStorage.setItem('user', JSON.stringify({
      type: 'student',
      email,
      assistanceTypes: selectedAssistance,
      additionalDetails,
      name: 'Alex Johnson',
      id: '20240912'
    }))
    playSound('success')
    router.push('/dashboard/student')
  }

  const nextStep = () => {
    setStep(s => s + 1)
    playSound('navigate')
  }

  const prevStep = () => {
    setStep(s => s - 1)
    playSound('navigate')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="font-bold text-foreground">UniReg</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/help" className="text-muted-foreground hover:text-foreground">Help</Link>
            <Link href="/support" className="text-muted-foreground hover:text-foreground">Support</Link>
          </div>
        </div>
      </header>

      <main className="py-8 px-4">
        <div className="max-w-xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[
              { num: 1, label: 'Account' },
              { num: 2, label: 'Verify' },
              { num: 3, label: 'Profile' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s.num}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < 2 && <div className={`w-12 h-0.5 mx-2 ${step > s.num ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h1 className="text-2xl font-bold text-foreground mb-2">Student Registration</h1>
              <p className="text-muted-foreground mb-6">Let&apos;s get started with your university credentials.</p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    University Email Address
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    You will receive a 6-digit verification code to this email address in the next step.
                  </p>
                </div>

                <button
                  onClick={nextStep}
                  disabled={!email.includes('@')}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Verification
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Email Verification */}
          {step === 2 && (
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Step 2: Email Verification</h2>
                  <p className="text-sm text-muted-foreground">Enter the OTP sent to your email.</p>
                </div>
              </div>

              <div className="flex justify-center gap-3 my-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { otpRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground mb-6">
                Didn&apos;t receive the code?{' '}
                <button className="text-primary font-medium hover:underline">Resend Code</button>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 border border-border text-foreground py-3 rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Profile Setup */}
          {step === 3 && (
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-2">Step 3: Profile Setup</h2>
              <p className="text-muted-foreground mb-6">Help us understand how we can support you best.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Type of assistance needed
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {assistanceTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => toggleAssistance(type.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          selectedAssistance.includes(type.id)
                            ? 'border-primary bg-primary/5 text-foreground'
                            : 'border-input bg-background text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedAssistance.includes(type.id) ? 'border-primary bg-primary' : 'border-input'
                        }`}>
                          {selectedAssistance.includes(type.id) && (
                            <CheckCircle className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="details" className="block text-sm font-medium text-foreground mb-2">
                    Additional Details
                  </label>
                  <textarea
                    id="details"
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    placeholder="Tell us more about your requirements..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Upload University ID
                  </label>
                  <div className="border-2 border-dashed border-input rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      {uploadedFile ? (
                        <p className="text-sm text-foreground font-medium">{uploadedFile.name}</p>
                      ) : (
                        <>
                          <p className="text-foreground font-medium">Click to upload or drag and drop</p>
                          <p className="text-sm text-muted-foreground">PDF, JPG or PNG (max. 5MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    className="flex-1 flex items-center justify-center gap-2 border border-border text-foreground py-3 rounded-xl font-medium hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Complete Registration
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2024 UniReg - Educational Accessibility Solutions
            <div className="flex items-center justify-center gap-4 mt-2">
              <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
