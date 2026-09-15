import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAppData } from "../../context/AppDataContext";
import { Link } from "../../utils/router";
import { useAuth } from "../../context/AuthContext";
import { databaseGroups, databaseEntities } from "../../utils/dbSchema";
import { apiClient } from "../../services/api";
import "./Admin.css";

const moduleDefs = [
    ["overview", "◫"], ["vehicles", "▣"], ["reservations", "□"], ["payments", "$"],
    ["customers", "♙"], ["reviews", "★"], ["content", "▤"], ["locations", "⌖"],
    ["offers", "%"], ["support", "?"], ["maintenance", "⚙"], ["gps", "◉"],
    ["database", "⌘"], ["settings", "☷"],
];

const collectionFields = {
    vehicles: ["id", "name", "slug", "category", "categoryLabel", "price", "seats", "luggage", "transmission", "efficiency", "color", "year", "location", "generalStatus", "operationalStatus", "imageUrl"],
    reservations: ["id", "customer", "vehicle", "dates", "status", "total"],
    payments: ["id", "reservation", "customer", "amount", "status", "method", "date", "squareStatus"],
    customers: ["id", "name", "email", "status", "reservations"],
    reviews: ["id", "name", "location", "trip", "rating", "status", "quote"],
    locations: ["id", "name", "region", "status", "description"],
    offers: ["id", "title", "badge", "status", "description"],
    support: ["id", "customer", "subject", "priority", "status", "updated"],
    maintenance: ["id", "vehicle", "type", "date", "status"],
    gps: ["id", "vehicle", "device", "status", "lastPing"],
};

const imageFields = [
    ["heroImageUrl", "heroImage"], ["featuredImageUrl", "featuredImage"], ["aboutImageUrl", "aboutImage"],
    ["californiaImageUrl", "californiaImage"], ["offerImageUrls.0", "offerImage1"], ["offerImageUrls.1", "offerImage2"], ["offerImageUrls.2", "offerImage3"],
];

function labelize(value) { return value.replace(/([A-Z])/g, " $1").replace(/[_\.]/g, " ").replace(/^./, (c) => c.toUpperCase()); }
function valueType(field) { return ["price", "total", "rating", "reservations", "seats", "luggage", "year", "mileage", "stock"].includes(field) ? "number" : field === "date" ? "date" : "text"; }

function CRUDTable({ t, title, rows = [], type, onAdd, onEdit, onDelete }) {
    const [query, setQuery] = useState("");
    const fields = collectionFields[type] || Object.keys(rows[0] || { id: "", status: "", notes: "" });
    const filtered = rows.filter((row) => !query.trim() || Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase())));
    return <section className="admin-panel">
        <div className="admin-panel__header"><div><span className="admin-kicker">{t.admin.crudKicker}</span><h2>{title}</h2></div><button className="admin-button admin-button--primary" type="button" onClick={onAdd}>+ {t.common.addRecord}</button></div>
        <div className="admin-toolbar"><label className="admin-search">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.admin.searchPlaceholder} /></label><span>{filtered.length} {t.common.records}</span></div>
        <div className="admin-table-wrap"><div className="admin-table-scroll"><table><thead><tr>{fields.map((field) => <th key={field}>{labelize(field)}</th>)}<th>{t.admin.actions}</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}>{fields.map((field) => <td key={field}>{field === "rating" ? `${row[field]}/5` : ["price","total","amount"].includes(field) ? `$${row[field]}` : String(row[field] ?? "—")}</td>)}<td><div className="admin-row-actions"><button type="button" onClick={() => onEdit(row)}>{t.common.edit}</button><button type="button" onClick={() => onDelete(row.id)}>{t.common.delete}</button></div></td></tr>)}</tbody></table></div></div>
    </section>;
}

