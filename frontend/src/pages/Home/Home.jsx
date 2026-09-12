import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import BookingSearch from "../../components/BookingSearch/BookingSearch";
import VehicleCard from "../../components/VehicleCard/VehicleCard";
import Footer from "../../components/Footer/Footer";
import SectionHeading from "../../components/SectionHeading/SectionHeading";
import HorizontalScroller from "../../components/HorizontalScroller/HorizontalScroller";
import FAQItem from "../../components/FAQ/FAQItem";
import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import { useAppData } from "../../context/AppDataContext";
import { getVehicleImage } from "../../utils/vehicleImage";
import "./Home.css";

function Home() {
    const { translations: t } = useApp();
    const { vehicles, reviews, content, locations, offers } = useAppData();
    const featured = vehicles.slice(0, 3);
    const featuredVehicle = vehicles.find((vehicle) => vehicle.slug === "toyota-rav4") || vehicles[0];
    return (
        <div className="home-page">
            <Navbar />
            <main>
                <Hero />
                <div className="home-booking"><div className="container"><BookingSearch /></div></div>

                <section className="home-section" id="fleet">
                    <div className="container">
                        <SectionHeading
                            eyebrow={t.fleet.eyebrow}
                            title={t.fleet.title}
                            description={t.fleet.description}
                            action={<Link to="/vehicles">{t.fleet.viewAll}<span>→</span></Link>}
                        />
                        <div className="vehicle-grid">
                            {featured.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
                        </div>
                    </div>
                </section>

                <section className="featured-section">
                    <div className="container featured-section__grid">
                        <div className="featured-section__visual">
                            <img className="featured-section__image" src={getVehicleImage(featuredVehicle)} alt={t.featured.title} onError={(event) => { if (event.currentTarget.src !== featuredVehicle.image) event.currentTarget.src = featuredVehicle.image; }} />
                            <div className="featured-glow"></div>
                        </div>
                        <div className="featured-section__copy">
                            <span className="home-eyebrow">{t.featured.eyebrow}</span>
                            <h2>{t.featured.title}</h2>
                            <p>{t.featured.description}</p>
                            <div className="feature-specs"><span>{t.featured.seats}</span><span>{t.featured.luggage}</span><span>{t.featured.transmission}</span><span>{t.featured.fuel}</span></div>
                            <div className="button-row"><Link className="button button--primary" to="/vehicles/toyota-rav4">{t.featured.viewVehicle} <span>→</span></Link><Link className="button button--ghost" to="/book">{t.featured.bookVehicle}</Link></div>
                        </div>
                    </div>
                </section>

                <section className="home-section home-section--soft" id="how-it-works">
                    <div className="container">
                        <SectionHeading eyebrow={t.howItWorks.eyebrow} title={t.howItWorks.title} description={t.howItWorks.description} center />
                        <div className="steps-grid">
                            {[t.howItWorks.step1, t.howItWorks.step2, t.howItWorks.step3].map((step) => <article className="step-card" key={step.number}><span>{step.number}</span><div>{step.number}</div><h3>{step.title}</h3><p>{step.description}</p></article>)}
                        </div>
                    </div>
                </section>

                <section className="home-section locations-section">
                    <div className="container">
                        <SectionHeading eyebrow={t.locations.eyebrow} title={t.locations.title} description={t.locations.description} action={<Link to="/contact">{t.locations.viewAll}<span>→</span></Link>} />
                        <HorizontalScroller ariaLabel="EcoFusion California locations">
                            {locations.map((location) => <article className="location-card" key={location.name}><span className="location-card__pin">CA</span><h3>{location.name}</h3><p>{location.description}</p><Link to="/contact">{t.locations.losAngeles.action}<span>→</span></Link></article>)}
                        </HorizontalScroller>
                    </div>
                </section>

                <section className="home-section home-section--soft">
                    <div className="container">
                        <SectionHeading eyebrow={t.offers.eyebrow} title={t.offers.title} description={t.offers.description} />
                        <HorizontalScroller ariaLabel="EcoFusion offers">
                            {offers.map((offer, index) => <article className="offer-card" key={offer.id}><span className="offer-card__badge">{offer.badge}</span><div className="offer-card__image" style={content.offerImageUrls?.[index] ? { backgroundImage: `url(${content.offerImageUrls[index]})` } : undefined}><span>{content.offerImageUrls?.[index] ? "" : "EF"}</span></div><h3>{offer.title}</h3><p>{offer.description}</p><Link to="/book">{t.offers.offer1.action}<span>→</span></Link></article>)}
                        </HorizontalScroller>
                        <small className="section-note">{t.offers.terms}</small>
                    </div>
                </section>

                <section className="drive-section">
                    <div className="container drive-section__inner">
                        <div><span className="home-eyebrow">{t.california.eyebrow}</span><h2>{t.california.title}</h2><p>{t.california.description}</p><div className="button-row"><Link className="button button--primary" to="/vehicles">{t.california.explore}</Link><Link className="button button--light" to="/book">{t.california.planTrip}</Link></div></div>
                        <div className="drive-tags"><span>{t.california.roadTrips}</span><span>{t.california.beaches}</span><span>{t.california.cities}</span><span>{t.california.nature}</span></div>
                    </div>
                </section>

                <section className="home-section">
                    <div className="container">
                        <SectionHeading eyebrow={t.reviews.eyebrow} title={t.reviews.title} description={t.reviews.description} />
                        <HorizontalScroller ariaLabel="Customer reviews">
                            {reviews.filter((review) => review.status === "Published").map((review) => <article className="review-card" key={review.id}><div className="review-stars">{"★".repeat(Math.max(1, Math.min(5, Number(review.rating) || 0)))}<span className="review-stars__muted">{"★".repeat(5 - Math.max(1, Math.min(5, Number(review.rating) || 0)))}</span></div><p>“{review.quote}”</p><div className="review-card__person"><div>{review.name.charAt(0)}</div><span><strong>{review.name}</strong><small>{review.location} · {review.trip}</small></span></div><small className="review-verified">✓ {t.reviews.verified}</small></article>)}
                        </HorizontalScroller>
                    </div>
                </section>

                <section className="home-section home-section--soft">
                    <div className="container faq-grid">
                        <div><span className="home-eyebrow">{t.faq.eyebrow}</span><h2>{t.faq.title}</h2><p>{t.faq.description}</p><Link className="text-link" to="/contact">{t.nav.contact} <span>→</span></Link></div>
                        <div>{[[t.faq.question1,t.faq.answer1],[t.faq.question2,t.faq.answer2],[t.faq.question3,t.faq.answer3],[t.faq.question4,t.faq.answer4],[t.faq.question5,t.faq.answer5]].map(([q,a]) => <FAQItem key={q} question={q} answer={a} />)}</div>
                    </div>
                </section>

                <section className="home-cta"><div className="container"><span>{t.finalCta.eyebrow}</span><h2>{t.finalCta.title}</h2><p>{t.finalCta.description}</p><div className="button-row"><Link className="button button--primary" to="/book">{t.finalCta.primaryAction} <span>→</span></Link><Link className="button button--light" to="/vehicles">{t.finalCta.secondaryAction}</Link></div></div></section>
            </main>
            <Footer />
        </div>
    );
}
export default Home;
