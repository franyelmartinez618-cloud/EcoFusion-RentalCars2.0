export const databaseEntities = [
    "roles", "users", "user_sessions", "login_attempts", "password_reset_tokens", "two_factor_recovery_codes", "customers", "customer_addresses", "drivers", "customer_documents",
    "vehicle_categories", "vehicles", "vehicle_features", "vehicle_feature_assignments", "vehicle_images", "locations", "location_business_hours", "location_holidays", "vehicle_blocks", "rate_plans", "vehicle_rates", "promotions", "promotion_vehicle_categories", "promotion_vehicles", "add_ons", "protection_plans", "fee_types", "tax_rates",
    "reservations", "reservation_status_history", "reservation_drivers", "reservation_add_ons", "reservation_protection", "reservation_promotions", "reservation_fees", "reservation_taxes", "payments", "payment_transactions", "payment_webhook_events", "payment_holds", "refunds", "invoices", "invoice_items", "rental_contracts",
    "pickup_records", "return_records", "vehicle_inspections", "inspection_items", "inspection_item_results", "vehicle_damages", "damage_photos", "vendors", "maintenance_records", "maintenance_schedules", "maintenance_parts", "vehicle_assets",
    "gps_devices", "vehicle_locations", "vehicle_geo_events", "files", "notifications", "notification_preferences", "support_tickets", "support_messages",
    "company_profile", "system_settings", "legal_documents", "legal_acceptances", "audit_logs",
];

export const databaseGroups = [
    { name: "Identity & customers", entities: databaseEntities.slice(0, 10) },
    { name: "Fleet, rates & locations", entities: databaseEntities.slice(10, 28) },
    { name: "Reservations & billing", entities: databaseEntities.slice(28, 43) },
    { name: "Rental operations", entities: databaseEntities.slice(43, 56) },
    { name: "Tracking & support", entities: databaseEntities.slice(56, 64) },
    { name: "Company & governance", entities: databaseEntities.slice(64) },
];
