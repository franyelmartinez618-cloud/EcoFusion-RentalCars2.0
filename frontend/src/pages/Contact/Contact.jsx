import { useState } from "react";
import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import "../SimplePages.css";

function Contact() {
    const { translations: t } = useApp();
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

    const update = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setCopied(false);
    };

    const copyDraft = async () => {
        const draft = [
            t.contact.name + ": " + form.name,
            t.contact.email + ": " + form.email,
            t.contact.phone + ": " + form.phone,
            t.contact.subject + ": " + form.subject,
            "",
            form.message,
        ].join("\n");
        try {
            await navigator.clipboard.writeText(draft);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    return (
        <PageShell>
            <section className="page-hero">
                <div className="container">
                    <span className="page-hero__eyebrow">{t.contact.eyebrow}</span>
                    <h1>{t.contact.title}</h1>
                    <p>{t.contact.description}</p>
                </div>
            </section>

            <section className="page-section contact-page">
                <div className="container">
                    <div className="contact-page__help-grid">
                        <article className="contact-help-card">
                            <span className="contact-help-card__number">01</span>
                            <h2>{t.contact.reservationsTitle}</h2>
                            <p>{t.contact.reservationsText}</p>
                        </article>
                        <article className="contact-help-card">
                            <span className="contact-help-card__number">02</span>
                            <h2>{t.contact.vehiclesTitle}</h2>
                            <p>{t.contact.vehiclesText}</p>
                        </article>
                        <article className="contact-help-card">
                            <span className="contact-help-card__number">03</span>
                            <h2>{t.contact.accountTitle}</h2>
                            <p>{t.contact.accountText}</p>
                        </article>
                    </div>

                    <div className="contact-page__content">
                        <article className="info-card contact-page__info">
                            <span className="page-hero__eyebrow">{t.contact.beforeWritingKicker}</span>
                            <h2>{t.contact.beforeWritingTitle}</h2>
                            <p>{t.contact.beforeWritingText}</p>
                            <ul>
                                <li>{t.contact.detailReservation}</li>
                                <li>{t.contact.detailVehicle}</li>
                                <li>{t.contact.detailAccount}</li>
                            </ul>
                            <div className="contact-page__location">
                                <strong>EcoFusion RentalCars</strong>
                                <span>{t.common.californiaUSA}</span>
                                <small>{t.contact.locationNote}</small>
                            </div>
                        </article>

                        <form className="info-card simple-form contact-page__form" onSubmit={(event) => { event.preventDefault(); copyDraft(); }}>
                            <div>
                                <span className="page-hero__eyebrow">{t.contact.formKicker}</span>
                                <h2>{t.contact.formTitle}</h2>
                                <p className="contact-page__form-intro">{t.contact.formDescription}</p>
                            </div>
                            <label>{t.contact.name}<input required type="text" autoComplete="name" value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
                            <label>{t.contact.email}<input required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
                            <label>{t.contact.phone}<input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
                            <label>{t.contact.subject}<input required type="text" value={form.subject} onChange={(event) => update("subject", event.target.value)} /></label>
                            <label>{t.contact.message}<textarea required value={form.message} onChange={(event) => update("message", event.target.value)} /></label>
                            <button type="submit">{t.contact.prepareMessage}</button>
                            <p className={\`contact-page__form-note \${copied ? "is-copied" : ""}\`} role="status">
                                {copied ? t.contact.copiedDraft : t.contact.formNotConnected}
                            </p>
                        </form>
                    </div>
                </div>
            </section>
        </PageShell>
    );
}

export default Contact;
