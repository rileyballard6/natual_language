require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function seed() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log("Running schema...");
  const schema = fs.readFileSync(path.join(__dirname, "../schema.sql"), "utf8");
  await db.query(schema);

  console.log("Seeding categories...");
  await db.query(`
    INSERT INTO categories (name) VALUES
      ('Electronics'),
      ('Clothing'),
      ('Books'),
      ('Home & Kitchen'),
      ('Sports & Outdoors');
  `);

  console.log("Seeding products...");
  await db.query(`
    INSERT INTO products (title, description, price, category_id) VALUES
      ('Wireless Headphones',  'Over-ear noise cancelling headphones', 79.99,  1),
      ('Mechanical Keyboard',  'Tenkeyless with blue switches',        59.99,  1),
      ('USB-C Hub',            '7-in-1 multiport adapter',             34.99,  1),
      ('Classic T-Shirt',      '100% cotton, unisex fit',               9.99,  2),
      ('Hoodie',               'Fleece-lined pullover hoodie',          34.99,  2),
      ('Denim Jacket',         'Slim fit, washed blue',                49.99,  2),
      ('The Pragmatic Programmer', 'Your journey to mastery',          35.00,  3),
      ('Clean Code',           'A handbook of agile software craftsmanship', 30.00, 3),
      ('Cast Iron Skillet',    '12-inch pre-seasoned skillet',         25.99,  4),
      ('Yoga Mat',             'Non-slip, 6mm thick',                  22.99,  5);
  `);

  console.log("Seeding product variants...");
  await db.query(`
    INSERT INTO product_variants (product_id, name, sku, stock, price) VALUES
      (1, 'Black',          'WH-BLK',    40,  NULL),
      (1, 'White',          'WH-WHT',    25,  NULL),
      (2, 'Black / Blue switches', 'KB-BLK-BL', 30, NULL),
      (2, 'White / Red switches',  'KB-WHT-RD', 15, 64.99),
      (3, 'Space Gray',     'HUB-GRY',   50,  NULL),
      (4, 'Small / White',  'TS-S-WHT',  60,  NULL),
      (4, 'Medium / White', 'TS-M-WHT',  80,  NULL),
      (4, 'Large / Black',  'TS-L-BLK',  70,  NULL),
      (5, 'Small / Gray',   'HD-S-GRY',  35,  NULL),
      (5, 'Large / Navy',   'HD-L-NVY',  20,  NULL),
      (6, 'Medium',         'DJ-M',      15,  NULL),
      (7, 'Paperback',      'PPG-PB',    20,  NULL),
      (8, 'Paperback',      'CC-PB',     18,  NULL),
      (9, 'Standard',       'SKL-STD',   45,  NULL),
      (10,'Purple',         'YM-PRP',    55,  NULL),
      (10,'Black',          'YM-BLK',    40,  NULL);
  `);

  console.log("Seeding users...");
  await db.query(`
    INSERT INTO users (email, password_hash, first_name, last_name) VALUES
      ('alice@example.com',   'hash1', 'Alice',   'Johnson'),
      ('bob@example.com',     'hash2', 'Bob',     'Smith'),
      ('carol@example.com',   'hash3', 'Carol',   'Williams'),
      ('dave@example.com',    'hash4', 'Dave',    'Brown'),
      ('eve@example.com',     'hash5', 'Eve',     'Davis');
  `);

  console.log("Seeding orders...");
  await db.query(`
    INSERT INTO orders (user_id, total_amount, status, created_at) VALUES
      (1, 114.98, 'completed', '2025-01-10 10:00:00'),
      (2,  59.99, 'completed', '2025-01-15 14:30:00'),
      (3,  44.98, 'shipped',   '2025-02-01 09:15:00'),
      (1,  30.00, 'completed', '2025-02-05 16:45:00'),
      (4,  84.98, 'pending',   '2025-02-10 11:00:00'),
      (5,  22.99, 'pending',   '2025-02-12 13:20:00'),
      (2,  94.98, 'shipped',   '2025-02-14 08:00:00'),
      (3,  65.00, 'completed', '2025-02-16 17:00:00');
  `);

  console.log("Seeding order items...");
  await db.query(`
    INSERT INTO order_items (order_id, product_variant_id, quantity, price) VALUES
      (1, 1,  1, 79.99),
      (1, 6,  2,  9.99),
      (1, 9,  1, 34.99),
      (2, 3,  1, 59.99),
      (3, 10, 1, 34.99),
      (3, 11, 1,  9.99),
      (4, 12, 1, 30.00),
      (5, 2,  1, 79.99),
      (5, 7,  1,  9.99),
      (6, 15, 1, 22.99),
      (7, 4,  1, 64.99),
      (7, 8,  1,  9.99),
      (7, 13, 1, 30.00),
      (8, 12, 1, 35.00),
      (8, 13, 1, 30.00);
  `);

  console.log("Done! Database seeded successfully.");
  await db.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
