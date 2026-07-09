/* Path: js/profile.js */
import { auth, db } from './firebase-config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// List of preset avatars for the user to choose from
const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Casper"
];

let selectedAvatar = "";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();

            // IF ON VIEW PROFILE PAGE
            if (document.getElementById('displayUsername')) {
                document.getElementById('displayUsername').innerText = data.username;
                document.getElementById('displayStatus').innerText = data.status || "Sky Traveler";
                document.getElementById('displayBio').innerText = data.bio || "No bio added.";
                document.getElementById('displayAvatar').src = data.avatar || avatars[0];
            }

            // IF ON EDIT PROFILE PAGE
            if (document.getElementById('editForm')) {
                document.getElementById('editUsername').value = data.username;
                document.getElementById('editStatus').value = data.status || "";
                document.getElementById('editBio').value = data.bio || "";
                renderAvatarPicker(data.avatar);
            }
        }
    }
});

// Setup Avatar Picker
function renderAvatarPicker(currentAvatar) {
    const picker = document.getElementById('avatarPicker');
    if(!picker) return;

    avatars.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.className = `avatar-option ${url === currentAvatar ? 'selected' : ''}`;
        img.onclick = () => {
            document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
            img.classList.add('selected');
            selectedAvatar = url;
        };
        picker.appendChild(img);
    });
}

// Save Profile Updates
const editForm = document.getElementById('editForm');
if(editForm) {
    editForm.onsubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, {
            username: document.getElementById('editUsername').value,
            status: document.getElementById('editStatus').value,
            bio: document.getElementById('editBio').value,
            avatar: selectedAvatar || avatars[0]
        });

        alert("Profile Updated!");
        window.location.href = "profile.html";
    };
}