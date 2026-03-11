"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type TextSize = 'small' | 'medium' | 'large' | 'xlarge'

interface AccessibilityContextType {
  textSize: TextSize
  setTextSize: (size: TextSize) => void
  highContrast: boolean
  setHighContrast: (enabled: boolean) => void
  colorblindMode: boolean
  setColorblindMode: (enabled: boolean) => void
  darkMode: boolean
  setDarkMode: (enabled: boolean) => void
  audioCues: boolean
  setAudioCues: (enabled: boolean) => void
  playSound: (type: 'click' | 'success' | 'error' | 'navigate') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

const textSizeMultipliers: Record<TextSize, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
  xlarge: 1.25
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSize] = useState<TextSize>('medium')
  const [highContrast, setHighContrast] = useState(false)
  const [colorblindMode, setColorblindMode] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [audioCues, setAudioCues] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings')
    if (saved) {
      const settings = JSON.parse(saved)
      setTextSize(settings.textSize || 'medium')
      setHighContrast(settings.highContrast || false)
      setColorblindMode(settings.colorblindMode || false)
      setDarkMode(settings.darkMode || false)
      setAudioCues(settings.audioCues || false)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify({
      textSize,
      highContrast,
      colorblindMode,
      darkMode,
      audioCues
    }))

    const root = document.documentElement
    root.style.fontSize = `${textSizeMultipliers[textSize] * 16}px`
    
    root.classList.toggle('dark', darkMode)
    root.classList.toggle('high-contrast', highContrast)
    root.classList.toggle('colorblind', colorblindMode)
  }, [textSize, highContrast, colorblindMode, darkMode, audioCues])

  const playSound = (type: 'click' | 'success' | 'error' | 'navigate') => {
    if (!audioCues) return
    
    let ctx = audioContext
    if (!ctx) {
      ctx = new AudioContext()
      setAudioContext(ctx)
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    const frequencies: Record<typeof type, number> = {
      click: 800,
      success: 1200,
      error: 300,
      navigate: 600
    }
    
    oscillator.frequency.value = frequencies[type]
    oscillator.type = 'sine'
    gainNode.gain.value = 0.1
    
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.1)
  }

  return (
    <AccessibilityContext.Provider value={{
      textSize,
      setTextSize,
      highContrast,
      setHighContrast,
      colorblindMode,
      setColorblindMode,
      darkMode,
      setDarkMode,
      audioCues,
      setAudioCues,
      playSound
    }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}
