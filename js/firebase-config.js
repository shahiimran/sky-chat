/* Path: js/firebase-config.js */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBBXZ31NDkaqVyMoeVsD2y46nZ1Bwkmi5s",
  authDomain: "chatapp-949d0.firebaseapp.com",
  projectId: "chatapp-949d0",
  storageBucket: "chatapp-949d0.firebasestorage.app",
  messagingSenderId: "322687317561",
  appId: "1:322687317561:web:1dc4de7a051904fb64bfe8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);