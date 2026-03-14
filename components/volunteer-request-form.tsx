"use client"

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { X, Plus, MapPin, Hash, ListTodo, FileText, Type, Timer, Calendar, Clock } from 'lucide-react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { generateId, type VolunteerRequest, getCurrentUser } from '@/lib/store'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import CalmButton from '@/components/calm-button'
import { db } from '@/lib/firebase'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { playAudioMessage } from '@/lib/audio'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

const LocationPicker = dynamic(() => import('./location-picker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground font-display font-bold">Loading Map...</div>
})

interface VolunteerRequestFormProps {
  onClose: () => void
  onSuccess: () => void
  request?: VolunteerRequest
  readOnly?: boolean
}

// Unified Type for React Hook Form
type FormValues = {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  duration: string
  urgency: 'low' | 'medium' | 'high'
  tasks: { value: string }[] 
  categoryTags: string[]
}

const CATEGORIES = [
  "Blind School", 
  "Physical Mobility", 
  "Cognitive Support", 
  "Scribe", 
  "Campus Guide", 
  "Lab Assistant",
  "Reading Assistance",
  "Note Taking",
  "Medical Visit Support",
  "Daily Tasks Support",
  "Mobility Help",
  "Library Help",
  "Classroom Navigation",
  "Exam Support",
  "Technical Support"
]

