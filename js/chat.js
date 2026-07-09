/* Path: js/chat.js */
import { auth, db } from './firebase-config.js';
import { 
    collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let currentUser = null;
const messagesDisplay = document.getElementById('messagesDisplay');
const chatForm = document.getElementById('chatForm');

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadMessages();
    } else {
        window.location.href = "login.html";
    }
});

// 1. Send Message
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('msgInput').value;

    await addDoc(collection(db, "globalMessages"), {
        text: text,
        senderId: currentUser.uid,
        senderName: currentUser.email.split('@')[0],
        timestamp: serverTimestamp()
    });

    chatForm.reset();
});

// 2. Load Messages in Real-time
function loadMessages() {
    const q = query(collection(db, "globalMessages"), orderBy("timestamp", "asc"));
    
    onSnapshot(q, (snapshot) => {
        messagesDisplay.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            const isMe = data.senderId === currentUser.uid;

            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${isMe ? 'sent' : 'received'}`;
            
            msgDiv.innerHTML = `
                <span class="user-name">${data.senderName}</span>
                <p>${data.text}</p>
                <span class="time">
                    ${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                    ${isMe ? `<button class="delete-btn" onclick="deleteMsg('${id}')"><i class="fas fa-trash"></i></button>` : ''}
                </span>
            `;
            messagesDisplay.appendChild(msgDiv);
        });
        messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
    });
}

// 3. Delete Message Logic
window.deleteMsg = async (id) => {
    if(confirm("Delete this message?")) {
        await deleteDoc(doc(db, "globalMessages", id));
    }
};
