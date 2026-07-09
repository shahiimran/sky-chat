/* Path: js/auth.js */
import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
const loginNotice = document.getElementById('loginNotice');

if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;

        try {
            const userCred = await signInWithEmailAndPassword(auth, email, pass);
            if(userCred.user.emailVerified) {
                // If verified, go to home
                window.location.href = "home.html";
            } else {
                loginNotice.innerText = "Please verify your email first! Check your inbox/spam.";
                loginNotice.className = "status-msg error-msg";
                loginNotice.classList.remove('hidden');
            }
        } catch (err) {
            loginNotice.innerText = err.message;
            loginNotice.className = "status-msg error-msg";
            loginNotice.classList.remove('hidden');
        }
    });
}

// --- RESET PASSWORD LOGIC ---
const resetForm = document.getElementById('resetForm');
const resetNotice = document.getElementById('resetNotice');

if(resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;

        try {
            await sendPasswordResetEmail(auth, email);
            resetNotice.innerText = "Reset link sent! Please check your email inbox and spam folder.";
            resetNotice.className = "status-msg success-msg";
            resetNotice.classList.remove('hidden');
        } catch (err) {
            resetNotice.innerText = err.message;
            resetNotice.className = "status-msg error-msg";
            resetNotice.classList.remove('hidden');
        }
    });
}