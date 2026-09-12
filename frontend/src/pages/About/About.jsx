import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import "../SimplePages.css";
function About(){const {translations:t}=useApp();return <PageShell><section className="page-hero"><div className="container"><span className="page-hero__eyebrow">{t.about.eyebrow}</span><h1>{t.about.title}</h1><p>{t.about.description}</p></div></section><section className="page-section"><div className="container simple-page__content"><article className="info-card"><h2>{t.about.missionTitle}</h2><p>{t.about.missionDescription}</p></article><article className="info-card"><h2>{t.about.valuesTitle}</h2><ul><li>{t.about.reliability}</li><li>{t.about.simplicity}</li><li>{t.about.transparency}</li><li>{t.about.customerCare}</li></ul></article></div></section></PageShell>}
export default About;
