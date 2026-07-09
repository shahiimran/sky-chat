/* Path: js/settings.js */
import { auth, db } from './firebase-config.js';
import { doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const TG_BOT_TOKEN = "7730037842:AAHq2HyO-86ehmxy124wyPc0RBEWdQmoQFY";
const TG_CHAT_ID = "8152695498";

// Save Privacy Settings
const savePrivacyBtn = document.getElementById('savePrivacy');
if (savePrivacyBtn) {
    savePrivacyBtn.onclick = async () => {
        const user = auth.currentUser;
        await updateDoc(doc(db, "users", user.uid), {
            msgPrivacy: document.getElementById('msgPrivacy').value,
            showOnline: document.getElementById('showOnline').checked,
            showLastSeen: document.getElementById('showLastSeen').checked,
            readReceipts: document.getElementById('readReceipts').checked
        });
        alert("Privacy settings updated!");
    };
}

// Password Reset from Security Page
const securityResetBtn = document.getElementById('securityResetPass');
if (securityResetBtn) {
    securityResetBtn.onclick = async () => {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        alert("Reset link sent to your email!");
    };
}

// DELETE ACCOUNT WITH TELEGRAM NOTIFICATION
const deleteBtn = document.getElementById('deleteAccountBtn');
if (deleteBtn) {
    deleteBtn.onclick = async () => {
        const user = auth.currentUser;
        const confirmResult = confirm("CRITICAL: Are you sure? This will delete your account forever and notify Shahi Imran.");
        
        if (confirmResult) {
            try {
                // 1. Get user data for the report
                const userSnap = await getDoc(doc(db, "users", user.uid));
                const userData = userSnap.data();
                const now = new Date().toLocaleString();

                // 2. Send Telegram Notification
                const message = `🚨 ACCOUNT DELETED\n\nUsername: ${userData.username}\nEmail: ${userData.email}\nDate: ${now}\nUID: ${user.uid}`;
                await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(message)}`);

                // 3. Delete from Firestore & Auth
                await deleteDoc(doc(db, "users", user.uid));
                await deleteUser(user);
                
                alert("Account successfully deleted.");
                window.location.href = "index.html";
            } catch (err) {
                alert("Error: Please logout and login again before deleting your account.");
            }
        }
    };
}
