import PageShell from "../../components/PageShell/PageShell";
import BookingSearch from "../../components/BookingSearch/BookingSearch";
import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import "../SimplePages.css";

function Booking() {
    const { translations: t } = useApp();

    return (
        <PageShell>
            <section className="page-hero">
                <div className="container">
                    <span className="page-hero__eyebrow">{t.bookingSearch.eyebrow}</span>
                    <h1>{t.booking.title}</h1>
                    <p>{t.booking.subtitle}</p>
                </div>
            </section>

            <section className="page-section">
                <div className="container booking-page__grid">
                    <div>
                        <BookingSearch />
                        <div className="info-card" style={{ marginTop: 20 }}>
                            <h2>{t.howItWorks.title}</h2>
                            <p>{t.howItWorks.description}</p>
                        </div>
                    </div>

                    <aside className="booking-summary">
                        <h3>{t.booking.summaryTitle}</h3>
                        <div className="booking-summary__line">
                            <span>{t.booking.summaryFleet}</span>
                            <strong>{t.booking.summaryFleetValue}</strong>
                        </div>
                        <div className="booking-summary__line">
                            <span>{t.booking.summaryAvailability}</span>
                            <strong>{t.booking.summaryAvailabilityValue}</strong>
                        </div>
                        <div className="booking-summary__line">
                            <span>{t.booking.summaryPayment}</span>
                            <strong>{t.booking.summaryPaymentValue}</strong>
                        </div>
                        <Link
                            className="button button--primary"
                            style={{ width: "100%", marginTop: 20 }}
                            to="/vehicles"
                        >
                            {t.booking.chooseVehicle}
                        </Link>
                    </aside>
                </div>
            </section>
        </PageShell>
    );
}

export default Booking;
