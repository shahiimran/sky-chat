import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, user => {
  if (user && /login\.html|register\.html|index\.html$/.test(location.pathname)) location.href = 'home.html';
});

const regForm = document.getElementById('regForm');
regForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('regBtn');
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return alert('Username: 3–20 letters, numbers or underscores.');
  if (password.length < 8) return alert('Password must be at least 8 characters.');
  btn.disabled = true;
  try {
    const exists = await getDocs(query(collection(db,'publicProfiles'),where('usernameLower','==',username.toLowerCase())));
    if (!exists.empty) throw new Error('Username already taken.');
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    const uid = cred.user.uid;
    const avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(username);
    await setDoc(doc(db,'users',uid),{uid,username,email,role:'user',isBanned:false,createdAt:serverTimestamp()});
    await setDoc(doc(db,'publicProfiles',uid),{uid,username,usernameLower:username.toLowerCase(),avatar,status:'',bio:'',createdAt:serverTimestamp()});
    location.href='home.html';
  } catch(err) {
    console.error(err); alert(err.message || 'Registration failed.'); btn.disabled=false;
  }
});

const loginForm = document.getElementById('loginForm');
loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn=document.getElementById('loginBtn'); if(btn) btn.disabled=true;
  try {
    await signInWithEmailAndPassword(auth,document.getElementById('loginEmail').value.trim().toLowerCase(),document.getElementById('loginPass').value);
    location.href='home.html';
  } catch(err) { alert('Login failed. Check your email and password.'); if(btn) btn.disabled=false; }
});

const resetForm=document.getElementById('resetForm');
resetForm?.addEventListener('submit',async e=>{
  e.preventDefault();
  try { await sendPasswordResetEmail(auth,document.getElementById('resetEmail').value.trim().toLowerCase()); }
  catch(_) {}
  alert('If an account exists for that email, a reset link will be sent.');
});
