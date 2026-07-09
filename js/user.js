/* Path: js/user.js */
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in, just fetch data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if(document.getElementById('userNameDisplay')) {
                document.getElementById('userNameDisplay').innerText = userData.username;
            }
            if(document.getElementById('userAvatar')) {
                document.getElementById('userAvatar').innerText = userData.username[0].toUpperCase();
            }
        }
    } else {
        // Not logged in? Send to login
        const path = window.location.pathname;
        if (!path.includes('login.html') && !path.includes('register.html') && !path.includes('index.html')) {
            window.location.href = "login.html";
        }
    }
});

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.onclick = () => signOut(auth).then(() => window.location.href = "login.html");
}
