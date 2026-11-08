/* Sky Chat v2: safer global chat rendering and validation. */
import { auth, db } from './firebase-config.js';
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,
  deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const messagesDisplay = document.getElementById('messagesDisplay');
const chatForm = document.getElementById('chatForm');
const msgInput = document.getElementById('msgInput');

let currentUser = null;
let stopMessages = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  if (!currentUser) {
    if (stopMessages) stopMessages();
    window.location.href = "login.html";
    return;
  }
  if (messagesDisplay && !stopMessages) loadMessages();
});

chatForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const messageText = msgInput?.value.trim() || '';
  if (!messageText) return;
  if (messageText.length > 1000) {
    alert('Messages must be 1,000 characters or fewer.');
    return;
  }

  const submitButton = chatForm.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  try {
    await addDoc(collection(db, "globalMessages"), {
      text: messageText,
      senderId: currentUser.uid,
      senderName: currentUser.email?.split('@')[0] || 'Member',
      timestamp: serverTimestamp()
    });
    chatForm.reset();
  } catch (error) {
    console.error('Could not send message:', error);
    alert('Message could not be sent. Please try again.');
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

function loadMessages() {
  const messagesQuery = query(collection(db, "globalMessages"), orderBy("timestamp", "asc"));
  stopMessages = onSnapshot(messagesQuery, (snapshot) => {
    messagesDisplay.replaceChildren();

    snapshot.forEach((messageDoc) => {
      const data = messageDoc.data();
      const isMine = data.senderId === currentUser?.uid;
      const message = document.createElement('div');
      message.className = `message ${isMine ? 'sent' : 'received'}`;

      const sender = document.createElement('span');
      sender.className = 'user-name';
      sender.textContent = String(data.senderName || 'Member');

      const body = document.createElement('p');
      // Never interpret user-submitted text as HTML.
      body.textContent = String(data.text || '');

      const meta = document.createElement('span');
      meta.className = 'time';
      meta.append(document.createTextNode(data.timestamp?.toDate
        ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Sending…'));

      if (isMine) {
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'delete-btn';
        removeButton.textContent = 'Delete';
        removeButton.setAttribute('aria-label', 'Delete your message');
        removeButton.addEventListener('click', () => deleteMessage(messageDoc.id));
        meta.append(' ', removeButton);
      }

      message.append(sender, body, meta);
      messagesDisplay.appendChild(message);
    });
    messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
  }, (error) => {
    console.error('Could not load messages:', error);
    messagesDisplay.textContent = 'Messages could not be loaded. Please refresh.';
  });
}

async function deleteMessage(messageId) {
  if (!currentUser || !messageId || !window.confirm('Delete this message?')) return;
  try {
    await deleteDoc(doc(db, "globalMessages", messageId));
  } catch (error) {
    console.error('Could not delete message:', error);
    alert('Message could not be deleted.');
  }
}
