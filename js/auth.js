/* Path: js/auth.js */
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

// --- 1. AUTO REDIRECT (Keep Logged-in Users on Home) ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        const path = window.location.pathname;
        // If logged in, skip auth pages and go home
        if (path.includes('login.html') || path.includes('register.html') || path.endsWith('/') || path.includes('index.html')) {
            window.location.href = "home.html";
        }
    }
});

// --- 2. REGISTER LOGIC (NO VERIFICATION) ---
const regForm = document.getElementById('regForm');
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const regBtn = document.getElementById('regBtn');
        const userVal = document.getElementById('username').value.trim();
        const emailVal = document.getElementById('email').value.trim().toLowerCase();
        const passVal = document.getElementById('password').value;

        // Validations
        if (userVal.length < 3) return alert("Username too short!");
        if (passVal.length < 6) return alert("Password must be 6+ characters!");

        regBtn.disabled = true;
        regBtn.innerText = "Checking name...";

        try {
            // 1. Check if Username is taken
            const userQuery = query(collection(db, "users"), where("username", "==", userVal));
            const userSnap = await getDocs(userQuery);

            if (!userSnap.empty) {
                alert("Username is already taken!");
                regBtn.disabled = false;
                regBtn.innerText = "Sign Up & Enter";
                return;
            }

            // 2. Create User
            const userCred = await createUserWithEmailAndPassword(auth, emailVal, passVal);
            
            // 3. Save to Database
            await setDoc(doc(db, "users", userCred.user.uid), {
                username: userVal,
                email: emailVal,
                uid: userCred.user.uid,
                role: 'user',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userVal}`,
                createdAt: new Date(),
                isBanned: false
            });

            // 4. Go to Home instantly
            window.location.href = "home.html";

        } catch (err) {
            alert(err.message);
            regBtn.disabled = false;
            regBtn.innerText = "Sign Up & Enter";
        }
    });
}

// --- 3. LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailVal = document.getElementById('loginEmail').value.trim();
        const passVal = document.getElementById('loginPass').value;

        try {
            await signInWithEmailAndPassword(auth, emailVal, passVal);
            window.location.href = "home.html";
        } catch (err) {
            alert("Login Failed: Please check email/password or Register.");
        }
    });
}

// --- 4. FORGOT PASSWORD (Check if account exists) ---
const resetForm = document.getElementById('resetForm');
if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailVal = document.getElementById('resetEmail').value.trim();

        const emailQuery = query(collection(db, "users"), where("email", "==", emailVal));
        const emailSnap = await getDocs(emailQuery);

        if (emailSnap.empty) {
            alert("No account found with this email!");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, emailVal);
            alert("Reset link sent! Check your inbox/spam.");
        } catch (err) { alert(err.message); }
    });
}
