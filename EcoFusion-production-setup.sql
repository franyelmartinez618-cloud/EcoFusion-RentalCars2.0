-- EcoFusion RentalCars - production schema v3
-- 27 functional tables. MySQL 8 / Railway MySQL.
-- Clean database for EcoFusion RentalCars (California, USA).

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firebase_uid VARCHAR(191) NOT NULL,
  name VARCHAR(160) NOT NULL DEFAULT '',
  email VARCHAR(254) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL DEFAULT '',
  role VARCHAR(20) NOT NULL DEFAULT 'client',
  provider VARCHAR(50) NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  identity_status VARCHAR(30) NOT NULL DEFAULT 'not_started',
  identity_provider VARCHAR(40) NOT NULL DEFAULT '',
  identity_inquiry_id VARCHAR(191) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  last_login_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_firebase_uid (firebase_uid),
  UNIQUE KEY uq_users_identity_inquiry_id (identity_inquiry_id),
  KEY idx_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS user_identities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  firebase_uid VARCHAR(191) NOT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT '',
  email VARCHAR(254) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(6) NOT NULL,
  last_seen_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_identities_firebase_uid (firebase_uid),
  KEY idx_user_identities_user (user_id),
  KEY idx_user_identities_email (email),
  CONSTRAINT fk_user_identities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(96) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  csrf_token VARCHAR(96) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  revoked_at DATETIME(6) NULL,
  last_seen_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expiry (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS user_consents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  privacy_version VARCHAR(40) NOT NULL,
  terms_version VARCHAR(40) NOT NULL,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_at DATETIME(6) NOT NULL,
  ip VARCHAR(64) NOT NULL DEFAULT '',
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_consents_user (user_id),
  KEY idx_user_consents_accepted (accepted_at),
  CONSTRAINT fk_user_consents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(254) NULL,
  firebase_uid VARCHAR(191) NULL,
  ip VARCHAR(64) NOT NULL DEFAULT '',
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  provider VARCHAR(40) NOT NULL DEFAULT '',
  outcome VARCHAR(30) NOT NULL DEFAULT 'blocked',
  reason VARCHAR(160) NOT NULL DEFAULT '',
  occurred_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_login_attempts_email_time (email, occurred_at),
  KEY idx_login_attempts_ip_time (ip, occurred_at),
  KEY idx_login_attempts_uid_time (firebase_uid, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  first_name VARCHAR(100) NOT NULL DEFAULT '',
  last_name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(254) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_user (user_id),
  KEY idx_customers_email (email),
  KEY idx_customers_status (status),
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS customer_addresses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(40) NOT NULL DEFAULT 'primary',
  address_line1 VARCHAR(200) NOT NULL DEFAULT '',
  address_line2 VARCHAR(200) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  state_region VARCHAR(100) NOT NULL DEFAULT '',
  postal_code VARCHAR(30) NOT NULL DEFAULT '',
  country_code CHAR(2) NOT NULL DEFAULT 'US',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_customer_addresses_customer (customer_id),
  CONSTRAINT fk_customer_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS locations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT '',
  state_region VARCHAR(100) NOT NULL DEFAULT '',
  country_code CHAR(2) NOT NULL DEFAULT 'US',
  address VARCHAR(250) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL DEFAULT '',
  timezone VARCHAR(64) NOT NULL DEFAULT 'America/Los_Angeles',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_locations_code (code),
  KEY idx_locations_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vehicle_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicle_categories_code (code),
  KEY idx_vehicle_categories_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(64) NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  location_id BIGINT UNSIGNED NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT '',
  transmission VARCHAR(40) NOT NULL DEFAULT 'Automatic',
  fuel VARCHAR(40) NOT NULL DEFAULT '',
  seats INT NOT NULL DEFAULT 5,
  price_per_day DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  location VARCHAR(120) NOT NULL DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  image_url TEXT NULL,
  metadata_json JSON NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicles_public_id (public_id),
  UNIQUE KEY uq_vehicles_slug (slug),
  KEY idx_vehicle_status (status),
  KEY idx_vehicle_location (location),
  KEY idx_vehicle_category_id (category_id),
  KEY idx_vehicle_location_id (location_id),
  CONSTRAINT fk_vehicles_category FOREIGN KEY (category_id) REFERENCES vehicle_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_vehicles_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vehicle_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_vehicle_images_vehicle (vehicle_id, sort_order),
  CONSTRAINT fk_vehicle_images_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vehicle_features (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(60) NOT NULL,
  name VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicle_features_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS reservations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(64) NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  pickup_location_id BIGINT UNSIGNED NULL,
  return_location_id BIGINT UNSIGNED NULL,
  pickup_at DATETIME(6) NOT NULL,
  return_at DATETIME(6) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  taxes DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  fees DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_reservations_public_id (public_id),
  KEY idx_res_customer (customer_id),
  KEY idx_res_vehicle_dates (vehicle_id, pickup_at, return_at),
  KEY idx_res_status (status),
  KEY idx_res_pickup_location (pickup_location_id),
  KEY idx_res_return_location (return_location_id),
  CONSTRAINT fk_res_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_res_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_res_pickup_location FOREIGN KEY (pickup_location_id) REFERENCES locations(id) ON DELETE SET NULL,
  CONSTRAINT fk_res_return_location FOREIGN KEY (return_location_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  reservation_id BIGINT UNSIGNED NULL,
  inspector_user_id BIGINT UNSIGNED NULL,
  inspection_type VARCHAR(30) NOT NULL DEFAULT 'PRE_RENTAL',
  status VARCHAR(30) NOT NULL DEFAULT 'PASSED',
  odometer_km INT NULL,
  fuel_level_percent TINYINT UNSIGNED NULL,
  notes TEXT NULL,
  inspected_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_vehicle_inspections_vehicle (vehicle_id, inspected_at),
  KEY idx_vehicle_inspections_reservation (reservation_id),
  CONSTRAINT fk_vehicle_inspections_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_inspections_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
  CONSTRAINT fk_vehicle_inspections_user FOREIGN KEY (inspector_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vehicle_feature_assignments (
  vehicle_id BIGINT UNSIGNED NOT NULL,
  feature_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (vehicle_id, feature_id),
  CONSTRAINT fk_vfa_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  CONSTRAINT fk_vfa_feature FOREIGN KEY (feature_id) REFERENCES vehicle_features(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vehicle_damages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  inspection_id BIGINT UNSIGNED NULL,
  severity VARCHAR(30) NOT NULL DEFAULT 'MINOR',
  area VARCHAR(120) NOT NULL DEFAULT '',
  description VARCHAR(500) NOT NULL DEFAULT '',
  photo_url TEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  reported_at DATETIME(6) NOT NULL,
  resolved_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  KEY idx_vehicle_damages_vehicle (vehicle_id, status),
  KEY idx_vehicle_damages_inspection (inspection_id),
  CONSTRAINT fk_vehicle_damages_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_damages_inspection FOREIGN KEY (inspection_id) REFERENCES vehicle_inspections(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS reservation_status_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reservation_id BIGINT UNSIGNED NOT NULL,
  from_status VARCHAR(30) NULL,
  to_status VARCHAR(30) NOT NULL,
  changed_by_user_id BIGINT UNSIGNED NULL,
  reason VARCHAR(255) NOT NULL DEFAULT '',
  changed_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_res_status_history_res (reservation_id, changed_at),
  CONSTRAINT fk_res_status_history_res FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  CONSTRAINT fk_res_status_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS rental_contracts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reservation_id BIGINT UNSIGNED NOT NULL,
  contract_number VARCHAR(80) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  terms_version VARCHAR(40) NOT NULL DEFAULT '',
  signed_at DATETIME(6) NULL,
  started_at DATETIME(6) NULL,
  closed_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rental_contracts_reservation (reservation_id),
  UNIQUE KEY uq_rental_contracts_number (contract_number),
  KEY idx_rental_contracts_status (status),
  CONSTRAINT fk_rental_contracts_res FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS pickup_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reservation_id BIGINT UNSIGNED NOT NULL,
  contract_id BIGINT UNSIGNED NULL,
  processed_by_user_id BIGINT UNSIGNED NULL,
  odometer_km INT NULL,
  fuel_level_percent TINYINT UNSIGNED NULL,
  handoff_notes TEXT NULL,
  customer_signature_ref VARCHAR(191) NULL,
  picked_up_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pickup_reservation (reservation_id),
  KEY idx_pickup_contract (contract_id),
  CONSTRAINT fk_pickup_res FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pickup_contract FOREIGN KEY (contract_id) REFERENCES rental_contracts(id) ON DELETE SET NULL,
  CONSTRAINT fk_pickup_user FOREIGN KEY (processed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS return_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reservation_id BIGINT UNSIGNED NOT NULL,
  contract_id BIGINT UNSIGNED NULL,
  processed_by_user_id BIGINT UNSIGNED NULL,
  odometer_km INT NULL,
  fuel_level_percent TINYINT UNSIGNED NULL,
  return_notes TEXT NULL,
  customer_signature_ref VARCHAR(191) NULL,
  returned_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_return_reservation (reservation_id),
  KEY idx_return_contract (contract_id),
  CONSTRAINT fk_return_res FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE RESTRICT,
  CONSTRAINT fk_return_contract FOREIGN KEY (contract_id) REFERENCES rental_contracts(id) ON DELETE SET NULL,
  CONSTRAINT fk_return_user FOREIGN KEY (processed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(64) NOT NULL,
  reservation_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(40) NOT NULL DEFAULT 'square',
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  square_order_id VARCHAR(191) NOT NULL DEFAULT '',
  square_payment_link_id VARCHAR(191) NOT NULL DEFAULT '',
  checkout_url TEXT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payments_public_id (public_id),
  KEY idx_pay_reservation (reservation_id),
  KEY idx_pay_order (square_order_id),
  KEY idx_pay_status (status),
  CONSTRAINT fk_pay_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payment_id BIGINT UNSIGNED NOT NULL,
  provider_transaction_id VARCHAR(191) NOT NULL DEFAULT '',
  transaction_type VARCHAR(30) NOT NULL DEFAULT 'CHARGE',
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  idempotency_key VARCHAR(191) NOT NULL DEFAULT '',
  raw_reference VARCHAR(191) NOT NULL DEFAULT '',
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payment_transactions_idempotency (idempotency_key),
  KEY idx_payment_transactions_payment (payment_id, created_at),
  KEY idx_payment_transactions_provider (provider_transaction_id),
  CONSTRAINT fk_payment_transactions_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS refunds (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payment_id BIGINT UNSIGNED NOT NULL,
  transaction_id BIGINT UNSIGNED NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  reason VARCHAR(255) NOT NULL DEFAULT '',
  provider_refund_id VARCHAR(191) NOT NULL DEFAULT '',
  created_at DATETIME(6) NOT NULL,
  completed_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  KEY idx_refunds_payment (payment_id),
  KEY idx_refunds_status (status),
  KEY idx_refunds_provider (provider_refund_id),
  CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
  CONSTRAINT fk_refunds_transaction FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(64) NOT NULL,
  reservation_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  taxes DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  issued_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_invoices_public_id (public_id),
  UNIQUE KEY uq_invoices_reservation (reservation_id),
  KEY idx_invoice_status (status),
  CONSTRAINT fk_invoice_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_id BIGINT UNSIGNED NOT NULL,
  line_type VARCHAR(40) NOT NULL DEFAULT 'RENTAL',
  description VARCHAR(255) NOT NULL DEFAULT '',
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  line_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_invoice_items_invoice (invoice_id),
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider VARCHAR(40) NOT NULL,
  event_id VARCHAR(191) NOT NULL,
  event_type VARCHAR(100) NOT NULL DEFAULT '',
  payload_hash CHAR(64) NOT NULL DEFAULT '',
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(6) NOT NULL,
  processed_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payment_webhook_event (event_id),
  KEY idx_payment_webhook_provider (provider),
  KEY idx_payment_webhook_processed (processed, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  entity VARCHAR(120) NOT NULL,
  entity_id VARCHAR(120) NOT NULL DEFAULT '',
  ip VARCHAR(64) NOT NULL DEFAULT '',
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  details JSON NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_audit_user (user_id, created_at),
  KEY idx_audit_entity (entity, entity_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;

SELECT COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_type = 'BASE TABLE';
-- EcoFusion RentalCars - starter data for California, USA
-- Run AFTER EcoFusion-production-schema-27.sql.

INSERT INTO locations
(code, name, city, state_region, country_code, address, phone, timezone, active, created_at)
VALUES
('CA-01', 'California', '', 'CA', 'US', '', '', 'America/Los_Angeles', TRUE, UTC_TIMESTAMP(6))
ON DUPLICATE KEY UPDATE
  name=VALUES(name), city=VALUES(city), state_region=VALUES(state_region),
  country_code=VALUES(country_code), timezone=VALUES(timezone), active=VALUES(active);

INSERT INTO vehicle_categories (code, name, description, active)
VALUES
('COMPACT', 'Compact', 'Compact vehicles for city driving and efficient trips.', TRUE),
('SUV', 'SUV', 'Utility vehicles for passengers and luggage.', TRUE),
('SEDAN', 'Sedan', 'Comfortable sedans for everyday travel.', TRUE),
('PREMIUM', 'Premium', 'Vehicles with additional capacity and equipment.', TRUE)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), description=VALUES(description), active=VALUES(active);

SET @location_id := (SELECT id FROM locations WHERE code='CA-01' LIMIT 1);

INSERT INTO vehicles
(public_id, category_id, location_id, name, slug, category, transmission, fuel, seats,
 price_per_day, location, status, image_url, metadata_json, created_at, updated_at)
VALUES
('VH-001', (SELECT id FROM vehicle_categories WHERE code='COMPACT' LIMIT 1), @location_id,
 'Toyota Prius', 'toyota-prius', 'compact', 'Automatic', 'Hybrid', 5, 59.00,
 'California, USA', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','PRIUS','categoryLabel','Hybrid','luggage',2,'efficiency','57 MPG','color','Silver'),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('VH-002', (SELECT id FROM vehicle_categories WHERE code='SUV' LIMIT 1), @location_id,
 'Toyota RAV4', 'toyota-rav4', 'suv', 'Automatic', 'Gasoline', 5, 79.00,
 'California, USA', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','RAV4','categoryLabel','SUV','luggage',3,'efficiency','29 MPG','color','Ice Cap'),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('VH-003', (SELECT id FROM vehicle_categories WHERE code='COMPACT' LIMIT 1), @location_id,
 'Toyota Corolla', 'toyota-corolla', 'compact', 'Automatic', 'Hybrid', 5, 59.00,
 'California, USA', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','COROLLA','categoryLabel','Compact Hybrid','luggage',2,'efficiency','50 MPG','color','Graphite'),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('VH-004', (SELECT id FROM vehicle_categories WHERE code='SEDAN' LIMIT 1), @location_id,
 'Toyota Camry', 'toyota-camry', 'sedan', 'Automatic', 'Hybrid', 5, 69.00,
 'California, USA', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','CAMRY','categoryLabel','Premium Sedan','luggage',3,'efficiency','47 MPG','color','Pearl White'),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('VH-005', (SELECT id FROM vehicle_categories WHERE code='SUV' LIMIT 1), @location_id,
 'Toyota Highlander', 'toyota-highlander', 'suv', 'Automatic', 'Gasoline', 7, 104.00,
 'California, USA', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','HIGHLANDER','categoryLabel','Three-Row SUV','luggage',4,'efficiency','24 MPG','color','Ice Cap'),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('VH-006', (SELECT id FROM vehicle_categories WHERE code='PREMIUM' LIMIT 1), @location_id,
 'Toyota Sienna', 'toyota-sienna', 'premium', 'Automatic', 'Hybrid', 7, 99.00,
 'California, USA', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','SIENNA','categoryLabel','Hybrid Minivan','luggage',5,'efficiency','36 MPG','color','Blueprint'),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))
ON DUPLICATE KEY UPDATE
  category_id=VALUES(category_id), location_id=VALUES(location_id), name=VALUES(name), slug=VALUES(slug), category=VALUES(category),
  transmission=VALUES(transmission), fuel=VALUES(fuel), seats=VALUES(seats), price_per_day=VALUES(price_per_day), location=VALUES(location),
  status=VALUES(status), metadata_json=VALUES(metadata_json), updated_at=UTC_TIMESTAMP(6);

INSERT INTO vehicle_features (code, name) VALUES
('HYBRID', 'Hybrid'),
('AUTOMATIC', 'Automatic transmission'),
('AIR_CONDITIONING', 'Air conditioning'),
('BLUETOOTH', 'Bluetooth'),
('USB', 'USB ports'),
('REAR_CAMERA', 'Rear camera')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT IGNORE INTO vehicle_feature_assignments (vehicle_id, feature_id)
SELECT v.id, f.id
FROM vehicles v
CROSS JOIN vehicle_features f
WHERE f.code IN ('AUTOMATIC','AIR_CONDITIONING','BLUETOOTH','USB')
  AND v.status='ACTIVE';

SELECT COUNT(*) AS vehicle_count FROM vehicles;
SELECT COUNT(*) AS location_count FROM locations;
