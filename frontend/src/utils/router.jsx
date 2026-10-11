import { useEffect, useState } from "react";

function getAdminBase() {
    if (typeof window === "undefined") return "";
    const value = window.__ECOFUSION_ADMIN_BASE__;
    if (typeof value !== "string") return "";
    const cleaned = value.replace(/\/+$/, "");
    // The private entry path is supplied by the Cloudflare Worker at runtime,
    // not stored in this public repository.
    return /^\/[A-Za-z0-9_-]{24,128}$/.test(cleaned) ? cleaned : "";
}

export function normalizePath(pathname = window.location.pathname) {
    const cleaned = pathname.replace(/\/+$/, "") || "/";
    const adminBase = getAdminBase();

    // Translate the Worker-only private URLs into the app's internal routes.
    if (adminBase && cleaned === adminBase) return "/admin/login";
    if (adminBase && cleaned === `${adminBase}/panel`) return "/admin";

    return cleaned;
}

function toBrowserPath(to) {
    const adminBase = getAdminBase();
    if (!adminBase) return to;
    if (to === "/admin/login") return adminBase;
    if (to === "/admin" || to === "/admin/") return `${adminBase}/panel`;
    return to;
}

export function navigate(to) {
    const destination = toBrowserPath(to);
    if (destination === window.location.pathname) return;
    window.history.pushState({}, "", destination);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
}

export function useLocation() {
    const [path, setPath] = useState(() => normalizePath());

    useEffect(() => {
        const handle = () => setPath(normalizePath());
        window.addEventListener("popstate", handle);
        return () => window.removeEventListener("popstate", handle);
    }, []);

    return path;
}

export function Link({ to, children, className = "", onClick, ...props }) {
    const handleClick = (event) => {
        if (props.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            onClick?.(event);
            return;
        }

        event.preventDefault();
        navigate(to);
        onClick?.(event);
    };

    return (
        <a href={toBrowserPath(to)} className={className} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}

export function getVehicleSlug(pathname) {
    const match = normalizePath(pathname).match(/^\/vehicles\/([^/]+)$/);
    return match?.[1] ?? null;
}
