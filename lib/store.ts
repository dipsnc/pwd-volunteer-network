// localStorage-based data store for PWD Volunteer Network
export interface StudentUser {
  uid: string;
  type: 'student';
  fullName: string;
  phone: string;
  email: string;
  address: string;
  govDocName?: string;
  motherName: string;
  fatherName: string;
  guardianName: string;
  parentEmails: string[];
  bloodGroup: string;
  age: number;
  weight?: number;
  height?: number;
  assistanceNeeds?: string;
  enrolledInCollege: boolean;
  courseDetails: string;
  collegeIdName?: string;
  photoName?: string;
  profilePhotoUrl?: string | null;
  govIdUrl?: string | null;
  disabilityCertificateUrl?: string | null;
  username: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'ban';
  lastActiveAt: string;
  managedByGuardian: boolean;
  parentPhones?: string[];
  disabilityTypes?: string[];
  disabilityType?: string; // Legacy support
  createdAt: string;
}

export interface VolunteerUser {
  uid: string;
  type: 'volunteer';
  fullName: string;
  phone: string;
  email: string;
  reason: string;
  collegeName: string;
  course: string;
  year: string;
  courseTimeline: string;
  studentIdName?: string;
  govDocName?: string;
  parentGuardianName: string;
  parentGuardianPhone: string;
  alternativeContact: string;
  locationPreference: string;
  permanentAddress: string;
  bloodGroup: string;
  age: number;
  weight?: number;
  height?: number;
  skills: string;
  assistanceType: string;
  assistanceTypes?: string[];
  profilePhotoUrl?: string | null;
  studentIdUrl?: string | null;
  govIdUrl?: string | null;
  username: string;
  verificationStatus: 'pending' | 'approved' | 'declined' | 'ban';
  lastActiveAt: string;
  status: 'pending' | 'approved' | 'declined';
  completedMissions: number;
  rating: number | null;
  createdAt: string;
}

export interface VolunteerRequest {
  uid: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  time: string;
  urgency: 'low' | 'medium' | 'high';
  tasks: string[];
  categoryTags: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'pending' | 'open' | 'assigned' | 'completed' | 'rejected';
  volunteerId?: string;
  volunteerName?: string;
  assignedVolunteerId?: string;
  applications?: string[];
  points?: number;
  duration?: string;
  updatedAt?: string;
  createdAt: string;
}

export interface Appointment {
  uid: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  assistanceType: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'assigned' | 'completed';
  volunteerId?: string;
  volunteerName?: string;
  createdAt: string;
}

type AppUser = StudentUser | VolunteerUser;

const REQUESTS_KEY = 'pwd_volunteer_requests';
const STUDENTS_KEY = 'pwd_students';
const VOLUNTEERS_KEY = 'pwd_volunteers';
const APPOINTMENTS_KEY = 'pwd_appointments';
const CURRENT_USER_KEY = 'pwd_current_user';

// Helpers
function getJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}
function setJSON(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Students
export function getStudents(): StudentUser[] { return getJSON(STUDENTS_KEY, []); }
export function saveStudent(user: StudentUser) {
  const all = getStudents();
  const idx = all.findIndex(u => u.uid === user.uid);
  if (idx >= 0) all[idx] = user; else all.push(user);
  setJSON(STUDENTS_KEY, all);
}
export function findStudentByLogin(identifier: string): StudentUser | null {
  return getStudents().find(u =>
    (u.username === identifier || u.email === identifier || u.phone === identifier)
  ) || null;
}
export function findStudentByEmail(email: string): StudentUser | null {
  return getStudents().find(u => u.email === email) || null;
}

// Volunteers
export function getVolunteers(): VolunteerUser[] { return getJSON(VOLUNTEERS_KEY, []); }
export function saveVolunteer(user: VolunteerUser) {
  const all = getVolunteers();
  const idx = all.findIndex(u => u.uid === user.uid);
  if (idx >= 0) all[idx] = user; else all.push(user);
  setJSON(VOLUNTEERS_KEY, all);
}
export function findVolunteerByLogin(identifier: string): VolunteerUser | null {
  return getVolunteers().find(u =>
    (u.username === identifier || u.email === identifier || u.phone === identifier)
  ) || null;
}
export function approveVolunteer(uid: string) {
  const all = getVolunteers();
  const v = all.find(u => u.uid === uid);
  if (v) { v.status = 'approved'; setJSON(VOLUNTEERS_KEY, all); }
}
export function declineVolunteer(uid: string) {
  const all = getVolunteers();
  const v = all.find(u => u.uid === uid);
  if (v) { v.status = 'declined'; setJSON(VOLUNTEERS_KEY, all); }
}

// Appointments
export function getAppointments(): Appointment[] { return getJSON(APPOINTMENTS_KEY, []); }
export function saveAppointment(appt: Appointment) {
  const all = getAppointments();
  const idx = all.findIndex(a => a.uid === appt.uid);
  if (idx >= 0) all[idx] = appt; else all.push(appt);
  setJSON(APPOINTMENTS_KEY, all);
}

// Volunteer Requests
export function getVolunteerRequests(): VolunteerRequest[] { return getJSON(REQUESTS_KEY, []); }
export function saveVolunteerRequest(req: VolunteerRequest) {
  const all = getVolunteerRequests();
  const idx = all.findIndex(r => r.uid === req.uid);
  if (idx >= 0) all[idx] = req; else all.push(req);
  setJSON(REQUESTS_KEY, all);
}

// Current user session
export function setCurrentUser(user: AppUser | null) { setJSON(CURRENT_USER_KEY, user); }
export function getCurrentUser(): AppUser | null { return getJSON(CURRENT_USER_KEY, null); }
export function clearCurrentUser() { if (typeof window !== 'undefined') localStorage.removeItem(CURRENT_USER_KEY); }

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
