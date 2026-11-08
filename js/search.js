import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection, query, where, orderBy, limit, getDocs, getDoc, doc, addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const input = document.getElementById('searchInput');
const button = document.getElementById('searchBtn');
const results = document.getElementById('results');
let currentUser = null;
let myProfile = null;

onAuthStateChanged(auth, async user => {
  if (!user) { location.href = 'login.html'; return; }
  currentUser = user;
  try {
    const snap = await getDoc(doc(db, 'publicProfiles', user.uid));
    myProfile = snap.exists() ? snap.data() : {};
  } catch (error) { console.error('Profile load failed:', error); }
});

button?.addEventListener('click', searchPeople);
input?.addEventListener('keydown', event => { if (event.key === 'Enter') searchPeople(); });

async function searchPeople() {
  if (!currentUser) return;
  const term = input.value.trim().toLowerCase();
  if (term.length < 2) { results.textContent = 'Enter at least 2 characters to search.'; return; }
  button.disabled = true;
  results.textContent = 'Searching…';
  try {
    const q = query(collection(db, 'publicProfiles'),
      where('usernameLower', '>=', term),
      where('usernameLower', '<=', term + '\uf8ff'),
      orderBy('usernameLower'), limit(20));
    const snap = await getDocs(q);
    results.replaceChildren();
    const people = snap.docs.filter(d => d.id !== currentUser.uid);
    if (!people.length) { results.textContent = 'No matching members found.'; return; }
    for (const person of people) {
      const data = person.data();
      const row = document.createElement('div');
      row.className = 'friend-row';
      row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #333';
      const avatar = document.createElement('img');
      avatar.src = data.avatar || '';
      avatar.alt = '';
      avatar.width = 44; avatar.height = 44; avatar.style.borderRadius = '50%';
      const info = document.createElement('div');
      const name = document.createElement('strong'); name.textContent = data.username || 'Member';
      const bio = document.createElement('p'); bio.textContent = data.bio || data.status || '';
      info.append(name, bio);
      const send = document.createElement('button');
      send.type = 'button'; send.className = 'btn btn-primary'; send.style.width = 'auto'; send.textContent = 'Add friend';
      send.addEventListener('click', async () => {
        send.disabled = true;
        try {
          await addDoc(collection(db, 'friendRequests'), {
            from: currentUser.uid, to: person.id,
            fromName: myProfile?.username || 'Member',
            status: 'pending', createdAt: serverTimestamp()
          });
          send.textContent = 'Request sent';
        } catch (error) {
          console.error('Friend request failed:', error);
          send.disabled = false;
          alert('Could not send request. They may already have a request from you.');
        }
      });
      row.append(avatar, info, send);
      results.appendChild(row);
    }
  } catch (error) {
    console.error('Discover search failed:', error);
    results.textContent = 'Search failed. Check Firestore rules and try again.';
  } finally { button.disabled = false; }
}
