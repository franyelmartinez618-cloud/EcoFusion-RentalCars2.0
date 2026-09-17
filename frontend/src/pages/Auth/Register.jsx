import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { Link, navigate } from "../../utils/router";
import "../SimplePages.css";

export default function Register(){
    const { translations:t } = useApp();
    const {user, register, loginGoogle, startPhoneSignIn, confirmPhoneCode, authError, firebaseConfigured} = useAuth();
    const [method,setMethod]=useState("email");
    useEffect(() => { if (user) navigate(user.role === "admin" ? "/admin" : "/account"); }, [user]); const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [phone,setPhone]=useState(""); const [code,setCode]=useState(""); const [codeSent,setCodeSent]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
    const submitEmail=async e=>{e.preventDefault();setError("");setMessage("");setBusy(true);try{await register(name,email,password);setMessage(t.account.emailVerificationNotice);}catch(err){setError(err.message)}finally{setBusy(false)}};
    const submitPhone=async e=>{e.preventDefault();setError("");setMessage("");setBusy(true);try{if(!codeSent){await startPhoneSignIn(phone);setCodeSent(true)}else{const u=await confirmPhoneCode(code,name);if(u.role!=="client"){setError(t.account.clientOnly);return}navigate("/account")}}catch(err){setError(err.message)}finally{setBusy(false)}};
    const google=async()=>{
        if(busy) return; setError(""); setMessage(""); setBusy(true);
        try {
            const result=await loginGoogle();
            if(!result?.user) return;
            if(result.user.role!=="client") throw new Error(t.account.clientOnly);
            if(result.isNewUser) setMessage(t.account.googleWelcomeNotice);
            navigate("/account");
        } catch(err) { setError(err.message); } finally { setBusy(false); }
    };
    return <PageShell><section className="page-section"><div className="container" style={{maxWidth:700}}><article className="info-card auth-modern-card">
        <span className="page-hero__eyebrow">{t.account.createAccount}</span><h1>{t.account.createAccount}</h1><p>{t.account.registerDescription}</p>{(!firebaseConfigured || authError) && <div className="auth-error auth-error--setup">{authError || "Firebase Authentication is not configured. Add your Firebase Web App settings to frontend/.env.local before using Google or SMS authentication."}</div>}
        <div className="auth-provider-grid"><button type="button" className="auth-provider auth-provider--google" disabled={busy} onClick={google}><span className="google-mark" aria-hidden="true"><svg viewBox="0 0 24 24" role="img"><path d="M21.35 12.2c0-.67-.06-1.31-.18-1.92H12v3.63h5.24a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.91-4.18 2.91-7.07Z" fill="#4285F4"/><path d="M12 21.8c2.64 0 4.85-.87 6.46-2.35l-3.14-2.43c-.87.58-1.97.92-3.32.92-2.55 0-4.71-1.72-5.49-4.04H3.27v2.5A9.75 9.75 0 0 0 12 21.8Z" fill="#34A853"/><path d="M6.51 13.9A5.86 5.86 0 0 1 6.2 12c0-.66.11-1.3.31-1.9V7.6H3.27A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.02 4.4l3.24-2.5Z" fill="#FBBC05"/><path d="M12 6.06c1.45 0 2.76.5 3.79 1.49l2.84-2.84C16.85 3.1 14.64 2.2 12 2.2A9.75 9.75 0 0 0 3.27 7.6l3.24 2.5C7.29 7.78 9.45 6.06 12 6.06Z" fill="#EA4335"/></svg></span> {t.account.continueGoogle}</button><button type="button" className={`auth-provider ${method === "phone" ? "is-active" : ""}`} disabled={busy} onClick={()=>{setMethod("phone");setError("")}}><span>⌕</span> {t.account.continuePhone}</button></div>
        <div className="auth-tabs"><button type="button" className={method === "email"?"is-active":""} onClick={()=>setMethod("email")}>{t.account.email}</button><button type="button" className={method === "phone"?"is-active":""} onClick={()=>setMethod("phone")}>{t.account.phone}</button></div>
        {method === "email" ? <form className="simple-form" onSubmit={submitEmail}><label>{t.account.fullName}<input value={name} onChange={e=>setName(e.target.value)} required autoComplete="name" /></label><label>{t.account.email}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" /></label><label>{t.account.password}<input type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="new-password" /></label>{error&&<p className="auth-error">{error}</p>}{message&&<p className="auth-success">{message}</p>}<button type="submit" disabled={busy}>{busy?t.account.creating:t.account.createAccount}</button></form> : <form className="simple-form" onSubmit={submitPhone}><label>{t.account.fullName}<input value={name} onChange={e=>setName(e.target.value)} required autoComplete="name" /></label><label>{t.account.phone}<input type="tel" placeholder="+1 555 123 4567" value={phone} onChange={e=>setPhone(e.target.value)} required autoComplete="tel" /></label>{codeSent&&<label>{t.account.verificationCode}<input inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value)} required autoComplete="one-time-code" /></label>}<div id="recaptcha-container" />{error&&<p className="auth-error">{error}</p>}<button type="submit" disabled={busy}>{busy?(codeSent?t.account.verifying:t.account.sending):(codeSent?t.account.verifyCreate:t.account.sendCode)}</button></form>}
        <p style={{marginTop:20}}>{t.account.alreadyAccount} <Link to="/sign-in" className="text-link">{t.account.signIn}</Link></p>
    </article></div></section></PageShell>
}
