"use client"

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { X, Plus, MapPin, Hash, ListTodo, FileText, Type } from 'lucide-react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { generateId, saveVolunteerRequest, type VolunteerRequest, getCurrentUser } from '@/lib/store'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import CalmButton from '@/components/calm-button'

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
  time: string
  urgency: 'low' | 'medium' | 'high'
  tasks: { value: string }[] 
  categoryTags: string[]
}

const CATEGORIES = ["Blind School", "Physical Mobility", "Cognitive Support", "Scribe", "Campus Guide", "Lab Assistant"]

export default function VolunteerRequestForm({ onClose, onSuccess, request, readOnly = false }: VolunteerRequestFormProps) {
  const user = getCurrentUser()
  const [isEditing, setIsEditing] = useState(!readOnly)
  const [location, setLocation] = useState<{ lat: number, lng: number, address: string } | null>(request?.location || null)
  
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: request?.title || '',
      description: request?.description || '',
      date: request?.date || new Date().toISOString().split('T')[0],
      time: request?.time || '10:00',
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

  const onSubmit = (data: FormValues) => {
    if (!location) {
      toast.error("Please select a location on the map.")
      return
    }

    if (!user) {
      toast.error("You must be logged in to post a request.")
      return
    }

    const finalRequest: VolunteerRequest = {
      ...(request || {}),
      id: request?.id || generateId(),
      studentId: request?.studentId || user.id,
      studentName: request?.studentName || user.fullName,
      studentAvatar: request?.studentAvatar || (user as any).photoName || '', 
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      urgency: data.urgency,
      tasks: data.tasks.map(t => t.value).filter(val => val.trim() !== ""),
      categoryTags: data.categoryTags,
      location: location,
      status: request?.status || 'open',
      createdAt: request?.createdAt || new Date().toISOString()
    }

    saveVolunteerRequest(finalRequest)
    toast.success(request ? "Request updated successfully!" : "Volunteer request posted successfully!")
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
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
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
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
            />
            {errors.description && <p className="text-xs text-destructive font-bold">{errors.description.message}</p>}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Preferred Date
              </label>
              <Input 
                type="date"
                {...register('date', { required: "Date is required" })}
                className="px-4 py-6 rounded-xl border-2 border-border focus:border-primary transition-all font-medium"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Preferred Time
              </label>
              <Input 
                type="time"
                {...register('time', { required: "Time is required" })}
                className="px-4 py-6 rounded-xl border-2 border-border focus:border-primary transition-all font-medium"
                disabled={!isEditing}
              />
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
                  onClick={() => isEditing && setValue('urgency', level as any)}
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

          {/* Category Tags */}
          <div className="space-y-3">
            <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" /> Category Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => isEditing && toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                    selectedTags.includes(tag)
                    ? "bg-primary border-primary text-primary-foreground shadow-soft"
                    : "border-border hover:border-primary/50 text-muted-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
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
                  />
                  {fields.length > 1 && isEditing && (
                    <button type="button" onClick={() => remove(index)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Location Picker */}
          <div className="space-y-3">
            <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Meeting Location
            </label>
            <LocationPicker onLocationSelect={(lat, lng, address) => setLocation({ lat, lng, address })} disabled={!isEditing} />
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