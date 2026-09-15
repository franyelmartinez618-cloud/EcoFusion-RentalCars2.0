// Replace local AppDataContext operations with these calls as FastAPI is added.
// Keeping the boundary small avoids coupling UI components to fetch() details.
import { api } from "./api";

export const backendAdapter = {
    listVehicles: api.listVehicles,
    getVehicle: api.getVehicle,
    searchAvailability: api.searchAvailability,
    createReservation: api.createReservation,
    listAdminVehicles: api.getAdminVehicles,
    updateAdminVehicle: api.updateAdminVehicle,
    deleteAdminVehicle: api.deleteAdminVehicle,
};
