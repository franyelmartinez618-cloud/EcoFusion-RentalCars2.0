export const adminSeed = {
    vehicles: [
        { id: "VH-001", name: "Toyota Corolla", category: "Compact Sedan", price: 59, status: "Available", location: "Los Angeles" },
        { id: "VH-002", name: "Toyota RAV4", category: "SUV", price: 79, status: "Available", location: "San Diego" },
        { id: "VH-003", name: "Toyota Camry", category: "Premium Sedan", price: 69, status: "Maintenance", location: "Orange County" },
        { id: "VH-004", name: "Toyota Corolla Cross", category: "Compact SUV", price: 74, status: "Available", location: "Anaheim" },
    ],
    reservations: [
        { id: "RS-1042", customer: "Michael R.", vehicle: "Toyota RAV4", dates: "Sep 14 → Sep 18", status: "CONFIRMED", total: 356 },
        { id: "RS-1043", customer: "Sarah T.", vehicle: "Toyota Corolla", dates: "Sep 16 → Sep 19", status: "PAYMENT_PENDING", total: 177 },
        { id: "RS-1044", customer: "Daniel K.", vehicle: "Toyota Camry", dates: "Sep 20 → Sep 23", status: "ACTIVE", total: 207 },
    ],
    customers: [
        { id: "CU-201", name: "Michael R.", email: "michael@example.com", status: "Active", reservations: 4 },
        { id: "CU-202", name: "Sarah T.", email: "sarah@example.com", status: "Active", reservations: 2 },
        { id: "CU-203", name: "Daniel K.", email: "daniel@example.com", status: "Active", reservations: 7 },
    ],
    comments: [
        { id: "CM-001", customer: "Michael R.", rating: 5, comment: "Excellent pickup experience.", status: "Published" },
        { id: "CM-002", customer: "Sarah T.", rating: 5, comment: "Easy reservation and clean vehicle.", status: "Published" },
        { id: "CM-003", customer: "Jordan P.", rating: 3, comment: "Return instructions could be clearer.", status: "Pending" },
    ],
    maintenance: [
        { id: "MT-001", vehicle: "Toyota Camry", type: "Routine service", date: "2026-09-10", status: "In progress" },
        { id: "MT-002", vehicle: "Toyota RAV4", type: "Tire inspection", date: "2026-09-22", status: "Scheduled" },
    ],
    gps: [
        { id: "GPS-001", vehicle: "Toyota Corolla", device: "Prepared / API", status: "Ready", lastPing: "Not connected" },
        { id: "GPS-002", vehicle: "Toyota RAV4", device: "Prepared / API", status: "Ready", lastPing: "Not connected" },
    ],
};
