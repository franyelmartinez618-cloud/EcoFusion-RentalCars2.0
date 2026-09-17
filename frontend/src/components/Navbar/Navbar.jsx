import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { navigate } from "../../utils/router";
import { Link, useLocation } from "../../utils/router";
import "./Navbar.css";

function Navbar() {
    const { theme, language, toggleTheme, toggleLanguage, translations } = useApp();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const path = useLocation();
    const closeMenu = () => setMenuOpen(false);
    const accountPath = user ? "/account" : "/sign-in";
    const accountLabel = user ? translations.nav.myAccount : "Iniciar sesión";
    const handleLogout = async () => { closeMenu(); await logout(); navigate("/"); };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 18);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
        ["/", translations.nav.home],
        ["/vehicles", translations.nav.vehicles],
        ["/how-it-works", translations.nav.howItWorks],
        ["/about", translations.nav.about],
        ["/contact", translations.nav.contact],
    ];

    return (
        <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
            <div className="container navbar__container">
                <Link to="/" className="navbar__brand" onClick={closeMenu} aria-label="EcoFusion Rental Cars home">
                    <img src="/ecofusion-logo.png" alt="EcoFusion Rental Cars" className="navbar__logo-image" />
                </Link>

                <button type="button" className="navbar__mobile-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label={translations.common.menu} aria-expanded={menuOpen}>
                    <span></span><span></span><span></span>
                </button>

                <nav className={`navbar__nav ${menuOpen ? "navbar__nav--open" : ""}`}>
                    {links.map(([to, label]) => (
                        <Link key={to} to={to} className={path === to ? "is-active" : ""} onClick={closeMenu}>{label}</Link>
                    ))}
                    <Link to={accountPath} className={`navbar__mobile-account ${path === "/account" || path === "/sign-in" ? "is-active" : ""}`} onClick={closeMenu}>
                        <span>{accountLabel}</span><span aria-hidden="true">→</span>
                    </Link>
                    {user && <button type="button" className="navbar__mobile-logout" onClick={handleLogout}>{translations.common.signOut}<span aria-hidden="true">↗</span></button>}
                    <div className="navbar__mobile-controls">
                        <button type="button" className="navbar__control" onClick={toggleLanguage}>{language === "en" ? "ES" : "EN"}</button>
                        <button type="button" className="navbar__control navbar__theme" onClick={toggleTheme}>{theme === "light" ? "☾" : "☀"}</button>
                    </div>
                </nav>

                <div className="navbar__actions">
                    <button type="button" className="navbar__control" onClick={toggleLanguage} aria-label={translations.common.changeLanguage} title={translations.common.changeLanguage}>{language === "en" ? "ES" : "EN"}</button>
                    <button type="button" className="navbar__control navbar__theme" onClick={toggleTheme} aria-label={translations.common.changeTheme} title={translations.common.changeTheme}>{theme === "light" ? "☾" : "☀"}</button>
                    <Link to={accountPath} className={`navbar__signin ${user ? "navbar__signin--user" : ""}`} onClick={closeMenu}>
                        {user ? <><span className="navbar__signin-avatar">{(user.name || "US").slice(0,2).toUpperCase()}</span>{accountLabel}</> : accountLabel}
                    </Link>
                    <Link to="/book" className="navbar__book" onClick={closeMenu}>{translations.nav.bookNow}</Link>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
