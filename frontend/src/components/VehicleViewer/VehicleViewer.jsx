import { useEffect, useState } from "react";
import { getVehicleImage } from "../../utils/vehicleImage";
import { useApp } from "../../context/AppContext";
import "./VehicleViewer.css";

function VehicleViewer({ vehicle, alt }) {
    const { translations: t } = useApp();
    const [open, setOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const image = getVehicleImage(vehicle);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => event.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const reset = () => setZoom(1);

    return (
        <>
            <button type="button" className="vehicle-viewer" onClick={() => { setOpen(true); reset(); }} aria-label={`${t.vehiclesPage.zoomView}: ${alt}`}>
                <img src={image} alt={alt} onError={(event) => { if (event.currentTarget.src !== vehicle.image) event.currentTarget.src = vehicle.image; }} />
                <span className="vehicle-viewer__hint">⌕ {t.vehiclesPage.zoomView}</span>
                <span className="vehicle-viewer__glow" />
            </button>

            {open && (
                <div className="vehicle-lightbox" role="dialog" aria-modal="true" aria-label={`${alt} image viewer`} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
                    <div className="vehicle-lightbox__panel">
                        <div className="vehicle-lightbox__top"><strong>{alt}</strong><button type="button" onClick={() => setOpen(false)} aria-label={t.vehiclesPage.closeImage}>×</button></div>
                        <div className="vehicle-lightbox__stage">
                            <img src={image} alt={alt} style={{ transform: `scale(${zoom})` }} onError={(event) => { if (event.currentTarget.src !== vehicle.image) event.currentTarget.src = vehicle.image; }} />
                        </div>
                        <div className="vehicle-lightbox__controls"><button type="button" onClick={() => setZoom((v) => Math.max(1, +(v - .2).toFixed(1)))}>−</button><span>{Math.round(zoom * 100)}%</span><button type="button" onClick={() => setZoom((v) => Math.min(2, +(v + .2).toFixed(1)))}>+</button><button type="button" onClick={reset}>{t.vehiclesPage.resetZoom}</button></div>
                    </div>
                </div>
            )}
        </>
    );
}

export default VehicleViewer;
