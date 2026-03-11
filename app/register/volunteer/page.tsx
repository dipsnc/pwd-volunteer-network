"use client"

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Upload, CheckCircle, Mail, FileText, Users, ClipboardList, BookOpen, MapPin, Hand, MessageSquare, HelpCircle, Info } from 'lucide-react'
import { useAccessibility } from '@/components/accessibility-provider'

const assistanceTypes = [
  { id: 'note-taking', label: 'Note-taking', desc: 'Sharing lecture summaries', icon: FileText },
  { id: 'mobility', label: 'Mobility Assistance', desc: 'Navigating campus grounds', icon: MapPin },
  { id: 'reading', label: 'Reading Aloud', desc: 'For visually impaired peers', icon: BookOpen },
  { id: 'tutoring', label: 'Tutoring', desc: 'Academic subject support', icon: ClipboardList },
  { id: 'sign-language', label: 'Sign Language', desc: 'Communication support', icon: Hand },
  { id: 'writing', label: 'Writing Aid', desc: 'Note-taking assistance', icon: MessageSquare },
]

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const timeSlots = ['Morning', 'Afternoon', 'Evening']

export default function VolunteerRegistrationPage() {
  const router = useRouter()
  const { playSound } = useAccessibility()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [selectedAssistance, setSelectedAssistance] = useState<string[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [bio, setBio] = useState('')
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

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
    playSound('click')
  }

  const toggleTime = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
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
    localStorage.setItem('user', JSON.stringify({
      type: 'volunteer',
      ...formData,
      assistanceTypes: selectedAssistance,
      availability: { days: selectedDays, times: selectedTimes },
      bio,
      name: formData.fullName || 'Alex Rivera',
      points: 2450,
      badges: 12,
      hours: 86.5,
      rank: 412
    }))
    playSound('success')
    router.push('/dashboard/volunteer')
  }

  const nextStep = () => {
    setStep(s => s + 1)
    playSound('navigate')
  }

  const prevStep = () => {
    setStep(s => s - 1)
    playSound('navigate')
  }

  const progress = (step / 4) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Volunteer Hub</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/help" className="text-muted-foreground hover:text-foreground">Help Center</Link>
            <Link href="/support" className="text-muted-foreground hover:text-foreground">Support</Link>
          </div>
        </div>
      </header>

      <main className="py-8 px-4">
        <div className="max-w-xl mx-auto">
          {/* Progress Header */}
          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-primary font-medium">STEP {step} OF 4</p>
                <h1 className="text-2xl font-bold text-foreground">
                  {step === 1 && 'Account Setup'}
                  {step === 2 && 'Email Verification'}
                  {step === 3 && 'Profile Setup'}
                  {step === 4 && 'Skills & Availability'}
                </h1>
              </div>
              <span className="text-primary font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step 1: Account Setup */}
          {step === 1 && (
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="volunteer@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Create a password"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  onClick={nextStep}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Email Verification */}
          {step === 2 && (
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Email Verification</h2>
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
                  className="px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
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
              <h2 className="text-lg font-bold text-foreground mb-2">Type of assistance</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Select the areas where you would like to provide support to fellow students.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {assistanceTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleAssistance(type.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-colors ${
                      selectedAssistance.includes(type.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-input hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      selectedAssistance.includes(type.id) ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <type.icon className={`w-5 h-5 ${selectedAssistance.includes(type.id) ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedAssistance.includes(type.id) ? 'border-primary bg-primary' : 'border-input'
                    }`}>
                      {selectedAssistance.includes(type.id) && (
                        <CheckCircle className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">Upload University ID</h3>
              <p className="text-muted-foreground text-sm mb-4">
                We need to verify your student status. Please upload a clear photo or scan of your university ID card.
              </p>

              <div className="border-2 border-dashed border-input rounded-xl p-8 text-center hover:border-primary/50 transition-colors mb-4">
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

              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl mb-6">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Your document is encrypted and will only be used for verification purposes.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Complete Registration
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Availability */}
          {step === 4 && (
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-2">Availability</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Select the days and times you&apos;re available to volunteer.
              </p>

              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-3">Days of the week</p>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDays.includes(day)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-3">Time slots</p>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => toggleTime(time)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTimes.includes(time)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
                  Why do you want to volunteer?
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your motivation..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Complete Registration
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Why Info */}
          <div className="mt-6 bg-primary/5 rounded-2xl p-6 border border-primary/20">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Why do we need this?</h4>
                <p className="text-sm text-muted-foreground">
                  Verification helps us maintain a safe community of verified students and ensures that 
                  assistance reaches those who truly need it.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2024 Volunteer Hub. Empowering university communities through collaboration.
            <div className="flex items-center justify-center gap-4 mt-2">
              <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
