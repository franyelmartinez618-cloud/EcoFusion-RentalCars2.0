import PageShell from "../../components/PageShell/PageShell";
import SectionHeading from "../../components/SectionHeading/SectionHeading";
import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import "../SimplePages.css";

const icons = ["⌁", "◉", "✓"];

function HowItWorks(){
    const {translations:t}=useApp();
    const steps=[t.howItWorks.step1,t.howItWorks.step2,t.howItWorks.step3];
    return <PageShell>
        <section className="page-hero"><div className="container"><span className="page-hero__eyebrow">{t.howItWorks.eyebrow}</span><h1>{t.howItWorks.title}</h1><p>{t.howItWorks.description}</p></div></section>
        <section className="page-section"><div className="container"><SectionHeading eyebrow={t.howItWorks.eyebrow} title={t.howItWorks.title} description={t.howItWorks.description}/><div className="steps-grid">{steps.map((s,i)=><article className="step-card" key={s.title}><div className="step-card__icon">{icons[i]}</div><h3>{s.title}</h3><p>{s.description}</p></article>)}</div><div style={{marginTop:30}}><Link className="button button--primary" to="/book">{t.nav.bookNow} →</Link></div></div></section>
    </PageShell>
}
export default HowItWorks;
