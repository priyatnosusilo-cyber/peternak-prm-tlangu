import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAxieeb3ytsGT4AL_MmPz4R9nFN3-34MC0",
  authDomain: "peternak-prm-tlangu.firebaseapp.com",
  projectId: "peternak-prm-tlangu",
  storageBucket: "peternak-prm-tlangu.firebasestorage.app",
  messagingSenderId: "5644512665",
  appId: "1:5644512665:web:d28a336bd7428f3bf9b708",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