function Editor({ t, type, row, onCancel, onSave }) {
    const fields = type === "content" ? imageFields.map(([key]) => key) : collectionFields[type] || ["id", "status", "notes"];
    const [draft, setDraft] = useState({ ...row });
    const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
    const save = (event) => { event.preventDefault(); onSave(draft); };
    return <div className="admin-modal-backdrop" role="presentation"><div className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal__header"><div><span className="admin-kicker">{type === "content" ? t.admin.visualContent : t.admin.crudEditor}</span><h2>{row.__new ? t.admin.add : `${t.admin.editRecord} ${row.id || t.admin.editContent}`}</h2></div><button type="button" onClick={onCancel} aria-label={t.common.close}>×</button></div><form className="admin-modal__form" onSubmit={save}>
        {type === "content" ? fields.map((field) => { const imageKey = imageFields.find(([key]) => key === field)?.[1]; return <label key={field}>{imageKey ? t.admin[imageKey] : labelize(field)}<input type="url" placeholder="https://..." value={draft[field] ?? ""} onChange={(event) => set(field, event.target.value)} />{draft[field] && <span className="admin-image-preview"><img src={draft[field]} alt={t.admin.imagePreviewAlt} onError={(event) => { event.currentTarget.style.display = "none"; }} /></span>}</label>; }) : fields.map((field) => <label key={field}>{labelize(field)}<input required={field === "id" || field === "name"} type={valueType(field)} value={draft[field] ?? ""} onChange={(event) => set(field, valueType(field) === "number" ? Number(event.target.value) : event.target.value)} /></label>)}
        <div className="admin-modal__actions"><button className="admin-button" type="button" onClick={onCancel}>{t.common.cancel}</button><button className="admin-button admin-button--primary" type="submit">{t.common.save}</button></div>
    </form></div></div>;
}

function DatabaseBrowser({ t, dbRecords, setDbEntityRecords, flash }) {
    const [entity, setEntity] = useState("vehicles");
    const [editor, setEditor] = useState(null);
    const rows = dbRecords[entity] || [];
    const add = () => setEditor({ id: `${entity.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-6)}`, payload: "{}", __new: true });
    const edit = (row) => setEditor({ ...row });
    const remove = (id) => { setDbEntityRecords(entity, rows.filter((row) => row.id !== id)); flash(`${t.admin.deleted} ${id} ${t.admin.localAdminDeleted}`); };
    const save = (draft) => { const record = { id: draft.id || `${entity.slice(0,3).toUpperCase()}-${Date.now()}`, payload: draft.payload || "{}" }; let payload = record.payload; try { payload = JSON.stringify(JSON.parse(payload), null, 0); } catch { flash(t.admin.payloadInvalid); return; } const next = rows.some((row) => row.id === record.id) ? rows.map((row) => row.id === record.id ? { ...record, payload } : row) : [{ ...record, payload }, ...rows]; setDbEntityRecords(entity, next); setEditor(null); flash(`${t.admin.saved} ${entity}.`); };
    return <section className="admin-panel database-panel"><div className="admin-panel__header"><div><span className="admin-kicker">{t.admin.databaseKicker}</span><h2>{t.admin.databaseTitle}</h2><p>{t.admin.databaseText}</p></div></div><div className="database-selector"><label>{t.admin.entity}<select value={entity} onChange={(event) => setEntity(event.target.value)}>{databaseGroups.map((group)=><optgroup key={group.name} label={group.name}>{group.entities.map((name)=><option key={name} value={name}>{name}</option>)}</optgroup>)}</select></label><button className="admin-button admin-button--primary" type="button" onClick={add}>+ {t.common.addRecord}</button></div><div className="db-meta"><strong>{entity}</strong><span>{databaseEntities.length} {t.admin.entitiesCovered}</span></div><div className="admin-table-wrap"><div className="admin-table-scroll"><table><thead><tr><th>{t.admin.recordId}</th><th>{t.admin.prototypePayload}</th><th>{t.admin.actions}</th></tr></thead><tbody>{rows.map((row)=><tr key={row.id}><td>{row.id}</td><td><code>{row.payload}</code></td><td><div className="admin-row-actions"><button type="button" onClick={()=>edit(row)}>{t.common.edit}</button><button type="button" onClick={()=>remove(row.id)}>{t.common.delete}</button></div></td></tr>)}</tbody></table></div></div>{editor&&<div className="admin-modal-backdrop" role="presentation"><div className="admin-modal"><div className="admin-modal__header"><div><span className="admin-kicker">{t.admin.genericEntity}</span><h2>{editor.__new ? t.admin.add : t.admin.editRecord} {entity}</h2></div><button type="button" onClick={()=>setEditor(null)} aria-label={t.common.close}>×</button></div><form className="admin-modal__form database-editor" onSubmit={(event)=>{event.preventDefault();save(editor);}}><label>{t.admin.recordId}<input value={editor.id} onChange={(event)=>setEditor((current)=>({...current,id:event.target.value}))}/></label><label>{t.admin.jsonPayload}<textarea value={editor.payload} onChange={(event)=>setEditor((current)=>({...current,payload:event.target.value}))}/></label><div className="admin-modal__actions"><button type="button" className="admin-button" onClick={()=>setEditor(null)}>{t.common.cancel}</button><button type="submit" className="admin-button admin-button--primary">{t.common.save}</button></div></form></div></div>}</section>;
}

