import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    limit 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. MAIN AUTH & UI LOGIC ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Fetch User Data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Update Name and Avatar on Home Page
            const nameDisplay = document.getElementById('userNameDisplay');
            const avatarDisplay = document.getElementById('userAvatar');
            
            if (nameDisplay) nameDisplay.innerText = userData.username;
            if (avatarDisplay) {
                // If user has a custom avatar URL, use it. Otherwise, show first letter.
                if (userData.avatar && userData.avatar.startsWith('http')) {
                    avatarDisplay.innerHTML = `<img src="${userData.avatar}" style="width:100%; height:100%; border-radius:50%;">`;
                } else {
                    avatarDisplay.innerText = userData.username[0].toUpperCase();
                }
            }

            // Start Notification Listeners
            setupNotifications(user.uid);
            
            // If we are on home.html, load the recent inbox preview
            if (document.getElementById('homeInbox')) {
                loadHomeInbox(user.uid);
            }
        }
    } else {
        // Not logged in? Send back to login page
        const path = window.location.pathname;
        if (!path.includes('login.html') && !path.includes('register.html') && !path.includes('index.html')) {
            window.location.href = "login.html";
        }
    }
});

// --- 2. NOTIFICATION DOT LOGIC ---
function setupNotifications(uid) {
    // Show dot if there are pending friend requests
    const reqQuery = query(
        collection(db, "friendRequests"), 
        where("to", "==", uid), 
        where("status", "==", "pending")
    );
    
    onSnapshot(reqQuery, (snap) => {
        const dot = document.getElementById('notifDot');
        if (dot) {
            dot.style.display = snap.empty ? "none" : "block";
        }
    });

    // Show dot if there is activity in private chats
    const msgQuery = query(
        collection(db, "chats"), 
        where("participants", "array-contains", uid)
    );
    
    onSnapshot(msgQuery, (snap) => {
        const inboxDot = document.getElementById('inboxDot');
        if (inboxDot) {
            inboxDot.style.display = snap.empty ? "none" : "block";
        }
    });
}

// --- 3. HOME PAGE INBOX PREVIEW ---
function loadHomeInbox(uid) {
    const homeInbox = document.getElementById('homeInbox');
    const q = query(
        collection(db, "chats"), 
        where("participants", "array-contains", uid),
        orderBy("lastUpdate", "desc"),
        limit(3) // Show only top 3 recent chats
    );

    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            homeInbox.innerHTML = `<p style="color:gray; padding:10px;">No recent messages.</p>`;
            return;
        }

        homeInbox.innerHTML = ""; // Clear
        snapshot.forEach(async (chatDoc) => {
            const data = chatDoc.data();
            const otherUid = data.participants.find(id => id !== uid);
            
            // Get the other person's name
            const otherUserSnap = await getDoc(doc(db, "users", otherUid));
            const otherName = otherUserSnap.exists() ? otherUserSnap.data().username : "Sky User";

            homeInbox.innerHTML += `
                <div class="inbox-item" onclick="location.href='dm.html'">
                    <div class="inbox-avatar">${otherName[0].toUpperCase()}</div>
                    <div style="flex:1;">
                        <div style="font-weight:bold;">${otherName}</div>
                        <small style="color:gray;">New activity in chat</small>
                    </div>
                    <i class="fas fa-chevron-right" style="font-size:0.8rem; color:#444;"></i>
                </div>
            `;
        });
    });
}

// --- 4. LOGOUT LOGIC ---
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.onclick = async (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to exit Sky Chat?")) {
            await signOut(auth);
            window.location.href = "login.html";
        }
    };
}
