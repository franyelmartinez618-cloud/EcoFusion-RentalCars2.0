import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { Link } from "../../utils/router";
import { getVehicleImage } from "../../utils/vehicleImage";
import "./VehicleCard.css";

function VehicleCard({ vehicle, compact = false, index = 0 }) {
    const { translations: t, language } = useApp();
    const { showToast } = useToast();
    const translationKey = vehicle.slug.replace("toyota-", "");
    const translated = t.fleet?.[translationKey] || {};
    const category = translated.category || vehicle.categoryLabel;
    const image = getVehicleImage(vehicle);
    const favoriteKey = `ecofusion-favorite-${vehicle.id}`;
    const [favorite, setFavorite] = useState(() => localStorage.getItem(favoriteKey) === "1");

    useEffect(() => {
        localStorage.setItem(favoriteKey, favorite ? "1" : "0");
    }, [favorite, favoriteKey]);

    const toggleFavorite = () => {
        const next = !favorite;
        setFavorite(next);
        showToast(next ? `${translated.name || vehicle.name} ${t.vehiclesPage.favoriteAdded}` : `${translated.name || vehicle.name} ${t.vehiclesPage.favoriteRemoved}`, "success");
    };

    return (
        <article className={`vehicle-card reveal reveal--delay-${Math.min(index + 1, 4)} ${compact ? "vehicle-card--compact" : ""}`}>
            <Link to={`/vehicles/${vehicle.slug}`} className="vehicle-card__media-link" aria-label={`${translated.name || vehicle.name} ${t.vehiclesPage.details}`}>
                <div className="vehicle-card__media">
                    <img
                        src={image}
                        alt={translated.name || vehicle.name}
                        loading="lazy"
                        onError={(event) => {
                            if (event.currentTarget.src !== vehicle.image) event.currentTarget.src = vehicle.image;
                        }}
                    />
                    <span className={`vehicle-card__badge vehicle-card__badge--${vehicle.accent || "green"}`}>
                        {vehicle.categoryLabel?.toLowerCase().includes("hybrid") ? t.vehiclesPage.badgeHybrid : t.vehiclesPage.badgeFleet}
                    </span>
                    <button type="button" className={`vehicle-card__favorite ${favorite ? "is-active" : ""}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite(); }} aria-label={favorite ? `${t.vehiclesPage.removeFavorite}: ${translated.name || vehicle.name}` : `${t.vehiclesPage.addFavorite}: ${translated.name || vehicle.name}`} aria-pressed={favorite}>
                        {favorite ? "♥" : "♡"}
                    </button>
                </div>
            </Link>

            <div className="vehicle-card__content">
                <div className="vehicle-card__top">
                    <div>
                        <span className="vehicle-card__eyebrow">{t.common.toyota}</span>
                        <h3>{translated.name || vehicle.name}</h3>
                        <p>{translated.description || t.vehiclesPage.descriptionFallback}</p>
                    </div>
                    <div className="vehicle-card__category">{category}</div>
                </div>

                <div className="vehicle-card__specs" aria-label={language === "es" ? "Características del vehículo" : "Vehicle features"}>
                    <span><em>{t.vehicleDetails.capacity}</em><strong>{vehicle.seats} {t.vehicleDetails.seats}</strong></span>
                    <span><em>{t.vehicleDetails.transmission}</em><strong>{/automatic/i.test(vehicle.transmission || "") ? (language === "es" ? "Automática" : "Automatic") : vehicle.transmission}</strong></span>
                    <span><em>{t.vehicleDetails.luggage}</em><strong>{vehicle.luggage} {t.vehicleDetails.bags}</strong></span>
                    <span><em>{t.vehicleDetails.efficiency}</em><strong>{vehicle.efficiency}</strong></span>
                    {vehicle.airConditioning === true && <span><em>{language === "es" ? "Confort" : "Comfort"}</em><strong>{language === "es" ? "Aire acondicionado" : "Air conditioning"}</strong></span>}
                </div>

                <div className="vehicle-card__bottom">
                    <div className="vehicle-card__price">
                        <small>{t.featured?.from || "From"}</small>
                        <strong>${vehicle.price}</strong>
                        <span>{t.featured?.perDay || "/ day"}</span>
                    </div>
                    <Link to={`/vehicles/${vehicle.slug}`} className="vehicle-card__button">
                        <span>{translated.button || "View details"}</span>
                        <b>→</b>
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default VehicleCard;
