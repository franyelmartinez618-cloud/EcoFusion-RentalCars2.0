import { useState } from "react";
import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { Link, navigate } from "../../utils/router";
import "../SimplePages.css";

function GoogleMark() {
    return (
        <span className="google-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
                <path d="M21.35 12.2c0-.67-.06-1.31-.18-1.92H12v3.63h5.24a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.91-4.18 2.91-7.07Z" fill="#4285F4"/>
                <path d="M12 21.8c2.64 0 4.85-.87 6.46-2.35l-3.14-2.43c-.87.58-1.97.92-3.32.92-2.55 0-4.71-1.72-5.49-4.04H3.27v2.5A9.75 9.75 0 0 0 12 21.8Z" fill="#34A853"/>
                <path d="M6.51 13.9A5.86 5.86 0 0 1 6.2 12c0-.66.11-1.3.31-1.9V7.6H3.27A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.02 4.4l3.24-2.5Z" fill="#FBBC05"/>
                <path d="M12 6.06c1.45 0 2.76.5 3.79 1.49l2.84-2.84C16.85 3.1 14.64 2.2 12 2.2A9.75 9.75 0 0 0 3.27 7.6l3.24 2.5C7.29 7.78 9.45 6.06 12 6.06Z" fill="#EA4335"/>
            </svg>
        </span>
    );
}

export default function SignIn() {
    const { translations: t } = useApp();
    const { login, loginGoogle, startPhoneSignIn, confirmPhoneCode, authError, firebaseConfigured } = useAuth();
    const [method, setMethod] = useState("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const finish = (result) => {
        if (result?.registrationRequired) {
            if (result.email) sessionStorage.setItem("ecofusion-registration-email", result.email);
            navigate("/register");
            return;
        }
        const account = result?.user || result;
        if (!account) return;
        if (account.role !== "client") throw new Error(t.account.clientOnly);
        navigate(account.registrationRequired ? "/complete-account" : "/account");
    };

    const run = async (fn) => {
        setError("");
        setBusy(true);
        try {
            finish(await fn());
        } catch (err) {
            setError(err.message || t.account.authErrors.generic);
        } finally {
            setBusy(false);
        }
    };

    const handleGoogle = async () => {
        setError("");
        setBusy(true);
        try {
            finish(await loginGoogle());
        } catch (err) {
            setError(err.message || t.account.authErrors.generic);
        } finally {
            setBusy(false);
        }
    };

    return (
        <PageShell>
            <section className="page-section">
                <div className="container" style={{ maxWidth: 700 }}>
                    <article className="info-card auth-modern-card auth-entry-card">
                        <span className="page-hero__eyebrow">{t.account.authEyebrow}</span>
                        <h1>{t.account.signInTitle}</h1>
                        <p>{t.account.signInDescription}</p>
                        {(!firebaseConfigured || authError) && (
                            <div className="auth-error auth-error--setup">
                                {authError || t.account.firebaseSetupError}
                            </div>
                        )}
                        <div className="auth-provider-grid">
                            <button type="button" className="auth-provider auth-provider--google" disabled={busy} onClick={handleGoogle}>
                                <GoogleMark />
                                {t.account.continueGoogle}
                            </button>
                            <button type="button" className={`auth-provider ${method === "phone" ? "is-active" : ""}`} disabled={busy} onClick={() => { setMethod("phone"); setError(""); }}>
                                <span className="auth-provider-icon" aria-hidden="true">⌕</span>
                                {t.account.continuePhone}
                            </button>
                        </div>
                        <div className="auth-divider"><span>{t.common.or}</span></div>
                        <div className="auth-tabs">
                            <button type="button" className={method === "email" ? "is-active" : ""} onClick={() => setMethod("email")}>{t.account.email}</button>
                            <button type="button" className={method === "phone" ? "is-active" : ""} onClick={() => setMethod("phone")}>{t.account.phone}</button>
                        </div>
                        {method === "email" ? (
                            <form className="simple-form" onSubmit={(event) => { event.preventDefault(); run(() => login(email, password)); }}>
                                <label>{t.account.email}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email"/></label>
                                <label>{t.account.password}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password"/></label>
                                {error && <p className="auth-error">{error}</p>}
                                <button type="submit" disabled={busy}>{busy ? t.account.verifying : t.account.signIn}</button>
                            </form>
                        ) : (
                            <form className="simple-form" onSubmit={async (event) => {
                                event.preventDefault();
                                setError("");
                                setBusy(true);
                                try {
                                    if (!codeSent) {
                                        await startPhoneSignIn(phone);
                                        setCodeSent(true);
                                    } else {
                                        finish(await confirmPhoneCode(code));
                                    }
                                } catch (err) {
                                    setError(err.message || t.account.authErrors.generic);
                                } finally {
                                    setBusy(false);
                                }
                            }}>
                                <label>{t.account.phone}<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required autoComplete="tel"/></label>
                                {codeSent && <label>{t.account.verificationCode}<input inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} required autoComplete="one-time-code"/></label>}
                                <div id="recaptcha-container"/>
                                {error && <p className="auth-error">{error}</p>}
                                <button type="submit" disabled={busy}>{busy ? (codeSent ? t.account.verifying : t.account.sending) : (codeSent ? t.account.verifyCode : t.account.sendCode)}</button>
                            </form>
                        )}
                        <p className="auth-security-note">{t.account.securityNote}</p>
                        <div className="auth-entry-links">
                            <span>{t.account.noAccount}</span>
                            <Link to="/register" className="text-link">{t.account.createAccount}</Link>
                        </div>
                    </article>
                </div>
            </section>
        </PageShell>
    );
}
