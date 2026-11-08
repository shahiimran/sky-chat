import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection, query, where, orderBy, onSnapshot, doc, getDoc, setDoc,
  addDoc, updateDoc, serverTimestamp, limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const inbox = document.getElementById('dmList');
const messagesBox = document.getElementById('privateMessages');
const form = document.getElementById('privateForm');
const input = document.getElementById('pMsgInput');
let me = null;
let activeChatId = null;
let stopInbox = null;
let stopMessages = null;

onAuthStateChanged(auth, async user => {
  if (!user) { location.href = 'login.html'; return; }
  me = user;
  if (inbox) loadInbox(user.uid);
  if (messagesBox && form) await startConversation(user.uid);
});

function chatIdFor(a, b) { return [a, b].sort().join('__'); }

function loadInbox(uid) {
  const q = query(collection(db, 'chats'), where('members', 'array-contains', uid), orderBy('lastUpdate', 'desc'), limit(50));
  stopInbox = onSnapshot(q, async snap => {
    inbox.replaceChildren();
    if (snap.empty) { inbox.textContent = 'No conversations yet. Add a friend from Discover to start chatting.'; return; }
    for (const chatDoc of snap.docs) {
      const chat = chatDoc.data();
      const otherUid = (chat.members || []).find(id => id !== uid);
      if (!otherUid) continue;
      const profileSnap = await getDoc(doc(db, 'publicProfiles', otherUid));
      const profile = profileSnap.exists() ? profileSnap.data() : {};
      const link = document.createElement('a');
      link.href = 'conversation.html?uid=' + encodeURIComponent(otherUid);
      link.className = 'friend-row';
      link.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px;color:inherit;text-decoration:none;border-bottom:1px solid #333';
      const avatar = document.createElement('img');
      avatar.src = profile.avatar || '';
      avatar.alt = '';
      avatar.width = 42;
      avatar.height = 42;
      avatar.style.borderRadius = '50%';
      const name = document.createElement('strong');
      name.textContent = profile.username || 'Sky Chat member';
      link.append(avatar, name);
      inbox.appendChild(link);
    }
  }, error => {
    console.error('Inbox load failed:', error);
    inbox.textContent = 'Inbox could not load. Check Firestore rules and indexes.';
  });
}

async function startConversation(uid) {
  const targetUid = new URLSearchParams(location.search).get('uid');
  if (!targetUid || targetUid === uid) {
    messagesBox.textContent = 'Choose a friend to start a conversation.';
    form.hidden = true;
    return;
  }

  // Only existing friends can start a private conversation from this client.
  const friendQuery = query(collection(db, 'friends'), where('users', 'array-contains', uid));
  const friendSnap = await new Promise((resolve, reject) => {
    const stop = onSnapshot(friendQuery, value => { stop(); resolve(value); }, error => { stop(); reject(error); });
  });
  const isFriend = friendSnap.docs.some(d => (d.data().users || []).includes(targetUid));
  if (!isFriend) {
    messagesBox.textContent = 'Private chat is available to friends only. Send or accept a friend request first.';
    form.hidden = true;
    return;
  }

  const profileSnap = await getDoc(doc(db, 'publicProfiles', targetUid));
  if (!profileSnap.exists()) {
    messagesBox.textContent = 'This profile is no longer available.';
    form.hidden = true;
    return;
  }
  const profile = profileSnap.data();
  const name = document.getElementById('chatName');
  const avatar = document.getElementById('chatAvatar');
  if (name) name.textContent = profile.username || 'Friend';
  if (avatar) { avatar.src = profile.avatar || ''; avatar.alt = profile.username || 'Friend'; }

  activeChatId = chatIdFor(uid, targetUid);
  const chatRef = doc(db, 'chats', activeChatId);
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) {
    await setDoc(chatRef, { members: [uid, targetUid].sort(), createdAt: serverTimestamp(), lastUpdate: serverTimestamp() });
  } else if (!(chatSnap.data().members || []).includes(uid) || !(chatSnap.data().members || []).includes(targetUid)) {
    throw new Error('Conversation membership mismatch.');
  }
  const messagesQuery = query(collection(db, 'chats', activeChatId, 'messages'), orderBy('timestamp', 'asc'), limit(100));
  stopMessages = onSnapshot(messagesQuery, snap => {
    messagesBox.replaceChildren();
    snap.forEach(messageDoc => {
      const data = messageDoc.data();
      const row = document.createElement('div');
      row.className = 'message ' + (data.senderId === uid ? 'sent' : 'received');
      const sender = document.createElement('strong');
      sender.textContent = data.senderId === uid ? 'You' : (profile.username || 'Friend');
      const body = document.createElement('p');
      body.textContent = String(data.text || '');
      const time = document.createElement('small');
      time.textContent = data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : 'Sending…';
      row.append(sender, body, time);
      messagesBox.appendChild(row);
    });
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }, error => {
    console.error('Private messages load failed:', error);
    messagesBox.textContent = 'Messages could not load. Check Firestore rules and indexes.';
  });
}

form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!me || !activeChatId) return;
  const text = input.value.trim();
  if (!text || text.length > 1000) {
    if (text.length > 1000) alert('Messages must be 1,000 characters or fewer.');
    return;
  }
  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = true;
  try {
    const chatRef = doc(db, 'chats', activeChatId);
    await addDoc(collection(db, 'chats', activeChatId, 'messages'), {
      text, senderId: me.uid, timestamp: serverTimestamp()
    });
    await updateDoc(chatRef, { lastUpdate: serverTimestamp() });
    form.reset();
  } catch (error) {
    console.error('Private message send failed:', error);
    alert('Message could not be sent. Check your connection and Firestore rules.');
  } finally {
    if (button) button.disabled = false;
  }
});
