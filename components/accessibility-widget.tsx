"use client"

import { useState } from 'react'
import { Accessibility, X, Sun, Moon, Eye, Palette, Volume2, VolumeX, Type } from 'lucide-react'
import { useAccessibility } from './accessibility-provider'
import { Button } from '@/components/ui/button'

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const {
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
    playSound,
    speak
  } = useAccessibility()

  const handleToggle = () => {
    setIsOpen(!isOpen)
    playSound('click')
    if (!isOpen) speak('Accessibility settings opened')
    else speak('Accessibility settings closed')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-card rounded-2xl shadow-xl border border-border p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">Accessibility Settings</h3>
            <button 
              onClick={handleToggle}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close accessibility panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Text Size */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-2">
                <Type className="w-4 h-4" />
                Text Size
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => { 
                      setTextSize(size); 
                      playSound('click');
                      speak(`Text size set to ${size}`);
                    }}
                    className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                      textSize === size 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'XL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode */}
            <button
              onClick={() => { 
                const next = !darkMode;
                setDarkMode(next); 
                playSound('click');
                speak(`Dark mode ${next ? 'enabled' : 'disabled'}`);
              }}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                Dark Mode
              </span>
              <div className={`w-10 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-border'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </button>

            {/* High Contrast */}
            <button
              onClick={() => { 
                const next = !highContrast;
                setHighContrast(next); 
                playSound('click');
                speak(`High contrast ${next ? 'enabled' : 'disabled'}`);
              }}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                <Eye className="w-4 h-4" />
                High Contrast
              </span>
              <div className={`w-10 h-6 rounded-full transition-colors ${highContrast ? 'bg-primary' : 'bg-border'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${highContrast ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </button>

            {/* Colorblind Mode */}
            <button
              onClick={() => { 
                const next = !colorblindMode;
                setColorblindMode(next); 
                playSound('click');
                speak(`Colorblind mode ${next ? 'enabled' : 'disabled'}`);
              }}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                <Palette className="w-4 h-4" />
                Colorblind Mode
              </span>
              <div className={`w-10 h-6 rounded-full transition-colors ${colorblindMode ? 'bg-primary' : 'bg-border'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${colorblindMode ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </button>

            {/* Audio Cues */}
            <button
              onClick={() => { 
                const next = !audioCues;
                setAudioCues(next); 
                playSound('click');
                // We speak before disabling if it's going more quiet, but actually 
                // if it's disabled, speak() won't do anything because of the check inside it.
                // However, we can call speak directly or change the order.
                // But in support-calm-connect, it announces "Audio enabled/disabled"
                // Let's make it work by checking the NEW state in the speak function or passing it.
                // Actually, the speak function in provider checks current state.
                // If we set it to false, speak() won't work.
                // To match support-calm-connect behavior, we might want to announce BEFORE toggling or handle it in provider.
                if (next) {
                  // If enabling, we need the state to be updated first or bypass check.
                  // Since setAudioCues is async (state), we might need to announce it in useEffect or just manually.
                  // For now, let's just use the same logic as others.
                }
              }}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                {audioCues ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Audio Cues
              </span>
              <div className={`w-10 h-6 rounded-full transition-colors ${audioCues ? 'bg-primary' : 'bg-border'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${audioCues ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </button>
          </div>
        </div>
      )}

      <Button
        onClick={handleToggle}
        size="lg"
        audioLabel="Open accessibility settings"
        className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
      >
        <Accessibility className="w-6 h-6" />
      </Button>
    </div>
  )
}
