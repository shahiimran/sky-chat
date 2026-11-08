import { auth, db } from './firebase-config.js';
import { collection,query,where,onSnapshot,doc,getDoc,deleteDoc,addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
let uidNow=null;
onAuthStateChanged(auth,user=>{
  if(!user){location.href='login.html';return;} uidNow=user.uid;
  if(document.getElementById('friendsList'))loadFriends(user.uid);
  if(document.getElementById('requestList'))loadRequests(user.uid);
  updateBadge(user.uid);
});
function loadFriends(uid){
 const el=document.getElementById('friendsList');
 onSnapshot(query(collection(db,'friends'),where('users','array-contains',uid)),async snap=>{
  el.replaceChildren();if(snap.empty){el.textContent='No friends yet. Visit Discover.';return;}
  for(const d of snap.docs){
   const other=d.data().users.find(x=>x!==uid);if(!other)continue;
   const p=await getDoc(doc(db,'publicProfiles',other));if(!p.exists())continue;const v=p.data();
   const row=document.createElement('div');row.className='friend-row';
   const img=document.createElement('img');img.src=v.avatar||'';img.alt='';img.width=40;img.height=40;img.style.borderRadius='50%';
   const name=document.createElement('span');name.textContent=v.username||'Member';
   const link=document.createElement('a');link.href='conversation.html?uid='+encodeURIComponent(other);link.className='btn btn-primary';link.textContent='Chat';
   row.append(img,name,link);el.appendChild(row);
  }
 },err=>{console.error(err);el.textContent='Could not load friends.';});
}
function loadRequests(uid){
 const el=document.getElementById('requestList');
 onSnapshot(query(collection(db,'friendRequests'),where('to','==',uid),where('status','==','pending')),snap=>{
  el.replaceChildren();if(snap.empty){el.textContent='No pending requests.';return;}
  snap.forEach(d=>{
   const v=d.data(),row=document.createElement('div'),label=document.createElement('span');
   label.textContent=(v.fromName||'A member')+' wants to connect.';
   const yes=document.createElement('button');yes.className='btn btn-primary';yes.textContent='Accept';yes.addEventListener('click',()=>accept(d.id,v.from,uid));
   const no=document.createElement('button');no.className='btn btn-outline';no.textContent='Decline';no.addEventListener('click',()=>decline(d.id));
   row.append(label,yes,no);el.appendChild(row);
  });
 },err=>{console.error(err);el.textContent='Could not load requests.';});
}
async function accept(id,from,to){
 if(uidNow!==to)return;
 try{
  const ref=doc(db,'friendRequests',id),snap=await getDoc(ref);
  if(!snap.exists()||snap.data().to!==uidNow||snap.data().from!==from||snap.data().status!=='pending')throw Error('Request changed');
  await addDoc(collection(db,'friends'),{users:[from,to],timestamp:new Date()});
  await deleteDoc(ref);
 }catch(err){console.error(err);alert('Could not accept request. Refresh and try again.');}
}
async function decline(id){try{await deleteDoc(doc(db,'friendRequests',id));}catch(err){console.error(err);alert('Could not decline request.');}}
function updateBadge(uid){
 onSnapshot(query(collection(db,'friendRequests'),where('to','==',uid),where('status','==','pending')),snap=>{
  const b=document.getElementById('reqBadge');if(b){b.textContent=String(snap.size);b.style.display=snap.size?'inline':'none';}
 });
}
