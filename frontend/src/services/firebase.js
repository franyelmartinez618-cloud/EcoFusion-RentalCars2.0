import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserSessionPersistence } from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const required = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_APP_ID",
];

const missing = required.filter((key) => !import.meta.env[key]);

export const firebaseConfigured = missing.length === 0;

let app = null;
let auth = null;
let googleProvider = null;
let appCheck = null;

if (firebaseConfigured) {
    app = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
    auth = getAuth(app);
    // Keep authentication for the current tab only; closing the tab clears the Firebase identity so incomplete onboarding cannot linger.
    setPersistence(auth, browserSessionPersistence).catch(() => {});
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
    const recaptchaSiteKey = import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY?.trim();
    if (recaptchaSiteKey) {
        try {
            appCheck = initializeAppCheck(app, {
                provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
                isTokenAutoRefreshEnabled: true,
            });
        } catch {
            appCheck = null;
        }
    }
}

export { app, auth, googleProvider, appCheck, missing };
