import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import "../SimplePages.css";

function HowItWorks() {
    const { translations: t, language } = useApp();
    // Keep the journey focused on the three actions customers actually take.
    const steps = [t.howItWorks.step1, t.howItWorks.step2, t.howItWorks.step3];

    return (
        <PageShell>
            <section className="page-hero how-it-works-hero">
                <div className="container">
                    <span className="page-hero__eyebrow">{t.howItWorks.eyebrow}</span>
                    <h1>{t.howItWorks.title}</h1>
                    <p>{t.howItWorks.description}</p>
                </div>
            </section>

            <section className="page-section how-it-works-steps">
                <div className="container">
                    <div className="steps-grid">
                        {steps.map((step) => (
                            <article className="step-card" key={step.title}>
                                <span className="step-card__number">{step.number}</span>
                                <span className="how-it-works-steps__number">{language === "es" ? "PASO" : "STEP"} {step.number}</span>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </article>
                        ))}
                    </div>

                    <div className="how-it-works-steps__cta">
                        <Link className="button button--primary" to="/book">
                            {t.nav.bookNow} →
                        </Link>
                    </div>


                </div>
            </section>
        </PageShell>
    );
}

export default HowItWorks;
