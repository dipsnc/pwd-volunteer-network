"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { 
  Search, Bell, User, Users, Shield, 
  MoreHorizontal, CheckCircle2, XCircle, Clock,
  Filter, Download, ChevronRight, Mail, Phone, School
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { type VolunteerUser } from "@/lib/store"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const q = query(collection(db, "volunteers"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VolunteerUser[]
      setVolunteers(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleStatusChange = async (volunteerId: string, newStatus: string) => {
    try {
      const docRef = doc(db, "volunteers", volunteerId)
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      })
      toast.success(`Volunteer status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const filteredVolunteers = volunteers.filter(v => 
    v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.collegeName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 font-bold">Approved</Badge>
      case 'declined':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 font-bold">Declined</Badge>
      default:
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-3 py-1 font-bold">Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="admin" userName="Admin User" />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Volunteer Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-4 py-2 border border-border/50">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search volunteers..." 
                  className="bg-transparent border-none outline-none text-sm w-48 text-foreground placeholder:text-muted-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-3xl border border-border shadow-soft flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Volunteers</p>
                <h3 className="text-2xl font-bold text-foreground">{volunteers.length}</h3>
              </div>
            </div>
            <div className="bg-card p-6 rounded-3xl border border-border shadow-soft flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/5 flex items-center justify-center border border-orange-500/10">
                <Clock className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Awaiting Approval</p>
                <h3 className="text-2xl font-bold text-foreground">{volunteers.filter(v => v.status === 'pending').length}</h3>
              </div>
            </div>
            <div className="bg-card p-6 rounded-3xl border border-border shadow-soft flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-green-500/5 flex items-center justify-center border border-green-500/10">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Specialists</p>
                <h3 className="text-2xl font-bold text-foreground">{volunteers.filter(v => v.status === 'approved').length}</h3>
              </div>
            </div>
          </div>

          {/* Volunteers Table Card */}
          <div className="bg-card rounded-[32px] border border-border shadow-elevated overflow-hidden">
            <div className="p-8 border-b border-border flex items-center justify-between flex-wrap gap-4">
               <div>
                  <h2 className="text-xl font-display font-bold text-foreground">Volunteer Directory</h2>
                  <p className="text-sm font-medium text-muted-foreground">Manage and approve volunteer access to the platform.</p>
               </div>
               <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 bg-muted/50 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all border border-border/50">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-xs font-bold shadow-soft hover:opacity-90 transition-all">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
               </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[300px] font-bold text-foreground py-5 pl-8 text-xs uppercase tracking-widest">Volunteer</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-xs uppercase tracking-widest">Education</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-xs uppercase tracking-widest">Status</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-xs uppercase tracking-widest text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <TableRow key={i} className="animate-pulse border-border/50 hover:bg-transparent">
                        <TableCell className="pl-8 py-6"><div className="h-10 w-40 bg-muted rounded-xl" /></TableCell>
                        <TableCell><div className="h-6 w-32 bg-muted rounded-lg" /></TableCell>
                        <TableCell><div className="h-8 w-20 bg-muted rounded-full" /></TableCell>
                        <TableCell className="pr-8"><div className="h-8 w-10 bg-muted ml-auto rounded-lg" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredVolunteers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                          <Users className="w-12 h-12" />
                          <p className="font-bold uppercase tracking-widest text-xs">No volunteers found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredVolunteers.map((volunteer) => (
                    <TableRow key={volunteer.id} className="group border-border/50 hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 rounded-[18px] border-2 border-background shadow-soft shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                              {volunteer.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground truncate">{volunteer.fullName}</span>
                            <span className="text-xs font-medium text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                              <Mail size={12} className="text-primary/70 shrink-0" /> {volunteer.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                            <School size={12} className="text-primary/70" /> {volunteer.collegeName}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{volunteer.course}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(volunteer.status)}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                           <Select 
                             defaultValue={volunteer.status} 
                             onValueChange={(val) => handleStatusChange(volunteer.id, val)}
                           >
                             <SelectTrigger className="w-32 h-10 rounded-xl bg-muted/50 border-border/50 text-xs font-bold text-foreground">
                               <SelectValue placeholder="Status" />
                             </SelectTrigger>
                             <SelectContent className="rounded-2xl border-border shadow-elevated">
                               <SelectItem value="pending" className="text-xs font-bold text-orange-500 p-3 rounded-xl focus:bg-orange-500/10">Pending</SelectItem>
                               <SelectItem value="approved" className="text-xs font-bold text-green-500 p-3 rounded-xl focus:bg-green-500/10">Approve</SelectItem>
                               <SelectItem value="declined" className="text-xs font-bold text-red-500 p-3 rounded-xl focus:bg-red-500/10">Decline</SelectItem>
                             </SelectContent>
                           </Select>

                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <button className="p-2.5 rounded-xl hover:bg-muted transition-colors border border-border/50">
                                 <MoreHorizontal size={18} className="text-muted-foreground" />
                               </button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-48 rounded-2xl border-border shadow-elevated p-2">
                               <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase p-2 tracking-widest">Actions</DropdownMenuLabel>
                               <DropdownMenuItem className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-primary/5 cursor-pointer">
                                 <User size={14} className="text-primary" /> View Profile
                               </DropdownMenuItem>
                               <DropdownMenuItem className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-primary/5 cursor-pointer">
                                 <Phone size={14} className="text-primary" /> Contact Details
                               </DropdownMenuItem>
                               <DropdownMenuSeparator className="bg-border/50 mx-2 my-1" />
                               <DropdownMenuItem className="rounded-xl p-3 text-xs font-bold gap-3 text-destructive focus:bg-destructive/10 cursor-pointer">
                                 <XCircle size={14} /> Ban Volunteer
                               </DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-8 border-t border-border flex items-center justify-between bg-muted/10">
               <p className="text-xs font-bold text-muted-foreground">
                 Showing {filteredVolunteers.length} of {volunteers.length} volunteers
               </p>
               <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-muted transition-all">Previous</button>
                  <button className="px-4 py-2 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-muted transition-all">Next</button>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
