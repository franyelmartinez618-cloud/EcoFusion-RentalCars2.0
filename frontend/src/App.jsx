import Home from "./pages/Home/Home";
import Vehicles from "./pages/Vehicles/Vehicles";
import VehicleDetails from "./pages/VehicleDetails/VehicleDetails";
import HowItWorks from "./pages/HowItWorks/HowItWorks";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import SignIn from "./pages/SignIn/SignIn";
import Booking from "./pages/Booking/Booking";
import Admin from "./pages/Admin/Admin";
import { AppProvider } from "./context/AppContext";
import { AppDataProvider } from "./context/AppDataContext";
import { normalizePath, useLocation, Link } from "./utils/router";
import "./styles/variables.css";
import "./styles/global.css";
import "./App.css";

function NotFound() {
    return <div className="not-found"><div><span>404</span><h1>Page not found</h1><p>The route you requested does not exist.</p><Link to="/">Back to EcoFusion</Link></div></div>;
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
    if (path === "/book") return <Booking />;
    if (path === "/admin") return <Admin />;
    return <NotFound />;
}

function App() {
    return <AppProvider><AppDataProvider><RouterView /></AppDataProvider></AppProvider>;
}

export default App;
