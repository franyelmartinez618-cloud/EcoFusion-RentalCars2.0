import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import "./Footer.css";

function Footer() {
    const { translations: t, language } = useApp();

    return (
        <footer className="footer">
            <div className="container footer__main">
                <div className="footer__brand">
                    <Link to="/" className="footer__logo-link" aria-label="FRANKEY Rentals Car home">
                        <img
                            src="/frankey-official-logo.webp"
                            alt="FRANKEY Rentals Car"
                            className="footer__logo-image"
                            width={320}
                            height={160}
                            style={{ width: "min(100%, 190px)", height: "auto", maxHeight: "none", aspectRatio: "2 / 1", objectFit: "contain" }}
                        />
                    </Link>
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
                    <a href="https://frankey-rentals-admin.ecofusionrentalcars.workers.dev/" target="_blank" rel="noopener noreferrer">{language === "es" ? "Acceso del equipo" : "Team access"}</a>
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
