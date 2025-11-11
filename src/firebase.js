import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'


const firebaseConfig = {
  apiKey: "AIzaSyC112KcF0xvhxTyVj1nhVmrXioAjc-lGpQ",
  authDomain: "collaborative-editor-aa600.firebaseapp.com",
  projectId: "collaborative-editor-aa600",
  storageBucket: "collaborative-editor-aa600.firebasestorage.app",
  messagingSenderId: "201499705897",
  appId: "1:201499705897:web:02be9bf6d72ba6c0e0d238",
  measurementId: "G-04BQ3NTE6B"
};


const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)