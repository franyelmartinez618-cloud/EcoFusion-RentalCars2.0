import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import "../SimplePages.css";

const icons = ["⌁", "◉", "✓"];

function HowItWorks() {
    const { translations: t } = useApp();
    const steps = [t.howItWorks.step1, t.howItWorks.step2, t.howItWorks.step3];

    return (
        <PageShell>
            <section className="page-hero">
                <div className="container">
                    <span className="page-hero__eyebrow">{t.howItWorks.eyebrow}</span>
                    <h1>{t.howItWorks.title}</h1>
                    <p>{t.howItWorks.description}</p>
                </div>
            </section>

            <section className="page-section how-it-works-steps">
                <div className="container">
                    <div className="steps-grid">
                        {steps.map((step, index) => (
                            <article className="step-card" key={step.title}>
                                <div className="step-card__icon">{icons[index]}</div>
                                <span className="how-it-works-steps__number">
                                    Paso {String(index + 1).padStart(2, "0")}
                                </span>
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
