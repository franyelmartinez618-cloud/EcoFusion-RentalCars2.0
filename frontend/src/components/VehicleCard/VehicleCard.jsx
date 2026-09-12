import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import { getVehicleImage } from "../../utils/vehicleImage";
import "./VehicleCard.css";

function VehicleCard({ vehicle, compact = false }) {
    const { translations } = useApp();
    const translationKey = vehicle.slug.replace("toyota-", "");
    const translated = translations.fleet?.[translationKey] || {};
    const category = translated.category || vehicle.categoryLabel;
    const image = getVehicleImage(vehicle);

    return (
        <article className={`vehicle-card ${compact ? "vehicle-card--compact" : ""}`}>
            <Link to={`/vehicles/${vehicle.slug}`} className="vehicle-card__media-link" aria-label={`${translated.name || vehicle.name} details`}>
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
                        <i>✦</i> {vehicle.categoryLabel?.toLowerCase().includes("hybrid") ? "Eco-Hybrid" : "Toyota Fleet"}
                    </span>
                    <span className="vehicle-card__zoom">＋</span>
                    <span className="vehicle-card__media-glow" />
                </div>
            </Link>

            <div className="vehicle-card__content">
                <div className="vehicle-card__top">
                    <div>
                        <span className="vehicle-card__eyebrow">TOYOTA</span>
                        <h3>{translated.name || vehicle.name}</h3>
                        <p>{translated.description || "Reliable, comfortable and ready for your California journey."}</p>
                    </div>
                    <div className="vehicle-card__category">{category}</div>
                </div>

                <div className="vehicle-card__specs">
                    <span><b>◉</b><em>Transmission</em>{vehicle.transmission}</span>
                    <span><b>♧</b><em>Capacity</em>{vehicle.seats} {vehicle.seats === 1 ? "seat" : "seats"}</span>
                    <span><b>↗</b><em>Efficiency</em>{vehicle.efficiency}</span>
                </div>

                <div className="vehicle-card__bottom">
                    <div className="vehicle-card__price">
                        <small>{translations.featured?.from || "From"}</small>
                        <strong>${vehicle.price}</strong>
                        <span>{translations.featured?.perDay || "/ day"}</span>
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
