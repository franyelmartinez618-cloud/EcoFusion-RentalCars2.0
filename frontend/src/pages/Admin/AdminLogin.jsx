import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import { navigate } from "../../utils/router";
import "../SimplePages.css";

export default function AdminLogin() {
    const { translations: t } = useApp();
    const { user, refreshSession, logout } = useAuth();
    const [mode, setMode] = useState("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [recoveryCode, setRecoveryCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [rotatedRecoveryCode, setRotatedRecoveryCode] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (user?.role === "admin") navigate("/admin");
    }, [user]);

    const submitLogin = async (event) => {
        event.preventDefault();
        setError("");
        setNotice("");
        setBusy(true);
        try {
            // Ensure a customer/Firebase identity cannot carry over into the admin session.
            await logout();
            await api("/admin/auth/login", {
                method: "POST",
                body: JSON.stringify({ username: username.trim(), password }),
            });
            const loggedInUser = await refreshSession();
            if (loggedInUser?.role !== "admin") {
                throw new Error("No se pudo confirmar una sesión administrativa válida.");
            }
            navigate("/admin");
        } catch (err) {
            setError(err?.message || "No se pudo iniciar sesión. Revisa tus datos.");
        } finally {
            setBusy(false);
        }
    };

    const submitRecovery = async (event) => {
        event.preventDefault();
        setError("");
        setNotice("");
        setRotatedRecoveryCode("");
        if (newPassword.length < 14) {
            setError("La nueva contraseña debe tener al menos 14 caracteres.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        setBusy(true);
        try {
            const result = await api("/admin/auth/recover", {
                method: "POST",
                body: JSON.stringify({
                    username: username.trim(),
                    recovery_code: recoveryCode.trim(),
                    new_password: newPassword,
                }),
            });
            if (!result?.ok || !result?.recovery_code) {
                throw new Error("No se pudieron verificar los datos de recuperación. Comprueba el usuario y el código e inténtalo más tarde.");
            }
            setRotatedRecoveryCode(result.recovery_code);
            setNotice("Contraseña actualizada. El código de recuperación anterior ya no sirve. Guarda este nuevo código fuera del ordenador y no cierres esta pantalla hasta haberlo guardado.");
            setPassword("");
            setRecoveryCode("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err?.message || "No se pudo recuperar el acceso.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-screen">
            <div className="auth-card admin-login-card">
                <div className="auth-brand">
                    <img src="/ecofusion-logo.png" alt="EcoFusion Rental Cars" />
                    <div><small>Acceso privado de administración</small></div>
                </div>
                <span className="page-hero__eyebrow">PANEL PROTEGIDO</span>
                <h1>{mode === "login" ? "Acceso administrativo" : "Recuperar acceso"}</h1>
                <p>
                    {mode === "login"
                        ? "Usa las credenciales privadas creadas directamente en el servidor. Este acceso no utiliza Google ni el correo de clientes."
                        : "Para restablecer el acceso necesitas el código de recuperación guardado fuera de la web. No se envía ningún correo."}
                </p>

                <div className="admin-auth-tabs" role="group" aria-label="Tipo de acceso">
                    <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => { setMode("login"); setError(""); setNotice(""); setRotatedRecoveryCode(""); }} disabled={busy}>Iniciar sesión</button>
                    <button type="button" className={mode === "recovery" ? "is-active" : ""} onClick={() => { setMode("recovery"); setError(""); setNotice(""); setRotatedRecoveryCode(""); }} disabled={busy}>Recuperar acceso</button>
                </div>

                {mode === "login" ? (
                    <form className="simple-form" onSubmit={submitLogin}>
                        <label>Usuario administrador
                            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" minLength={3} maxLength={80} required />
                        </label>
                        <label>Contraseña privada
                            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" maxLength={128} required />
                        </label>
                        {error && <p className="auth-error" role="alert">{error}</p>}
                        <button type="submit" disabled={busy}>{busy ? "Verificando acceso…" : "Entrar al panel"}</button>
                    </form>
                ) : (
                    <form className="simple-form" onSubmit={submitRecovery}>
                        <label>Usuario administrador
                            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" minLength={3} maxLength={80} required />
                        </label>
                        <label>Código de recuperación
                            <input value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value)} autoComplete="off" spellCheck="false" minLength={20} maxLength={160} required />
                        </label>
                        <label>Nueva contraseña (mínimo 14 caracteres)
                            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={14} maxLength={128} required />
                        </label>
                        <label>Confirmar nueva contraseña
                            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={14} maxLength={128} required />
                        </label>
                        {error && <p className="auth-error" role="alert">{error}</p>}
                        <button type="submit" disabled={busy}>{busy ? "Comprobando código…" : "Restablecer contraseña"}</button>
                    </form>
                )}

                {notice && <p className="admin-recovery-notice" role="status">{notice}</p>}
                {rotatedRecoveryCode && (
                    <div className="admin-recovery-code" role="alert">
                        <strong>Nuevo código de recuperación — se muestra una sola vez</strong>
                        <code>{rotatedRecoveryCode}</code>
                        <p>Cópialo ahora a un gestor de contraseñas o guárdalo impreso en un lugar seguro. No lo compartas ni lo dejes en este dispositivo.</p>
                        <button type="button" onClick={() => { navigator.clipboard?.writeText(rotatedRecoveryCode).catch(() => {}); }}>Copiar código</button>
                    </div>
                )}
                <p className="auth-footer"><a href="/">← {t.common.viewSite}</a></p>
            </div>
        </div>
    );
}
