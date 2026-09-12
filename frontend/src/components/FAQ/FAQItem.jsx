import { useState } from "react";
import "./FAQItem.css";

function FAQItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <article className={`faq-item ${open ? "faq-item--open" : ""}`}>
            <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
                <span>{question}</span>
                <span className="faq-item__icon">+</span>
            </button>
            {open && <p>{answer}</p>}
        </article>
    );
}

export default FAQItem;
