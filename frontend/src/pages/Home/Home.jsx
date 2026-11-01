import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import BookingSearch from "../../components/BookingSearch/BookingSearch";
import { useApp } from "../../context/AppContext";
import { useAppData } from "../../context/AppDataContext";
import { Link } from "../../utils/router";
import { getVehicleImage } from "../../utils/vehicleImage";
import "./Home.css";

function FeaturedTile({ vehicle, large = false }) {
    const image = getVehicleImage(vehicle);
    return (
        <article className={`home-fleet-tile ${large ? "home-fleet-tile--large" : ""}`}>
            <Link to={`/vehicles/${vehicle.slug}`} className="home-fleet-tile__link">
                <img src={image} alt={vehicle.name} onError={(event) => { if (event.currentTarget.src !== "/hero-prius-temporary.jpg") event.currentTarget.src = "/hero-prius-temporary.jpg"; }} />
                <div className="home-fleet-tile__veil" />
                <div className="home-fleet-tile__content">
                    <span>{vehicle.categoryLabel || vehicle.category}</span>
                    <h3>{vehicle.name}</h3>
                    <div><strong>${Number(vehicle.price || 0).toFixed(0)}</strong><small>/day</small></div>
                </div>
                <span className="home-fleet-tile__arrow">↗</span>
            </Link>
        </article>
    );
}

function Home() {
    const { translations:t, language } = useApp();
    const { vehicles } = useAppData();
    const featured = vehicles.slice(0, 3);
    const heroVehicle = featured[0];

    return <div className="home-page">
        <Navbar />
        <main>
            <section className="home-booking-wrap">
                <div className="container"><BookingSearch /></div>
            </section>

            <section className="home-hero">
                <div className="home-hero__glow" />
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
                    <div className="home-hero__visual">
                        <img src="/frankey-rentals-hero.webp" alt="Vehículo Toyota de FRANKEY Rentals Car" className="home-hero__image" loading="eager" fetchPriority="high" decoding="async" />
                        <div className="home-hero__image-glow" />
                        {heroVehicle && <div className="home-hero__price"><span>{t.homeUi.featuredFleet}</span><strong>{heroVehicle.name}</strong><small>${Number(heroVehicle.price || 0).toFixed(0)} {t.homeUi.perDay}</small></div>}
                    </div>
                </div>
            </section>

            <section className="home-section home-featured">
                <div className="container">
                    <div className="home-section-head">
                        <div><span className="home-kicker">{t.homeUi.homeFleet}</span><h2>{t.homeUi.homeFavorites}</h2></div>
                        <Link to="/vehicles" className="home-text-link">{t.homeUi.homeViewAll} <span>→</span></Link>
                    </div>
                    <div className="home-fleet-grid">
                        {featured.map((vehicle, index) => <FeaturedTile key={vehicle.id} vehicle={vehicle} large={index === 0} />)}
                    </div>
                </div>
            </section>

            {/* Three clear steps explain the rental journey without decorative placeholder symbols. */}
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
    </div>;
}

export default Home;
