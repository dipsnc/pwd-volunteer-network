"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { 
  Search, Bell, User, Users, GraduationCap, 
  MoreHorizontal, Phone, Mail, MapPin, 
  Filter, Download, Heart, ShieldAlert
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import { type StudentUser } from "@/lib/store"
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
import { cn } from "@/lib/utils"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ExternalLink, ShieldCheck, ShieldX, Ban, Clock } from "lucide-react"

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as StudentUser[]
      setStudents(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleStatusUpdate = async (studentId: string, status: string) => {
    try {
      await updateDoc(doc(db, "students", studentId), {
        verificationStatus: status,
        updatedAt: serverTimestamp()
      })
      toast.success(`Student status updated to ${status}`)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar type="admin" userName="Admin User" />
      
      <main className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-foreground">Student Directory</h1>
                <p className="text-[10px] font-medium text-muted-foreground -mt-0.5 uppercase tracking-wider">Manage & Verify Students</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-4 py-2 border border-border/50">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
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
          {/* Mobile Search */}
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
            <StatCard label="Total" value={students.length} icon={Users} color="primary" />
            <StatCard label="Pending" value={students.filter(s => s.verificationStatus === 'pending').length} icon={Clock} color="orange" />
            <StatCard label="Verified" value={students.filter(s => s.verificationStatus === 'verified').length} icon={ShieldCheck} color="green" />
            <StatCard label="Banned" value={students.filter(s => s.verificationStatus === 'ban').length} icon={Ban} color="red" />
          </div>

          <div className="bg-card rounded-2xl md:rounded-[32px] border border-border shadow-elevated overflow-hidden">
            <div className="p-4 md:p-8 border-b border-border flex items-center justify-between flex-wrap gap-4">
               <div>
                  <h2 className="text-lg md:text-xl font-display font-bold text-foreground">Active Members</h2>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Verify and manage the student community.</p>
               </div>
               <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-muted/50 rounded-xl text-xs font-bold text-muted-foreground border border-border/50">
                    <Filter className="w-3.5 h-3.5 mr-1.5 inline md:hidden" /> <span className="hidden md:inline">Filter</span>
                  </button>
                  <button 
                    onClick={() => exportToCSV(students, "students-directory")}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-soft"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 inline md:hidden" /> <span className="hidden md:inline">Export CSV</span>
                  </button>
               </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[100px] font-bold text-foreground py-5 pl-8 text-[10px] uppercase tracking-widest">Photo</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-[10px] uppercase tracking-widest">Name</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-[10px] uppercase tracking-widest">Username</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-[10px] uppercase tracking-widest">Disability</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-[10px] uppercase tracking-widest">Guardian</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-[10px] uppercase tracking-widest">Joined</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-[10px] uppercase tracking-widest text-right pr-8">Actions</TableHead>
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
                        <TableCell><div className="h-6 w-16 bg-muted rounded-full" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted rounded-lg" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted mx-auto rounded-full" /></TableCell>
                        <TableCell className="pr-8"><div className="h-8 w-10 bg-muted ml-auto rounded-lg" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                          <Users className="w-12 h-12" />
                          <p className="font-bold uppercase tracking-widest text-xs">No students found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.map((student) => (
                    <TableRow key={student.uid} className="group border-border/50 hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-8 py-4">
                        <Avatar className="h-10 w-10 rounded-[14px] border border-border shadow-sm">
                          <AvatarImage src={student.profilePhotoUrl || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-xs uppercase">
                            {student.fullName.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-bold text-foreground text-sm">{student.fullName}</TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">@{student.username}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const types = Array.isArray(student.disabilityTypes) 
                              ? student.disabilityTypes 
                              : (student.disabilityType ? [student.disabilityType] : []);
                            
                            return (
                              <>
                                {types.slice(0, 2).map(type => (
                                  <Badge key={type} variant="outline" className="text-[9px] bg-primary/5 text-primary border-primary/20 px-1.5 font-bold uppercase tracking-wider">
                                    {type}
                                  </Badge>
                                ))}
                                {types.length > 2 && (
                                  <span className="text-[9px] font-bold text-muted-foreground">+{types.length - 2}</span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                         {student.managedByGuardian ? (
                           <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px] font-black uppercase tracking-widest">Managed</Badge>
                         ) : (
                           <span className="text-[10px] text-muted-foreground font-medium uppercase">Self</span>
                         )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium uppercase">
                        {new Date(student.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2",
                          student.verificationStatus === 'verified' ? "bg-green-500/10 text-green-500" :
                          student.verificationStatus === 'rejected' ? "bg-red-500/10 text-red-500" :
                          student.verificationStatus === 'ban' ? "bg-black text-white" :
                          "bg-orange-500/10 text-orange-500"
                        )}>
                          {student.verificationStatus || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => { setSelectedStudent(student); setIsReviewOpen(true); }}
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
                             <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border p-2">
                               <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase p-2 tracking-widest">Update Status</DropdownMenuLabel>
                               <DropdownMenuItem onClick={() => handleStatusUpdate(student.uid, 'verified')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-green-500/10 cursor-pointer">
                                 <ShieldCheck size={14} className="text-green-500" /> Verify Student
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleStatusUpdate(student.uid, 'rejected')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-red-500/10 cursor-pointer">
                                 <ShieldX size={14} className="text-red-500" /> Reject Application
                               </DropdownMenuItem>
                               <DropdownMenuSeparator className="bg-border/50 mx-2 my-1" />
                               <DropdownMenuItem onClick={() => handleStatusUpdate(student.uid, 'ban')} className="rounded-xl p-3 text-xs font-bold gap-3 text-destructive focus:bg-destructive/10 cursor-pointer">
                                 <Ban size={14} /> Ban Account
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

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-border">
              {loading ? (
                 [1,2,3].map(i => <div key={i} className="p-4 animate-pulse space-y-3">
                   <div className="flex gap-3"><div className="w-12 h-12 bg-muted rounded-xl"/><div className="space-y-2"><div className="h-4 w-32 bg-muted"/><div className="h-3 w-20 bg-muted"/></div></div>
                 </div>)
              ) : filteredStudents.length === 0 ? (
                 <div className="p-8 text-center opacity-50"><Users className="mx-auto w-10 h-10 mb-2"/><p className="text-xs font-bold uppercase tracking-widest">No Matches</p></div>
              ) : filteredStudents.map(student => (
                <div key={student.uid} className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 rounded-2xl border border-border shadow-sm">
                        <AvatarImage src={student.profilePhotoUrl || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">{student.fullName.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{student.fullName}</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">@{student.username}</span>
                      </div>
                    </div>
                    <Badge className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
                      student.verificationStatus === 'verified' ? "bg-green-500/10 text-green-500" :
                      student.verificationStatus === 'rejected' ? "bg-red-500/10 text-red-500" :
                      student.verificationStatus === 'ban' ? "bg-black text-white" :
                      "bg-orange-500/10 text-orange-500"
                    )}>
                      {student.verificationStatus || 'pending'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <div className="p-3 bg-muted/30 rounded-xl space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Disability</p>
                        <p className="text-[11px] font-bold text-foreground truncate">{student.disabilityTypes?.[0] || 'N/A'}</p>
                     </div>
                     <div className="p-3 bg-muted/30 rounded-xl space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Education</p>
                        <p className="text-[11px] font-bold text-foreground truncate">{student.enrolledInCollege ? 'Enrolled' : 'N/A'}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => { setSelectedStudent(student); setIsReviewOpen(true); }}
                       className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-soft"
                     >
                       Full Review
                     </button>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <button className="px-4 py-3 bg-muted rounded-xl border border-border/50">
                           <MoreHorizontal size={16} />
                         </button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                         <DropdownMenuItem onClick={() => handleStatusUpdate(student.uid, 'verified')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-green-500/10">Verify</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStatusUpdate(student.uid, 'rejected')} className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-red-500/10">Reject</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStatusUpdate(student.uid, 'ban')} className="rounded-xl p-3 text-xs font-bold gap-3 text-destructive focus:bg-destructive/10">Ban</DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 md:p-8 border-t border-border flex items-center justify-between bg-muted/10">
               <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                 {filteredStudents.length} Active Records
               </p>
               <div className="flex items-center gap-2">
                 <button className="p-2 md:px-4 md:py-2 rounded-xl border border-border/50 text-[10px] font-bold text-muted-foreground hover:bg-muted transition-all uppercase tracking-widest">Prev</button>
                 <button className="p-2 md:px-4 md:py-2 rounded-xl border border-border/50 text-[10px] font-bold text-muted-foreground hover:bg-muted transition-all uppercase tracking-widest">Next</button>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] p-6 md:p-8 border-border shadow-elevated overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-display font-bold">Document Verification</DialogTitle>
            <DialogDescription>Review sensitive documents for {selectedStudent?.fullName}</DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-8 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Verification Documents</h3>
                   <div className="space-y-3">
                      {selectedStudent.govIdUrl ? (
                         <div className="p-4 rounded-2xl border-2 border-primary/10 bg-primary/5 space-y-2">
                            <div className="flex items-center justify-between">
                               <p className="text-xs font-bold text-foreground">Government ID (Proof)</p>
                               <a href={selectedStudent.govIdUrl} target="_blank" className="p-1 px-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5"><ExternalLink size={10}/> View PDF</a>
                            </div>
                         </div>
                      ) : <p className="text-xs font-medium text-destructive">No Gov ID uploaded</p>}

                      {selectedStudent.disabilityCertificateUrl ? (
                         <div className="p-4 rounded-2xl border-2 border-primary/10 bg-primary/5 space-y-2">
                            <div className="flex items-center justify-between">
                               <p className="text-xs font-bold text-foreground">Disability Cert (Proof)</p>
                               <a href={selectedStudent.disabilityCertificateUrl} target="_blank" className="p-1 px-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5"><ExternalLink size={10}/> View PDF</a>
                            </div>
                         </div>
                      ) : <p className="text-xs font-medium text-destructive">No Disability Certificate uploaded</p>}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Contact & Access</h3>
                   <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-muted/40 space-y-2">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Parent/Guardian Phones</p>
                         <div className="flex flex-wrap gap-2">
                            {selectedStudent.parentPhones?.map(p => (
                               <Badge key={p} variant="secondary" className="bg-white text-foreground border-border text-[11px] font-bold px-3">{p}</Badge>
                            )) || <span className="text-[11px] font-medium opacity-50">Not provided</span>}
                         </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/40 space-y-2">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Full Residential Address</p>
                         <p className="text-xs font-medium text-foreground leading-relaxed">{selectedStudent.address}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex flex-wrap gap-3">
                 <button 
                   onClick={() => { handleStatusUpdate(selectedStudent.uid, 'verified'); setIsReviewOpen(false); }}
                   className="flex-1 py-4 bg-primary text-white font-display font-black text-xs uppercase tracking-widest rounded-2xl shadow-soft hover:opacity-90 active:scale-95 transition-all"
                 >
                   Verify Account
                 </button>
                 <button 
                   onClick={() => { handleStatusUpdate(selectedStudent.uid, 'rejected'); setIsReviewOpen(false); }}
                   className="flex-1 py-4 bg-red-500/10 text-red-500 font-display font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                 >
                   Reject Identity
                 </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