function Overview({ t, app, onModule }) {
    const cards = [["vehicles",app.vehicles.length],["reservations",app.reservations.length],["payments",app.payments.length],["customers",app.customers.length],["reviews",app.reviews.length],["support",app.support.length]];
    return <><div className="admin-stat-grid">{cards.map(([key,value])=><button className="admin-stat" key={key} type="button" onClick={()=>onModule(key)}><span>{t.admin.modules[key]}</span><strong>{value}</strong><small>{t.admin.manage} →</small></button>)}</div><section className="admin-panel admin-panel--security"><div className="admin-panel__header"><div><span className="admin-kicker">{t.admin.databaseContract}</span><h2>{t.admin.tableCoverage}</h2></div></div><div className="security-grid"><div><strong>{t.admin.fleetPricing}</strong><p>{t.admin.fleetPricingText}</p></div><div><strong>{t.admin.reservationsPayments}</strong><p>{t.admin.reservationsPaymentsText}</p></div><div><strong>{t.admin.operationsGps}</strong><p>{t.admin.operationsGpsText}</p></div><div><strong>{t.admin.supportGovernance}</strong><p>{t.admin.supportGovernanceText}</p></div></div></section></>;
}

function ContentManager({ t, app, flash }) {
    const [row,setRow]=useState({...app.content});
    const save=()=>{const patch={...row}; const offerImageUrls=[patch["offerImageUrls.0"]??row.offerImageUrls?.[0]??"",patch["offerImageUrls.1"]??row.offerImageUrls?.[1]??"",patch["offerImageUrls.2"]??row.offerImageUrls?.[2]??""]; delete patch["offerImageUrls.0"]; delete patch["offerImageUrls.1"]; delete patch["offerImageUrls.2"]; patch.offerImageUrls=offerImageUrls; app.setContent(patch); flash(t.admin.visualSaved);};
    return <section className="admin-panel"><div className="admin-panel__header"><div><span className="admin-kicker">{t.admin.visualKicker}</span><h2>{t.admin.visualTitle}</h2><p>{t.admin.visualText}</p></div><button className="admin-button admin-button--primary" type="button" onClick={save}>{t.admin.saveVisuals}</button></div><div className="content-image-grid">{imageFields.map(([key,labelKey])=>{const value=key.startsWith("offerImageUrls.")?row[key]??row.offerImageUrls?.[Number(key.split(".")[1])]??"":row[key]??"";return <label key={key}>{t.admin[labelKey]}<input type="url" placeholder="https://example.com/car.jpg" value={value} onChange={(event)=>setRow((current)=>({...current,[key]:event.target.value}))}/>{value&&<img src={value} alt={t.admin.imagePreviewAlt} onError={(event)=>{event.currentTarget.style.display="none";}}/>}</label>;})}</div></section>;
}

