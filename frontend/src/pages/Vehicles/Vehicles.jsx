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

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return vehicles.filter((vehicle) => {
            const categoryMatch = category === "all" || vehicle.category === category;
            const searchMatch = !query || `${vehicle.name} ${vehicle.categoryLabel} ${vehicle.color}`.toLowerCase().includes(query);
            return categoryMatch && searchMatch;
        });
    }, [category, search, vehicles]);

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
                        <span>California-ready fleet</span>
                        <span>Hybrid options</span>
                        <span>{vehicles.length} vehicles</span>
                    </div>
                </div>
            </section>

            <section className="vehicles-page">
                <div className="container">
                    <div className="vehicles-page__intro">
                        <SectionHeading eyebrow="ECOFUSION FLEET" title={t.fleet.viewAll} description={t.fleet.description} />
                    </div>

                    <div className="vehicles-toolbar">
                        <div className="vehicle-filters" role="tablist" aria-label="Vehicle categories">
                            {categories.map(([value, label]) => (
                                <button key={value} type="button" role="tab" aria-selected={category === value} className={category === value ? "is-active" : ""} onClick={() => setCategory(value)}>{label}</button>
                            ))}
                        </div>
                        <label className="vehicles-search">
                            <span>⌕</span>
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the fleet" />
                        </label>
                    </div>

                    <div className="vehicles-grid">
                        {filtered.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
                    </div>

                    {!filtered.length && (
                        <div className="vehicles-empty">
                            <strong>No vehicles match your search.</strong>
                            <button type="button" onClick={() => { setCategory("all"); setSearch(""); }}>Clear filters</button>
                        </div>
                    )}
                </div>
            </section>
        </PageShell>
    );
}

export default Vehicles;
