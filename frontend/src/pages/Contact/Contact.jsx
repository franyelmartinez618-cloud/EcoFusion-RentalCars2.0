import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import "../SimplePages.css";
import "./Contact.css";

// Give visitors working call and WhatsApp routes instead of a form that only copied text.
function Contact() {
    const { translations: t, language } = useApp();
    const copy = language === "es" ? {
        eyebrow: "CONTACTO DIRECTO",
        title: "Habla con FRANKEY",
        description: "Elige la vía más cómoda. Las solicitudes urgentes deben ser fáciles.",
        sectionTitle: "Estamos a una llamada o un mensaje.",
        sectionText: "Para una conversación urgente en carretera, llama. Para consultas generales, puedes escribir por WhatsApp.",
        primaryLabel: "LÍNEA PRINCIPAL",
        primaryText: "La vía más rápida para una conversación urgente en carretera.",
        alternativeLabel: "LÍNEA ALTERNATIVA",
        alternativeText: "Usa la segunda línea si la primera está ocupada.",
        call: "Llamar ahora",
        whatsapp: "Escribir por WhatsApp",
        privacy: "Por seguridad, no envíes contraseñas, códigos de acceso ni datos completos de tarjetas por WhatsApp.",
    } : {
        eyebrow: "DIRECT CONTACT",
        title: "Talk to FRANKEY",
        description: "Choose the channel that works best. Urgent requests should be easy to make.",
        sectionTitle: "One call or message away.",
        sectionText: "For urgent roadside conversations, call us. For general questions, you can message us on WhatsApp.",
        primaryLabel: "MAIN LINE",
        primaryText: "The fastest way to speak with someone about an urgent roadside issue.",
        alternativeLabel: "ALTERNATE LINE",
        alternativeText: "Use the second line if the first one is busy.",
        call: "Call now",
        whatsapp: "Message on WhatsApp",
        privacy: "For your security, do not send passwords, sign-in codes or full card details over WhatsApp.",
    };

    // Both published numbers offer direct dialing and a pre-filled WhatsApp conversation.
    const channels = [
        { number: "669-499-0584", tel: "+16694990584", whatsapp: "16694990584", label: copy.primaryLabel, description: copy.primaryText, message: language === "es" ? "Hola, necesito ayuda con FRANKEY Rentals Car." : "Hello, I need help with FRANKEY Rentals Car." },
        { number: "408-722-4634", tel: "+14087224634", whatsapp: "14087224634", label: copy.alternativeLabel, description: copy.alternativeText, message: language === "es" ? "Hola, estoy contactando a FRANKEY por la línea alternativa." : "Hello, I am contacting FRANKEY through the alternate line." },
    ];

    return (
        <PageShell>
            {/* A compact contact introduction leads directly into the two real contact channels. */}
            <section className="contact-hero">
                <div className="container contact-hero__inner">
                    <span className="page-hero__eyebrow">{copy.eyebrow}</span>
                    <h1>{copy.title}</h1>
                    <p>{copy.description}</p>
                </div>
            </section>

            {/* Each number has independent call and WhatsApp actions for desktop and mobile. */}
            <section className="contact-channel-section">
                <div className="container">
                    <div className="contact-channel-section__heading">
                        <div>
                            <span className="page-hero__eyebrow">{t.contact.eyebrow}</span>
                            <h2>{copy.sectionTitle}</h2>
                            <p>{copy.sectionText}</p>
                        </div>
                    </div>
                    <div className="contact-channel-grid">
                        {channels.map((channel, index) => (
                            <article className="contact-channel-card" key={channel.number}>
                                <div className="contact-channel-card__top">
                                    <span>{channel.label}</span>
                                    <span className="contact-channel-card__index">0{index + 1}</span>
                                </div>
                                <strong className="contact-channel-card__number">{channel.number}</strong>
                                <p>{channel.description}</p>
                                <div className="contact-channel-card__actions">
                                    <a className="contact-channel-card__call" href={`tel:${channel.tel}`}>
                                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.1 3.7 9.6 7l-1.5 2a14.4 14.4 0 0 0 6.9 6.9l2-1.5 3.3 2.5-.8 3a1.7 1.7 0 0 1-1.8 1.2A17.5 17.5 0 0 1 2.9 5.5 1.7 1.7 0 0 1 4.1 3.7l3-.8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        {copy.call}
                                    </a>
                                    <a className="contact-channel-card__whatsapp" href={`https://wa.me/${channel.whatsapp}?text=${encodeURIComponent(channel.message)}`} target="_blank" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.7a8.1 8.1 0 0 1-12 7.1L4 20l1.2-3.8A8.1 8.1 0 1 1 20 11.7Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.4 8.2c.3-.5.6-.5.9-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.5.9 1.2 1.6 2.1 2.1.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .5-.2 1-.6 1.3-.4.4-1 .6-1.6.5-1.2-.2-2.5-.8-3.6-1.8-1.1-1-2-2.3-2.2-3.5-.1-.8.1-1.5.7-2.2Z" fill="currentColor"/></svg>
                                        {copy.whatsapp}
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                    <p className="contact-channel-note">
                        <span aria-hidden="true">ⓘ</span>
                        {copy.privacy}
                    </p>
                </div>
            </section>
        </PageShell>
    );
}

export default Contact;
