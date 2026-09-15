import { useApp } from "../../context/AppContext";
import { useAppData } from "../../context/AppDataContext";
import { Link } from "../../utils/router";
import { getVehicleImage } from "../../utils/vehicleImage";
import "./Hero.css";

function Hero() {
    const { translations } = useApp();
    const { content, vehicles } = useAppData();
    const featured = vehicles.find((vehicle) => vehicle.slug === "toyota-rav4") || vehicles[0];
    const heroImage = content.heroImageUrl?.trim();

    return (
        <section className="hero" id="home">
            <div className="hero__background" />
            <div className="container hero__container">
                <div className="hero__content">
                    <span className="hero__eyebrow">{translations.hero.eyebrow}</span>
                    <h1>{translations.hero.title}</h1>
                    <p className="hero__description">{translations.hero.description}</p>
                    <div className="hero__actions">
                        <Link to="/vehicles" className="hero__button hero__button--primary">{translations.hero.primaryAction}<span>→</span></Link>
                        <Link to="/book" className="hero__button hero__button--secondary">{translations.hero.secondaryAction}</Link>
                    </div>
                    <div className="hero__trust"><div className="hero__trust-stars" aria-hidden="true">★★★★★</div><div><strong>{translations.hero.badge.title}</strong><span>{translations.hero.badge.text}</span></div></div>
                </div>

                <div className={`hero__visual ${heroImage ? "hero__visual--image" : ""}`}>
                    <div className="hero__orb hero__orb--large" /><div className="hero__orb hero__orb--small" />
                    <div className="hero__vehicle-stage">
                        {heroImage ? (
                            <img className="hero__real-car" src={heroImage} alt={featured?.name || translations.common.toyota} onError={(event) => { event.currentTarget.src = getVehicleImage(featured); }} />
                        ) : (
                            <div className="hero__vehicle"><div className="hero__vehicle-roof" /><div className="hero__vehicle-window" /><div className="hero__vehicle-body"><span className="hero__vehicle-logo">{translations.common.toyota}</span><strong>RAV4</strong></div><div className="hero__wheel hero__wheel--left" /><div className="hero__wheel hero__wheel--right" /></div>
                        )}
                        <div className="hero__vehicle-floor" />
                    </div>

                    <div className="hero__info-card hero__info-card--top"><span className="hero__info-label">{translations.common.availableNow}</span><strong>{featured?.name || "Toyota RAV4"}</strong><small>{translations.featured.from} ${featured?.price || 79} {translations.featured.perDay}</small></div>
                    <div className="hero__info-card hero__info-card--bottom"><div className="hero__info-icon">✓</div><div><strong>{translations.hero.bottom.support}</strong><small>{translations.hero.badge.text}</small></div></div>
                </div>
            </div>
            <div className="hero__bottom-line"><div className="container"><span>{translations.hero.bottom.secure}</span><span>{translations.hero.bottom.flexible}</span><span>{translations.hero.floating.location}</span></div></div>
        </section>
    );
}
export default Hero;
