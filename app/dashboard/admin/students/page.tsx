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
import { cn } from "@/lib/utils"

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudentUser[]
      setStudents(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.disabilityType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="admin" userName="Admin User" />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Student Directory</h1>
            </div>
            <div className="flex items-center gap-4">
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
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total Students" value={students.length} icon={Users} color="primary" />
            <StatCard label="High Priority" value={students.length} icon={ShieldAlert} color="red" />
            <StatCard label="Active Requests" value="12" icon={Heart} color="pink" />
            <StatCard label="Joined Today" value="3" icon={GraduationCap} color="blue" />
          </div>

          {/* Students Table Card */}
          <div className="bg-card rounded-[32px] border border-border shadow-elevated overflow-hidden">
            <div className="p-8 border-b border-border flex items-center justify-between flex-wrap gap-4">
               <div>
                  <h2 className="text-xl font-display font-bold text-foreground">Active Members</h2>
                  <p className="text-sm font-medium text-muted-foreground">Monitor and support students in the volunteer network.</p>
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
                    <TableHead className="w-[300px] font-bold text-foreground py-5 pl-8 text-xs uppercase tracking-widest">Student</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-xs uppercase tracking-widest">Disability / Need</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-xs uppercase tracking-widest">Contact Information</TableHead>
                    <TableHead className="font-bold text-foreground py-5 text-xs uppercase tracking-widest text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <TableRow key={i} className="animate-pulse border-border/50 hover:bg-transparent">
                        <TableCell className="pl-8 py-6"><div className="h-10 w-40 bg-muted rounded-xl" /></TableCell>
                        <TableCell><div className="h-6 w-32 bg-muted rounded-lg" /></TableCell>
                        <TableCell><div className="h-8 w-20 bg-muted rounded-lg" /></TableCell>
                        <TableCell className="pr-8"><div className="h-8 w-10 bg-muted ml-auto rounded-lg" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                          <Users className="w-12 h-12" />
                          <p className="font-bold uppercase tracking-widest text-xs">No students found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.map((student) => (
                    <TableRow key={student.id} className="group border-border/50 hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 rounded-[18px] border-2 border-background shadow-soft shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                              {student.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground truncate">{student.fullName}</span>
                            <span className="text-xs font-medium text-muted-foreground truncate uppercase tracking-[0.1em] mt-0.5">
                              Joined {new Date(student.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 font-bold px-3">
                            {student.disabilityType}
                          </Badge>
                          <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[200px]">{student.courseDetails}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                            <Mail size={12} className="text-muted-foreground" /> {student.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <Phone size={12} className="text-muted-foreground" /> {student.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2.5 rounded-xl hover:bg-muted transition-colors border border-border/50">
                              <MoreHorizontal size={18} className="text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border shadow-elevated p-2">
                            <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase p-2 tracking-widest">Manage Student</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-primary/5 cursor-pointer">
                              <User size={14} className="text-primary" /> View Full Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl p-3 text-xs font-bold gap-3 focus:bg-primary/5 cursor-pointer">
                              <MapPin size={14} className="text-primary" /> Tracking Info
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/50 mx-2 my-1" />
                            <DropdownMenuItem className="rounded-xl p-3 text-xs font-bold gap-3 text-destructive focus:bg-destructive/10 cursor-pointer">
                              <ShieldAlert size={14} /> Flag Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-8 border-t border-border flex items-center justify-between bg-muted/10">
               <p className="text-xs font-bold text-muted-foreground">
                 Showing {filteredStudents.length} students
               </p>
               <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                 Page 1 of 1
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
    red: "bg-red-500/5 text-red-500 border-red-500/10",
    pink: "bg-pink-500/5 text-pink-500 border-pink-500/10",
    blue: "bg-blue-500/5 text-blue-500 border-blue-500/10",
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