function Settings({ t, settings, setSettings, resetData, flash }) {
    const [draft,setDraft]=useState(settings);
    const save=()=>{setSettings(draft);flash(t.admin.settingsSaved);};
    return <section className="admin-panel"><div className="admin-panel__header"><div><span className="admin-kicker">{t.admin.settingsKicker}</span><h2>{t.admin.appearance}</h2><p>{t.admin.settingsText}</p></div></div><div className="settings-grid"><label>{t.admin.companyName}<input value={draft.companyName} onChange={(event)=>setDraft({...draft,companyName:event.target.value})}/></label><label>{t.admin.country}<select value={draft.country} onChange={(event)=>setDraft({...draft,country:event.target.value})}><option value="US">{t.admin.unitedStates}</option><option value="CO">{t.admin.colombia}</option></select></label><label>{t.admin.currency}<select value={draft.currency} onChange={(event)=>setDraft({...draft,currency:event.target.value})}><option>USD</option></select></label><label>{t.admin.lightPrimary}<input type="color" value={draft.lightPrimary} onChange={(event)=>setDraft({...draft,lightPrimary:event.target.value})}/></label><label>{t.admin.lightNeonGreen}<input type="color" value={draft.lightNeonGreen} onChange={(event)=>setDraft({...draft,lightNeonGreen:event.target.value})}/></label><label>{t.admin.darkPrimary}<input type="color" value={draft.darkPrimary} onChange={(event)=>setDraft({...draft,darkPrimary:event.target.value})}/></label><label>{t.admin.darkNeonPurple}<input type="color" value={draft.darkNeonPurple} onChange={(event)=>setDraft({...draft,darkNeonPurple:event.target.value})}/></label><label>{t.admin.rentalPolicy}<input value={draft.defaultRentalPolicy} onChange={(event)=>setDraft({...draft,defaultRentalPolicy:event.target.value})}/></label></div><div className="settings-actions"><button className="admin-button" type="button" onClick={()=>{resetData();flash(t.admin.resetDone);}}>{t.admin.resetLocalData}</button><button className="admin-button admin-button--primary" type="button" onClick={save}>{t.admin.saveSettings}</button></div></section>;
}

