import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import "./BookingSearch.css";

function BookingSearch() {
    const { translations: t } = useApp();
    const [sameLocation, setSameLocation] = useState(true);

    return (
        <section className="booking-search">
            <div className="booking-search__heading">
                <div>
                    <span>BOOK YOUR TOYOTA</span>
                    <h2>{t.booking.title}</h2>
                    <p>{t.booking.subtitle}</p>
                </div>
                <div className="booking-search__step">
                    <span>01</span>
                    <small>Search</small>
                </div>
            </div>

            <form
                className="booking-search__form"
                onSubmit={(event) => event.preventDefault()}
            >
                <label className="booking-field booking-field--location">
                    <span>{t.booking.pickupLocation}</span>
                    <select defaultValue="">
                        <option value="" disabled>{t.booking.selectLocation}</option>
                        <option>{t.booking.losAngeles}</option>
                        <option>{t.booking.anaheim}</option>
                        <option>{t.booking.sanDiego}</option>
                        <option>{t.booking.sanFrancisco}</option>
                        <option>{t.booking.orangeCounty}</option>
                    </select>
                </label>

                <label className="booking-field booking-field--location">
                    <span>{t.booking.returnLocation}</span>
                    <select defaultValue={sameLocation ? "same" : ""}>
                        <option value="same">{t.booking.sameLocation}</option>
                        <option>{t.booking.losAngeles}</option>
                        <option>{t.booking.anaheim}</option>
                        <option>{t.booking.sanDiego}</option>
                        <option>{t.booking.sanFrancisco}</option>
                        <option>{t.booking.orangeCounty}</option>
                    </select>
                </label>

                <label className="booking-field">
                    <span>{t.booking.pickupDate}</span>
                    <input type="date" />
                </label>

                <label className="booking-field">
                    <span>{t.booking.returnDate}</span>
                    <input type="date" />
                </label>

                <button className="booking-search__button" type="submit">
                    {t.booking.search}<span>→</span>
                </button>
            </form>

            <div className="booking-search__meta">
                <label>
                    <input
                        type="checkbox"
                        checked={sameLocation}
                        onChange={(event) => setSameLocation(event.target.checked)}
                    />
                    <span>{t.booking.sameLocation}</span>
                </label>
                <Link to="/vehicles">Browse fleet instead <span>→</span></Link>
            </div>
        </section>
    );
}

export default BookingSearch;
