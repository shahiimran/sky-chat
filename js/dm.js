/* Path: js/dm.js */
import { auth, db } from './firebase-config.js';
import { 
    collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, doc, getDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const urlParams = new URLSearchParams(window.location.search);
const otherUid = urlParams.get('uid');

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (document.getElementById('dmList')) loadInbox(user.uid);
        if (document.getElementById('privateMessages')) startConversation(user.uid, otherUid);
    } else {
        window.location.href = "login.html";
    }
});

// 1. Generate a Unique ID for the two users
function getChatId(id1, id2) {
    return id1 < id2 ? id1 + "_" + id2 : id2 + "_" + id1;
}

// 2. Load Inbox (dm.html)
async function loadInbox(myUid) {
    const dmList = document.getElementById('dmList');
    const q = query(collection(db, "chats"), where("participants", "array-contains", myUid));

    onSnapshot(q, (snapshot) => {
        dmList.innerHTML = "";
        if (snapshot.empty) dmList.innerHTML = "<p style='text-align:center;'>No messages yet.</p>";
        
        snapshot.forEach(async (chatDoc) => {
            const data = chatDoc.data();
            const friendId = data.participants.find(id => id !== myUid);
            const userSnap = await getDoc(doc(db, "users", friendId));
            const friendData = userSnap.data();

            dmList.innerHTML += `
                <div onclick="window.location.href='conversation.html?uid=${friendId}'" style="display: flex; align-items: center; gap: 15px; padding: 15px; border-bottom: 1px solid #222; cursor: pointer;">
                    <img src="${friendData.avatar || ''}" style="width: 50px; border-radius: 50%;">
                    <div>
                        <strong>${friendData.username}</strong><br>
                        <small style="color: var(--text-gray)">Click to view messages</small>
                    </div>
                </div>
            `;
        });
    });
}

// 3. Start Conversation (conversation.html)
async function startConversation(myUid, targetUid) {
    const chatId = getChatId(myUid, targetUid);
    const messagesDisplay = document.getElementById('privateMessages');
    const privateForm = document.getElementById('privateForm');

    // Fetch Friend's info for Header
    const friendSnap = await getDoc(doc(db, "users", targetUid));
    const friendData = friendSnap.data();
    document.getElementById('chatName').innerText = friendData.username;
    document.getElementById('chatAvatar').src = friendData.avatar || '';

    // Load Messages
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        messagesDisplay.innerHTML = "";
        snapshot.forEach((mDoc) => {
            const mData = mDoc.data();
            const isMe = mData.senderId === myUid;
            const div = document.createElement('div');
            div.className = `message ${isMe ? 'sent' : 'received'}`;
            div.innerHTML = `<p>${mData.text}</p>`;
            messagesDisplay.appendChild(div);
        });
        messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
    });

    // Send Message
    privateForm.onsubmit = async (e) => {
        e.preventDefault();
        const text = document.getElementById('pMsgInput').value;
        
        // Ensure chat document exists in 'chats' collection
        await setDoc(doc(db, "chats", chatId), {
            participants: [myUid, targetUid],
            lastUpdate: serverTimestamp()
        }, { merge: true });

        // Add message to subcollection
        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: text,
            senderId: myUid,
            timestamp: serverTimestamp()
        });

        privateForm.reset();
    };
}