import { useEffect, useState } from "react";
import { apiClient } from "../services/api";
import { useApp } from "../context/AppContext";

export default function IdentityVerification() {
  const { translations: t } = useApp();
  const [status, setStatus] = useState("not_started");
  const [configured, setConfigured] = useState(false);
  const [identityUrl, setIdentityUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    try {
      const data = await apiClient.identityStatus();
      setStatus(data.status || "not_started");
      setConfigured(Boolean(data.configured));
    } catch (err) {
      setError(err.message || "No se pudo consultar la verificación de identidad.");
    }
  };

  useEffect(() => {
    let active = true;
    refresh().catch(() => {});
    const timer = window.setInterval(() => {
      if (active) refresh().catch(() => {});
    }, 8000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const start = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await apiClient.identityStart();
      setStatus(data.status || "pending");
      setIdentityUrl(data.url || "");
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        setMessage("Se abrió la verificación de identidad.");
      }
    } catch (err) {
      setError(err.message || "No se pudo iniciar la verificación.");
    } finally {
      setBusy(false);
    }
  };

  const label = t.identity?.statuses?.[status] || status;
  const verified = status === "verified";

  return <section className="account-panel identity-panel">
    <div className="account-panel__header">
      <div>
        <span className="account-kicker">{t.identity.kicker}</span>
        <h2>{t.identity.title}</h2>
        <p>{t.identity.description}</p>
      </div>
      <span className={`account-status account-status--${status.replace(/_/g, "-")}`}>{label}</span>
    </div>

    <div className="identity-checklist">
      <div><span>✓</span><strong>{t.identity.document}</strong><small>{t.identity.documentHelp}</small></div>
      <div><span>✓</span><strong>{t.identity.selfie}</strong><small>{t.identity.selfieHelp}</small></div>
      <div><span>✓</span><strong>{t.identity.liveness}</strong><small>{t.identity.livenessHelp}</small></div>
    </div>

    {!configured && !verified && (
      <p className="identity-privacy">La verificación de identidad es opcional por ahora y todavía no está configurada.</p>
    )}

    {error && <p className="auth-error">{error}</p>}
    {message && <p className="auth-success">{message}</p>}

    <button type="button" className="button button--primary" onClick={start} disabled={busy || verified || !configured}>
      {verified ? t.identity.verified : busy ? t.identity.starting : status === "pending" || status === "review" ? t.identity.resume : t.identity.start}
    </button>

    {identityUrl && <a className="text-link identity-reopen-link" href={identityUrl} target="_blank" rel="noreferrer">Abrir verificación</a>}
    <p className="identity-privacy">{t.identity.privacy}</p>
  </section>;
}
