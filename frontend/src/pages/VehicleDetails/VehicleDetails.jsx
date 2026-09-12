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
                        <span className="vehicle-detail__badge">TOYOTA · {vehicle.operationalStatus || "READY"}</span>
                        <VehicleViewer vehicle={vehicle} alt={translated.name || vehicle.name} />
                    </div>
                    <div className="vehicle-detail__copy">
                        <span className="page-hero__eyebrow">TOYOTA RENTAL</span>
                        <h1>{translated.name || vehicle.name}</h1>
                        <p>{translated.description || "Reliable, comfortable and prepared for your California journey."}</p>
                        <div className="detail-specs">
                            <div><small>Capacity</small><strong>{vehicle.seats} seats</strong></div>
                            <div><small>Luggage</small><strong>{vehicle.luggage} bags</strong></div>
                            <div><small>Transmission</small><strong>{vehicle.transmission}</strong></div>
                            <div><small>Efficiency</small><strong>{vehicle.efficiency}</strong></div>
                            <div><small>Model year</small><strong>{vehicle.year}</strong></div>
                            <div><small>Location</small><strong>{vehicle.location}</strong></div>
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
