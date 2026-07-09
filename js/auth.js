/* Path: js/auth.js */
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. AUTO-REDIRECT LOGIC ---
// If the user is already logged in, send them straight to home.html
onAuthStateChanged(auth, (user) => {
    if (user && !window.location.pathname.includes('home.html')) {
        window.location.href = "home.html";
    }
});

// --- 2. REGISTER LOGIC (Auto-Open Website) ---
const regForm = document.getElementById('regForm');
if(regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userVal = document.getElementById('username').value;
        const emailVal = document.getElementById('email').value;
        const passVal = document.getElementById('password').value;

        try {
            const userCred = await createUserWithEmailAndPassword(auth, emailVal, passVal);
            const user = userCred.user;

            // Save user to database
            await setDoc(doc(db, "users", user.uid), {
                username: userVal,
                email: emailVal,
                uid: user.uid,
                role: 'user',
                createdAt: new Date()
            });

            // INSTANT ENTRY: No need to log in again
            window.location.href = "home.html"; 

        } catch (err) {
            alert("Registration Failed: " + err.message);
        }
    });
}

// --- 3. LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "home.html"; // Success!
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                alert("Account not found! Please register first.");
            } else {
                alert("Login Error: Check your email/password.");
            }
        }
    });
}

// --- 4. FORGOT PASSWORD LOGIC ---
const resetForm = document.getElementById('resetForm');
if(resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Check your email for the reset link!");
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                alert("We can't find an account with that email.");
            } else {
                alert(err.message);
            }
        }
    });
}
