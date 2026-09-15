import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { vehicles as seedVehicles } from "../data";
import { adminSeed } from "../utils/adminData";
import { apiClient } from "../services/api";

const STORAGE_KEY = "ecofusion-app-data-v4";
const AppDataContext = createContext(null);

const seedContent = {
    heroImageUrl: "",
    featuredImageUrl: "",
    aboutImageUrl: "",
    californiaImageUrl: "",
    offerImageUrls: ["", "", ""],
};

const seedReviews = [];

const seedLocations = [
    { id: "LOC-001", name: "Los Angeles", region: "California", status: "Active", description: "City, airport and Southern California access." },
    { id: "LOC-002", name: "Orange County", region: "California", status: "Active", description: "Coastal trips, business travel and weekend escapes." },
    { id: "LOC-003", name: "San Diego", region: "California", status: "Active", description: "Coastal journeys and Southern California travel." },
    { id: "LOC-004", name: "San Francisco", region: "California", status: "Active", description: "Northern California city and scenic-road access." },
];

const seedOffers = [
    { id: "OFF-001", title: "Weekend getaway", badge: "POPULAR", status: "Active", description: "Flexible short rentals for California escapes." },
    { id: "OFF-002", title: "Stay a little longer", badge: "LONGER STAYS", status: "Active", description: "Extended rental value for longer journeys." },
    { id: "OFF-003", title: "Drive with confidence", badge: "BUSINESS", status: "Active", description: "Comfort-focused options for business travel." },
];

const seedSupport = [];


const seedPayments = [];

const seedAccount = { currentUser: null, favoriteVehicleIds: [] };

const seedSettings = {
    companyName: "EcoFusion RentalCars",
    defaultLanguage: "en",
    country: "US",
    currency: "USD",
    defaultRentalPolicy: "Standard rental policy",
    lightPrimary: "#1f9f5a",
    lightNeonGreen: "#52ff9b",
    darkPrimary: "#45f08f",
    darkNeonPurple: "#b47cff",
};

function loadStored() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function normalizeVehicle(vehicle) {
    return {
        ...vehicle,
        imageUrl: vehicle.imageUrl || "",
        generalStatus: vehicle.generalStatus || "ACTIVE",
        operationalStatus: vehicle.operationalStatus || "READY",
        location: vehicle.location || "Los Angeles",
        mileage: vehicle.mileage ?? 0,
        year: vehicle.year ?? 2026,
        stock: vehicle.stock ?? 1,
    };
}

function getInitialData() {
    const stored = loadStored();
    if (stored) {
        return {
            ...stored,
            vehicles: (stored.vehicles || seedVehicles).map(normalizeVehicle),
            reviews: stored.reviews || seedReviews,
            content: { ...seedContent, ...(stored.content || {}) },
            locations: stored.locations || seedLocations,
            offers: stored.offers || seedOffers,
            support: stored.support || seedSupport,
            settings: { ...seedSettings, ...(stored.settings || {}) },
            reservations: stored.reservations || [],
            payments: stored.payments || seedPayments,
            account: { ...seedAccount, ...(stored.account || {}) },
            customers: stored.customers || [],
            maintenance: stored.maintenance || [],
            gps: stored.gps || [],
            dbRecords: stored.dbRecords || {},
        };
    }

    return {
        vehicles: seedVehicles.map(normalizeVehicle),
        reviews: seedReviews,
        content: seedContent,
        locations: seedLocations,
        offers: seedOffers,
        support: seedSupport,
        settings: seedSettings,
        reservations: [],
        payments: seedPayments,
        account: seedAccount,
        customers: [],
        maintenance: [],
        gps: [],
        dbRecords: {},
    };
}

export function AppDataProvider({ children }) {
    const [data, setData] = useState(getInitialData);
    const [serverData, setServerData] = useState({ vehicles: [], reservations: [], payments: [], customers: [], invoices: [] });
    const refreshServerData = async () => {
        const results = await Promise.allSettled([apiClient.vehicles(), apiClient.myReservations(), apiClient.myPayments(), apiClient.adminCustomers(), apiClient.adminInvoices()]);
        setServerData({
            vehicles: results[0].status === "fulfilled" ? results[0].value : [],
            reservations: results[1].status === "fulfilled" ? results[1].value : [],
            payments: results[2].status === "fulfilled" ? results[2].value : [],
            customers: results[3].status === "fulfilled" ? results[3].value : [],
            invoices: results[4].status === "fulfilled" ? results[4].value : [],
        });
    };
    useEffect(() => {
        refreshServerData();
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        const root = document.documentElement;
        root.style.setProperty("--ef-light-primary", data.settings.lightPrimary || "#1f9f5a");
        root.style.setProperty("--ef-light-neon-green", data.settings.lightNeonGreen || "#52ff9b");
        root.style.setProperty("--ef-dark-primary", data.settings.darkPrimary || "#45f08f");
        root.style.setProperty("--ef-dark-neon-purple", data.settings.darkNeonPurple || "#b47cff");
    }, [data]);

    const updateCollection = (key, updater) => {
        setData((current) => ({ ...current, [key]: updater(current[key] || []) }));
    };

    const addRecord = (key, record) => updateCollection(key, (rows) => [record, ...rows]);

    const updateRecord = (key, id, patch) =>
        updateCollection(key, (rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));

    const deleteRecord = (key, id) => updateCollection(key, (rows) => rows.filter((row) => row.id !== id));

    const value = useMemo(() => ({
        data,
        vehicles: serverData.vehicles.length ? serverData.vehicles : data.vehicles,
        reviews: data.reviews,
        content: data.content,
        locations: data.locations,
        offers: data.offers,
        support: data.support,
        settings: data.settings,
        reservations: serverData.reservations.length ? serverData.reservations : data.reservations,
        payments: serverData.payments.length ? serverData.payments : data.payments,
        account: data.account,
        customers: serverData.customers.length ? serverData.customers : data.customers,
        maintenance: data.maintenance,
        gps: data.gps,
        addRecord,
        updateRecord,
        deleteRecord,
        updateCollection,
        addVehicle: (vehicle) => addRecord("vehicles", normalizeVehicle(vehicle)),
        updateVehicle: (id, patch) => setData((current) => ({ ...current, vehicles: current.vehicles.map((vehicle) => vehicle.id === id ? normalizeVehicle({ ...vehicle, ...patch }) : vehicle) })),
        deleteVehicle: (id) => deleteRecord("vehicles", id),
        addPayment: (payment) => addRecord("payments", payment),
        updatePayment: (id, patch) => updateRecord("payments", id, patch),
        setContent: (patch) => setData((current) => ({ ...current, content: { ...current.content, ...patch } })),
        setSettings: (patch) => setData((current) => ({ ...current, settings: { ...current.settings, ...patch } })),
        dbRecords: data.dbRecords || {},
        setDbEntityRecords: (entity, rows) => setData((current) => ({ ...current, dbRecords: { ...(current.dbRecords || {}), [entity]: rows } })),
        resetData: () => setData(getInitialData()),
        invoices: serverData.invoices,
        refreshServerData,
    }), [data]);

    return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
    const context = useContext(AppDataContext);
    if (!context) throw new Error("useAppData must be used inside AppDataProvider");
    return context;
}
