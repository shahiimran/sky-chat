/* Path: js/settings.js */
import { auth, db } from './firebase-config.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { sendPasswordResetEmail, deleteUser } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Save privacy settings for the signed-in account.
const savePrivacyBtn = document.getElementById('savePrivacy');
if (savePrivacyBtn) {
  savePrivacyBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return alert('Please sign in first.');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        msgPrivacy: document.getElementById('msgPrivacy').value,
        showOnline: document.getElementById('showOnline').checked,
        showLastSeen: document.getElementById('showLastSeen').checked,
        readReceipts: document.getElementById('readReceipts').checked
      });
      alert('Privacy settings updated.');
    } catch (error) {
      console.error('Privacy update failed:', error);
      alert('Could not save privacy settings. Please try again.');
    }
  });
}

// Send a password reset link to the signed-in account.
const securityResetBtn = document.getElementById('securityResetPass');
if (securityResetBtn) {
  securityResetBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user?.email) return alert('Please sign in first.');
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert('Reset link sent. Check your email.');
    } catch (error) {
      console.error('Password reset request failed:', error);
      alert('Could not send the reset email. Please try again.');
    }
  });
}

// Account deletion. No bot token or private account data is sent to a third party.
const deleteBtn = document.getElementById('deleteAccountBtn');
if (deleteBtn) {
  deleteBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return alert('Please sign in first.');
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;
    try {
      // Firebase requires a recent sign-in for account deletion.
      await deleteUser(user);
      alert('Your sign-in account was deleted.');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Account deletion failed:', error);
      alert('Deletion failed. You may need to sign in again and retry.');
    }
  });
}
