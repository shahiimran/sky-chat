/* Sky Chat v2: admin access is granted only by a server-issued Firebase custom claim. */
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, getIdTokenResult } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const userList = document.getElementById('allUsersList');

function showAccessDenied(message) {
  if (userList) userList.textContent = message;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '../login.html';
    return;
  }

  try {
    const token = await getIdTokenResult(user, true);
    if (token.claims.admin !== true) {
      showAccessDenied('Access denied. An authorized administrator account is required.');
      return;
    }
    loadUsers();
  } catch (error) {
    console.error('Admin authorization failed:', error);
    showAccessDenied('Could not verify administrator access. Please try again.');
  }
});

function loadUsers() {
  if (!userList) return;

  onSnapshot(collection(db, 'users'), (snapshot) => {
    userList.replaceChildren();

    snapshot.forEach((userDoc) => {
      const user = userDoc.data();
      const row = document.createElement('div');
      row.className = 'user-row';

      const details = document.createElement('div');
      const username = document.createElement('strong');
      username.textContent = String(user.username || 'Unnamed user');
      const email = document.createElement('small');
      email.textContent = String(user.email || '');
      const status = document.createElement('span');
      status.className = user.isBanned ? 'badge-red' : 'badge-blue';
      status.textContent = user.isBanned ? 'BANNED' : 'ACTIVE';
      details.append(username, document.createElement('br'), email, document.createElement('br'), status);

      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'btn';
      action.style.width = 'auto';
      action.style.padding = '5px 10px';
      action.textContent = user.isBanned ? 'Unban' : 'Ban';
      action.addEventListener('click', () => toggleBan(userDoc.id, Boolean(user.isBanned)));

      row.append(details, action);
      userList.appendChild(row);
    });
  }, (error) => {
    console.error('Could not load users:', error);
    showAccessDenied('User list could not be loaded. Check Firestore permissions.');
  });
}

async function toggleBan(uid, currentStatus) {
  if (!uid) return;
  try {
    await updateDoc(doc(db, 'users', uid), { isBanned: !currentStatus });
  } catch (error) {
    console.error('Could not update user status:', error);
    alert('Could not update account status. Check administrator permissions.');
  }
}
