import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, getIdTokenResult } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById('reportsContainer');
function showMessage(message) { if (container) container.textContent = message; }

onAuthStateChanged(auth, async user => {
  if (!user) { location.href = '../login.html'; return; }
  try {
    const token = await getIdTokenResult(user, true);
    if (token.claims.admin !== true && token.claims.moderator !== true) {
      showMessage('Access denied. Moderator permission is required.');
      return;
    }
    loadReports();
  } catch (error) {
    console.error('Moderator verification failed:', error);
    showMessage('Could not verify moderator access.');
  }
});

function loadReports() {
  if (!container) return;
  onSnapshot(collection(db, 'reports'), snapshot => {
    container.replaceChildren();
    if (snapshot.empty) { showMessage('No reports found.'); return; }
    snapshot.forEach(reportDoc => {
      const report = reportDoc.data();
      const card = document.createElement('div');
      card.className = 'user-row';
      const title = document.createElement('strong');
      title.textContent = 'Reported member: ' + String(report.reportedUser || report.reportedUid || 'Unknown');
      const reason = document.createElement('p');
      reason.textContent = 'Reason: ' + String(report.reason || 'Not provided');
      const dismiss = document.createElement('button');
      dismiss.type = 'button'; dismiss.className = 'btn btn-outline'; dismiss.textContent = 'Dismiss';
      dismiss.addEventListener('click', async () => {
        dismiss.disabled = true;
        try { await deleteDoc(doc(db, 'reports', reportDoc.id)); }
        catch (error) { console.error(error); dismiss.disabled = false; alert('Could not dismiss report.'); }
      });
      card.append(title, reason, dismiss);
      container.appendChild(card);
    });
  }, error => {
    console.error('Report load failed:', error);
    showMessage('Reports could not load. Check moderator permissions.');
  });
}
