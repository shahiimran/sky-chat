import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDocs, 
    collection, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. STAY LOGGED IN (Auto-Redirect) ---
onAuthStateChanged(auth, (user) => {
    // If logged in and on Login/Register page, go to home
    const path = window.location.pathname;
    if (user && (path.includes('login.html') || path.includes('register.html') || path.includes('index.html'))) {
        window.location.href = "home.html";
    }
});

// --- 2. UNIQUE USERNAME & REGISTER ---
const regForm = document.getElementById('regForm');
if(regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userVal = document.getElementById('username').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const passVal = document.getElementById('password').value;

        // CHECK IF USERNAME EXISTS
        const q = query(collection(db, "users"), where("username", "==", userVal));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert("This username is already taken! Please choose another sky-name.");
            return;
        }

        try {
            const userCred = await createUserWithEmailAndPassword(auth, emailVal, passVal);
            const user = userCred.user;

            // Save user to database
            await setDoc(doc(db, "users", user.uid), {
                username: userVal,
                email: emailVal,
                uid: user.uid,
                role: 'user',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userVal}`,
                createdAt: new Date()
            });

            // Redirect instantly (No verification required to enter)
            window.location.href = "home.html";

        } catch (err) {
            alert("Error: " + err.message);
        }
    });
}

// --- 3. LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPass').value;

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "home.html";
        } catch (err) {
            alert("Login Failed: Account not found or wrong password.");
        }
    });
}

// --- 4. FORGOT PASSWORD (Check if user exists first) ---
const resetForm = document.getElementById('resetForm');
if(resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value.trim();

        // Check if email exists in our database
        const q = query(collection(db, "users"), where("email", "==", email));
        const snap = await getDocs(q);

        if (snap.empty) {
            alert("Error: There is no account registered with this email.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Reset link sent! Please check your email (and Spam).");
        } catch (err) {
            alert(err.message);
        }
    });
}
