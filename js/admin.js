/* Path: js/admin.js */
import { db } from './firebase-config.js';
import { collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const userList = document.getElementById('allUsersList');

onSnapshot(collection(db, "users"), (snap) => {
    userList.innerHTML = "";
    snap.forEach((d) => {
        const user = d.data();
        const div = document.createElement('div');
        div.className = "user-row";
        div.innerHTML = `
            <div>
                <strong>${user.username}</strong><br>
                <small>${user.email}</small>
                ${user.isBanned ? '<span class="badge-red">BANNED</span>' : '<span class="badge-blue">ACTIVE</span>'}
            </div>
            <div>
                <button class="btn" style="width:auto; padding:5px 10px; background:${user.isBanned ? '#00e676' : '#ff4b2b'}; color:white;" 
                    onclick="toggleBan('${d.id}', ${user.isBanned})">
                    ${user.isBanned ? 'Unban' : 'Ban'}
                </button>
            </div>
        `;
        userList.appendChild(div);
    });
});

window.toggleBan = async (uid, currentStatus) => {
    await updateDoc(doc(db, "users", uid), {
        isBanned: !currentStatus
    });
};