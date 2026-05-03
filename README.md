# Firebase Auth Example

Simple login and register UI using Firebase Authentication.

## Files
- `index.html` — page structure and Firebase CDN includes
- `styles.css` — styling for login/register cards
- `app.js` — auth logic using Firebase Email/Password

## Setup
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Email/Password sign-in in Authentication > Sign-in method.
3. Copy your Firebase config and replace values in `app.js`.
4. Open `index.html` in a browser.

## Notes
- This example uses Firebase compatibility (`firebase-app-compat.js`, `firebase-auth-compat.js`).
- For production, use secure hosting and environment variables instead of hard-coded config.
