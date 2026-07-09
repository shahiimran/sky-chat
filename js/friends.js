/* Path: js/friends.js */
import { auth, db } from './firebase-config.js';
import { 
    collection, addDoc, query, where, onSnapshot, doc, getDoc, updateDoc, deleteDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (document.getElementById('friendsList')) loadFriends(user.uid);
        if (document.getElementById('requestList')) loadRequests(user.uid);
        updateRequestBadge(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

// 1. Load Friends List
function loadFriends(myUid) {
    const friendsList = document.getElementById('friendsList');
    const q = query(collection(db, "friends"), where("users", "array-contains", myUid));

    onSnapshot(q, async (snapshot) => {
        friendsList.innerHTML = "";
        if (snapshot.empty) friendsList.innerHTML = "No friends yet. Go to Discover!";
        
        snapshot.forEach(async (d) => {
            const data = d.data();
            const otherUid = data.users.find(id => id !== myUid);
            const userSnap = await getDoc(doc(db, "users", otherUid));
            const userData = userSnap.data();

            friendsList.innerHTML += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid #222;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${userData.avatar || ''}" style="width: 40px; border-radius: 50%;">
                        <span>${userData.username}</span>
                    </div>
                    <a href="conversation.html?uid=${otherUid}" class="btn btn-primary" style="width: auto; padding: 5px 15px;">Chat</a>
                </div>
            `;
        });
    });
}

// 2. Load Pending Requests
function loadRequests(myUid) {
    const requestList = document.getElementById('requestList');
    const q = query(collection(db, "friendRequests"), where("to", "==", myUid), where("status", "==", "pending"));

    onSnapshot(q, (snapshot) => {
        requestList.innerHTML = "";
        if (snapshot.empty) requestList.innerHTML = "No pending requests.";

        snapshot.forEach((d) => {
            const req = d.data();
            requestList.innerHTML += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid #333;">
                    <span><b>${req.fromName}</b> wants to be your friend.</span>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" style="width: auto; padding: 5px 10px;" onclick="acceptReq('${d.id}', '${req.from}', '${myUid}')">Accept</button>
                        <button class="btn btn-outline" style="width: auto; border: 1px solid red; color: red; padding: 5px 10px;" onclick="deleteReq('${d.id}')">Decline</button>
                    </div>
                </div>
            `;
        });
    });
}

// 3. Accept Request Logic
window.acceptReq = async (reqId, fromUid, toUid) => {
    // Create friend link
    await addDoc(collection(db, "friends"), {
        users: [fromUid, toUid],
        timestamp: new Date()
    });
    // Delete the request
    await deleteDoc(doc(db, "friendRequests", reqId));
    alert("Friend added!");
};

window.deleteReq = async (id) => {
    await deleteDoc(doc(db, "friendRequests", id));
};

function updateRequestBadge(myUid) {
    const q = query(collection(db, "friendRequests"), where("to", "==", myUid), where("status", "==", "pending"));
    onSnapshot(q, (snapshot) => {
        const badge = document.getElementById('reqBadge');
        if (badge) {
            if (snapshot.size > 0) {
                badge.innerText = snapshot.size;
                badge.style.display = "inline";
            } else {
                badge.style.display = "none";
            }
        }
    });
}