export default function VolunteerRequestForm({ onClose, onSuccess, request, readOnly = false }: VolunteerRequestFormProps) {
  const user = getCurrentUser()
  const [isEditing, setIsEditing] = useState(!readOnly)
  const [location, setLocation] = useState<{ lat: number, lng: number, address: string } | null>(request?.location || null)

  useEffect(() => {
    if (isEditing) {
      playAudioMessage("Volunteer request form opened. Please fill in the details.");
    }
  }, [isEditing]);
  
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: request?.title || '',
      description: request?.description || '',
      date: request?.date || new Date().toISOString().split('T')[0],
      startTime: request?.startTime || request?.time || '10:00',
      endTime: request?.endTime || '12:00',
      duration: request?.duration || '2 hours',
      urgency: request?.urgency || 'medium',
      tasks: request?.tasks.map(t => ({ value: t })) || [{ value: '' }],      
      categoryTags: request?.categoryTags || []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks"
  })

  const selectedTags = watch('categoryTags')

  const toggleTag = (tag: string) => {
    const currentTags = [...selectedTags]
    if (currentTags.includes(tag)) {
      setValue('categoryTags', currentTags.filter(t => t !== tag))
    } else {
      setValue('categoryTags', [...currentTags, tag])
    }
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.promise(
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const locData = { lat: latitude, lng: longitude, address: data.display_name || "Custom Location" };
            setLocation(locData);
            resolve(locData);
          } catch (err) {
            reject(err);
          }
        }, reject);
      }),
      {
        loading: 'Finding your location...',
        success: 'Location updated!',
        error: 'Could not detect location.',
      }
    );
  };

  const onSubmit = async (data: FormValues) => {
    if (!location) {
      toast.error("Please select a location on the map.")
      playAudioMessage("Error: Please select a location on the map.");
      return
    }

    if (!user) {
      toast.error("You must be logged in to post a request.")
      playAudioMessage("Error: You must be logged in to post a request.");
      return
    }

    playAudioMessage("Submitting your volunteer request.");

    try {
      const finalRequest = {
        studentId: request?.studentId || (user as any).uid || user.uid,
        studentName: request?.studentName || user.fullName,
        studentAvatar: request?.studentAvatar || (user as any).photoName || '', 
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        time: `${data.startTime} - ${data.endTime}`,
        duration: data.duration,
        urgency: data.urgency,
        tasks: data.tasks.map(t => t.value).filter(val => val.trim() !== ""),
        categoryTags: data.categoryTags,
        location: location,
        status: request?.status || 'open',
        updatedAt: serverTimestamp(),
        createdAt: request?.createdAt || new Date().toISOString(),
        points: (request as any)?.points || 250,
      }

      if (request?.uid) {
        // Update existing
        await updateDoc(doc(db, "requests", request.uid), finalRequest);
        toast.success("Request updated successfully!");
        playAudioMessage("Request updated successfully!");
      } else {
        // Create new
        await addDoc(collection(db, "requests"), {
          ...finalRequest,
          createdAt: serverTimestamp()
        });
        toast.success("Volunteer request posted successfully!");
        playAudioMessage("Volunteer request posted successfully!");
      }
      
      onSuccess()
    } catch (error) {
      console.error("Error saving request:", error);
      toast.error("Failed to save request. Please try again.");
      playAudioMessage("Failed to save request. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-elevated overflow-hidden my-8"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Request a Volunteer</h2>
            <p className="text-sm text-muted-foreground font-medium">Post a new request for campus assistance.</p>
          </div>
          <button 
            onClick={() => { playAudioMessage("Closing form"); onClose(); }} 
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" /> Request Title
            </label>
            <Input 
              {...register('title', { required: "Title is required" })}
              placeholder="e.g. Scribe needed for Chemistry Midterm"
              className="px-4 py-6 rounded-xl border-2 border-border focus:border-primary transition-all font-medium"
              disabled={!isEditing}
              aria-label="Request Title"
              onFocus={() => playAudioMessage("Enter Request Title")}
            />
            {errors.title && <p className="text-xs text-destructive font-bold">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Description
            </label>
            <Textarea 
              {...register('description', { required: "Description is required" })}
              placeholder="Describe what kind of help you need..."
              rows={4}
              className="px-4 py-3 rounded-xl border-2 border-border focus:border-primary transition-all font-medium resize-none"
              disabled={!isEditing}
              aria-label="Request Description"
              onFocus={() => playAudioMessage("Enter Request Description")}
            />
            {errors.description && <p className="text-xs text-destructive font-bold">{errors.description.message}</p>}
          </div>

          {/* Date and Timing */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Preferred Date
              </label>
              <Input 
                type="date"
                {...register('date', { required: "Date is required" })}
                className="px-4 py-6 rounded-xl border-2 border-border focus:border-primary transition-all font-medium"
                disabled={!isEditing}
                aria-label="Preferred Date"
                onFocus={() => playAudioMessage("Select Preferred Date")}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-display font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Start Time
                </label>
                <Input 
                  type="time"
                  {...register('startTime', { required: "Required" })}
                  className="px-4 py-6 rounded-xl border-2 border-border focus:border-primary transition-all font-medium"
                  disabled={!isEditing}
                  aria-label="Start Time"
                  onFocus={() => playAudioMessage("Select Start Time")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-display font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> End Time
                </label>
                <Input 
                  type="time"
                  {...register('endTime', { required: "Required" })}
                  className="px-4 py-6 rounded-xl border-2 border-border focus:border-primary transition-all font-medium"
                  disabled={!isEditing}
                  aria-label="End Time"
                  onFocus={() => playAudioMessage("Select End Time")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-display font-medium text-muted-foreground flex items-center gap-2">
                  <Timer className="w-3.5 h-3.5 text-primary" /> Duration
                </label>
                <Input 
                  {...register('duration', { required: "Required" })}
                  placeholder="e.g. 2 hours"
                  className="px-4 py-6 rounded-xl border-2 border-border focus:border-primary transition-all font-medium"
                  disabled={!isEditing}
                  aria-label="Expected Duration"
                  onFocus={() => playAudioMessage("Enter Expected Duration")}
                />
              </div>
            </div>
          </div>

          {/* Urgency */}
          <div className="space-y-3">
            <label className="text-sm font-display font-bold text-foreground">Urgency Level</label>
            <div className="flex gap-4">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    if(isEditing) {
                      setValue('urgency', level as any);
                      playAudioMessage(`Urgency level set to ${level}`);
                    }
                  }}
                  aria-label={`Urgency ${level}`}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize transition-all border-2 ${
                    watch('urgency') === level
                      ? level === 'low' ? 'bg-green-100 border-green-500 text-green-700' :
                        level === 'medium' ? 'bg-orange-100 border-orange-500 text-orange-700' :
                        'bg-red-100 border-red-500 text-red-700'
                      : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('urgency')} />
          </div>

          {/* Category Multiselect */}
          <div className="space-y-3">
            <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" /> Categories
            </label>
            <div className="flex flex-col gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between px-4 py-6 rounded-xl border-2 border-border focus:border-primary transition-all font-medium bg-card hover:bg-card text-muted-foreground"
                    disabled={!isEditing}
                  >
                    {selectedTags.length > 0 
                      ? `${selectedTags.length} categories selected`
                      : "Select categories..."}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 rounded-xl border-2 border-border shadow-elevated z-[110]">
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                    {CATEGORIES.map(cat => (
                      <div 
                        key={cat}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group"
                        onClick={() => isEditing && toggleTag(cat)}
                      >
                        <Checkbox 
                          checked={selectedTags.includes(cat)} 
                          onCheckedChange={() => isEditing && toggleTag(cat)}
                          className="border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {cat}
                        </span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {selectedTags.map(tag => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 flex items-center gap-2"
                      >
                        {tag}
                        {isEditing && (
                          <button 
                            type="button" 
                            onClick={() => toggleTag(tag)}
                            className="p-1 hover:bg-primary/20 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <label className="text-sm font-display font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2"><ListTodo className="w-4 h-4 text-primary" /> What needs to be done?</span>
              <button 
                type="button" 
                onClick={() => isEditing && append({ value: '' })}
                className={`text-xs text-primary flex items-center gap-1 hover:underline font-bold ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
              >
                <Plus className="w-3 h-3" /> Add Task
              </button>
            </label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input 
                    {...register(`tasks.${index}.value` as const)}
                    placeholder={`Task ${index + 1}`}
                    className="flex-1 px-4 py-2 rounded-xl border border-border focus:border-primary transition-all text-sm font-medium"
                    disabled={!isEditing}
                    aria-label={`Task ${index + 1}`}
                    onFocus={() => playAudioMessage(`Enter Task ${index + 1}`)}
                  />
                  {fields.length > 1 && isEditing && (
                    <button 
                      type="button" 
                      onClick={() => { remove(index); playAudioMessage(`Task ${index + 1} removed`); }} 
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove Task ${index + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Location Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Meeting Location
              </label>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={handleLocateMe} 
                  className="text-xs text-primary flex items-center gap-1 hover:underline font-bold"
                >
                  <MapPin className="w-3 h-3" /> Use My Location
                </button>
              )}
            </div>
            
            <LocationPicker 
              onLocationSelect={(lat, lng, address) => setLocation({ lat, lng, address })} 
              disabled={!isEditing} 
              currentLocation={location}
            />
            
            {location && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-soft">
                <p className="text-[10px] font-bold text-primary mb-1 tracking-widest">SELECTED ADDRESS:</p>
                <p className="text-sm text-foreground font-medium leading-snug">{location.address}</p>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-4">
            <CalmButton 
              variant="outline"
              type="button"
              onClick={onClose}
              className="flex-1 py-6 rounded-2xl"
              audioLabel="Close form"
            >
              {isEditing ? "Cancel" : "Close"}
            </CalmButton>
            {isEditing ? (
              <CalmButton 
                type="submit"
                className="flex-1 py-6 rounded-2xl"
                audioLabel={request ? "Save changes" : "Post volunteer request"}
              >
                {request ? "Save Changes" : "Post Request"}
              </CalmButton>
            ) : (
              <CalmButton 
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 py-6 rounded-2xl"
                audioLabel="Edit volunteer request"
              >
                Edit Request
              </CalmButton>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )
}