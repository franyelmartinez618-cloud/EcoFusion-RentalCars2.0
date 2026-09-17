import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { navigate, Link, useLocation } from "../../utils/router";
import "./Navbar.css";

function Avatar({ user, mobile=false }) {
    const [failed,setFailed]=useState(false);
    const initials=(user?.name||"US").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"US";
    if(user?.photoURL && !failed) return <img className={mobile?"navbar__avatar navbar__avatar--mobile":"navbar__avatar"} src={user.photoURL} alt="" referrerPolicy="no-referrer" onError={()=>setFailed(true)} />;
    return <span className={mobile?"navbar__avatar navbar__avatar--mobile":"navbar__avatar"}>{initials}</span>;
}

export default function Navbar(){
 const {theme,language,toggleTheme,toggleLanguage,translations}=useApp(); const {user,firebaseUser,logout}=useAuth();
 const [menuOpen,setMenuOpen]=useState(false); const [scrolled,setScrolled]=useState(false); const path=useLocation(); const closeMenu=()=>setMenuOpen(false);
 const accountPath=user?"/account":"/sign-in"; const accountLabel=user?translations.nav.myAccount:translations.nav.signIn;
 const avatarUser=user?{...user,photoURL:firebaseUser?.photoURL}:null;
 const handleLogout=async()=>{closeMenu();await logout();navigate("/")};
 useEffect(()=>{const fn=()=>setScrolled(window.scrollY>18);fn();window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
 const links=[["/",translations.nav.home],["/vehicles",translations.nav.vehicles],["/how-it-works",translations.nav.howItWorks],["/about",translations.nav.about],["/contact",translations.nav.contact]];
 return <header className={`navbar ${scrolled?"navbar--scrolled":""}`}><div className="container navbar__container">
  <Link to="/" className="navbar__brand" onClick={closeMenu} aria-label="EcoFusion Rental Cars"><img src="/ecofusion-logo.png" alt="EcoFusion Rental Cars" className="navbar__logo-image navbar__logo-image--full"/><img src="/ecofusion-logo-symbol.png" alt="EcoFusion" className="navbar__logo-image navbar__logo-image--compact"/></Link>
  <button type="button" className="navbar__mobile-toggle" onClick={()=>setMenuOpen(v=>!v)} aria-label={translations.common.menu} aria-expanded={menuOpen}><span/><span/><span/></button>
  <nav className={`navbar__nav ${menuOpen?"navbar__nav--open":""}`}>
   {links.map(([to,label])=><Link key={to} to={to} className={path===to?"is-active":""} onClick={closeMenu}>{label}</Link>)}
   {!user&&<Link to="/register" className={path==="/register"?"is-active":""} onClick={closeMenu}>Registrarse</Link>}
   <Link to={accountPath} className={`navbar__mobile-account ${path==="/account"||path==="/sign-in"?"is-active":""}`} onClick={closeMenu}>{avatarUser&&<Avatar user={avatarUser} mobile/>}<span>{accountLabel}</span><span aria-hidden="true">→</span></Link>
   {user&&<button type="button" className="navbar__mobile-logout" onClick={handleLogout}>{translations.common.signOut}<span aria-hidden="true">↗</span></button>}
   <div className="navbar__mobile-controls"><button type="button" className="navbar__control" onClick={toggleLanguage}>{language==="en"?"ES":"EN"}</button><button type="button" className="navbar__control navbar__theme" onClick={toggleTheme}>{theme==="light"?"☾":"☀"}</button></div>
  </nav>
  <div className="navbar__actions"><button type="button" className="navbar__control" onClick={toggleLanguage} aria-label={translations.common.changeLanguage}>{language==="en"?"ES":"EN"}</button><button type="button" className="navbar__control navbar__theme" onClick={toggleTheme} aria-label={translations.common.changeTheme}>{theme==="light"?"☾":"☀"}</button><Link to={accountPath} className={`navbar__signin ${user?"navbar__signin--user":""}`} onClick={closeMenu}>{avatarUser&&<Avatar user={avatarUser}/>}<span>{accountLabel}</span></Link><Link to="/book" className="navbar__book" onClick={closeMenu}>{translations.nav.bookNow}</Link></div>
 </div></header>
}
