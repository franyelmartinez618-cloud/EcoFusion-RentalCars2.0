import "./SectionHeading.css";

function SectionHeading({ eyebrow, title, description, center = false, action = null }) {
    return (
        <div className={`section-heading ${center ? "section-heading--center" : ""}`}>
            <div>
                {eyebrow && <span>{eyebrow}</span>}
                <h2>{title}</h2>
                {description && <p>{description}</p>}
            </div>
            {action}
        </div>
    );
}

export default SectionHeading;
