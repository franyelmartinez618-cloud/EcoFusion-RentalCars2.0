import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { Link, useLocation } from "../../utils/router";
import "./Navbar.css";

function Navbar() {
    const { theme, language, toggleTheme, toggleLanguage, translations } = useApp();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const path = useLocation();
    const closeMenu = () => setMenuOpen(false);

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
                <Link to="/" className="navbar__brand" onClick={closeMenu}>
                    <span className="navbar__logo">E</span>
                    <span className="navbar__name">EcoFusion<small>RentalCars</small></span>
                </Link>

                <button type="button" className="navbar__mobile-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label={translations.common.menu} aria-expanded={menuOpen}>
                    <span></span><span></span><span></span>
                </button>

                <nav className={`navbar__nav ${menuOpen ? "navbar__nav--open" : ""}`}>
                    {links.map(([to, label]) => (
                        <Link key={to} to={to} className={path === to ? "is-active" : ""} onClick={closeMenu}>{label}</Link>
                    ))}
                </nav>

                <div className="navbar__actions">
                    <button type="button" className="navbar__control" onClick={toggleLanguage} aria-label={translations.common.changeLanguage} title={translations.common.changeLanguage}>{language === "en" ? "ES" : "EN"}</button>
                    <button type="button" className="navbar__control navbar__theme" onClick={toggleTheme} aria-label={translations.common.changeTheme} title={translations.common.changeTheme}>{theme === "light" ? "☾" : "☀"}</button>
                    <Link to="/account" className="navbar__signin" onClick={closeMenu}>{translations.nav.myAccount}</Link>
                    <Link to="/book" className="navbar__book" onClick={closeMenu}>{translations.nav.bookNow}</Link>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
