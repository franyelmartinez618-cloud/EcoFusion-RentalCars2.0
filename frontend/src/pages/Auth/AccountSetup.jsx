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
    if(!privacy || !terms){setError("Debes aceptar la política de privacidad y los términos para continuar.");return;}
    if(name.trim().length<2){setError("Escribe tu nombre completo.");return;}
    if(phone.trim().length<7){setError("Añade un teléfono válido para tu perfil de alquiler.");return;}
    setBusy(true);
    try {
      await apiClient.updateProfile(name,phone);
      await apiClient.consent({privacy_version:"2026-09-16",terms_version:"2026-09-16",marketing_opt_in:marketing});
      setMessage("Cuenta completada. Ya puedes continuar con tu reserva.");
      setTimeout(()=>navigate("/account"),500);
    } catch(err){setError(err.message || "No fue posible completar la cuenta.");}
    finally{setBusy(false);}
  };
  return <PageShell><section className="page-section"><div className="container" style={{maxWidth:820}}><article className="info-card account-setup-card">
    <span className="page-hero__eyebrow">CUENTA ECOFUSION</span><h1>Completa tu cuenta</h1>
    <p>Antes de utilizar funciones de alquiler, necesitamos confirmar tus datos básicos y registrar tu aceptación de las condiciones de uso.</p>
    <form className="simple-form" onSubmit={submit}>
      <label>Nombre completo<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required /></label>
      <label>Correo electrónico<input value={user?.email || firebaseUser?.email || ""} readOnly /></label>
      <label>Teléfono<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel" required /></label>
      <label className="consent-check"><input type="checkbox" checked={privacy} onChange={e=>setPrivacy(e.target.checked)} /> <span>Acepto la <Link to="/privacy" className="text-link">Política de privacidad</Link> y el tratamiento de mis datos conforme a la información allí indicada.</span></label>
      <label className="consent-check"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} /> <span>Acepto los <Link to="/terms" className="text-link">Términos y condiciones</Link> del servicio.</span></label>
      <label className="consent-check consent-check--optional"><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)} /> <span>Quiero recibir comunicaciones comerciales y novedades. (Opcional)</span></label>
      {error&&<p className="auth-error">{error}</p>}{message&&<p className="auth-success">{message}</p>}
      <button type="submit" disabled={busy}>{busy?"Guardando…":"Aceptar y continuar"}</button>
    </form>
    <div className="account-setup-security"><strong>Protección de la cuenta</strong><span>El acceso se mantiene detrás de Firebase Authentication y una sesión del servidor. Para acciones sensibles podremos pedir una nueva autenticación o verificación adicional.</span></div>
  </article></div></section></PageShell>;
}
