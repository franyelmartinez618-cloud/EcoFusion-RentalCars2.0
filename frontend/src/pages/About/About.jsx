import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import "../SimplePages.css";
import "./About.css";

// Present FRANKEY's purpose and service principles through a more editorial layout.
function About() {
    const { translations: t, language } = useApp();

    // These four principles keep the page grounded in the services the site actually provides.
    const pillars = [
        { number: "01", title: t.about.reliability, text: t.about.reliabilityText },
        { number: "02", title: t.about.simplicity, text: t.about.simplicityText },
        { number: "03", title: t.about.transparency, text: t.about.transparencyText },
        { number: "04", title: t.about.customerCare, text: t.about.customerCareText },
    ];

    return (
        <PageShell>
            {/* The opening panel balances the brand story with one strong fleet image. */}
            <section className="about-hero">
                <div className="container about-hero__grid">
                    <div className="about-hero__copy">
                        <span className="page-hero__eyebrow">{t.about.eyebrow}</span>
                        <h1>{t.about.title}</h1>
                        <p>{t.about.description}</p>
                        <Link to="/how-it-works" className="button button--primary">
                            {t.about.exploreProcess} <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                    <figure className="about-hero__visual">
                        <img src="/frankey-rentals-hero.webp" alt={language === "es" ? "Vehículo de la flota FRANKEY Rentals Car" : "A vehicle from the FRANKEY Rentals Car fleet"} loading="lazy" />
                        <figcaption>
                            <span>FRANKEY RENTALS CAR</span>
                            <strong>{language === "es" ? "Cada detalle, más claro desde el inicio." : "A clearer experience from the start."}</strong>
                        </figcaption>
                    </figure>
                </div>
            </section>

            {/* Mission and service promise form one focused story rather than two plain text blocks. */}
            <section className="about-page page-section">
                <div className="container">
                    <div className="about-page__intro">
                        <article className="about-page__mission">
                            <span className="page-hero__eyebrow">{t.about.missionKicker}</span>
                            <h2>{t.about.missionTitle}</h2>
                            <p>{t.about.missionDescription}</p>
                        </article>
                        <article className="about-page__statement">
                            <span className="about-page__statement-mark" aria-hidden="true">F</span>
                            <span className="page-hero__eyebrow">{t.about.valuesKicker}</span>
                            <h2>{t.about.promiseTitle}</h2>
                            <p>{t.about.promiseDescription}</p>
                        </article>
                    </div>

                    {/* Each value receives equal space and a clear visual hierarchy. */}
                    <div className="about-page__section-heading">
                        <span className="page-hero__eyebrow">{t.about.valuesKicker}</span>
                        <h2>{t.about.valuesTitle}</h2>
                        <p>{t.about.valuesDescription}</p>
                    </div>
                    <div className="about-page__values">
                        {pillars.map((item) => (
                            <article className="about-page__value" key={item.number}>
                                <span>{item.number}</span>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </PageShell>
    );
}

export default About;
