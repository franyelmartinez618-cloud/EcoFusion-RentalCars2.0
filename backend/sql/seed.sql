-- EcoFusion starter fleet. Run after schema.sql.
USE ecofusion;

INSERT INTO vehicles
(public_id, name, slug, category, transmission, fuel, seats, price_per_day, location, status, image_url, metadata_json)
VALUES
('VH-001', 'Toyota Prius', 'toyota-prius', 'compact', 'Automatic', 'Hybrid', 5, 59.00, 'Malambo', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','PRIUS','categoryLabel','Hybrid','luggage',2,'efficiency','57 MPG','color','Silver','accent','green')),
('VH-002', 'Toyota RAV4', 'toyota-rav4', 'suv', 'Automatic', 'Gasoline', 5, 79.00, 'Malambo', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','RAV4','categoryLabel','SUV','luggage',3,'efficiency','29 MPG','color','Ice Cap','accent','green')),
('VH-003', 'Toyota Corolla', 'toyota-corolla', 'compact', 'Automatic', 'Hybrid', 5, 59.00, 'Malambo', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','COROLLA','categoryLabel','Compact Hybrid','luggage',2,'efficiency','50 MPG','color','Graphite','accent','green')),
('VH-004', 'Toyota Camry', 'toyota-camry', 'sedan', 'Automatic', 'Hybrid', 5, 69.00, 'Malambo', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','CAMRY','categoryLabel','Premium Sedan','luggage',3,'efficiency','47 MPG','color','Pearl White','accent','green')),
('VH-005', 'Toyota Highlander', 'toyota-highlander', 'suv', 'Automatic', 'Gasoline', 7, 104.00, 'Malambo', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','HIGHLANDER','categoryLabel','Three-Row SUV','luggage',4,'efficiency','24 MPG','color','Ice Cap','accent','purple')),
('VH-006', 'Toyota Sienna', 'toyota-sienna', 'premium', 'Automatic', 'Hybrid', 7, 99.00, 'Malambo', 'ACTIVE', NULL,
 JSON_OBJECT('shortName','SIENNA','categoryLabel','Hybrid Minivan','luggage',5,'efficiency','36 MPG','color','Blueprint','accent','purple'))
ON DUPLICATE KEY UPDATE
  name=VALUES(name),
  slug=VALUES(slug),
  category=VALUES(category),
  transmission=VALUES(transmission),
  fuel=VALUES(fuel),
  seats=VALUES(seats),
  price_per_day=VALUES(price_per_day),
  location=VALUES(location),
  status=VALUES(status),
  metadata_json=VALUES(metadata_json);
