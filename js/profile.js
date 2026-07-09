/* Path: js/profile.js */
import { auth, db } from './firebase-config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Casper",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lola",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max"
];

let selectedAvatar = "";

// 1. Load current data into the form
async function initEditProfile() {
    const user = auth.currentUser;
    const snap = await getDoc(doc(db, "users", user.uid));
    const data = snap.data();

    document.getElementById('editUsername').value = data.username;
    document.getElementById('editStatus').value = data.status || "";
    document.getElementById('editBio').value = data.bio || "";
    selectedAvatar = data.avatar || avatars[0];

    renderPicker();
}

function renderPicker() {
    const picker = document.getElementById('avatarPicker');
    picker.innerHTML = "";
    avatars.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.style.width = "60px";
        img.style.borderRadius = "50%";
        img.style.cursor = "pointer";
        img.style.border = (url === selectedAvatar) ? "3px solid var(--accent)" : "3px solid transparent";
        img.onclick = () => {
            selectedAvatar = url;
            renderPicker();
        };
        picker.appendChild(img);
    });
}

const editForm = document.getElementById('editForm');
if (editForm) {
    auth.onAuthStateChanged(user => { if(user) initEditProfile(); });
    editForm.onsubmit = async (e) => {
        e.preventDefault();
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
            username: document.getElementById('editUsername').value,
            status: document.getElementById('editStatus').value,
            bio: document.getElementById('editBio').value,
            avatar: selectedAvatar
        });
        alert("Profile Updated!");
        window.location.href = "profile.html";
    };
}
