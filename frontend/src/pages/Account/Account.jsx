import { useEffect, useMemo, useState } from "react";
import PageShell from "../../components/PageShell/PageShell";
import { useApp } from "../../context/AppContext";
import { useAppData } from "../../context/AppDataContext";
import { Link, navigate } from "../../utils/router";
import { useAuth } from "../../context/AuthContext";
import "./Account.css";
import IdentityVerification from "../../components/IdentityVerification";
import { apiClient } from "../../services/api";

function statusClass(status = "") { return `account-status account-status--${status.toLowerCase().replace(/[^a-z]+/g, "-")}`; }

function Account() {
    const { translations: t } = useApp();
    const { user, logout } = useAuth();
    const { account, reservations: cachedReservations, payments: cachedPayments, vehicles } = useAppData();
    const [serverReservations, setServerReservations] = useState([]);
    const [serverPayments, setServerPayments] = useState([]);
    const [serverLoading, setServerLoading] = useState(true);
    useEffect(() => {
        let active = true;
        Promise.all([apiClient.myReservations(), apiClient.myPayments()]).then(([rs, ps]) => {
            if (active) { setServerReservations(rs || []); setServerPayments(ps || []); }
        }).catch(() => {
            if (active) { setServerReservations([]); setServerPayments([]); }
        }).finally(() => active && setServerLoading(false));
        return () => { active = false; };
    }, [user?.id]);
    const [active, setActive] = useState("overview");
    const profile = user || account.currentUser || { name: "Customer", email: "", phone: "" };
    const tabs = [["overview", t.accountPage.overview], ["reservations", t.accountPage.reservations], ["payments", t.accountPage.payments], ["profile", t.accountPage.profile]];
    const myReservations = useMemo(() => serverLoading ? cachedReservations.filter((r) => r.customer === profile.name) : serverReservations, [serverLoading, cachedReservations, serverReservations, profile.name]);
    const myPayments = useMemo(() => serverLoading ? cachedPayments.filter((p) => p.customer === profile.name) : serverPayments, [serverLoading, cachedPayments, serverPayments, profile.name]);
    const next = myReservations.find((r) => ["CONFIRMED", "ACTIVE", "PAYMENT_PENDING"].includes(r.status));
    return <PageShell>
        <section className="account-page"><div className="container">
            <div className="account-hero"><div><span className="page-hero__eyebrow">{t.accountPage.eyebrow}</span><h1>{t.accountPage.welcome} {profile.name.split(" ")[0]}.</h1><p>{t.accountPage.description}</p></div><Link className="button button--primary" to="/vehicles">{t.accountPage.bookAnother} <span>→</span></Link></div>
            <div className="account-layout">
                <aside className="account-sidebar"><div className="account-profile"><div className="account-avatar">{profile.name.slice(0,2).toUpperCase()}</div><strong>{profile.name}</strong><span>{profile.email}</span><button type="button" className="account-link-button" onClick={async()=>{await logout();navigate("/sign-in")}}>{t.common.signOut}</button></div><nav>{tabs.map(([key,label]) => <button key={key} className={active===key?"is-active":""} type="button" onClick={()=>setActive(key)}>{label}<span>→</span></button>)}</nav></aside>
                <main className="account-main">
                    {active === "overview" && <Overview t={t} user={profile} next={next} payments={myPayments} reservations={myReservations} />}
                    {active === "reservations" && <Reservations t={t} reservations={myReservations} vehicles={vehicles} />}
                    {active === "payments" && <Payments t={t} payments={myPayments} />}
                    {active === "profile" && <><Profile t={t} user={profile} /><IdentityVerification /></>}
                </main>
            </div>
        </div></section>
    </PageShell>;
}

