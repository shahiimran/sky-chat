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
        if (path.includes('login.html') || path.includes('register.html') || path.includes('forgot-password.html') || path.endsWith('/') || path.includes('index.html')) {
            window.location.href = "home.html";
        }
    }
});

// --- 2. REGISTER LOGIC ---
const regForm = document.getElementById('regForm');
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const regBtn = document.getElementById('regBtn');

        const userVal = usernameInput.value.trim();
        const emailVal = emailInput.value.trim().toLowerCase();
        const passVal = passwordInput.value;

        if (userVal.length < 3) {
            alert("Username must be at least 3 characters long!");
            return;
        }

        if (passVal.length < 6) {
            alert("Password must be at least 6 characters long!");
            return;
        }

        regBtn.disabled = true;
        regBtn.innerText = "Checking availability...";

        try {
            // Check if username is already taken (exact match check)
            const userQuery = query(collection(db, "users"), where("username", "==", userVal));
            const userSnap = await getDocs(userQuery);

            if (!userSnap.empty) {
                alert("Username is already taken! Please choose a different name.");
                regBtn.disabled = false;
                regBtn.innerText = "Sign Up & Enter";
                return;
            }

            regBtn.innerText = "Creating account...";

            // Create Firebase Auth user
            const userCred = await createUserWithEmailAndPassword(auth, emailVal, passVal);
            const user = userCred.user;

            // Save user profile into Firestore
            await setDoc(doc(db, "users", user.uid), {
                username: userVal,
                email: emailVal,
                uid: user.uid,
                role: 'user',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userVal)}`,
                createdAt: new Date(),
                isBanned: false,
                isMuted: false
            });

            // Automatically logged in and redirected to home.html via Firebase SDK
            window.location.href = "home.html";

        } catch (err) {
            console.error("Registration Error:", err);
            if (err.code === 'auth/email-already-in-use') {
                alert("An account with this email already exists! Try logging in.");
            } else {
                alert("Registration Failed: " + err.message);
            }
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

        const emailInput = document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPass');
        const loginBtn = document.getElementById('loginBtn');

        const emailVal = emailInput.value.trim().toLowerCase();
        const passVal = passInput.value;

        loginBtn.disabled = true;
        loginBtn.innerText = "Logging in...";

        try {
            await signInWithEmailAndPassword(auth, emailVal, passVal);
            window.location.href = "home.html";
        } catch (err) {
            console.error("Login Error:", err);
            loginBtn.disabled = false;
            loginBtn.innerText = "Login";

            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                alert("Account not found or password incorrect. Please check your details or register.");
            } else {
                alert("Login Error: " + err.message);
            }
        }
    });
}

// --- 4. FORGOT PASSWORD LOGIC ---
const resetForm = document.getElementById('resetForm');
if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const resetEmailInput = document.getElementById('resetEmail');
        const resetBtn = document.getElementById('resetBtn');
        const emailVal = resetEmailInput.value.trim().toLowerCase();

        resetBtn.disabled = true;
        resetBtn.innerText = "Checking account...";

        try {
            // Check if account exists in database before sending email
            const emailQuery = query(collection(db, "users"), where("email", "==", emailVal));
            const emailSnap = await getDocs(emailQuery);

            if (emailSnap.empty) {
                alert("No registered account found with this email. Please register first!");
                resetBtn.disabled = false;
                resetBtn.innerText = "Send Reset Link";
                return;
            }

            resetBtn.innerText = "Sending email...";
            await sendPasswordResetEmail(auth, emailVal);

            alert("Password reset link sent! Check your email inbox and spam folder.");
            resetForm.reset();
            resetBtn.disabled = false;
            resetBtn.innerText = "Send Reset Link";

        } catch (err) {
            console.error("Password Reset Error:", err);
            alert("Error sending reset email: " + err.message);
            resetBtn.disabled = false;
            resetBtn.innerText = "Send Reset Link";
        }
    });
}
