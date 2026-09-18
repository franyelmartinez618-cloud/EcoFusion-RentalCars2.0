const PHONE_COUNTRIES = {
    US: { dial: "+1", digits: 10, label: "United States (+1)" },
    CA: { dial: "+1", digits: 10, label: "Canada (+1)" },
    CO: { dial: "+57", digits: 10, label: "Colombia (+57)" },
    MX: { dial: "+52", digits: 10, label: "Mexico (+52)" },
};

export function normalizePhoneNumber(value, country = "US") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("+")) {
        const digits = raw.replace(/\D/g, "");
        return digits ? `+${digits}` : "";
    }
    const config = PHONE_COUNTRIES[country] || PHONE_COUNTRIES.US;
    const digits = raw.replace(/\D/g, "");
    return digits ? `${config.dial}${digits}` : "";
}

export function validatePhoneNumber(value, country = "US") {
    const normalized = normalizePhoneNumber(value, country);
    if (!normalized) return false;
    const config = PHONE_COUNTRIES[country] || PHONE_COUNTRIES.US;
    return normalized.slice(config.dial.length).length === config.digits;
}

export { PHONE_COUNTRIES };
