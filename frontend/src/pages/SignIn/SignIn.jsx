import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { Link, navigate } from "../../utils/router";
import "../SimplePages.css";

export default function SignIn() {
    const { translations: t } = useApp();
    const { user, login, loginGoogle, startPhoneSignIn, confirmPhoneCode, authError, firebaseConfigured } = useAuth();
    const [method, setMethod] = useState("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const go = async (fn) => {
        setError(""); setBusy(true);
        try {
            const user = await fn();
            if (!user) return; // redirect-based OAuth continues after Google returns to the app
            if (user.role !== "client") { setError(t.account.clientOnly); return; }
            navigate("/account");
        } catch (err) { setError(err.message); }
        finally { setBusy(false); }
    };

    const submitEmail = (e) => { e.preventDefault(); return go(() => login(email, password)); };
    const submitPhone = async (e) => {
        e.preventDefault(); setError(""); setBusy(true);
        try {
            if (!codeSent) { await startPhoneSignIn(phone); setCodeSent(true); }
            else { const user = await confirmPhoneCode(code); if (user.role !== "client") { await go(async()=>user); return; } navigate("/account"); }
        } catch (err) { setError(err.message); }
        finally { setBusy(false); }
    };

    useEffect(() => { if (user) navigate(user.role === "admin" ? "/admin" : "/account"); }, [user]);
    return <PageShell><section className="page-section"><div className="container" style={{maxWidth:700}}><article className="info-card auth-modern-card">
        <span className="page-hero__eyebrow">{t.account.signInTitle}</span>
        <h1>{t.account.signInTitle}</h1>
        <p>{t.account.signInDescription}</p>{(!firebaseConfigured || authError) && <div className="auth-error auth-error--setup">{authError || "Firebase Authentication is not configured. Add your Firebase Web App settings to frontend/.env.local before using Google or SMS authentication."}</div>}
        <div className="auth-provider-grid">
            <button type="button" className="auth-provider auth-provider--google" disabled={busy} onClick={() => go(loginGoogle)}><span>G</span> {t.account.continueGoogle}</button>
            <button type="button" className={`auth-provider ${method === "phone" ? "is-active" : ""}`} disabled={busy} onClick={() => { setMethod("phone"); setError(""); }}><span>⌕</span> {t.account.continuePhone}</button>
        </div>
        <div className="auth-divider"><span>{t.common.or} {t.account.email}</span></div>
        <div className="auth-tabs"><button type="button" className={method === "email" ? "is-active" : ""} onClick={() => {setMethod("email");setError("")}}>{t.account.email}</button><button type="button" className={method === "phone" ? "is-active" : ""} onClick={() => {setMethod("phone");setError("")}}>{t.account.phone}</button></div>
        {method === "email" ? <form className="simple-form" onSubmit={submitEmail}><label>{t.account.email}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" /></label><label>{t.account.password}<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" /></label>{error&&<p className="auth-error">{error}</p>}<button type="submit" disabled={busy}>{busy?t.account.verifying:t.account.signIn}</button></form>
        : <form className="simple-form" onSubmit={submitPhone}><label>{t.account.phone}<input type="tel" placeholder="+1 555 123 4567" value={phone} onChange={e=>setPhone(e.target.value)} required autoComplete="tel" /></label>{codeSent&&<label>{t.account.verificationCode}<input inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value)} required autoComplete="one-time-code" /></label>}<div id="recaptcha-container" />{error&&<p className="auth-error">{error}</p>}<button type="submit" disabled={busy}>{busy?(codeSent?t.account.verifying:t.account.sending):(codeSent?t.account.verifyCode:t.account.sendCode)}</button></form>}
        <p className="auth-helper">{t.account.authHelper}</p>
        <p style={{marginTop:18}}>{t.account.noAccount} <Link to="/register" className="text-link">{t.account.createAccount}</Link></p>
    </article></div></section></PageShell>;
}
