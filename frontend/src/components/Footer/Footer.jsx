import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import "./Footer.css";

function Footer() {
    const { translations: t, language } = useApp();

    return (
        <footer className="footer">
            <div className="container footer__main">
                <div className="footer__brand">
                    <Link to="/" className="footer__logo-link" aria-label="EcoFusion RentalCars home">
                        <img
                            src="/ecofusion-logo.svg"
                            alt="EcoFusion RentalCars"
                            className="footer__logo-image"
                            width={900}
                            height={323}
                            style={{ width: "min(100%, 190px)", height: "auto", maxHeight: "none", aspectRatio: "900 / 323", objectFit: "contain" }}
                        />
                    </Link>
                    <strong className="footer__brand-name">EcoFusion</strong>
                    <p>{t.footer.description}</p>
                </div>

                <div className="footer__column">
                    <h3>{t.footer.company}</h3>
                    <Link to="/about">{t.footer.about}</Link>
                    <Link to="/vehicles">{t.footer.vehicles}</Link>
                    <Link to="/contact">{t.footer.locations}</Link>
                    <Link to="/book">{t.footer.offers}</Link>
                </div>

                <div className="footer__column">
                    <h3>{t.footer.support}</h3>
                    <Link to="/contact">{t.footer.contact}</Link>
                    <Link to="/contact">{t.footer.faq}</Link>
                    <Link to="/book">{t.footer.reservations}</Link>
                    <Link to="/privacy">{t.footer.privacyPolicy}</Link>
                    <Link to="/terms">{t.footer.termsAndConditions}</Link>
                    <Link to="/cookies">Cookies</Link>
                </div>
            </div>

            <div className="container footer__bottom">
                <span>{t.footer.copyright}</span>
                <span>{t.footer.tagline} · {t.common.californiaUSA}</span>
            </div>
        </footer>
    );
}

export default Footer;
