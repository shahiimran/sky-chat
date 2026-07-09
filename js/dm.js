// When sending a private message, update the parent chat document time
await updateDoc(doc(db, "chats", chatId), {
    lastUpdate: serverTimestamp()
});
