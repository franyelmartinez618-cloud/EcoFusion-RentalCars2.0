import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./context/AppContext";
import { AppDataProvider } from "./context/AppDataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { useLocation, navigate } from "./utils/router";
import Admin from "./pages/Admin/Admin";
import AdminLogin from "./pages/Admin/AdminLogin";
import "./styles/variables.css";
import "./styles/global.css";
import "./App.css";
import "./styles/compact-layout.css";
import "./styles/typography.css";
import "./styles/responsive-polish.css";
import "./pages/SimplePages.css";

// Keep the dedicated console inside its own standalone application and host.
function AdminRouter() {
    const { user, loading } = useAuth();
    const path = useLocation();

    // Only a server-confirmed administrator session may reach the console route.
    useEffect(() => {
        if (loading) return;
        if (user?.role === "admin" && path !== "/panel") navigate("/panel");
        if (path === "/panel" && user?.role !== "admin") navigate("/");
    }, [user, loading, path]);

    if (loading) {
        return <main className="route-loading" role="status">Verificando sesión administrativa…</main>;
    }

    return user?.role === "admin" && path === "/panel"
        ? <Admin />
        : <AdminLogin />;
}

// The admin bundle does not load customer reservations or account data.
function AdminApplication() {
    return (
        <AppProvider>
            <AuthProvider>
                <AppDataProvider adminMode>
                    <ToastProvider>
                        <AdminRouter />
                    </ToastProvider>
                </AppDataProvider>
            </AuthProvider>
        </AppProvider>
    );
}

// Mount the isolated administrator experience.
createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AdminApplication />
    </StrictMode>
);
