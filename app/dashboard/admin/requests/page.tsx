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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<VolunteerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
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
      toast.success(`Request status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.categoryTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-2 py-0.5 text-[10px] font-black uppercase">High</Badge>
      case 'medium':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-2 py-0.5 text-[10px] font-black uppercase">Medium</Badge>
      default:
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 text-[10px] font-black uppercase">Low</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1 font-bold">Assigned</Badge>
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 font-bold">Completed</Badge>
      default:
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-3 py-1 font-bold">Open</Badge>
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
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Mission Monitoring</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-4 py-2 border border-border/50">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search missions..." 
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total Missions" value={requests.length} icon={ClipboardList} color="primary" />
            <StatCard label="Open / Pending" value={requests.filter(r => r.status === 'open').length} icon={Clock} color="orange" />
            <StatCard label="Successfully Assigned" value={requests.filter(r => r.status === 'assigned').length} icon={CheckCircle2} color="blue" />
            <StatCard label="Completed" value={requests.filter(r => r.status === 'completed').length} icon={AlertCircle} color="green" />
          </div>

          {/* Requests Table Card */}
          <div className="bg-card rounded-[32px] border border-border shadow-elevated overflow-hidden">
            <div className="p-8 border-b border-border flex items-center justify-between flex-wrap gap-4">
               <div>
                  <h2 className="text-xl font-display font-bold text-foreground">All Mission Requests</h2>
                  <p className="text-sm font-medium text-muted-foreground">Monitor campus needs and manually adjust assignment statuses.</p>
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
                    <TableHead className="w-[300px] font-bold text-foreground py-5 pl-8 text-xs uppercase tracking-widest">Mission Details</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-xs uppercase tracking-widest">Requester (Student)</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-xs uppercase tracking-widest">Urgency</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-xs uppercase tracking-widest">Status</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-xs uppercase tracking-widest text-right pr-8">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <TableRow key={i} className="animate-pulse border-border/50 hover:bg-transparent">
                        <TableCell className="pl-8 py-6"><div className="h-10 w-48 bg-muted rounded-xl" /></TableCell>
                        <TableCell><div className="h-8 w-32 bg-muted rounded-lg" /></TableCell>
                        <TableCell><div className="h-6 w-16 bg-muted rounded-full" /></TableCell>
                        <TableCell><div className="h-8 w-20 bg-muted rounded-full" /></TableCell>
                        <TableCell className="pr-8"><div className="h-8 w-10 bg-muted ml-auto rounded-lg" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                          <ClipboardList className="w-12 h-12" />
                          <p className="font-bold uppercase tracking-widest text-xs">No missions found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.map((req) => (
                    <TableRow key={req.id} className="group border-border/50 hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-8 py-5">
                        <div className="flex flex-col min-w-0 pr-4">
                          <span className="font-bold text-foreground truncate">{req.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                             <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-wider py-0 px-2 bg-muted text-muted-foreground border-transparent line-clamp-1 max-w-[120px]">
                               {req.categoryTags[0] || 'Uncategorized'}
                             </Badge>
                             <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                               <MapPin size={10} /> {req.location.address.split(',')[0]}
                             </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                               <User size={14} className="text-primary" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-foreground">{req.studentName}</span>
                               <span className="text-[10px] font-medium text-muted-foreground uppercase">{new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                        {getUrgencyBadge(req.urgency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(req.status)}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                         <div className="flex items-center justify-end gap-2">
                            <Select 
                              defaultValue={req.status} 
                              onValueChange={(val) => handleStatusChange(req.id, val)}
                            >
                              <SelectTrigger className="w-32 h-10 rounded-xl bg-muted/50 border-border/50 text-xs font-bold text-foreground">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-border shadow-elevated">
                                <SelectItem value="open" className="text-xs font-bold text-orange-500 p-3 rounded-xl focus:bg-orange-500/10">Open</SelectItem>
                                <SelectItem value="assigned" className="text-xs font-bold text-blue-500 p-3 rounded-xl focus:bg-blue-500/10">Assigned</SelectItem>
                                <SelectItem value="completed" className="text-xs font-bold text-green-500 p-3 rounded-xl focus:bg-green-500/10">Completed</SelectItem>
                              </SelectContent>
                            </Select>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2.5 rounded-xl hover:bg-muted transition-colors border border-border/50">
                                  <MoreHorizontal size={18} className="text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border shadow-elevated p-2">
                                <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase p-2 tracking-widest">Mission Monitoring</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-primary/5 cursor-pointer">
                                  <ClipboardList size={14} className="text-primary" /> Full Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-primary/5 cursor-pointer">
                                  <Tag size={14} className="text-primary" /> Volunteer Info
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/50 mx-2 my-1" />
                                <DropdownMenuItem className="rounded-xl p-3 text-xs font-bold gap-3 text-destructive focus:bg-destructive/10 cursor-pointer">
                                  <AlertCircle size={14} /> Close Mission
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
                 Monitoring {filteredRequests.length} active university missions
               </p>
               <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                 Archive View Coming Soon
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colorClasses: Record<string, string> = {
    primary: "bg-primary/5 text-primary border-primary/10",
    orange: "bg-orange-500/5 text-orange-500 border-orange-500/10",
    blue: "bg-blue-500/5 text-blue-500 border-blue-500/10",
    green: "bg-green-500/5 text-green-500 border-green-500/10",
  }

  return (
    <div className="bg-card p-5 rounded-[24px] border border-border shadow-soft">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
          <h3 className="text-xl font-bold text-foreground">{value}</h3>
        </div>
      </div>
    </div>
  )
}
