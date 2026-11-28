import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import BookingSearch from "../../components/BookingSearch/BookingSearch";
import VehicleCard from "../../components/VehicleCard/VehicleCard";
import { useApp } from "../../context/AppContext";
import { useAppData } from "../../context/AppDataContext";
import { Link } from "../../utils/router";
import "./Home.css";

function Home() {
    const { translations: t, language } = useApp();
    const { vehicles } = useAppData();
    const featured = vehicles.slice(0, 3);

    return (
        <div className="home-page">
            <Navbar />
            <main>
                <section className="home-booking-wrap">
                    <div className="container"><BookingSearch /></div>
                </section>

                <section className="home-hero">
                    <div className="container home-hero__grid">
                        <div className="home-hero__copy">
                            <span className="home-kicker">{t.hero.eyebrow}</span>
                            <h1>{t.hero.title}</h1>
                            <p>{t.hero.description}</p>
                            <div className="home-hero__actions">
                                <Link className="button button--primary" to="/vehicles">{t.hero.primaryAction}<span>→</span></Link>
                                <Link className="button button--ghost" to="/how-it-works">{t.hero.secondaryAction}</Link>
                            </div>
                            <div className="home-hero__trust">
                                <strong>{t.homeUi.homeTrustTitle}</strong>
                                <span>{t.homeUi.homeTrustText}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="home-section home-featured">
                    <div className="container">
                        <div className="home-section-head">
                            <div>
                                <span className="home-kicker">{t.homeUi.homeFleet}</span>
                                <h2>{t.homeUi.homeFavorites}</h2>
                            </div>
                            <Link to="/vehicles" className="home-text-link">{t.homeUi.homeViewAll} <span>→</span></Link>
                        </div>
                        <div className="home-fleet-grid">
                            {featured.map((vehicle, index) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} compact index={index} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="home-section home-section--muted">
                    <div className="container home-process">
                        <div className="home-process__intro">
                            <span className="home-kicker">{t.homeUi.homeHow}</span>
                            <h2>{t.homeUi.homeHowTitle}</h2>
                            <p>{t.homeUi.homeHowText}</p>
                            <Link to="/how-it-works" className="home-text-link">{t.homeUi.homeSeeProcess} <span>→</span></Link>
                        </div>
                        <div className="home-process__cards">
                            {[t.howItWorks.step1, t.howItWorks.step2, t.howItWorks.step3].map((step) => (
                                <article key={step.number}>
                                    <div className="home-process__card-top">
                                        <span className="home-process__number">{step.number}</span>
                                        <span className="home-process__label">{language === "es" ? "PASO" : "STEP"} {step.number}</span>
                                    </div>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default Home;
