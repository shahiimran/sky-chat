import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// SIGNUP FIX
const regForm = document.getElementById('regForm');
if(regForm) {
    regForm.onsubmit = async (e) => {
        e.preventDefault();
        const userVal = document.getElementById('username').value;
        const emailVal = document.getElementById('email').value;
        const passVal = document.getElementById('password').value;
        try {
            const userCred = await createUserWithEmailAndPassword(auth, emailVal, passVal);
            await setDoc(doc(db, "users", userCred.user.uid), {
                username: userVal, email: emailVal, uid: userCred.user.uid,
                role: 'user', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userVal}`
            });
            window.location.href = "home.html";
        } catch (err) { alert("Signup Error: " + err.message); }
    };
}

// FORGOT PASSWORD FIX (Checks if account exists)
const resetForm = document.getElementById('resetForm');
if(resetForm) {
    resetForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Reset link sent! If the email exists, you will receive it.");
        } catch (err) { alert("Error: Account may not exist."); }
    };
}
