import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAppData } from "../../context/AppDataContext";
import { Link } from "../../utils/router";
import { databaseGroups, databaseEntities } from "../../utils/dbSchema";
import "./Admin.css";

const modules = [
    ["overview", "Overview", "◫"],
    ["vehicles", "Vehicles", "▣"],
    ["reservations", "Reservations", "□"],
    ["customers", "Customers", "♙"],
    ["reviews", "Ratings & reviews", "★"],
    ["content", "Site content", "▤"],
    ["locations", "Locations", "⌖"],
    ["offers", "Offers", "%"],
    ["support", "Support", "?"],
    ["maintenance", "Maintenance", "⚙"],
    ["gps", "GPS", "◉"],
    ["database", "Database CRUD", "⌘"],
    ["settings", "Settings", "☷"],
];

const collectionFields = {
    vehicles: ["id", "name", "slug", "category", "categoryLabel", "price", "seats", "luggage", "transmission", "efficiency", "color", "year", "location", "generalStatus", "operationalStatus", "imageUrl"],
    reservations: ["id", "customer", "vehicle", "dates", "status", "total"],
    customers: ["id", "name", "email", "status", "reservations"],
    reviews: ["id", "name", "location", "trip", "rating", "status", "quote"],
    locations: ["id", "name", "region", "status", "description"],
    offers: ["id", "title", "badge", "status", "description"],
    support: ["id", "customer", "subject", "priority", "status", "updated"],
    maintenance: ["id", "vehicle", "type", "date", "status"],
    gps: ["id", "vehicle", "device", "status", "lastPing"],
};

const imageFields = [
    ["heroImageUrl", "Hero / main presentation image"],
    ["featuredImageUrl", "Featured vehicle image"],
    ["aboutImageUrl", "About section image"],
    ["californiaImageUrl", "California section image"],
    ["offerImageUrls.0", "Offer card 01 image"],
    ["offerImageUrls.1", "Offer card 02 image"],
    ["offerImageUrls.2", "Offer card 03 image"],
];

