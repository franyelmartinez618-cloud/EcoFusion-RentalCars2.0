import { useEffect, useState } from "react";

export function normalizePath(pathname = window.location.pathname) {
    const cleaned = pathname.replace(/\/+$/, "");
    return cleaned || "/";
}

export function navigate(to) {
    if (to === window.location.pathname) return;
    window.history.pushState({}, "", to);
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
        <a href={to} className={className} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}

export function getVehicleSlug(pathname) {
    const match = normalizePath(pathname).match(/^\/vehicles\/([^/]+)$/);
    return match?.[1] ?? null;
}
