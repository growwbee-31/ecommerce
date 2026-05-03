import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, updateProfile } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getDatabase, ref, set, push, update, get, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyB7HSi3-seMYrpQdd1YutNCZPllGgGGlwY",
  authDomain: "growwbee-9c95d.firebaseapp.com",
  databaseURL: "https://growwbee-9c95d-default-rtdb.firebaseio.com",
  projectId: "growwbee-9c95d",
  storageBucket: "growwbee-9c95d.firebasestorage.app",
  messagingSenderId: "998928281296",
  appId: "1:998928281296:web:c9975d67d61364985738d5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = database;
window.firebaseRef = ref;
window.firebaseSet = set;
window.firebasePush = push;
window.firebaseUpdate = update;
window.firebaseGet = get;
window.firebaseOnValue = onValue;
window.firebaseRemove = remove;
window.firebaseOnAuthStateChanged = onAuthStateChanged;
window.firebaseSignInWithEmailAndPassword = signInWithEmailAndPassword;
window.firebaseCreateUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.firebaseSignOut = signOut;
window.firebaseGoogleAuthProvider = GoogleAuthProvider;
window.firebaseSignInWithPopup = signInWithPopup;
window.firebaseGoogleProvider = googleProvider;
window.firebaseUpdateProfile = updateProfile;

export {
    app,
    auth,
    database,
    ref,
    set,
    push,
    update,
    get,
    onValue,
    remove,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    updateProfile,
    googleProvider
};
