import { useState } from "react";
import PageShell from "../../components/PageShell/PageShell";
import { Link, navigate } from "../../utils/router";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../services/api";
import { useApp } from "../../context/AppContext";
import "../SimplePages.css";
import "./AccountSetup.css";

export default function AccountSetup() {
  const { user, firebaseUser } = useAuth();
  const { translations: t } = useApp();
  const [name,setName]=useState(user?.name || firebaseUser?.displayName || "");
  const [phone,setPhone]=useState(user?.phone || "");
  const [privacy,setPrivacy]=useState(false);
  const [terms,setTerms]=useState(false);
  const [marketing,setMarketing]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const submit=async(e)=>{
    e.preventDefault(); setError(""); setMessage("");
    if(!privacy || !terms){setError(t.homeUi.setupInvalidConsent);return;}
    if(name.trim().length<2){setError(t.homeUi.setupNameError);return;}
    if(phone.trim().length<7){setError(t.homeUi.setupPhoneError);return;}
    setBusy(true);
    try {
      await apiClient.updateProfile(name,phone);
      await apiClient.consent({privacy_version:"2026-09-16",terms_version:"2026-09-16",marketing_opt_in:marketing});
      setMessage(t.homeUi.setupSuccess);
      setTimeout(()=>navigate("/account"),500);
    } catch(err){setError(err.message || t.homeUi.setupFailure);}
    finally{setBusy(false);}
  };
  return <PageShell><section className="page-section"><div className="container" style={{maxWidth:820}}><article className="info-card account-setup-card">
    <span className="page-hero__eyebrow">{t.homeUi.setupEyebrow}</span><h1>{t.homeUi.setupTitle}</h1>
    <p>{t.homeUi.setupDescription}</p>
    <form className="simple-form" onSubmit={submit}>
      <label>{t.homeUi.setupFullName}<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required /></label>
      <label>{t.homeUi.emailLabel}<input value={user?.email || firebaseUser?.email || ""} readOnly /></label>
      <label>{t.homeUi.phoneLabel}<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel" required /></label>
      <label className="consent-check"><input type="checkbox" checked={privacy} onChange={e=>setPrivacy(e.target.checked)} /> <span>Acepto la <Link to="/privacy" className="text-link">{t.account.privacyPolicy}</Link> y el tratamiento de mis datos conforme a la información allí indicada.</span></label>
      <label className="consent-check"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} /> <span>Acepto los <Link to="/terms" className="text-link">{t.account.termsAndConditions}</Link> del servicio.</span></label>
      <label className="consent-check consent-check--optional"><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)} /> <span>{t.homeUi.setupMarketing}</span></label>
      {error&&<p className="auth-error">{error}</p>}{message&&<p className="auth-success">{message}</p>}
      <button type="submit" disabled={busy}>{busy?"Guardando…":t.homeUi.saveAccount}</button>
    </form>
    <div className="account-setup-security"><strong>{t.homeUi.setupSecurityTitle}</strong><span>{t.homeUi.setupSecurityText}</span></div>
  </article></div></section></PageShell>;
}
