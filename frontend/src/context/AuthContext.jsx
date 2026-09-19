/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signInWithPopup,
    linkWithPopup,
    linkWithPhoneNumber,
    getAdditionalUserInfo,
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
const TAB_AUTH_MARKER = "ecofusion-tab-auth";

class ApiRequestError extends Error {
    constructor(message, status, data = {}) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
        this.code = data?.code || "";
        this.data = data;
    }
}

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
    if (!response.ok) {
        const detail = data?.detail;
        const message = typeof detail === "string"
            ? detail
            : detail?.message || "Request failed";
        throw new ApiRequestError(message, response.status, typeof detail === "object" ? detail : data);
    }
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
        "auth/credential-already-in-use": t.account.authErrors.credentialInUse || "Esta cuenta de Google ya está vinculada a otra cuenta.",
        "auth/provider-already-linked": t.account.authErrors.providerLinked || "Google ya está vinculado a esta cuenta.",
        "auth/requires-recent-login": t.account.authErrors.recentLogin || "Por seguridad, vuelve a iniciar sesión antes de cambiar el acceso de la cuenta.",
        "auth/code-expired": t.account.authErrors.codeExpired || "El código ha expirado. Solicita uno nuevo.",
        "auth/captcha-check-failed": t.account.authErrors.captchaFailed || "No pudimos completar la verificación de seguridad. Inténtalo de nuevo.",
        "auth/missing-phone-number": t.account.authErrors.invalidPhone || "Introduce un número de teléfono válido.",
    };
    return map[error?.code] || error?.message || t.account.authErrors.generic;
}

async function exchangeFirebaseSession(firebaseUser, profileName = "", mode = "login") {
    if (!firebaseUser) throw new Error("Authentication was not completed.");
    const idToken = await firebaseUser.getIdToken(true);
    const data = await req("/auth/firebase", {
        method: "POST",
        body: JSON.stringify({
            id_token: idToken,
            profile_name: profileName || "",
            mode,
        }),
    });
    return data.user;
}

