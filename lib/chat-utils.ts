import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc } from "firebase/firestore"

export interface Chat {
  id: string
  requestId: string
  studentId: string
  volunteerId: string
  createdAt: any
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  text: string
  createdAt: any
}

export async function createChat(requestId: string, studentId: string, volunteerId: string) {
  // Check if chat already exists
  const q = query(collection(db, "chats"), where("requestId", "==", requestId))
  const snapshot = await getDocs(q)
  
  if (!snapshot.empty) {
    return snapshot.docs[0].id // Return existing chat ID
  }

  // Create new chat
  const docRef = await addDoc(collection(db, "chats"), {
    requestId,
    studentId,
    volunteerId,
    createdAt: serverTimestamp()
  })
  
  return docRef.id
}

export async function getChatForRequest(requestId: string) {
  const q = query(collection(db, "chats"), where("requestId", "==", requestId))
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    return null
  }
  
  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() } as Chat
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  if (!text.trim()) return

  await addDoc(collection(db, "messages"), {
    chatId,
    senderId,
    text: text.trim(),
    createdAt: serverTimestamp()
  })
}
