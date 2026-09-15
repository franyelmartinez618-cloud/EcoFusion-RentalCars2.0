import { useRef } from "react";
import { useApp } from "../../context/AppContext";
import "./HorizontalScroller.css";

function HorizontalScroller({ children, ariaLabel = "Horizontal content" }) {
    const { translations: t } = useApp();
    const ref = useRef(null);
    const move = (direction) => {
        ref.current?.scrollBy({ left: direction * Math.min(ref.current.clientWidth * 0.82, 520), behavior: "smooth" });
    };

    return (
        <div className="horizontal-scroller">
            <button className="horizontal-scroller__arrow horizontal-scroller__arrow--left" type="button" onClick={() => move(-1)} aria-label={t.common.previous || "Previous"}>‹</button>
            <div className="horizontal-scroller__viewport" ref={ref} aria-label={ariaLabel}>
                <div className="horizontal-scroller__track">{children}</div>
            </div>
            <button className="horizontal-scroller__arrow horizontal-scroller__arrow--right" type="button" onClick={() => move(1)} aria-label={t.common.next || "Next"}>›</button>
        </div>
    );
}

export default HorizontalScroller;
