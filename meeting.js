import { adminCreateRoom, adminRemoveRoom, ADMIN_UID } from "./database.js";

export const JaaS_APP_ID = "vpaas-magic-cookie-697d56e51785462189f1148e64a4502b";

let jitsiApi = null;
const jitsiContainer = document.getElementById('jitsi-container');
const setupDiv = document.getElementById('setup');
const toastContainer = document.getElementById('toast-container');

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

export const resetJoinBtn = () => {
    const btn = document.getElementById('joinButton');
    btn.disabled = false;
    btn.textContent = 'Join Meeting';
};

export const cleanupMeet = () => {
    if (jitsiApi) {
        jitsiApi.dispose();
        jitsiApi = null;
    }
    jitsiContainer.style.display = 'none';
    resetJoinBtn();
    document.getElementById('roomName').value = '';
    document.getElementById('roomSelect').value = '';
};

export const initMeet = () => {}; // legacy stub

export const startMeet = (roomName) => {
    if (isUserAdmin) adminCreateRoom(roomName);

    setupDiv.classList.add('hidden');
    jitsiContainer.style.display = 'block';

    const options = {
        roomName: `${JaaS_APP_ID}/${roomName}`,
        parentNode: jitsiContainer,
        configOverwrite: {
            prejoinPageEnabled: false,
            startWithVideoMuted: false,
            startWithAudioMuted: false
        },
        interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Participant'
        },
        userInfo: {
            displayName: currentUser.displayName,
            email: currentUser.email
        }
    };

    try {
        jitsiApi = new JitsiMeetExternalAPI("8x8.vc", options);
        jitsiApi.addEventListener('videoConferenceLeft', () => endMeet(roomName));
    } catch (e) {
        console.error("Error starting Jitsi:", e);
        showToast("Failed to join meeting. Check console.", 'error');
        cleanupMeet();
    }
};

const endMeet = (roomName) => {
    cleanupMeet();
    if (isUserAdmin && roomName) adminRemoveRoom(roomName);
    if (currentUser) setupDiv.classList.remove('hidden');
};