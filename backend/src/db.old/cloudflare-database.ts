import type { D1Database } from "../types/cloudflare";

export async function initCloudflareDatabase(db: D1Database) {
  // Create tables if they don't exist
  const createTables = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Services table
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Appointments table
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      guest_name TEXT,
      guest_email TEXT,
      guest_phone TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Appointment services junction table
    CREATE TABLE IF NOT EXISTS appointment_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );
  `;

  try {
    await db.exec(createTables);

    // Seed basic data
    await seedCloudflareDatabase(db);

    console.log("Cloudflare D1 database initialized successfully");
  } catch (error) {
    console.error("Error initializing Cloudflare D1 database:", error);
    throw error;
  }
}

async function seedCloudflareDatabase(db: D1Database) {
  // Check if services exist
  const servicesCount = await db.prepare("SELECT COUNT(*) as count FROM services").first("count");

  if (servicesCount === 0) {
    // Insert default services
    const services = [
      { name: "Sofa 2-osobowa", price: "150 zł", description: "Czyszczenie sofy 2-osobowej" },
      { name: "Sofa 3-osobowa", price: "180 zł", description: "Czyszczenie sofy 3-osobowej" },
      { name: "Fotel", price: "80 zł", description: "Czyszczenie fotela" },
      { name: "Narożnik L", price: "250 zł", description: "Czyszczenie narożnika L" },
      { name: "Narożnik U", price: "350 zł", description: "Czyszczenie narożnika U" },
      { name: "Materac pojedynczy", price: "120 zł", description: "Czyszczenie materaca pojedynczego" },
      { name: "Materac podwójny", price: "150 zł", description: "Czyszczenie materaca podwójnego" },
      { name: "Krzesło tapicerowane", price: "30 zł", description: "Czyszczenie krzesła tapicerowanego" },
      { name: "Pufa", price: "50 zł", description: "Czyszczenie pufy" },
      { name: "Szezlong", price: "120 zł", description: "Czyszczenie szezlongu" },
      { name: "Dywan samochodowy", price: "80 zł", description: "Czyszczenie dywanu samochodowego" },
      { name: "Tapicerka samochodowa", price: "200 zł", description: "Czyszczenie tapicerki samochodowej" },
      { name: "Sufit samochodowy", price: "150 zł", description: "Czyszczenie sufitu samochodowego" },
      { name: "Odkurzanie samochodu", price: "50 zł", description: "Odkurzanie wnętrza samochodu" },
    ];

    for (const service of services) {
      await db.prepare("INSERT INTO services (name, price, description) VALUES (?, ?, ?)").bind(service.name, service.price, service.description).run();
    }

    console.log("Services seeded successfully");
  }

  // Check if admin user exists
  const adminExists = await db.prepare("SELECT COUNT(*) as count FROM users WHERE is_admin = TRUE").first("count");

  if (adminExists === 0) {
    // Create default admin user (password should be changed!)
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db
      .prepare(
        `
      INSERT INTO users (email, password, first_name, last_name, is_admin) 
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .bind("admin@odnowakanapowa.pl", hashedPassword, "Admin", "User", true)
      .run();

    console.log("Admin user created successfully");
  }
}
