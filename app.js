const firebaseConfig = {
  apiKey: "AIzaSyB7HSi3-seMYrpQdd1YutNCZPllGgGGlwY",
  authDomain: "growwbee-9c95d.firebaseapp.com",
  databaseURL: "https://growwbee-9c95d-default-rtdb.firebaseio.com",
  projectId: "growwbee-9c95d",
  storageBucket: "growwbee-9c95d.firebasestorage.app",
  messagingSenderId: "998928281296",
  appId: "1:998928281296:web:c9975d67d61364985738d5"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const statusEl = document.getElementById('status');

function setStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = 'status';
  if (type === 'error') statusEl.classList.add('error');
  if (type === 'success') statusEl.classList.add('success');
}

function toggleForms(showRegisterForm) {
  registerForm.classList.toggle('active', showRegisterForm);
  loginForm.classList.toggle('active', !showRegisterForm);
  showRegister.classList.toggle('active', showRegisterForm);
  showLogin.classList.toggle('active', !showRegisterForm);
  setStatus('');
}

showRegister.addEventListener('click', () => toggleForms(true));
showLogin.addEventListener('click', () => toggleForms(false));

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    setStatus(`Registered as ${userCredential.user.email}`, 'success');
    registerForm.reset();
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    setStatus(`Logged in as ${userCredential.user.email}`, 'success');
    loginForm.reset();
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await auth.signOut();
    setStatus('Logged out successfully.', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

auth.onAuthStateChanged((user) => {
  if (user) {
    logoutBtn.style.display = 'block';
    setStatus(`Signed in: ${user.email}`, 'success');
  } else {
    logoutBtn.style.display = 'none';
  }
});
