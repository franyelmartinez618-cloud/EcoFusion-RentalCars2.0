import Home from "./pages/Home/Home";
import Vehicles from "./pages/Vehicles/Vehicles";
import VehicleDetails from "./pages/VehicleDetails/VehicleDetails";
import HowItWorks from "./pages/HowItWorks/HowItWorks";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import SignIn from "./pages/SignIn/SignIn";
import Booking from "./pages/Booking/Booking";
import Account from "./pages/Account/Account";
import Admin from "./pages/Admin/Admin";
import { AppProvider, useApp } from "./context/AppContext";
import { AppDataProvider } from "./context/AppDataContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Register from "./pages/Auth/Register";
import AdminLogin from "./pages/Admin/AdminLogin";
import AccountSetup from "./pages/Auth/AccountSetup";
import LegalPage from "./pages/Legal/LegalPage";
import { normalizePath, useLocation, Link, navigate } from "./utils/router";
import { Component, useEffect } from "react";
import "./styles/variables.css";
import "./styles/global.css";
import "./App.css";


class AppErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="route-loading" role="alert">
                    <strong>EcoFusion</strong>
                    <p>Something went wrong loading this page.</p>
                    <button type="button" onClick={() => window.location.reload()}>Reload</button>
                </div>
            );
        }
        return this.props.children;
    }
}

function NotFound() {
    const { translations:t } = useApp(); return <div className="not-found"><div><span>404</span><h1>{t.notFound.title}</h1><p>{t.notFound.description}</p><Link to="/">{t.notFound.back}</Link></div></div>;
}

function GuardedRoute({ role, children, loginPath, allowSetup = false }) {
    const { user, loading } = useAuth();
    useEffect(() => {
        if (!loading && !user) {
            sessionStorage.setItem("ecofusion-auth-return", window.location.pathname + window.location.search);
            navigate(loginPath);
            return;
        }
        if (!loading && user && role && user.role !== role) {
            navigate(user.role === "admin" ? "/admin" : "/account");
            return;
        }
        if (!loading && user?.role === "client" && user.registrationRequired && !allowSetup) {
            navigate("/complete-account");
        }
    }, [loading, user, role, loginPath, allowSetup]);
    if (loading || !user || (role && user.role !== role)) return <div className="route-loading">Loading…</div>;
    return children;
}

function RouterView() {
    const path = normalizePath(useLocation());
    if (path === "/") return <Home />;
    if (path === "/vehicles") return <Vehicles />;
    if (/^\/vehicles\/[^/]+$/.test(path)) return <VehicleDetails path={path} />;
    if (path === "/how-it-works") return <HowItWorks />;
    if (path === "/about") return <About />;
    if (path === "/contact") return <Contact />;
    if (path === "/sign-in") return <SignIn />;
    if (path === "/register") return <Register />;
    if (path === "/privacy") return <LegalPage type="privacy" />;
    if (path === "/terms") return <LegalPage type="terms" />;
    if (path === "/cookies") return <LegalPage type="cookies" />;
    if (path === "/complete-account") return <GuardedRoute role="client" loginPath="/sign-in" allowSetup><AccountSetup /></GuardedRoute>;
    if (path === "/admin/login") return <AdminLogin />;
    if (path === "/book") return <Booking />;
    if (path === "/account" || path.startsWith("/account/")) return <GuardedRoute role="client" loginPath="/sign-in"><Account /></GuardedRoute>;
    if (path === "/admin" || path === "/admin/") return <GuardedRoute role="admin" loginPath="/admin/login"><Admin /></GuardedRoute>;
    return <NotFound />;
}

function App() {
    return (
        <AppErrorBoundary>
            <AppProvider>
                <AuthProvider>
                    <AppDataProvider>
                        <ToastProvider>
                            <RouterView />
                        </ToastProvider>
                    </AppDataProvider>
                </AuthProvider>
            </AppProvider>
        </AppErrorBoundary>
    );
}

export default App;
