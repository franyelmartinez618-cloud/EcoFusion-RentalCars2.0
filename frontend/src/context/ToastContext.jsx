import { createContext, useCallback, useContext, useMemo, useState } from "react";
import "../styles/toast.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismissToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message, type = "info", duration = 3200) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((current) => [...current.slice(-3), { id, message, type }]);
        window.setTimeout(() => dismissToast(id), duration);
    }, [dismissToast]);

    const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-stack" aria-live="polite" aria-atomic="true">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
                        <span className="toast__icon" aria-hidden="true">
                            {toast.type === "success" ? "✓" : toast.type === "error" ? "×" : toast.type === "warning" ? "!" : "i"}
                        </span>
                        <span className="toast__message">{toast.message}</span>
                        <button type="button" className="toast__close" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification">×</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used inside ToastProvider");
    return context;
}
