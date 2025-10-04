import { getDatabase, ref, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { auth } from "./auth.js";
import { startMeet, showToast } from "./meeting.js";

const db = getDatabase(auth.app);
export const ADMIN_UID = "9Ik4R3FTvaRAQ6u4IUaVdwLDHa13";

export const listenRooms = (cb) => {
    const roomsRef = ref(db, 'activeRooms');
    return onValue(roomsRef, (snap) => {
        cb(snap.val() || {});
    }, (err) => {
        console.error("Error fetching rooms:", err);
        showToast("Failed to load rooms. Check Firebase rules and connection.", 'error');
    });
};

export const adminCreateRoom = (roomName) => {
    const roomRef = ref(db, `activeRooms/${roomName}`);
    return set(roomRef, true);
};

export const adminRemoveRoom = (roomName) => {
    const roomRef = ref(db, `activeRooms/${roomName}`);
    return remove(roomRef);
};