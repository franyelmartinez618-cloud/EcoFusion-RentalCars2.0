import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import "../SimplePages.css";

function About() {
    const { translations: t } = useApp();

    const pillars = [
        { number: "01", title: t.about.reliability, text: t.about.reliabilityText },
        { number: "02", title: t.about.simplicity, text: t.about.simplicityText },
        { number: "03", title: t.about.transparency, text: t.about.transparencyText },
        { number: "04", title: t.about.customerCare, text: t.about.customerCareText },
    ];

    return (
        <PageShell>
            <section className="page-hero">
                <div className="container">
                    <span className="page-hero__eyebrow">{t.about.eyebrow}</span>
                    <h1>{t.about.title}</h1>
                    <p>{t.about.description}</p>
                </div>
            </section>

            <section className="page-section about-page">
                <div className="container">
                    <div className="about-page__intro">
                        <article className="info-card">
                            <span className="page-hero__eyebrow">{t.about.missionKicker}</span>
                            <h2>{t.about.missionTitle}</h2>
                            <p>{t.about.missionDescription}</p>
                        </article>
                        <article className="about-page__statement">
                            <span aria-hidden="true" className="about-page__quote">“</span>
                            <h2>{t.about.promiseTitle}</h2>
                            <p>{t.about.promiseDescription}</p>
                            <Link to="/how-it-works" className="button button--primary">{t.about.exploreProcess} →</Link>
                        </article>
                    </div>

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
