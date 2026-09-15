import { useMemo, useState } from "react";
import PageShell from "../../components/PageShell/PageShell";
import SectionHeading from "../../components/SectionHeading/SectionHeading";
import VehicleCard from "../../components/VehicleCard/VehicleCard";
import { useApp } from "../../context/AppContext";
import { useAppData } from "../../context/AppDataContext";
import "../SimplePages.css";
import "./Vehicles.css";

function Vehicles() {
    const { translations: t } = useApp();
    const { vehicles } = useAppData();
    const [category, setCategory] = useState("all");
    const [search, setSearch] = useState("");
    const [transmission, setTransmission] = useState("all");
    const [fuel, setFuel] = useState("all");
    const [maxPrice, setMaxPrice] = useState(300);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return vehicles.filter((vehicle) => {
            const categoryMatch = category === "all" || vehicle.category === category;
            const transmissionMatch = transmission === "all" || vehicle.transmission === transmission;
            const derivedFuel = vehicle.fuel || (/hybrid/i.test(vehicle.categoryLabel || "") ? "Hybrid" : "Gasoline");
            const fuelMatch = fuel === "all" || derivedFuel === fuel;
            const priceMatch = Number(vehicle.price || 0) <= maxPrice;
            const searchMatch = !query || `${vehicle.name} ${vehicle.categoryLabel} ${vehicle.color} ${vehicle.fuel || (/hybrid/i.test(vehicle.categoryLabel || "") ? "Hybrid" : "Gasoline")}`.toLowerCase().includes(query);
            return categoryMatch && transmissionMatch && fuelMatch && priceMatch && searchMatch;
        });
    }, [category, search, transmission, fuel, maxPrice, vehicles]);

    const categories = [
        ["all", t.fleet.categories.all],
        ["compact", t.fleet.categories.compact],
        ["sedan", t.fleet.categories.sedan],
        ["suv", t.fleet.categories.suv],
        ["premium", t.fleet.categories.premium],
    ];

    return (
        <PageShell>
            <section className="page-hero page-hero--vehicles">
                <div className="container page-hero__inner">
                    <span className="page-hero__eyebrow">{t.fleet.eyebrow}</span>
                    <h1>{t.fleet.title}</h1>
                    <p>{t.fleet.description}</p>
                    <div className="vehicles-page__hero-pills">
                        <span>{t.vehiclesPage.fleetReady}</span>
                        <span>{t.vehiclesPage.hybridOptions}</span>
                        <span>{vehicles.length} {t.vehiclesPage.vehicleCount}</span>
                    </div>
                </div>
            </section>

            <section className="vehicles-page">
                <div className="container">
                    <div className="vehicles-page__intro">
                        <SectionHeading eyebrow={t.vehiclesPage.introEyebrow} title={t.fleet.viewAll} description={t.fleet.description} />
                    </div>

                    <div className="vehicles-toolbar">
                        <div className="vehicle-filters" role="tablist" aria-label={t.vehiclesPage.categoriesLabel}>
                            {categories.map(([value, label]) => (
                                <button key={value} type="button" role="tab" aria-selected={category === value} className={category === value ? "is-active" : ""} onClick={() => setCategory(value)}>{label}</button>
                            ))}
                            <button type="button" className={`vehicle-filter-toggle ${filtersOpen ? "is-active" : ""}`} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}>{t.vehiclesPage.filters} <span>⌄</span></button>
                        </div>
                        <label className="vehicles-search">
                            <span>⌕</span>
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.vehiclesPage.searchPlaceholder} />
                        </label>
                    </div>

                    {filtersOpen && (
                        <div className="vehicles-advanced-filters reveal" aria-label={t.vehiclesPage.advancedFiltersLabel}>
                            <label><span>{t.vehiclesPage.transmission}</span><select value={transmission} onChange={(event) => setTransmission(event.target.value)}><option value="all">{t.common.any}</option><option value="Automatic">{t.vehiclesPage.automatic}</option><option value="Manual">{t.vehiclesPage.manual}</option></select></label>
                            <label><span>{t.vehiclesPage.fuel}</span><select value={fuel} onChange={(event) => setFuel(event.target.value)}><option value="all">{t.common.any}</option><option value="Hybrid">{t.vehiclesPage.hybrid}</option><option value="Gasoline">{t.vehiclesPage.gasoline}</option><option value="Electric">{t.vehiclesPage.electric}</option></select></label>
                            <label className="vehicles-price-filter"><span>{t.vehiclesPage.priceUpTo} <strong>${maxPrice}{t.vehiclesPage.perDay}</strong></span><input type="range" min="60" max="300" step="10" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label>
                        </div>
                    )}

                    {(category !== "all" || transmission !== "all" || fuel !== "all" || maxPrice !== 300 || search) && (
                        <div className="active-filter-chips" aria-label={t.vehiclesPage.activeFilters}>
                            {category !== "all" && <button type="button" onClick={() => setCategory("all")}>{categories.find(([value]) => value === category)?.[1]} ×</button>}
                            {transmission !== "all" && <button type="button" onClick={() => setTransmission("all")}>{transmission} ×</button>}
                            {fuel !== "all" && <button type="button" onClick={() => setFuel("all")}>{fuel} ×</button>}
                            {maxPrice !== 300 && <button type="button" onClick={() => setMaxPrice(300)}>${maxPrice}{t.vehiclesPage.perDay} ×</button>}
                            {search && <button type="button" onClick={() => setSearch("")}>“{search}” ×</button>}
                        </div>
                    )}

                    <div className="vehicles-grid">
                        {filtered.map((vehicle, index) => <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />)}
                    </div>

                    {!filtered.length && (
                        <div className="vehicles-empty">
                            <strong>{t.vehiclesPage.noMatch}</strong>
                            <button type="button" onClick={() => { setCategory("all"); setSearch(""); setTransmission("all"); setFuel("all"); setMaxPrice(300); }}>{t.vehiclesPage.clearFilters}</button>
                        </div>
                    )}
                </div>
            </section>
        </PageShell>
    );
}

export default Vehicles;
