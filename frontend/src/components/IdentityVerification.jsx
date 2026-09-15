import { useEffect, useState } from "react";
import { identityApi } from "../services/identity";
import { useApp } from "../context/AppContext";

export default function IdentityVerification() {
  const { translations: t } = useApp();
  const [status, setStatus] = useState("not_started");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const data = await identityApi.status();
      setStatus(data.status || "not_started");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 8000);
    return () => window.clearInterval(timer);
  }, []);

  const start = async () => {
    setBusy(true); setError("");
    try {
      const data = await identityApi.start();
      setStatus(data.status || "pending");
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const label = t.identity.statuses[status] || t.identity.statuses.not_started;
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
    {error && <p className="auth-error">{error}</p>}
    <button type="button" className="button button--primary" onClick={start} disabled={busy || verified}>
      {verified ? t.identity.verified : busy ? t.identity.starting : status === "pending" || status === "review" ? t.identity.resume : t.identity.start}
    </button>
    <p className="identity-privacy">{t.identity.privacy}</p>
  </section>;
}
