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
    const { translations:t } = useApp();
    const { vehicles } = useAppData();
    const featured = vehicles.slice(0, 3);
    const heroVehicle = featured[0];

    return <div className="home-page">
        <Navbar />
        <main>
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
                            <strong>Simple booking. Clear pricing. Real availability.</strong>
                            <span>Built around the car you need, not a crowded homepage.</span>
                        </div>
                    </div>
                    <div className="home-hero__visual">
                        <img src="/hero-prius-temporary.jpg" alt="Toyota Prius rental" className="home-hero__image" />
                        <div className="home-hero__image-glow" />
                        {heroVehicle && <div className="home-hero__price"><span>Featured fleet</span><strong>{heroVehicle.name}</strong><small>from ${Number(heroVehicle.price || 0).toFixed(0)} / day</small></div>}
                    </div>
                </div>
            </section>

            <section className="home-booking-wrap">
                <div className="container"><BookingSearch /></div>
            </section>

            <section className="home-section home-featured">
                <div className="container">
                    <div className="home-section-head">
                        <div><span className="home-kicker">Fleet</span><h2>A few favorites. The full fleet is one click away.</h2></div>
                        <Link to="/vehicles" className="home-text-link">View all vehicles <span>→</span></Link>
                    </div>
                    <div className="home-fleet-grid">
                        {featured.map((vehicle, index) => <FeaturedTile key={vehicle.id} vehicle={vehicle} large={index === 0} />)}
                    </div>
                </div>
            </section>

            <section className="home-section home-section--muted">
                <div className="container home-process">
                    <div className="home-process__intro"><span className="home-kicker">How it works</span><h2>Everything important, one step at a time.</h2><p>Choose your dates, select a vehicle, sign in when the reservation begins, and keep the rest simple.</p><Link to="/how-it-works" className="home-text-link">See the full process <span>→</span></Link></div>
                    <div className="home-process__cards">
                        <article><div className="home-process__icon">⌁</div><h3>Choose your dates</h3><p>Tell us where and when you need the car.</p></article>
                        <article><div className="home-process__icon">◉</div><h3>Pick a vehicle</h3><p>Compare the cars in the live fleet without clutter.</p></article>
                        <article><div className="home-process__icon">✓</div><h3>Reserve securely</h3><p>Your account and reservation stay tied together.</p></article>
                    </div>
                </div>
            </section>

            <section className="home-cta">
                <div className="container home-cta__inner">
                    <div><span className="home-kicker">Ready when you are</span><h2>Find a car that fits the trip.</h2><p>See the current fleet or start a reservation with your dates.</p></div>
                    <div className="home-cta__actions"><Link className="button button--light" to="/vehicles">Browse fleet</Link><Link className="button button--primary" to="/book">Start a reservation <span>→</span></Link></div>
                </div>
            </section>
        </main>
        <Footer />
    </div>;
}

export default Home;
