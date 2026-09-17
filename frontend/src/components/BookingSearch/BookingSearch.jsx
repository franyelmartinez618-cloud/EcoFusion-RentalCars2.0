import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAppData } from "../../context/AppDataContext";
import { navigate } from "../../utils/router";
import { useToast } from "../../context/ToastContext";
import "./BookingSearch.css";

function BookingSearch() {
    const { translations:t } = useApp();
    const { locations = [] } = useAppData();
    const { showToast } = useToast();
    const [sameLocation, setSameLocation] = useState(true);
    const [pickupLocation, setPickupLocation] = useState("");
    const [returnLocation, setReturnLocation] = useState("");
    const [pickupDate, setPickupDate] = useState("");
    const [returnDate, setReturnDate] = useState("");

    const locationOptions = useMemo(() => locations.length ? locations : [
        { name: t.booking.losAngeles },
        { name: t.booking.anaheim },
        { name: t.booking.sanDiego },
        { name: t.booking.sanFrancisco },
        { name: t.booking.orangeCounty },
    ], [locations, t]);

    const submit = (event) => {
        event.preventDefault();
        if (!pickupLocation || !pickupDate || !returnDate) {
            showToast(t.homeUi.bookingInvalid, "error");
            return;
        }
        if (new Date(returnDate) <= new Date(pickupDate)) {
            showToast(t.homeUi.bookingDateError, "error");
            return;
        }
        const search = { pickupLocation, returnLocation: sameLocation ? pickupLocation : returnLocation, pickupDate, returnDate };
        sessionStorage.setItem("ecofusion-booking-search", JSON.stringify(search));
        navigate("/vehicles");
    };

    return <section className="booking-search">
        <div className="booking-search__heading">
            <div><span>{t.homeUi.bookingSearchKicker}</span><h2>{t.booking.title}</h2><p>{t.booking.subtitle}</p></div>
        </div>

        <form className="booking-search__form" onSubmit={submit}>
            <label className="booking-field booking-field--location"><span>{t.booking.pickupLocation}</span><select value={pickupLocation} onChange={(e)=>setPickupLocation(e.target.value)}><option value="">{t.booking.selectLocation}</option>{locationOptions.map((location)=><option key={location.name} value={location.name}>{location.name}</option>)}</select></label>
            <label className="booking-field booking-field--location"><span>{t.booking.returnLocation}</span><select value={sameLocation ? pickupLocation : returnLocation} disabled={sameLocation} onChange={(e)=>setReturnLocation(e.target.value)}><option value="">{t.booking.selectLocation}</option><option value={pickupLocation}>{t.booking.sameLocation}</option>{locationOptions.map((location)=><option key={location.name} value={location.name}>{location.name}</option>)}</select></label>
            <label className="booking-field"><span>{t.booking.pickupDate}</span><input type="date" value={pickupDate} onChange={(e)=>setPickupDate(e.target.value)} /></label>
            <label className="booking-field"><span>{t.booking.returnDate}</span><input type="date" value={returnDate} onChange={(e)=>setReturnDate(e.target.value)} /></label>
            <button className="booking-search__button" type="submit">{t.booking.search}<span>→</span></button>
        </form>

        <div className="booking-search__meta">
            <label><input type="checkbox" checked={sameLocation} onChange={(e)=>setSameLocation(e.target.checked)} /><span>{t.booking.sameLocation}</span></label>
            <button type="button" className="booking-search__fleet-link" onClick={()=>navigate("/vehicles")}>{t.bookingSearch.browseFleet} <span>→</span></button>
        </div>
    </section>
}
export default BookingSearch;