function Overview({ t, user, next, payments, reservations }) {
    const paid = payments.filter((p) => p.status === "PAID").reduce((sum,p)=>sum+p.amount,0);
    return <>
        <div className="account-stat-grid">{serverLoading && <div className="account-loading" role="status">{t.accountPage.loading || "Loading..."}</div>}<article><span>{t.accountPage.upcoming}</span><strong>{next?"1":"0"}</strong><small>{t.accountPage.activeBooking}</small></article><article><span>{t.accountPage.trips}</span><strong>{reservations.length}</strong><small>{t.accountPage.reservationsCount}</small></article><article><span>{t.accountPage.paid}</span><strong>${paid}</strong><small>{t.accountPage.lifetimeDemoTotal}</small></article></div>
        <section className="account-panel account-next"><div className="account-panel__header"><div><span className="account-kicker">{t.accountPage.nextReservation}</span><h2>{next?next.vehicle:t.accountPage.noUpcoming}</h2></div>{next&&<span className={statusClass(next.status)}>{next.status.replaceAll("_"," ")}</span>}</div>{next?<><div className="reservation-meta"><span>{next.dates}</span><strong>${next.total}</strong></div><p>{t.accountPage.reservationReady}</p></>:<p>{t.accountPage.bookToSee}</p>}<Link className="text-link" to="/vehicles">{t.accountPage.browseVehicles} →</Link></section>
        <section className="account-panel"><div className="account-panel__header"><div><span className="account-kicker">{t.accountPage.recentPayments}</span><h2>{t.accountPage.latestTransactions}</h2></div><button type="button" className="account-link-button" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>{t.accountPage.viewAccountTabs}</button></div><PaymentRows t={t} payments={payments.slice(0,3)}/></section>
        <section className="account-panel account-security"><span className="account-kicker">{t.accountPage.paymentSecurity}</span><h2>{t.accountPage.squareHandled}</h2><p>{t.accountPage.squareDescription}</p></section>
        <p className="account-note">{t.accountPage.signedInAs} <strong>{user.email || user.phone || "Customer"}</strong></p>
    </>;
}
function Reservations({ t, reservations }) { return <section className="account-panel"><div className="account-panel__header"><div><span className="account-kicker">{t.accountPage.reservationsKicker}</span><h2>{t.accountPage.reservations}</h2></div><Link className="button button--primary" to="/vehicles">{t.accountPage.bookVehicle}</Link></div><div className="account-list">{reservations.map(r=><article className="account-list-row" key={r.id}><div><strong>{r.vehicle}</strong><span>{r.id} · {r.dates}</span></div><div><strong>${r.total}</strong><span className={statusClass(r.status)}>{r.status.replaceAll("_"," ")}</span></div></article>)}</div></section>; }
function Payments({ t, payments }) { return <section className="account-panel"><div className="account-panel__header"><div><span className="account-kicker">{t.accountPage.paymentsKicker}</span><h2>{t.accountPage.paymentHistory}</h2></div></div><PaymentRows t={t} payments={payments}/><div className="account-payment-note"><strong>{t.accountPage.squareReady}</strong><span>{t.accountPage.squareLater}</span></div></section>; }
function PaymentRows({ payments }) { return <div className="account-list">{payments.map(p=><article className="account-list-row" key={p.id}><div><strong>{p.id}</strong><span>{p.reservation} · {p.method} · {p.date}</span></div><div><strong>${p.amount}</strong><span className={statusClass(p.status)}>{p.status}</span></div></article>)}</div>; }
function Profile({ t, user }) { return <section className="account-panel"><div className="account-panel__header"><div><span className="account-kicker">{t.accountPage.profileKicker}</span><h2>{t.accountPage.rentalProfile}</h2></div></div><div className="profile-grid"><label>{t.accountPage.fullName}<input value={user.name} readOnly /></label><label>{t.account.email}<input value={user.email} readOnly /></label><label>{t.accountPage.phone}<input value={user.phone} readOnly /></label><label>{t.accountPage.memberSince}<input value={user.memberSince} readOnly /></label></div><div className="account-payment-note"><strong>{t.accountPage.prototypeProfile}</strong><span>{t.accountPage.profileLater}</span></div></section>; }
export default Account;