function Admin() {
    const { theme, language, toggleTheme, toggleLanguage, translations: t } = useApp();
    const { user, logout } = useAuth();
    const app = useAppData();
    const [remote, setRemote] = useState({ vehicles: [], reservations: [], payments: [], customers: [], invoices: [] });
    const [serverReady, setServerReady] = useState(false);
    const [active,setActive]=useState("overview");
    const [editor,setEditor]=useState(null);
    const [toast,setToast]=useState("");
    const refreshRemote = async () => {
        const [v,r,p,c,i] = await Promise.all([apiClient.adminVehicles(), apiClient.adminReservations(), apiClient.adminPayments(), apiClient.adminCustomers(), apiClient.adminInvoices()]);
        setRemote({ vehicles:v||[], reservations:r||[], payments:p||[], customers:c||[], invoices:i||[] });
        setServerReady(true);
    };
    useEffect(() => { refreshRemote().catch(() => setServerReady(false)); }, []);
    const flash=(message)=>{setToast(message);window.clearTimeout(window.__efToast);window.__efToast=window.setTimeout(()=>setToast(""),2400);};
    const collections={vehicles:serverReady?remote.vehicles:app.vehicles,reservations:serverReady?remote.reservations:app.reservations,payments:serverReady?remote.payments:app.payments,customers:serverReady?remote.customers:app.customers,reviews:app.reviews,locations:app.locations,offers:app.offers,support:app.support,maintenance:app.maintenance,gps:app.gps};
    const titles=t.admin.modules;
    const openEditor=(type,row)=>setEditor({type,row:row?{...row}:{id:`${type.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-6)}`,__new:true}});
    const save=async(row)=>{const type=editor.type;const payload={...row};delete payload.__new;try{if(type==="vehicles"){const serverPayload={name:payload.name||"Vehicle",slug:payload.slug||`vehicle-${Date.now()}`,category:payload.category||"",transmission:payload.transmission||"Automatic",fuel:payload.fuel||"",seats:Number(payload.seats||5),price_per_day:Number(payload.price||payload.pricePerDay||0),location:payload.location||"",status:payload.generalStatus||payload.status||"ACTIVE",image_url:payload.imageUrl||"",metadata_json:{year:payload.year||new Date().getFullYear(),color:payload.color||"",luggage:payload.luggage||0}}; if(payload.id && !String(payload.id).startsWith("VEH-") && Number.isFinite(Number(payload.id))){await apiClient.adminUpdateVehicle(Number(payload.id),serverPayload)}else{await apiClient.adminCreateVehicle(serverPayload)} await refreshRemote();}else{app.updateRecord(type,payload.id,payload);}setEditor(null);flash(`${t.admin.saved} ${titles[type]||type}.`);}catch(error){flash(error.message||t.admin.saveFailed||"Save failed");}};
    const remove=async(type,id)=>{try{if(type==="vehicles" && Number.isFinite(Number(id))){await apiClient.adminDeleteVehicle(Number(id));await refreshRemote();}else{app.deleteRecord(type,id);}flash(`${t.admin.deleted} ${id} ${serverReady?"":"local"}`);}catch(error){flash(error.message||"Delete failed");}};
    return <div className="admin-app"><aside className="admin-sidebar"><div className="admin-brand"><span>E</span><div><strong>EcoFusion</strong><small>{t.admin.console}</small></div></div><nav>{moduleDefs.map(([key,icon])=><button key={key} className={active===key?"is-active":""} type="button" onClick={()=>setActive(key)}><span>{icon}</span>{titles[key]}</button>)}</nav><Link className="admin-back" to="/">← {t.common.backToWebsite}</Link></aside>
        <main className="admin-main"><header className="admin-topbar"><div><span>ADMIN / {String(titles[active]||active).toUpperCase()}</span><h1>{titles[active]||active}</h1></div><div className="admin-topbar__actions"><span className="admin-status"><i /> {t.admin.status}</span><div className="admin-controls" aria-label={`${t.admin.console} controls`}><button type="button" className="admin-control" onClick={toggleLanguage} aria-label={t.common.changeLanguage || "Change language"}><span className="admin-control__label">{t.admin.language}</span><strong>{language.toUpperCase()}</strong></button><button type="button" className="admin-control admin-control--theme" onClick={toggleTheme} aria-label={t.common.changeTheme || "Change theme"}><span className="admin-control__icon">{theme==="light"?"☾":"☀"}</span><span>{theme==="light"?t.admin.dark:t.admin.light}</span></button></div><span className="admin-user">{user?.email}</span><button type="button" className="admin-logout" onClick={async()=>{await logout(); window.location.href="/sign-in";}}>{t.common.signOut}</button><Link to="/">{t.common.viewSite}</Link></div></header><div className="admin-content"><div className="admin-notice"><strong>{t.admin.noticeTitle}</strong><span>{serverReady ? (t.admin.serverConnected || "Connected to backend") : (t.admin.localMode || "Backend data unavailable; local view shown")}</span></div>
            {active==="overview"&&<Overview t={t} app={app} onModule={setActive}/>} {collections[active]&&<CRUDTable t={t} title={titles[active]} rows={collections[active]} type={active} onAdd={()=>openEditor(active)} onEdit={(row)=>openEditor(active,row)} onDelete={(id)=>remove(active,id)}/>} {active==="content"&&<ContentManager t={t} app={app} flash={flash}/>} {active==="database"&&<DatabaseBrowser t={t} dbRecords={app.dbRecords} setDbEntityRecords={app.setDbEntityRecords} flash={flash}/>} {active==="settings"&&<Settings t={t} settings={app.settings} setSettings={app.setSettings} resetData={app.resetData} flash={flash}/>} {toast&&<div className="admin-toast">{toast}</div>} {editor&&<Editor t={t} type={editor.type} row={editor.row} onCancel={()=>setEditor(null)} onSave={save}/>}        </div></main></div>;
}

export default Admin;
