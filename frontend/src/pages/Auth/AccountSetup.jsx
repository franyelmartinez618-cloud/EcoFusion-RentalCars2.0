import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell/PageShell";
import { Link, navigate } from "../../utils/router";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../services/api";
import { useApp } from "../../context/AppContext";
import "../SimplePages.css";
import "./AccountSetup.css";

export default function AccountSetup() {
  const { user, firebaseUser, refreshSession } = useAuth();
  const { translations: t } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || firebaseUser?.displayName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [privacy, setPrivacy] = useState(false);
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [identity, setIdentity] = useState(user?.identityStatus || "not_started");
  const [identityUrl, setIdentityUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setName(user?.name || firebaseUser?.displayName || "");
    setPhone(user?.phone || "");
    setIdentity(user?.identityStatus || "not_started");
  }, [user, firebaseUser]);

  const saveProfile = async () => {
    setError("");
    if (name.trim().length < 2) {
      setError(t.homeUi.setupNameError);
      return false;
    }
    if (phone.trim().length < 7) {
      setError(t.homeUi.setupPhoneError);
      return false;
    }
    await apiClient.updateProfile(name, phone);
    await refreshSession();
    return true;
  };

  const saveConsent = async () => {
    if (!privacy || !terms) {
      setError(t.homeUi.setupInvalidConsent);
      return false;
    }
    await apiClient.consent({
      privacy_version: "2026-09-16",
      terms_version: "2026-09-16",
      marketing_opt_in: marketing,
    });
    await refreshSession();
    return true;
  };

  const nextFromProfile = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (await saveProfile()) setStep(2);
    } catch (err) {
      setError(err.message || t.homeUi.setupFailure);
    } finally {
      setBusy(false);
    }
  };

  const nextFromConsent = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (await saveConsent()) setStep(3);
    } catch (err) {
      setError(err.message || t.homeUi.setupFailure);
    } finally {
      setBusy(false);
    }
  };

  const startIdentity = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await apiClient.identityStart();
      setIdentity(result.status || "pending");
      setIdentityUrl(result.url || "");
      if (result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
        setMessage(t.homeUi.identityOpened);
      }
    } catch (err) {
      setError(err.message || t.homeUi.identityStartFailure);
    } finally {
      setBusy(false);
    }
  };

  const checkIdentity = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const status = await apiClient.identityStatus();
      setIdentity(status.status || "not_started");
      const account = await refreshSession();
      if (account?.registrationStatus === "active") {
        setMessage(t.homeUi.setupSuccess);
        setTimeout(() => navigate("/account"), 450);
      } else if (status.status === "verified") {
        setMessage(t.homeUi.identityVerifiedPending);
      } else {
        setMessage(t.homeUi.identityPending);
      }
    } catch (err) {
      setError(err.message || t.homeUi.identityCheckFailure);
    } finally {
      setBusy(false);
    }
  };

  const finishLater = async () => {
    const account = await refreshSession();
    if (account?.registrationStatus === "active") navigate("/account");
    else setMessage(t.homeUi.identityRequiredBeforeBooking);
  };

  return (
    <PageShell>
      <section className="page-section">
        <div className="container" style={{ maxWidth: 900 }}>
          <article className="info-card account-setup-card account-setup-card--pro">
            <div className="account-setup-heading">
              <span className="page-hero__eyebrow">{t.homeUi.setupEyebrow}</span>
              <h1>{t.homeUi.setupTitle}</h1>
              <p>{t.homeUi.setupDescription}</p>
            </div>

            <div className="registration-progress" aria-label={t.homeUi.registrationProgressLabel}>
              {[1, 2, 3].map((item) => (
                <div key={item} className={`registration-progress__item ${step === item ? "is-active" : ""} ${step > item ? "is-done" : ""}`}>
                  <span>{item}</span>
                  <strong>{[t.homeUi.registrationStepProfile, t.homeUi.registrationStepConsent, t.homeUi.registrationStepIdentity][item - 1]}</strong>
                </div>
              ))}
            </div>

            {step === 1 && (
              <section className="registration-panel">
                <span className="registration-panel__kicker">01</span>
                <h2>{t.homeUi.registrationStepProfile}</h2>
                <p>{t.homeUi.registrationProfileDescription}</p>
                <form className="simple-form" onSubmit={(e) => { e.preventDefault(); nextFromProfile(); }}>
                  <label>{t.homeUi.setupFullName}<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required /></label>
                  <label>{t.homeUi.emailLabel}<input value={user?.email || firebaseUser?.email || ""} readOnly /></label>
                  <label>{t.homeUi.phoneLabel}<input type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" required /></label>
                  {error && <p className="auth-error">{error}</p>}
                  <button type="submit" disabled={busy}>{busy ? t.homeUi.savingProfile : t.homeUi.continueRegistration}</button>
                </form>
              </section>
            )}

            {step === 2 && (
              <section className="registration-panel">
                <span className="registration-panel__kicker">02</span>
                <h2>{t.homeUi.registrationStepConsent}</h2>
                <p>{t.homeUi.registrationConsentDescription}</p>
                <div className="registration-profile-summary">
                  <strong>{name}</strong>
                  <span>{user?.email || firebaseUser?.email}</span>
                  <span>{phone}</span>
                </div>
                <div className="registration-consents">
                  <label className="consent-check"><input type="checkbox" checked={privacy} onChange={e=>setPrivacy(e.target.checked)} /> <span>{t.homeUi.setupPrivacy} <Link to="/privacy" className="text-link">{t.account.privacyPolicy}</Link></span></label>
                  <label className="consent-check"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} /> <span>{t.homeUi.setupTerms} <Link to="/terms" className="text-link">{t.account.termsAndConditions}</Link></span></label>
                  <label className="consent-check consent-check--optional"><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)} /> <span>{t.homeUi.setupMarketing}</span></label>
                </div>
                {error && <p className="auth-error">{error}</p>}
                <div className="registration-actions">
                  <button type="button" className="button-secondary" onClick={() => setStep(1)} disabled={busy}>{t.homeUi.backRegistration}</button>
                  <button type="button" onClick={nextFromConsent} disabled={busy}>{busy ? t.homeUi.savingConsent : t.homeUi.continueRegistration}</button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="registration-panel">
                <span className="registration-panel__kicker">03</span>
                <h2>{t.homeUi.registrationStepIdentity}</h2>
                <p>{t.homeUi.registrationIdentityDescription}</p>
                <div className={`identity-status-card identity-status-card--${identity}`}>
                  <div><strong>{t.homeUi.identityStatusLabel}</strong><span>{t.homeUi.identityStatusValue[identity] || identity}</span></div>
                  <div><strong>{t.homeUi.identityProviderLabel}</strong><span>Persona</span></div>
                </div>
                {identity === "verified" ? (
                  <div className="auth-success">{t.homeUi.identityVerifiedPending}</div>
                ) : (
                  <>
                    <div className="identity-checklist">
                      <span>✓ {t.homeUi.identitySecurityItem1}</span>
                      <span>✓ {t.homeUi.identitySecurityItem2}</span>
                      <span>✓ {t.homeUi.identitySecurityItem3}</span>
                    </div>
                    <div className="registration-actions">
                      <button type="button" className="button-secondary" onClick={() => setStep(2)} disabled={busy}>{t.homeUi.backRegistration}</button>
                      <button type="button" onClick={startIdentity} disabled={busy}>{busy ? t.homeUi.identityStarting : t.homeUi.identityStart}</button>
                    </div>
                    {identityUrl && <a className="text-link identity-reopen-link" href={identityUrl} target="_blank" rel="noreferrer">{t.homeUi.identityReopen}</a>}
                  </>
                )}
                <button type="button" className="button-secondary identity-check-button" onClick={checkIdentity} disabled={busy}>{busy ? t.homeUi.identityChecking : t.homeUi.identityCheck}</button>
                {error && <p className="auth-error">{error}</p>}
                {message && <p className="auth-success">{message}</p>}
                <div className="account-setup-security"><strong>{t.homeUi.setupSecurityTitle}</strong><span>{t.homeUi.setupSecurityText}</span></div>
              </section>
            )}

            {step < 3 && message && <p className="auth-success">{message}</p>}
            {step === 3 && identity === "verified" && (
              <button type="button" className="identity-complete-button" onClick={finishLater}>{t.homeUi.openAccount}</button>
            )}
          </article>
        </div>
      </section>
    </PageShell>
  );
}
