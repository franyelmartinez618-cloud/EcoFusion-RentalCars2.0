/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";
import { auth, firebaseConfigured, googleProvider, appCheck, missing } from "../services/firebase";
import { getToken } from "firebase/app-check";
import { useApp } from "./AppContext";

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

async function req(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (appCheck) {
        try {
            const token = await getToken(appCheck, false);
            if (token?.token) headers["X-Firebase-AppCheck"] = token.token;
        } catch {
            // App Check remains optional until production enforcement is enabled.
        }
    }
    const response = await fetch(`${API}${path}`, {
        credentials: "include",
        headers,
        ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "Request failed");
    return data;
}

function csrf() {
    return document.cookie.split("; ").find((x) => x.startsWith("ef_csrf="))?.split("=")[1] || "";
}

function firebaseError(error, t) {
    const map = {
        "auth/email-already-in-use": t.account.authErrors.emailExists,
        "auth/invalid-credential": t.account.authErrors.invalidCredential,
        "auth/wrong-password": t.account.authErrors.invalidCredential,
        "auth/user-not-found": t.account.authErrors.invalidCredential,
        "auth/popup-closed-by-user": t.account.authErrors.googleClosed,
        "auth/popup-blocked": t.account.authErrors.popupBlocked,
        "auth/operation-not-allowed": t.account.authErrors.providerDisabled,
        "auth/too-many-requests": t.account.authErrors.tooMany,
        "auth/unauthorized-domain": t.account.authErrors.unauthorizedDomain || "This domain is not authorized in Firebase Authentication.",
        "auth/operation-not-supported-in-this-environment": t.account.authErrors.environment || "Google sign-in is not supported in this browser environment.",
        "auth/invalid-api-key": t.account.authErrors.invalidApiKey || "The Firebase API key is invalid.",
        "auth/network-request-failed": t.account.authErrors.network || "Network error while contacting Firebase.",
        "auth/account-exists-with-different-credential": t.account.authErrors.accountExists || "An account already exists with another sign-in method. Use that method first.",
        "auth/invalid-phone-number": t.account.authErrors.invalidPhone,
        "auth/quota-exceeded": t.account.authErrors.quota,
        "auth/invalid-verification-code": t.account.authErrors.invalidCode,
    };
    return map[error?.code] || error?.message || t.account.authErrors.generic;
}

async function exchangeFirebaseSession(firebaseUser, profileName = "") {
    if (!firebaseUser) throw new Error("Authentication was not completed.");
    const idToken = await firebaseUser.getIdToken(true);
    const data = await req("/auth/firebase", {
        method: "POST",
        body: JSON.stringify({ id_token: idToken, profile_name: profileName || "" }),
    });
    return data.user;
}

export function AuthProvider({ children }) {
    const { language, translations: t } = useApp();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");
    useEffect(() => { if (auth) auth.languageCode = language; }, [language]);

    const latestTranslations = useRef(t);
    latestTranslations.current = t;
    const recaptchaRef = useRef(null);
    const confirmationRef = useRef(null);

    const ensureConfigured = () => {
        if (!firebaseConfigured) {
            throw new Error(`Firebase is not configured. Missing: ${missing.join(", ")}`);
        }
    };

    useEffect(() => {
        if (!firebaseConfigured || !auth) {
            setLoading(false);
            return undefined;
        }
        let mounted = true;
        const finish = async (firebaseUser) => {
            try {
                if (!firebaseUser) {
                    if (mounted) setUser(null);
                    return;
                }
                const backendUser = await exchangeFirebaseSession(firebaseUser);
                if (mounted) setUser(backendUser);
            } catch (error) {
                if (mounted) {
                    setUser(null);
                    setAuthError(error.message);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => finish(firebaseUser));
        return () => { mounted = false; unsubscribe(); };
    }, []);

    const login = useCallback(async (email, password) => {
        ensureConfigured();
        setAuthError("");
        try {
            const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
            if (!credential.user.emailVerified) {
                await signOut(auth);
                throw new Error("Please verify your email before signing in.");
            }
            const backendUser = await exchangeFirebaseSession(credential.user);
            setUser(backendUser);
            return backendUser;
        } catch (error) {
            throw new Error(firebaseError(error, latestTranslations.current));
        }
    }, []);

    const register = useCallback(async (name, email, password) => {
        ensureConfigured();
        setAuthError("");
        try {
            const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            await updateProfile(credential.user, { displayName: name.trim() });
            await sendEmailVerification(credential.user);
            await signOut(auth);
            throw new Error("Account created. Check your email to verify the account, then sign in.");
        } catch (error) {
            throw new Error(firebaseError(error, latestTranslations.current));
        }
    }, []);

    const loginGoogle = useCallback(async () => {
        ensureConfigured();
        setAuthError("");
        try {
            sessionStorage.setItem(
                "ecofusion-auth-return",
                window.location.pathname + window.location.search,
            );
            const credential = await signInWithPopup(auth, googleProvider);
            const backendUser = await exchangeFirebaseSession(credential.user);
            setUser(backendUser);
            return backendUser;
        } catch (error) {
            throw new Error(firebaseError(error, latestTranslations.current));
        }
    }, []);

    const startPhoneSignIn = useCallback(async (phoneNumber, containerId = "recaptcha-container") => {
        ensureConfigured();
        try {
            if (recaptchaRef.current) recaptchaRef.current.clear();
            recaptchaRef.current = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
            confirmationRef.current = await signInWithPhoneNumber(auth, phoneNumber.trim(), recaptchaRef.current);
            return true;
        } catch (error) {
            if (recaptchaRef.current) recaptchaRef.current.clear();
            recaptchaRef.current = null;
            throw new Error(firebaseError(error, latestTranslations.current));
        }
    }, []);

    const confirmPhoneCode = useCallback(async (code, profileName = "") => {
        if (!confirmationRef.current) throw new Error("Request an SMS code first.");
        try {
            const credential = await confirmationRef.current.confirm(code.trim());
            const backendUser = await exchangeFirebaseSession(credential.user, profileName);
            setUser(backendUser);
            confirmationRef.current = null;
            if (recaptchaRef.current) recaptchaRef.current.clear();
            recaptchaRef.current = null;
            return backendUser;
        } catch (error) {
            throw new Error(firebaseError(error, latestTranslations.current));
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await req("/auth/logout", { method: "POST", headers: { "X-CSRF-Token": csrf() } }).catch(() => {});
            if (auth) await signOut(auth);
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        authError,
        firebaseConfigured,
        login,
        register,
        loginGoogle,
        startPhoneSignIn,
        confirmPhoneCode,
        logout,
    }), [user, loading, authError, login, register, loginGoogle, startPhoneSignIn, confirmPhoneCode, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
