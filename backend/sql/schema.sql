-- EcoFusion RentalCars - clean production schema
-- Core application only. No placeholder tables.

CREATE DATABASE IF NOT EXISTS ecofusion CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE ecofusion;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firebase_uid VARCHAR(191) NOT NULL,
  name VARCHAR(160) NOT NULL DEFAULT '',
  email VARCHAR(254) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL DEFAULT '',
  role VARCHAR(20) NOT NULL DEFAULT 'client',
  provider VARCHAR(50) NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  identity_status VARCHAR(30) NOT NULL DEFAULT 'not_started',
  identity_provider VARCHAR(40) NOT NULL DEFAULT '',
  identity_inquiry_id VARCHAR(191) NULL,
  created_at DATETIME(6) NOT NULL,
  last_login_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_firebase_uid (firebase_uid),
  UNIQUE KEY uq_users_identity_inquiry_id (identity_inquiry_id),
  KEY idx_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(96) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  csrf_token VARCHAR(96) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  revoked_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expiry (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


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
  CONSTRAINT fk_user_consents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  first_name VARCHAR(100) NOT NULL DEFAULT '',
  last_name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(254) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_user (user_id),
  KEY idx_customers_email (email),
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(64) NOT NULL,
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
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicles_public_id (public_id),
  UNIQUE KEY uq_vehicles_slug (slug),
  KEY idx_vehicle_status (status),
  KEY idx_vehicle_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reservations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(64) NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  pickup_at DATETIME(6) NOT NULL,
  return_at DATETIME(6) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  taxes DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  fees DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reservations_public_id (public_id),
  KEY idx_res_customer (customer_id),
  KEY idx_res_vehicle_dates (vehicle_id, pickup_at, return_at),
  KEY idx_res_status (status),
  CONSTRAINT fk_res_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_res_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  CONSTRAINT fk_pay_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider VARCHAR(40) NOT NULL,
  event_id VARCHAR(191) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payment_webhook_event (event_id),
  KEY idx_payment_webhook_provider (provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(64) NOT NULL,
  reservation_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  taxes DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invoices_public_id (public_id),
  KEY idx_invoice_reservation (reservation_id),
  CONSTRAINT fk_invoice_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  entity VARCHAR(120) NOT NULL,
  entity_id VARCHAR(120) NOT NULL DEFAULT '',
  ip VARCHAR(64) NOT NULL DEFAULT '',
  details JSON NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_audit_user (user_id),
  KEY idx_audit_entity (entity, entity_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
