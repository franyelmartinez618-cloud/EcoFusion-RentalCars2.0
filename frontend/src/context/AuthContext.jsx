/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signInWithPopup,
    linkWithPopup,
    getAdditionalUserInfo,
    signOut,
    updateProfile,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";
import { auth, firebaseConfigured, googleProvider, missing } from "../services/firebase";
import { useApp } from "./AppContext";

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

async function req(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...options.headers },
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
        "auth/credential-already-in-use": t.account.authErrors.credentialInUse || "That Google account is already linked to another account.",
        "auth/provider-already-linked": t.account.authErrors.providerLinked || "This Google account is already linked.",
        "auth/requires-recent-login": t.account.authErrors.recentLogin || "For security, sign in again before changing account access.",
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
    const exchangePromisesRef = useRef(new Map());
    const googleBusyRef = useRef(false);


    const exchangeOnce = useCallback((firebaseUser, profileName = "") => {
        const key = firebaseUser?.uid;
        if (!key) return Promise.reject(new Error("Authentication was not completed."));
        const existing = exchangePromisesRef.current.get(key);
        if (existing) return existing;
        const promise = exchangeFirebaseSession(firebaseUser, profileName).finally(() => {
            exchangePromisesRef.current.delete(key);
        });
        exchangePromisesRef.current.set(key, promise);
        return promise;
    }, []);

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
                const backendUser = await exchangeOnce(firebaseUser);
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
    }, [exchangeOnce]);

    const login = useCallback(async (email, password) => {
        ensureConfigured();
        setAuthError("");
        try {
            const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
            if (!credential.user.emailVerified) {
                await signOut(auth);
                throw new Error("Please verify your email before signing in.");
            }
            const backendUser = await exchangeOnce(credential.user);
            setUser(backendUser);
            return backendUser;
        } catch (error) {
            throw new Error(firebaseError(error, latestTranslations.current));
        }
    }, [exchangeOnce]);

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
    }, [exchangeOnce]);

    const loginGoogle = useCallback(async () => {
        ensureConfigured();
        if (googleBusyRef.current) return null;
        googleBusyRef.current = true;
        setAuthError("");
        try {
            const credential = await signInWithPopup(auth, googleProvider);
            const backendUser = await exchangeOnce(credential.user);
            const additionalInfo = getAdditionalUserInfo(credential);
            setUser(backendUser);
            return {
                user: backendUser,
                isNewUser: Boolean(additionalInfo?.isNewUser),
            };
        } catch (error) {
            throw new Error(firebaseError(error, latestTranslations.current));
        } finally {
            googleBusyRef.current = false;
        }
    }, [exchangeOnce]);

    const linkGoogle = useCallback(async () => {
        ensureConfigured();
        const current = auth?.currentUser;
        if (!current) throw new Error("Sign in before linking Google.");
        const linked = current.providerData.some((item) => item.providerId === "google.com");
        if (linked) return current;
        try {
            const result = await linkWithPopup(current, googleProvider);
            const backendUser = await exchangeOnce(result.user);
            setUser(backendUser);
            return result.user;
        } catch (error) {
            throw new Error(firebaseError(error, latestTranslations.current));
        }
    }, [exchangeOnce]);

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
            const backendUser = await exchangeOnce(credential.user, profileName);
            setUser(backendUser);
            confirmationRef.current = null;
            if (recaptchaRef.current) recaptchaRef.current.clear();
            recaptchaRef.current = null;
            return backendUser;
        } catch (error) {
            throw new Error(firebaseError(error, latestTranslations.current));
        }
    }, [exchangeOnce]);

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
        firebaseUser: auth?.currentUser || null,
        loading,
        authError,
        firebaseConfigured,
        login,
        register,
        loginGoogle,
        linkGoogle,
        startPhoneSignIn,
        confirmPhoneCode,
        logout,
    }), [user, loading, authError, login, register, loginGoogle, linkGoogle, startPhoneSignIn, confirmPhoneCode, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
