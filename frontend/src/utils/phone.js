const PHONE_COUNTRIES = {
    US: { dial: "+1", digits: 10, label: "United States (+1)" },
    CA: { dial: "+1", digits: 10, label: "Canada (+1)" },
    CO: { dial: "+57", digits: 10, label: "Colombia (+57)" },
    MX: { dial: "+52", digits: 10, label: "Mexico (+52)" },
};

const COUNTRY_BY_DIAL = Object.entries(PHONE_COUNTRIES)
    .map(([code, config]) => ({ code, ...config }))
    .sort((a, b) => b.dial.length - a.dial.length);

function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
}

export function normalizePhoneNumber(value, country = "US") {
    const raw = String(value || "").trim();
    if (!raw) return "";

    if (raw.startsWith("+")) {
        const digits = digitsOnly(raw);
        return digits ? `+${digits}` : "";
    }

    const config = PHONE_COUNTRIES[country] || PHONE_COUNTRIES.US;
    const digits = digitsOnly(raw);
    if (!digits) return "";
    return `${config.dial}${digits}`;
}

export function getPhoneCountryFromNumber(value) {
    const normalized = normalizePhoneNumber(value, "US");
    if (!normalized.startsWith("+")) return null;
    return COUNTRY_BY_DIAL.find(({ dial }) => normalized.startsWith(dial))?.code || null;
}

export function validatePhoneNumber(value, country = "US") {
    const raw = String(value || "").trim();
    if (!raw) return false;

    if (raw.startsWith("+")) {
        const normalized = normalizePhoneNumber(raw, country);
        const match = COUNTRY_BY_DIAL.find(({ dial }) => normalized.startsWith(dial));
        return Boolean(match && normalized.slice(match.dial.length).length === match.digits);
    }

    const normalized = normalizePhoneNumber(raw, country);
    const config = PHONE_COUNTRIES[country] || PHONE_COUNTRIES.US;
    return normalized.slice(config.dial.length).length === config.digits;
}

export { PHONE_COUNTRIES };