function labelize(value) {
    return value.replace(/([A-Z])/g, " $1").replace(/[_\.]/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function valueType(field) {
    return ["price", "total", "rating", "reservations", "seats", "luggage", "year", "mileage", "stock"].includes(field) ? "number" : field === "date" ? "date" : "text";
}

function CRUDTable({ title, rows = [], type, onAdd, onEdit, onDelete }) {
    const [query, setQuery] = useState("");
    const fields = collectionFields[type] || Object.keys(rows[0] || { id: "", status: "", notes: "" });
    const filtered = rows.filter((row) => !query.trim() || Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase())));

    return <section className="admin-panel">
        <div className="admin-panel__header"><div><span className="admin-kicker">CRUD MANAGEMENT</span><h2>{title}</h2></div><button className="admin-button admin-button--primary" type="button" onClick={onAdd}>+ Add record</button></div>
        <div className="admin-toolbar"><label className="admin-search">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${title.toLowerCase()}...`} /></label><span>{filtered.length} records</span></div>
        <div className="admin-table-wrap"><div className="admin-table-scroll"><table><thead><tr>{fields.map((field) => <th key={field}>{labelize(field)}</th>)}<th>Actions</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}>{fields.map((field) => <td key={field}>{field === "rating" ? `${row[field]}/5` : field === "price" || field === "total" ? `$${row[field]}` : String(row[field] ?? "—")}</td>)}<td><div className="admin-row-actions"><button type="button" onClick={() => onEdit(row)}>Edit</button><button type="button" onClick={() => onDelete(row.id)}>Delete</button></div></td></tr>)}</tbody></table></div></div>
    </section>;
}

function Editor({ type, row, onCancel, onSave }) {
    const fields = type === "content" ? imageFields.map(([key]) => key) : collectionFields[type] || ["id", "status", "notes"];
    const [draft, setDraft] = useState({ ...row });
    const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
    const save = (event) => { event.preventDefault(); onSave(draft); };

    return <div className="admin-modal-backdrop" role="presentation"><div className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal__header"><div><span className="admin-kicker">{type === "content" ? "VISUAL CONTENT" : "CRUD EDITOR"}</span><h2>{row.__new ? "Add record" : `Edit ${row.id || "content"}`}</h2></div><button type="button" onClick={onCancel}>×</button></div><form className="admin-modal__form" onSubmit={save}>
        {type === "content" ? fields.map((field) => <label key={field}>{imageFields.find(([key]) => key === field)?.[1] || labelize(field)}<input type="url" placeholder="https://..." value={draft[field] ?? ""} onChange={(event) => set(field, event.target.value)} />{draft[field] && <span className="admin-image-preview"><img src={draft[field]} alt="Preview" onError={(event) => { event.currentTarget.style.display = "none"; }} /></span>}</label>) : fields.map((field) => <label key={field}>{labelize(field)}<input required={field === "id" || field === "name"} type={valueType(field)} value={draft[field] ?? ""} onChange={(event) => set(field, valueType(field) === "number" ? Number(event.target.value) : event.target.value)} /></label>)}
        <div className="admin-modal__actions"><button className="admin-button" type="button" onClick={onCancel}>Cancel</button><button className="admin-button admin-button--primary" type="submit">Save changes</button></div>
    </form></div></div>;
}

function DatabaseBrowser({ dbRecords, setDbEntityRecords, flash }) {
    const [entity, setEntity] = useState("vehicles");
    const [editor, setEditor] = useState(null);
    const rows = dbRecords[entity] || [];
    const add = () => setEditor({ id: `${entity.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`, payload: "{}", __new: true });
    const edit = (row) => setEditor({ ...row });
    const remove = (id) => { setDbEntityRecords(entity, rows.filter((row) => row.id !== id)); flash(`Deleted ${id} from local admin data.`); };
    const save = (draft) => { const record = { id: draft.id || `${entity.slice(0, 3).toUpperCase()}-${Date.now()}`, payload: draft.payload || "{}" }; let payload = record.payload; try { payload = JSON.stringify(JSON.parse(payload), null, 0); } catch { flash("Payload must be valid JSON."); return; } const next = rows.some((row) => row.id === record.id) ? rows.map((row) => row.id === record.id ? record : row) : [record, ...rows]; setDbEntityRecords(entity, next); setEditor(null); flash(`Saved ${entity}.`); };

    return <section className="admin-panel database-panel"><div className="admin-panel__header"><div><span className="admin-kicker">69-TABLE MASTER MODEL</span><h2>Database CRUD browser</h2><p>Select any logical database entity from the master specification. This frontend browser stores prototype records locally until FastAPI binds these forms to MySQL.</p></div></div><div className="database-selector"><label>Entity<select value={entity} onChange={(event) => setEntity(event.target.value)}>{databaseGroups.map((group) => <optgroup key={group.name} label={group.name}>{group.entities.map((name) => <option key={name} value={name}>{name}</option>)}</optgroup>)}</select></label><button className="admin-button admin-button--primary" type="button" onClick={add}>+ Add record</button></div><div className="db-meta"><strong>{entity}</strong><span>{databaseEntities.length} entities covered</span></div><div className="admin-table-wrap"><div className="admin-table-scroll"><table><thead><tr><th>Record ID</th><th>Prototype payload</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.id}</td><td><code>{row.payload}</code></td><td><div className="admin-row-actions"><button type="button" onClick={() => edit(row)}>Edit</button><button type="button" onClick={() => remove(row.id)}>Delete</button></div></td></tr>)}</tbody></table></div></div>{editor && <div className="admin-modal-backdrop" role="presentation"><div className="admin-modal"><div className="admin-modal__header"><div><span className="admin-kicker">GENERIC ENTITY</span><h2>{editor.__new ? "Add" : "Edit"} {entity}</h2></div><button type="button" onClick={() => setEditor(null)}>×</button></div><form className="admin-modal__form database-editor" onSubmit={(event) => { event.preventDefault(); save(editor); }}><label>Record ID<input value={editor.id} onChange={(event) => setEditor((current) => ({ ...current, id: event.target.value }))} /></label><label>JSON payload<textarea value={editor.payload} onChange={(event) => setEditor((current) => ({ ...current, payload: event.target.value }))} /></label><div className="admin-modal__actions"><button type="button" className="admin-button" onClick={() => setEditor(null)}>Cancel</button><button type="submit" className="admin-button admin-button--primary">Save record</button></div></form></div></div>}</section>;
}

function Admin() {
    const { theme, language, toggleTheme, toggleLanguage } = useApp();
    const app = useAppData();
    const [active, setActive] = useState("overview");
    const [editor, setEditor] = useState(null);
    const [toast, setToast] = useState("");
    const flash = (message) => { setToast(message); window.clearTimeout(window.__efToast); window.__efToast = window.setTimeout(() => setToast(""), 2400); };

    const collections = { vehicles: app.vehicles, reservations: app.reservations, customers: app.customers, reviews: app.reviews, locations: app.locations, offers: app.offers, support: app.support, maintenance: app.maintenance, gps: app.gps };
    const titles = Object.fromEntries(modules.map(([key, label]) => [key, label]));
    const openEditor = (type, row) => setEditor({ type, row: row ? { ...row } : { id: `${type.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`, __new: true } });
    const save = (row) => { const type = editor.type; const payload = { ...row }; delete payload.__new; if (type === "vehicles") { if (app.vehicles.some((v) => v.id === payload.id)) app.updateVehicle(payload.id, payload); else app.addVehicle(payload); } else if (["reservations","customers","reviews","locations","offers","support","maintenance","gps"].includes(type)) { const exists = (app[type] || []).some((item) => item.id === payload.id); exists ? app.updateRecord(type, payload.id, payload) : app.addRecord(type, payload); } setEditor(null); flash(`Saved ${type}.`); };
    const remove = (type, id) => { if (type === "vehicles") app.deleteVehicle(id); else app.deleteRecord(type, id); flash(`Deleted ${id} from the frontend data store.`); };

    return <div className="admin-app"><aside className="admin-sidebar"><div className="admin-brand"><span>E</span><div><strong>EcoFusion</strong><small>Admin Console</small></div></div><nav>{modules.map(([key, label, icon]) => <button key={key} className={active === key ? "is-active" : ""} type="button" onClick={() => setActive(key)}><span>{icon}</span>{label}</button>)}</nav><Link className="admin-back" to="/">← Back to website</Link></aside>
        <main className="admin-main"><header className="admin-topbar"><div><span>ADMIN / {titles[active]?.toUpperCase()}</span><h1>{titles[active]}</h1></div><div className="admin-topbar__actions"><span className="admin-status"><i /> Local prototype store</span><div className="admin-controls" aria-label="Admin appearance controls"><button type="button" className="admin-control" onClick={toggleLanguage} aria-label="Change admin language"><span className="admin-control__label">LANG</span><strong>{language === "en" ? "EN" : "ES"}</strong></button><button type="button" className="admin-control admin-control--theme" onClick={toggleTheme} aria-label="Change admin color theme"><span className="admin-control__icon">{theme === "light" ? "☾" : "☀"}</span><span>{theme === "light" ? "Dark" : "Light"}</span></button></div><Link to="/">View site</Link></div></header><div className="admin-content"><div className="admin-notice"><strong>Frontend-first data layer.</strong><span>Changes are persisted in this browser so you can fully design and test the workflows. The production backend will route every write through FastAPI to MySQL with authorization, validation, parameterized queries, safe sessions, rate limits, webhook verification and audit logging.</span></div>
            {active === "overview" && <Overview app={app} onModule={setActive} />}
            {collections[active] && <CRUDTable title={titles[active]} rows={collections[active]} type={active} onAdd={() => openEditor(active)} onEdit={(row) => openEditor(active, row)} onDelete={(id) => remove(active, id)} />}
            {active === "content" && <ContentManager app={app} flash={flash} />}
            {active === "database" && <DatabaseBrowser dbRecords={app.dbRecords} setDbEntityRecords={app.setDbEntityRecords} flash={flash} />}
            {active === "settings" && <Settings settings={app.settings} setSettings={app.setSettings} resetData={app.resetData} flash={flash} />}
            {toast && <div className="admin-toast">{toast}</div>}
            {editor && <Editor type={editor.type} row={editor.row} onCancel={() => setEditor(null)} onSave={save} />}
        </div></main></div>;
}

function Overview({ app, onModule }) { const cards = [["vehicles", app.vehicles.length, "Fleet"],["reservations", app.reservations.length, "Reservations"],["customers", app.customers.length, "Customers"],["reviews", app.reviews.length, "Ratings"],["support", app.support.length, "Support"],["gps", app.gps.length, "GPS"]]; return <><div className="admin-stat-grid">{cards.map(([key, value, label]) => <button className="admin-stat" key={key} type="button" onClick={() => onModule(key)}><span>{label}</span><strong>{value}</strong><small>Manage →</small></button>)}</div><section className="admin-panel admin-panel--security"><div className="admin-panel__header"><div><span className="admin-kicker">DATABASE CONTRACT</span><h2>All 69 logical tables are accounted for</h2></div></div><div className="security-grid"><div><strong>Fleet & pricing</strong><p>Vehicles, images, features, rates, promotions, add-ons, protection, fees and taxes are represented in the master model.</p></div><div><strong>Reservations & payments</strong><p>Reservation lifecycle, payment transactions, holds, refunds, invoices and webhook events are separated.</p></div><div><strong>Operations & GPS</strong><p>Pickup, returns, inspections, damages, maintenance, parts, assets and prepared GPS tracking are covered.</p></div><div><strong>Support & governance</strong><p>Notifications, support tickets/messages, legal documents, acceptances, settings and audit logs are covered.</p></div></div></section></>; }

function ContentManager({ app, flash }) { const [row, setRow] = useState({ ...app.content }); const save = () => { const patch = { ...row }; const offerImageUrls = [patch["offerImageUrls.0"] ?? row.offerImageUrls?.[0] ?? "", patch["offerImageUrls.1"] ?? row.offerImageUrls?.[1] ?? "", patch["offerImageUrls.2"] ?? row.offerImageUrls?.[2] ?? ""]; delete patch["offerImageUrls.0"]; delete patch["offerImageUrls.1"]; delete patch["offerImageUrls.2"]; patch.offerImageUrls = offerImageUrls; app.setContent(patch); flash("Visual content saved locally. Public pages update immediately."); }; return <section className="admin-panel"><div className="admin-panel__header"><div><span className="admin-kicker">EDITABLE VISUALS</span><h2>Images and presentation blocks</h2><p>Paste a public image URL. Leave it empty to use the safe local fallback already included in the project.</p></div><button className="admin-button admin-button--primary" type="button" onClick={save}>Save visuals</button></div><div className="content-image-grid">{imageFields.map(([key,label]) => { const value = key.startsWith("offerImageUrls.") ? row[key] ?? row.offerImageUrls?.[Number(key.split(".")[1])] ?? "" : row[key] ?? ""; return <label key={key}>{label}<input type="url" placeholder="https://example.com/car.jpg" value={value} onChange={(event) => setRow((current) => ({ ...current, [key]: event.target.value }))} />{value && <img src={value} alt="Editable preview" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</label>; })}</div></section>; }

function Settings({ settings, setSettings, resetData, flash }) { const [draft, setDraft] = useState(settings); const save = () => { setSettings(draft); flash("Theme and platform settings saved locally."); }; return <section className="admin-panel"><div className="admin-panel__header"><div><span className="admin-kicker">SYSTEM / THEME</span><h2>Platform appearance</h2><p>Light mode is the default. These accent tokens update the interface without editing CSS files manually.</p></div></div><div className="settings-grid"><label>Company name<input value={draft.companyName} onChange={(event) => setDraft({ ...draft, companyName: event.target.value })} /></label><label>Country<select value={draft.country} onChange={(event) => setDraft({ ...draft, country: event.target.value })}><option value="US">United States</option><option value="CO">Colombia</option></select></label><label>Currency<select value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.target.value })}><option>USD</option></select></label><label>Light primary<input type="color" value={draft.lightPrimary} onChange={(event) => setDraft({ ...draft, lightPrimary: event.target.value })} /></label><label>Light neon green<input type="color" value={draft.lightNeonGreen} onChange={(event) => setDraft({ ...draft, lightNeonGreen: event.target.value })} /></label><label>Dark primary<input type="color" value={draft.darkPrimary} onChange={(event) => setDraft({ ...draft, darkPrimary: event.target.value })} /></label><label>Dark neon purple<input type="color" value={draft.darkNeonPurple} onChange={(event) => setDraft({ ...draft, darkNeonPurple: event.target.value })} /></label><label>Rental policy<input value={draft.defaultRentalPolicy} onChange={(event) => setDraft({ ...draft, defaultRentalPolicy: event.target.value })} /></label></div><div className="settings-actions"><button className="admin-button" type="button" onClick={() => { resetData(); flash("Local prototype data reset."); }}>Reset local data</button><button className="admin-button admin-button--primary" type="button" onClick={save}>Save settings</button></div></section>; }

export default Admin;
