import { useApp } from "../../context/AppContext";
import { useAppData } from "../../context/AppDataContext";
import { getVehicleSlug, Link } from "../../utils/router";
import PageShell from "../../components/PageShell/PageShell";
import VehicleViewer from "../../components/VehicleViewer/VehicleViewer";
import "../SimplePages.css";

function VehicleDetails({ path }) {
    const { translations: t } = useApp();
    const { vehicles } = useAppData();
    const slug = getVehicleSlug(path) || "toyota-rav4";
    const vehicle = vehicles.find((item) => item.slug === slug) || vehicles[0];
    const key = vehicle.slug.replace("toyota-", "");
    const translated = t.fleet?.[key] || {};

    return (
        <PageShell>
            <section className="vehicle-detail">
                <div className="container vehicle-detail__grid">
                    <div className="vehicle-detail__visual">
                        <span className="vehicle-detail__badge">TOYOTA · {vehicle.operationalStatus || t.vehicleDetails.badgeReady}</span>
                        <VehicleViewer vehicle={vehicle} alt={translated.name || vehicle.name} />
                    </div>
                    <div className="vehicle-detail__copy">
                        <span className="page-hero__eyebrow">{t.vehicleDetails.eyebrow}</span>
                        <h1>{translated.name || vehicle.name}</h1>
                        <p>{translated.description || t.vehicleDetails.descriptionFallback}</p>
                        <div className="detail-specs">
                            <div><small>{t.vehicleDetails.capacity}</small><strong>{vehicle.seats} {t.vehicleDetails.seats}</strong></div>
                            <div><small>{t.vehicleDetails.luggage}</small><strong>{vehicle.luggage} {t.vehicleDetails.bags}</strong></div>
                            <div><small>{t.vehicleDetails.transmission}</small><strong>{vehicle.transmission}</strong></div>
                            <div><small>{t.vehicleDetails.efficiency}</small><strong>{vehicle.efficiency}</strong></div>
                            <div><small>{t.vehicleDetails.modelYear}</small><strong>{vehicle.year}</strong></div>
                            <div><small>{t.vehicleDetails.location}</small><strong>{vehicle.location}</strong></div>
                        </div>
                        <div className="vehicle-detail__price"><span>{t.featured.from}</span><strong>${vehicle.price}</strong><small>{t.featured.perDay}</small></div>
                        <div className="button-row"><Link className="button button--primary" to="/book">{t.featured.bookVehicle} <span>→</span></Link><Link className="button button--ghost" to="/vehicles">{t.fleet.viewAll}</Link></div>
                    </div>
                </div>
            </section>
        </PageShell>
    );
}
export default VehicleDetails;
