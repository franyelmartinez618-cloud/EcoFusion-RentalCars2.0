import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import "./Footer.css";

function Footer(){
    const {translations:t}=useApp();
    return <footer className="footer">
        <div className="container footer__main">
            <div className="footer__brand">
                <Link to="/" className="footer__logo-link" aria-label="EcoFusion Rental Cars home">
                    <img src="/ecofusion-logo.png" alt="EcoFusion Rental Cars" className="footer__logo-image" />
                </Link>
                <p>{t.footer.description}</p>
            </div>
            <div className="footer__column"><h3>{t.footer.company}</h3><Link to="/about">{t.footer.about}</Link><Link to="/vehicles">{t.footer.vehicles}</Link><Link to="/contact">{t.footer.locations}</Link><Link to="/book">{t.footer.offers}</Link></div>
            <div className="footer__column"><h3>{t.footer.support}</h3><Link to="/contact">{t.footer.contact}</Link><Link to="/contact">{t.footer.faq}</Link><Link to="/book">{t.footer.reservations}</Link><Link to="/privacy">Política de privacidad</Link><Link to="/terms">Términos</Link><Link to="/cookies">Cookies</Link><Link to="/admin/login">{t.admin?.console || "Admin Console"}</Link></div>
        </div>
        <div className="container footer__bottom"><span>{t.footer.copyright}</span><span>{t.footer.tagline} · {t.common.californiaUSA}</span></div>
    </footer>
}
export default Footer;
