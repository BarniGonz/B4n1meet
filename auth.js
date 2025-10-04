import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initMeet, startMeet, showToast, cleanupMeet, resetJoinBtn } from "./meeting.js";
import { listenRooms } from "./database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDOKvsVlLe4oGBF_nHzW7_VWkK235WazZM",
    authDomain: "barnilabs-52c78.firebaseapp.com",
    projectId: "barnilabs-52c78",
    storageBucket: "barnilabs-52c78.appspot.com",
    messagingSenderId: "653465697943",
    appId: "1:653465697943:web:e9f627ef3effdebc2f73d2",
    databaseURL: "https://barnilabs-52c78-default-rtdb.firebaseio.com/"
};

const ADMIN_UID = "9Ik4R3FTvaRAQ6u4IUaVdwLDHa13";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const authContainer = document.getElementById('auth-container');
const setupDiv = document.getElementById('setup');
const signInBtn = document.getElementById('signInButton');
const signOutBtn = document.getElementById('signOutButton');
const joinBtn = document.getElementById('joinButton');
const welcomeMsg = document.getElementById('welcomeMessage');
const roomSelect = document.getElementById('roomSelect');
const roomNameInp = document.getElementById('roomName');
const roomSelectContainer = document.getElementById('roomSelectContainer');

let roomsListener = null;
window.currentUser = null;
window.isUserAdmin = false;

export const handleSignIn = () => signInWithPopup(auth, provider).catch(err => console.error("Sign-in failed:", err));
export const handleSignOut = () => signOut(auth);

export const updateRoomList = (rooms) => {
    roomSelect.innerHTML = '<option value="">Select a room...</option>';
    Object.keys(rooms).forEach(room => {
        const opt = document.createElement('option');
        opt.value = room;
        opt.textContent = room;
        roomSelect.appendChild(opt);
    });
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.currentUser = user;
        window.isUserAdmin = user.uid === ADMIN_UID;

        authContainer.classList.add('hidden');
        setupDiv.classList.remove('hidden');
        document.getElementById('jitsi-container').style.display = 'none';

        const adminBadge = isUserAdmin ? '<span class="admin-badge">ADMIN</span>' : '';
        welcomeMsg.innerHTML = `Welcome, <strong>${user.displayName}</strong> ${adminBadge}`;

        if (roomsListener) roomsListener();
        roomsListener = listenRooms(updateRoomList);
    } else {
        window.currentUser = null;
        window.isUserAdmin = false;
        if (roomsListener) {
            roomsListener();
            roomsListener = null;
        }
        authContainer.classList.remove('hidden');
        setupDiv.classList.add('hidden');
        cleanupMeet();
    }
});

joinBtn.addEventListener('click', () => {
    let room = roomNameInp.value.trim().replace(/\s+/g, '-').toLowerCase();
    if (!room && roomSelect.value) room = roomSelect.value;
    if (!room) return showToast('Please select or enter a room name.', 'error');

    joinBtn.disabled = true;
    joinBtn.textContent = 'Joining...';

    const rooms = Array.from(roomSelect.options).map(o => o.value).filter(Boolean);
    if (!isUserAdmin && !rooms.includes(room)) {
        showToast('Room does not exist. Non-admins can only join existing rooms.', 'error');
        resetJoinBtn();
        return;
    }
    startMeet(room);
});

roomNameInp.addEventListener('keypress', e => { if (e.key === 'Enter') joinBtn.click(); });
roomSelect.addEventListener('change', () => { if (roomSelect.value) roomNameInp.value = roomSelect.value; });

signInBtn.addEventListener('click', handleSignIn);
signOutBtn.addEventListener('click', handleSignOut);