import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { navigate, Link, useLocation } from "../../utils/router";
import "./Navbar.css";

function Avatar({ user, mobile = false }) {
    const [failed, setFailed] = useState(false);
    const initials = (user?.name || "US")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((x) => x[0])
        .join("")
        .toUpperCase() || "US";

    const className = mobile
        ? "navbar__avatar navbar__avatar--mobile"
        : "navbar__avatar";

    if (user?.photoURL && !failed) {
        return (
            <img
                className={className}
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFailed(true)}
            />
        );
    }

    return <span className={className}>{initials}</span>;
}

export default function Navbar() {
    const { theme, language, toggleTheme, toggleLanguage, translations: t } = useApp();
    const { user, firebaseUser, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const path = useLocation();
    const closeMenu = () => setMenuOpen(false);

    const accountPath = user ? "/account" : "/sign-in";
    const accountLabel = user ? t.nav.myAccount : t.nav.signIn;
    const avatarUser = user
        ? { ...user, photoURL: firebaseUser?.photoURL || "" }
        : null;

    const handleLogout = async () => {
        closeMenu();
        await logout();
        navigate("/");
    };

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 18);
        fn();
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const links = [
        ["/", t.nav.home],
        ["/vehicles", t.nav.vehicles],
        ["/how-it-works", t.nav.howItWorks],
        ["/about", t.nav.about],
        ["/contact", t.nav.contact],
    ];

    return (
        <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
            <div className="container navbar__container">
                <Link
                    to="/"
                    className="navbar__brand"
                    onClick={closeMenu}
                    aria-label="EcoFusion Rental Cars"
                >
                    <img
                        src="/ecofusion-logo.png"
                        alt="EcoFusion Rental Cars"
                        className="navbar__logo-image navbar__logo-image--full"
                    />
                    <img
                        src="/ecofusion-logo-symbol.png"
                        alt="EcoFusion"
                        className="navbar__logo-image navbar__logo-image--compact"
                    />
                </Link>

                <button
                    type="button"
                    className="navbar__mobile-toggle"
                    onClick={() => setMenuOpen((value) => !value)}
                    aria-label={t.common.menu}
                    aria-expanded={menuOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>

                <nav className={`navbar__nav ${menuOpen ? "navbar__nav--open" : ""}`}>
                    {links.map(([to, label]) => (
                        <Link
                            key={to}
                            to={to}
                            className={path === to ? "is-active" : ""}
                            onClick={closeMenu}
                        >
                            {label}
                        </Link>
                    ))}

                    <Link
                        to="/book"
                        className={`navbar__mobile-book ${path === "/book" ? "is-active" : ""}`}
                        onClick={closeMenu}
                    >
                        {t.nav.reservations}
                    </Link>

                    {!user ? (
                        <div className="navbar__mobile-auth-links">
                            <Link
                                to="/sign-in"
                                className={path === "/sign-in" ? "is-active" : ""}
                                onClick={closeMenu}
                            >
                                {t.nav.signIn}
                            </Link>
                            <Link
                                to="/register"
                                className={path === "/register" ? "is-active" : ""}
                                onClick={closeMenu}
                            >
                                {t.nav.register}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/account"
                                className={`navbar__mobile-account ${path === "/account" ? "is-active" : ""}`}
                                onClick={closeMenu}
                            >
                                <Avatar user={avatarUser} mobile />
                                <span>{t.nav.myAccount}</span>
                                <span aria-hidden="true">→</span>
                            </Link>
                            <button
                                type="button"
                                className="navbar__mobile-logout"
                                onClick={handleLogout}
                            >
                                {t.common.signOut}
                                <span aria-hidden="true">↗</span>
                            </button>
                        </>
                    )}

                    <div className="navbar__mobile-controls">
                        <button type="button" className="navbar__control" onClick={toggleLanguage}>
                            {language === "en" ? "ES" : "EN"}
                        </button>
                        <button
                            type="button"
                            className="navbar__control navbar__theme"
                            onClick={toggleTheme}
                            aria-label={t.common.changeTheme}
                        >
                            {theme === "light" ? "☾" : "☀"}
                        </button>
                    </div>
                </nav>

                <div className="navbar__actions">
                    <div className="navbar__actions-cluster">
                        <Link to="/book" className="navbar__book" onClick={closeMenu}>
                            {t.nav.reservations}
                        </Link>
                        <div className="navbar__account-links">
                            {!user ? (
                                <>
                                    <Link to="/sign-in" className={path === "/sign-in" ? "is-active" : ""} onClick={closeMenu}>
                                        {t.nav.signIn}
                                    </Link>
                                    <span aria-hidden="true">·</span>
                                    <Link to="/register" className={path === "/register" ? "is-active" : ""} onClick={closeMenu}>
                                        {t.nav.register}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to={accountPath} className={path === "/account" ? "is-active" : ""} onClick={closeMenu}>
                                        <Avatar user={avatarUser} />
                                        <span>{accountLabel}</span>
                                    </Link>
                                    <span aria-hidden="true">·</span>
                                    <button type="button" onClick={handleLogout}>
                                        {t.common.signOut}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="navbar__desktop-controls">
                        <button
                            type="button"
                            className="navbar__control"
                            onClick={toggleLanguage}
                            aria-label={t.common.changeLanguage}
                        >
                            {language === "en" ? "ES" : "EN"}
                        </button>
                        <button
                            type="button"
                            className="navbar__control navbar__theme"
                            onClick={toggleTheme}
                            aria-label={t.common.changeTheme}
                        >
                            {theme === "light" ? "☾" : "☀"}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
