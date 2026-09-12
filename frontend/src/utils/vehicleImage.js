export function getVehicleImage(vehicle) {
    return vehicle?.imageUrl?.trim() || vehicle?.image;
}