export function AuthProvider({ children }) {
    const { language, translations: t } = useApp();
    const [user, setUser] = useState(null);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");
    useEffect(() => { if (auth) auth.languageCode = language; }, [language]);

    const latestTranslations = useRef(t);
    latestTranslations.current = t;
    const recaptchaRef = useRef(null);
    const confirmationRef = useRef(null);
    const exchangePromisesRef = useRef(new Map());
    const googleBusyRef = useRef(false);
    const googleFlowRef = useRef(false);
    const explicitAuthFlowRef = useRef(false);
    const googleAttemptRef = useRef(null);
    const registerGoogleAttemptRef = useRef(null);

    const exchangeOnce = useCallback((nextFirebaseUser, profileName = "", mode = "login") => {
        const uid = nextFirebaseUser?.uid;
        if (!uid) return Promise.reject(new Error("Authentication was not completed."));
        const key = `${uid}:${mode}`;
        const existing = exchangePromisesRef.current.get(key);
        if (existing) return existing;
        const promise = exchangeFirebaseSession(nextFirebaseUser, profileName, mode).finally(() => {
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

    const markTabAuthenticated = useCallback(() => {
        try {
            sessionStorage.setItem(TAB_AUTH_MARKER, "1");
        } catch {}
    }, []);

    const revokeServerSessionOnFreshTab = useCallback(async () => {
        try {
            const marker = sessionStorage.getItem(TAB_AUTH_MARKER);
            if (marker === "1") return;
            const current = await req("/auth/me");
            if (current?.authenticated) {
                await req("/auth/logout", { method: "POST", headers: { "X-CSRF-Token": csrf() } }).catch(() => {});
            }
            sessionStorage.removeItem(TAB_AUTH_MARKER);
        } catch {}
    }, []);

    useEffect(() => {
        if (!firebaseConfigured || !auth) {
            setLoading(false);
            return undefined;
        }
        let mounted = true;
        const finish = async (nextFirebaseUser) => {
            if (!mounted) return;

            // Explicit auth flows own the session exchange/state transition.
            // Firebase may emit intermediate events while a popup opens/closes;
            // never let those events clear a just-created account or start a
            // second server exchange.
            if (explicitAuthFlowRef.current || googleFlowRef.current) {
                if (nextFirebaseUser) setFirebaseUser(nextFirebaseUser);
                setLoading(false);
                return;
            }

            setFirebaseUser(nextFirebaseUser || null);
            if (!nextFirebaseUser) {
                // Ignore a transient null callback if Firebase has already restored
                // the current user; only clear the app session when it is truly gone.
                if (auth?.currentUser) {
                    setFirebaseUser(auth.currentUser);
                    setLoading(false);
                    return;
                }
                await revokeServerSessionOnFreshTab();
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const backendUser = await exchangeOnce(nextFirebaseUser);
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
        const unsubscribe = onAuthStateChanged(auth, finish);
        return () => { mounted = false; unsubscribe(); };
    }, [exchangeOnce, revokeServerSessionOnFreshTab]);

    const login = useCallback(async (email, password) => {
        ensureConfigured();
        setAuthError("");
        explicitAuthFlowRef.current = true;
        try {
            const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
            if (!credential.user.emailVerified) {
                await signOut(auth);
                throw new Error("Please verify your email before signing in.");
            }
            const backendUser = await exchangeOnce(credential.user);
            markTabAuthenticated();
            setUser(backendUser);
            return backendUser;
        } catch (error) {
            if (error?.code === "REGISTRATION_REQUIRED") {
                await signOut(auth).catch(() => {});
                setFirebaseUser(null);
                setUser(null);
                try {
                    sessionStorage.setItem("ecofusion-registration-email", error.data?.email || email.trim());
                } catch {}
                return { registrationRequired: true, email: error.data?.email || email.trim() };
            }
            throw new Error(firebaseError(error, latestTranslations.current));
        } finally {
            explicitAuthFlowRef.current = false;
        }
    }, [exchangeOnce, markTabAuthenticated]);

    const register = useCallback(async (name, email, password) => {
        ensureConfigured();
        setAuthError("");
        explicitAuthFlowRef.current = true;
        try {
            const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            await updateProfile(credential.user, { displayName: name.trim() });
            await exchangeOnce(credential.user, name.trim(), "register");
            await sendEmailVerification(credential.user);
            await signOut(auth);
            return { needsVerification: true, registrationCreated: true };
        } catch (error) {
            throw new Error(firebaseError(error, latestTranslations.current));
        } finally {
            explicitAuthFlowRef.current = false;
        }
    }, [exchangeOnce]);

    const loginGoogle = useCallback(async () => {
        ensureConfigured();
        if (googleAttemptRef.current) return googleAttemptRef.current;
        googleBusyRef.current = true;
        googleFlowRef.current = true;
        explicitAuthFlowRef.current = true;
        setAuthError("");
        const attempt = (async () => {
            try {
                sessionStorage.setItem("ecofusion-auth-return", window.location.pathname + window.location.search);
                const credential = await signInWithPopup(auth, googleProvider);
                const backendUser = await exchangeOnce(credential.user, "", "login");
                markTabAuthenticated();
                const additionalInfo = getAdditionalUserInfo(credential);
                setFirebaseUser(credential.user);
                setUser(backendUser);
                return { user: backendUser, isNewUser: Boolean(additionalInfo?.isNewUser) };
            } catch (error) {
                if (error?.code === "REGISTRATION_REQUIRED") {
                    const email = error.data?.email || auth?.currentUser?.email || "";
                    await signOut(auth).catch(() => {});
                    setFirebaseUser(null);
                    setUser(null);
                    try {
                        if (email) sessionStorage.setItem("ecofusion-registration-email", email);
                    } catch {}
                    return { registrationRequired: true, email };
                }
                await signOut(auth).catch(() => {});
                setFirebaseUser(null);
                setUser(null);
                throw new Error(firebaseError(error, latestTranslations.current));
            } finally {
                googleFlowRef.current = false;
                explicitAuthFlowRef.current = false;
                googleBusyRef.current = false;
                googleAttemptRef.current = null;
            }
        })();
        googleAttemptRef.current = attempt;
        return attempt;
    }, [exchangeOnce, markTabAuthenticated]);

    const registerGoogle = useCallback(async () => {
        ensureConfigured();
        if (registerGoogleAttemptRef.current) return registerGoogleAttemptRef.current;
        setAuthError("");
        explicitAuthFlowRef.current = true;
        googleFlowRef.current = true;

        const attempt = (async () => {
            try {
                const credential = await signInWithPopup(auth, googleProvider);
                const backendUser = await exchangeOnce(credential.user, credential.user.displayName || "", "register");
                markTabAuthenticated();
                setFirebaseUser(credential.user);
                setUser(backendUser);
                return { user: backendUser, isNewUser: true };
            } catch (error) {
                await signOut(auth).catch(() => {});
                setFirebaseUser(null);
                setUser(null);
                if (error?.code === "ACCOUNT_EXISTS") {
                    throw new Error(latestTranslations.current.account.authErrors.accountExists);
                }
                throw new Error(firebaseError(error, latestTranslations.current));
            } finally {
                googleFlowRef.current = false;
                explicitAuthFlowRef.current = false;
                registerGoogleAttemptRef.current = null;
            }
        })();

        registerGoogleAttemptRef.current = attempt;
        return attempt;
    }, [exchangeOnce, markTabAuthenticated]);

    const linkGoogle = useCallback(async () => {
        ensureConfigured();
        const current = auth?.currentUser;
        if (!current) throw new Error("Sign in before linking Google.");
        if (current.providerData.some((item) => item.providerId === "google.com")) return current;
        try {
            const result = await linkWithPopup(current, googleProvider);
            const backendUser = await exchangeOnce(result.user);
            setFirebaseUser(result.user);
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

    const startPhoneVerification = useCallback(async (phoneNumber, containerId = "recaptcha-container") => {
        ensureConfigured();
        const current = auth?.currentUser;
        if (!current) throw new Error("Authentication was not completed.");
        try {
            if (recaptchaRef.current) recaptchaRef.current.clear();
            recaptchaRef.current = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
            confirmationRef.current = await linkWithPhoneNumber(current, phoneNumber.trim(), recaptchaRef.current);
            return true;
        } catch (error) {
            if (recaptchaRef.current) recaptchaRef.current.clear();
            recaptchaRef.current = null;
            confirmationRef.current = null;
            throw new Error(firebaseError(error, latestTranslations.current));
        }
    }, []);

    const confirmPhoneVerification = useCallback(async (code) => {
        if (!confirmationRef.current) throw new Error("Request an SMS code first.");
        explicitAuthFlowRef.current = true;
        try {
            const credential = await confirmationRef.current.confirm(code.trim());
            const idToken = await credential.user.getIdToken(true);
            const data = await req("/auth/phone/verify", {
                method: "POST",
                headers: { "X-CSRF-Token": csrf() },
                body: JSON.stringify({ id_token: idToken }),
            });
            markTabAuthenticated();
            setFirebaseUser(credential.user);
            setUser(data.user);
            confirmationRef.current = null;
            if (recaptchaRef.current) recaptchaRef.current.clear();
            recaptchaRef.current = null;
            return data.user;
        } catch (error) {
            throw new Error(error instanceof ApiRequestError ? error.message : firebaseError(error, latestTranslations.current));
        } finally {
            explicitAuthFlowRef.current = false;
        }
    }, [markTabAuthenticated]);

    const confirmPhoneCode = useCallback(async (code, profileName = "", mode = "login") => {
        if (!confirmationRef.current) throw new Error("Request an SMS code first.");
        explicitAuthFlowRef.current = true;
        try {
            const credential = await confirmationRef.current.confirm(code.trim());
            let backendUser;
            try {
                backendUser = await exchangeOnce(credential.user, profileName, mode);
            } catch (error) {
                if (mode === "login" && error?.code === "REGISTRATION_REQUIRED") {
                    await signOut(auth).catch(() => {});
                    setFirebaseUser(null);
                    setUser(null);
                    return { registrationRequired: true, email: error.data?.email || "" };
                }
                throw error;
            }
            markTabAuthenticated();
            setFirebaseUser(credential.user);
            setUser(backendUser);
            confirmationRef.current = null;
            if (recaptchaRef.current) recaptchaRef.current.clear();
            recaptchaRef.current = null;
            return backendUser;
        } catch (error) {
            throw new Error(firebaseError(error, latestTranslations.current));
        } finally {
            explicitAuthFlowRef.current = false;
        }
    }, [exchangeOnce, markTabAuthenticated]);

    const refreshSession = useCallback(async () => {
        try {
            const data = await req("/auth/me");
            setUser(data.user || null);
            return data.user || null;
        } catch {
            return null;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await req("/auth/logout", { method: "POST", headers: { "X-CSRF-Token": csrf() } }).catch(() => {});
            if (auth) await signOut(auth);
        } finally {
            try { sessionStorage.removeItem(TAB_AUTH_MARKER); } catch {}
            setUser(null);
            setFirebaseUser(null);
        }
    }, []);

    const onboarding = Boolean(user?.role === "client" && user?.registrationRequired);
    const value = useMemo(() => ({
        user,
        onboarding,
        firebaseUser,
        loading,
        authError,
        firebaseConfigured,
        login,
        register,
        loginGoogle,
        registerGoogle,
        linkGoogle,
        startPhoneSignIn,
        confirmPhoneCode,
        startPhoneVerification,
        confirmPhoneVerification,
        refreshSession,
        logout,
    }), [user, onboarding, firebaseUser, loading, authError, login, register, loginGoogle, registerGoogle, linkGoogle, startPhoneSignIn, confirmPhoneCode, startPhoneVerification, confirmPhoneVerification, refreshSession, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
