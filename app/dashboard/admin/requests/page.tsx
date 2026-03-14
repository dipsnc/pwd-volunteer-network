"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { 
  Search, Bell, FileText, ClipboardList, 
  MoreHorizontal, CheckCircle2, AlertCircle, Clock,
  Filter, Download, MapPin, User, Tag
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { type VolunteerRequest } from "@/lib/store"
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<VolunteerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<VolunteerRequest | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as VolunteerRequest[]
      setRequests(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const docRef = doc(db, "requests", requestId)
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      })
      toast.success(`Mission status updated to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update mission status")
    }
  }

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">High</Badge>
      case 'medium':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Medium</Badge>
      default:
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Low</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Assigned</Badge>
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Completed</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Cancelled</Badge>
      default:
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Matching</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar type="admin" userName="Admin User" />
      
      <main className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-foreground">Mission Monitoring</h1>
                <p className="text-[10px] font-medium text-muted-foreground -mt-0.5 uppercase tracking-wider">Activity Coordination</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-4 py-2 border border-border/50">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search missions..." 
                  className="bg-transparent border-none outline-none text-sm w-48 text-foreground"
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

        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <StatCard label="Total Help" value={requests.length} icon={ClipboardList} color="primary" />
            <StatCard label="Matching" value={requests.filter(r => r.status === 'open').length} icon={Clock} color="orange" />
            <StatCard label="Active" value={requests.filter(r => r.status === 'assigned').length} icon={CheckCircle2} color="blue" />
            <StatCard label="Finished" value={requests.filter(r => r.status === 'completed').length} icon={AlertCircle} color="green" />
          </div>

          <div className="bg-card rounded-2xl md:rounded-[32px] border border-border shadow-elevated overflow-hidden">
            <div className="p-4 md:p-8 border-b border-border flex items-center justify-between flex-wrap gap-4">
               <div>
                  <h2 className="text-lg md:text-xl font-display font-bold text-foreground">Mission Control</h2>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Monitor platform activity and manage assistance requests.</p>
               </div>
               <div className="flex gap-2">
                  <button className="px-4 py-2 bg-muted/50 rounded-xl text-xs font-bold text-muted-foreground border border-border/50">
                    <Filter className="w-3.5 h-3.5 mr-1.5 inline md:hidden" /> <span className="hidden md:inline">Filter</span>
                  </button>
                  <button 
                    onClick={() => exportToCSV(requests, "missions-audit")}
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
                    <TableHead className="w-[280px] font-bold py-5 pl-8 text-[10px] uppercase tracking-widest text-foreground">Mission Title</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground">Student</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground">Location</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground text-center">Urgency</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground text-center">Status</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground text-center">Applications</TableHead>
                    <TableHead className="font-bold py-5 text-[10px] uppercase tracking-widest text-foreground text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <TableRow key={i} className="animate-pulse border-border/50 hover:bg-transparent">
                        <TableCell className="pl-8 py-6"><div className="h-6 w-40 bg-muted rounded-lg" /></TableCell>
                        <TableCell><div className="h-6 w-32 bg-muted rounded-lg" /></TableCell>
                        <TableCell><div className="h-6 w-32 bg-muted rounded-lg" /></TableCell>
                        <TableCell><div className="h-6 w-16 bg-muted mx-auto rounded-full" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted mx-auto rounded-full" /></TableCell>
                        <TableCell><div className="h-6 w-10 bg-muted mx-auto rounded-lg" /></TableCell>
                        <TableCell className="pr-8"><div className="h-8 w-10 bg-muted ml-auto rounded-lg" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center opacity-50 font-bold uppercase tracking-widest text-xs">No missions found</TableCell>
                    </TableRow>
                  ) : filteredRequests.map((req) => (
                    <TableRow key={req.uid} className="group border-border/50 hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-8 py-4">
                        <div className="flex flex-col min-w-0 pr-4">
                          <span className="font-bold text-foreground text-sm truncate">{req.title}</span>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5">{req.categoryTags.slice(0, 2).join(', ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                               <User size={12} className="text-primary" />
                            </div>
                            <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{req.studentName}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold text-muted-foreground truncate max-w-[140px] uppercase">
                        <MapPin size={10} className="inline mr-1" /> {req.location.address.split(',')[0]}
                      </TableCell>
                      <TableCell className="text-center">{getUrgencyBadge(req.urgency)}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-center text-xs font-black text-muted-foreground">{req.applications?.length || 0}</TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => { setSelectedRequest(req); setIsViewOpen(true); }}
                             className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all"
                           >
                             View
                           </button>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <button className="p-2 rounded-lg hover:bg-muted border border-border/50">
                                 <MoreHorizontal size={14} className="text-muted-foreground" />
                               </button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                               <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase p-2 tracking-widest">Update State</DropdownMenuLabel>
                               <DropdownMenuItem onClick={() => handleStatusChange(req.uid, 'open')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-orange-500/10">Re-open Request</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleStatusChange(req.uid, 'approved')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-blue-500/10">Mark Approved</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleStatusChange(req.uid, 'completed')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-green-500/10">Mark Completed</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleStatusChange(req.uid, 'rejected')} className="rounded-xl p-3 text-xs font-bold gap-3 text-destructive focus:bg-destructive/10">Reject</DropdownMenuItem>
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
                [1,2,3].map(i => <div key={i} className="p-4 animate-pulse h-24 bg-muted/20" />)
              ) : filteredRequests.map(req => (
                <div key={req.uid} className="p-4 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-4">
                         <p className="text-sm font-bold text-foreground truncate">{req.title}</p>
                         <p className="text-[10px] font-medium text-muted-foreground uppercase truncate mt-0.5">{req.studentName}</p>
                      </div>
                      {getStatusBadge(req.status)}
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="flex-1 p-2.5 bg-muted/30 rounded-xl">
                         <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Urgency</p>
                         {getUrgencyBadge(req.urgency)}
                      </div>
                      <div className="flex-1 p-2.5 bg-muted/30 rounded-xl">
                         <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1 text-center">Apps</p>
                         <p className="text-xs font-black text-foreground text-center">{req.applications?.length || 0}</p>
                      </div>
                   </div>
                   <button onClick={() => { setSelectedRequest(req); setIsViewOpen(true); }} className="w-full py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Mission Details</button>
                </div>
              ))}
            </div>

            <div className="p-6 md:p-8 border-t border-border flex items-center justify-between bg-muted/10">
               <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">
                 Monitoring {requests.length} missions
               </p>
               <div className="flex items-center gap-2">
                 <button className="p-2 md:px-4 md:py-2 rounded-xl border border-border/50 text-[10px] font-bold text-muted-foreground uppercase">Prev</button>
                 <button className="p-2 md:px-4 md:py-2 rounded-xl border border-border/50 text-[10px] font-bold text-muted-foreground uppercase">Next</button>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] p-6 md:p-8 border-border shadow-elevated">
          <DialogHeader>
             <DialogTitle className="text-xl md:text-2xl font-display font-bold">Mission Analysis</DialogTitle>
             <DialogDescription>Full audit of mission request #{selectedRequest?.uid?.substring(0,6)}</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 mt-6 overflow-y-auto max-h-[70vh] pr-2">
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Description & Context</h3>
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
                     <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">{selectedRequest.description}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                     <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Requirements</h3>
                     <div className="flex flex-wrap gap-2">
                        {selectedRequest.categoryTags.map(tag => (
                           <Badge key={tag} variant="outline" className="text-[10px] font-bold uppercase px-3 py-1">{tag}</Badge>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Logistics</h3>
                     <div className="space-y-2">
                        <p className="text-xs font-bold text-foreground flex items-center gap-2"><Clock size={12} className="text-primary"/> {selectedRequest.startTime} - {selectedRequest.endTime}</p>
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-2"><MapPin size={12} className="text-primary"/> {selectedRequest.location.address}</p>
                     </div>
                  </div>
               </div>

               {selectedRequest.assignedVolunteerId && (
                  <div className="space-y-4 pt-4 border-t border-border">
                     <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Assigned Specialist</h3>
                     <div className="p-4 rounded-2xl border-2 border-primary/10 bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">V</div>
                           <div>
                              <p className="text-xs font-black text-foreground uppercase tracking-tight">Active Assignment</p>
                              <p className="text-[10px] font-medium text-muted-foreground">Volunteer ID: {selectedRequest.assignedVolunteerId}</p>
                           </div>
                        </div>
                        <Link 
                          href={`/dashboard/chat/${selectedRequest.uid}`}
                          className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all"
                        >
                          Join Feed
                        </Link>
                     </div>
                  </div>
               )}
            </div>
          )}

          <DialogFooter className="mt-8 border-t border-border pt-6">
             <button onClick={() => setIsViewOpen(false)} className="w-full py-4 bg-muted text-muted-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:text-foreground transition-all">Close Audit</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


