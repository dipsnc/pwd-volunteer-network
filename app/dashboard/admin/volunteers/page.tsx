"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { 
  Search, Bell, User, Users, Shield, 
  MoreHorizontal, CheckCircle2, XCircle, Clock,
  Filter, Download, ChevronRight, Mail, Phone, School
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { type VolunteerUser } from "@/lib/store"
import { StatCard } from "@/components/admin/stat-card"
import { exportToCSV } from "@/lib/csv-export"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
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
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerUser | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  useEffect(() => {
    const q = query(collection(db, "volunteers"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as VolunteerUser[]
      setVolunteers(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleStatusUpdate = async (volunteerId: string, status: string) => {
    try {
      await updateDoc(doc(db, "volunteers", volunteerId), {
        verificationStatus: status,
        status: (status === 'verified' || status === 'approved') ? 'approved' : status === 'rejected' ? 'declined' : 'pending',
        updatedAt: serverTimestamp()
      })
      toast.success(`Volunteer status updated to ${status}`)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const filteredVolunteers = volunteers.filter(v => 
    v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.collegeName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar type="admin" userName="Admin User" />
      
      <main className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-foreground">Volunteer Directory</h1>
                <p className="text-[10px] font-medium text-muted-foreground -mt-0.5 uppercase tracking-wider">Guardian Coordination</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
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
          <div className="mt-3 md:hidden flex items-center gap-2 bg-muted rounded-xl px-3 py-2 border border-border/50">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm flex-1 text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <StatCard label="Total" value={volunteers.length} icon={Users} color="primary" />
            <StatCard label="Pending" value={volunteers.filter(v => v.verificationStatus === 'pending').length} icon={Clock} color="orange" />
            <StatCard label="Approved" value={volunteers.filter(v => v.verificationStatus === 'approved').length} icon={CheckCircle2} color="green" />
            <StatCard label="Banned" value={volunteers.filter(v => v.verificationStatus === 'ban').length} icon={XCircle} color="red" />
          </div>

          <div className="bg-card rounded-2xl md:rounded-[32px] border border-border shadow-elevated overflow-hidden">
            <div className="p-4 md:p-8 border-b border-border flex items-center justify-between flex-wrap gap-4">
               <div>
                  <h2 className="text-lg md:text-xl font-display font-bold text-foreground">Community Leaders</h2>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Approve and manage the volunteer network.</p>
               </div>
               <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-muted/50 rounded-xl text-xs font-bold text-muted-foreground border border-border/50">
                    <Filter className="w-3.5 h-3.5 mr-1.5 inline md:hidden" /> <span className="hidden md:inline">Filter</span>
                  </button>
                  <button 
                    onClick={() => exportToCSV(volunteers, "volunteers-directory")}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-soft"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 inline md:hidden" /> <span className="hidden md:inline">Export CSV</span>
                  </button>
               </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[80px] font-bold py-5 pl-8 text-[10px] uppercase tracking-widest text-foreground">Photo</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground">Name</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground">College</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground">Skills</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground">Location</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground text-center">Joined</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground text-center">Status</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <TableRow key={i} className="animate-pulse border-border/50 hover:bg-transparent">
                        <TableCell className="pl-8 py-6"><div className="h-10 w-10 bg-muted rounded-xl" /></TableCell>
                        <TableCell><div className="h-6 w-32 bg-muted rounded-lg" /></TableCell>
                        <TableCell><div className="h-6 w-24 bg-muted rounded-lg" /></TableCell>
                        <TableCell><div className="h-6 w-32 bg-muted rounded-full" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted rounded-lg" /></TableCell>
                        <TableCell><div className="h-6 w-16 bg-muted mx-auto rounded-lg" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted mx-auto rounded-full" /></TableCell>
                        <TableCell className="pr-8"><div className="h-8 w-10 bg-muted ml-auto rounded-lg" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredVolunteers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                          <Users className="w-12 h-12" />
                          <p className="font-bold uppercase tracking-widest text-xs">No volunteers found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredVolunteers.map((volunteer) => (
                    <TableRow key={volunteer.uid} className="group border-border/50 hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-8 py-4">
                        <Avatar className="h-10 w-10 rounded-[14px] border border-border shadow-sm">
                          <AvatarImage src={volunteer.profilePhotoUrl || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-xs uppercase">{volunteer.fullName.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-bold text-foreground text-sm">{volunteer.fullName}</TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground truncate max-w-[150px]">{volunteer.collegeName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-[9px] bg-primary/5 text-primary border-primary/20 px-1.5 font-bold uppercase tracking-wider">{volunteer.skills.split(',')[0]}</Badge>
                          {volunteer.skills.split(',').length > 1 && <span className="text-[9px] font-bold text-muted-foreground">+{volunteer.skills.split(',').length - 1}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">{volunteer.locationPreference}</TableCell>
                      <TableCell className="text-center text-[10px] font-medium text-muted-foreground uppercase">
                        {new Date(volunteer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2",
                          volunteer.verificationStatus === 'approved' ? "bg-green-500/10 text-green-500" :
                          volunteer.verificationStatus === 'declined' ? "bg-red-500/10 text-red-500" :
                          volunteer.verificationStatus === 'ban' ? "bg-black text-white" :
                          "bg-orange-500/10 text-orange-500"
                        )}>
                          {volunteer.verificationStatus || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => { setSelectedVolunteer(volunteer); setIsReviewOpen(true); }}
                             className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all"
                           >
                             Review
                           </button>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <button className="p-2 rounded-lg hover:bg-muted border border-border/50">
                                 <MoreHorizontal size={14} className="text-muted-foreground" />
                               </button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                               <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase p-2 tracking-widest">Update status</DropdownMenuLabel>
                               <DropdownMenuItem onClick={() => handleStatusUpdate(volunteer.uid, 'approved')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-green-500/10 cursor-pointer">
                                 <CheckCircle2 size={14} className="text-green-500" /> Approve Volunteer
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleStatusUpdate(volunteer.uid, 'declined')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-red-500/10 cursor-pointer">
                                 <XCircle size={14} className="text-red-500" /> Decline Application
                               </DropdownMenuItem>
                               <DropdownMenuSeparator className="bg-border/50 mx-2 my-1" />
                               <DropdownMenuItem onClick={() => handleStatusUpdate(volunteer.uid, 'ban')} className="rounded-xl p-3 text-xs font-bold gap-3 text-destructive focus:bg-destructive/10 cursor-pointer">
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="p-4 animate-pulse h-32 bg-muted/20" />)
              ) : filteredVolunteers.length === 0 ? (
                <div className="p-8 text-center opacity-50 uppercase tracking-tighter text-xs font-bold">No Volunteers Found</div>
              ) : filteredVolunteers.map(volunteer => (
                <div key={volunteer.uid} className="p-4 space-y-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 rounded-2xl border border-border">
                          <AvatarImage src={volunteer.profilePhotoUrl || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">{volunteer.fullName.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div>
                           <p className="text-sm font-bold text-foreground">{volunteer.fullName}</p>
                           <p className="text-[10px] font-medium text-muted-foreground uppercase">@{volunteer.username}</p>
                        </div>
                     </div>
                     <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
                        volunteer.verificationStatus === 'approved' ? "bg-green-500/10 text-green-500" :
                        volunteer.verificationStatus === 'declined' ? "bg-red-500/10 text-red-500" :
                        "bg-orange-500/10 text-orange-500"
                     )}>{volunteer.verificationStatus || 'pending'}</Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-muted/30 rounded-xl space-y-1">
                         <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Skills</p>
                         <p className="text-[11px] font-bold text-foreground truncate">{volunteer.skills.split(',')[0]}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-xl space-y-1">
                         <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Preferred Loc</p>
                         <p className="text-[11px] font-bold text-foreground truncate">{volunteer.locationPreference}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => { setSelectedVolunteer(volunteer); setIsReviewOpen(true); }} className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Review Documents</button>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <button className="px-4 py-3 bg-muted rounded-xl border border-border/50"><MoreHorizontal size={16}/></button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                         <DropdownMenuItem onClick={() => handleStatusUpdate(volunteer.uid, 'approved')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-green-500/10">Approve</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStatusUpdate(volunteer.uid, 'declined')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-red-500/10">Decline</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStatusUpdate(volunteer.uid, 'ban')} className="rounded-xl p-3 text-xs font-bold gap-3 text-destructive focus:bg-destructive/10">Ban</DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                </div>
              ))}
            </div>

            <div className="p-6 md:p-8 border-t border-border flex items-center justify-between bg-muted/10">
               <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                 {filteredVolunteers.length} Active Records
               </p>
               <div className="flex items-center gap-2">
                 <button className="p-2 md:px-4 md:py-2 rounded-xl border border-border/50 text-[10px] font-bold text-muted-foreground hover:bg-muted transition-all uppercase tracking-widest">Prev</button>
                 <button className="p-2 md:px-4 md:py-2 rounded-xl border border-border/50 text-[10px] font-bold text-muted-foreground hover:bg-muted transition-all uppercase tracking-widest">Next</button>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Verification Modal */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] p-6 md:p-8 border-border shadow-elevated overflow-y-auto max-h-[90vh]">
          <DialogHeader>
             <DialogTitle className="text-xl md:text-2xl font-display font-bold">Volunteer Verification</DialogTitle>
             <DialogDescription>Review credentials for {selectedVolunteer?.fullName}</DialogDescription>
          </DialogHeader>

          {selectedVolunteer && (
            <div className="space-y-8 mt-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Identification Documents</h3>
                     <div className="space-y-3">
                        {selectedVolunteer.govIdUrl ? (
                           <div className="p-4 rounded-2xl border-2 border-primary/10 bg-primary/5 flex items-center justify-between">
                              <p className="text-xs font-bold text-foreground">Government ID</p>
                              <a href={selectedVolunteer.govIdUrl} target="_blank" className="p-1 px-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5"><ChevronRight size={10}/> View</a>
                           </div>
                        ) : <p className="text-xs font-medium text-destructive">No Gov ID uploaded</p>}
                        
                        {selectedVolunteer.studentIdUrl ? (
                           <div className="p-4 rounded-2xl border-2 border-primary/10 bg-primary/5 flex items-center justify-between">
                              <p className="text-xs font-bold text-foreground">College ID / Proof</p>
                              <a href={selectedVolunteer.studentIdUrl} target="_blank" className="p-1 px-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5"><ChevronRight size={10}/> View</a>
                           </div>
                        ) : <p className="text-xs font-medium text-destructive">No College ID uploaded</p>}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Profile Details</h3>
                     <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-muted/40 space-y-1">
                           <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Reason for Joining</p>
                           <p className="text-xs font-medium text-foreground leading-relaxed">{selectedVolunteer.reason}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/40 space-y-1">
                           <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Contact Info</p>
                           <p className="text-xs font-bold text-foreground">{selectedVolunteer.phone}</p>
                           <p className="text-[10px] font-medium text-muted-foreground">{selectedVolunteer.email}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-border flex flex-wrap gap-3">
                 <button onClick={() => { handleStatusUpdate(selectedVolunteer.uid, 'approved'); setIsReviewOpen(false); }} className="flex-1 py-4 bg-primary text-white font-display font-black text-xs uppercase tracking-widest rounded-2xl shadow-soft">Approve Volunteer</button>
                 <button onClick={() => { handleStatusUpdate(selectedVolunteer.uid, 'declined'); setIsReviewOpen(false); }} className="flex-1 py-4 bg-red-500/10 text-red-500 font-display font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-red-500/20">Decline Role</button>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


