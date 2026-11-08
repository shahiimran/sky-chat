import { auth, db } from './firebase-config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const avatars=['Felix','Aneka','Buddy','Casper','Lola','Max'].map(seed=>'https://api.dicebear.com/7.x/avataaars/svg?seed='+seed);
let selectedAvatar='';
async function initEditProfile(user){
  const snap=await getDoc(doc(db,'publicProfiles',user.uid));
  if(!snap.exists()) throw new Error('Profile missing');
  const data=snap.data();
  document.getElementById('editUsername').value=data.username||'';
  document.getElementById('editStatus').value=data.status||'';
  document.getElementById('editBio').value=data.bio||'';
  selectedAvatar=data.avatar||avatars[0]; renderPicker();
}
function renderPicker(){
  const picker=document.getElementById('avatarPicker'); if(!picker)return;
  picker.replaceChildren();
  avatars.forEach(url=>{
    const img=document.createElement('img'); img.src=url; img.alt='Choose avatar';
    img.style.cssText='width:60px;border-radius:50%;cursor:pointer;border:3px solid '+(url===selectedAvatar?'var(--accent)':'transparent');
    img.addEventListener('click',()=>{selectedAvatar=url;renderPicker();}); picker.appendChild(img);
  });
}
const editForm=document.getElementById('editForm');
if(editForm){
  auth.onAuthStateChanged(async user=>{
    if(!user){location.href='login.html';return;}
    try{await initEditProfile(user);}catch(err){console.error(err);alert('Could not load profile.');}
  });
  editForm.addEventListener('submit',async e=>{
    e.preventDefault(); const user=auth.currentUser;if(!user)return;
    const username=document.getElementById('editUsername').value.trim();
    if(!/^[a-zA-Z0-9_]{3,20}$/.test(username))return alert('Username: 3–20 letters, numbers or underscores.');
    try{
      await updateDoc(doc(db,'publicProfiles',user.uid),{
        username,usernameLower:username.toLowerCase(),
        status:document.getElementById('editStatus').value.trim().slice(0,80),
        bio:document.getElementById('editBio').value.trim().slice(0,300),avatar:selectedAvatar
      });
      alert('Profile updated.');location.href='profile.html';
    }catch(err){console.error(err);alert('Could not update profile.');}
  });
}
