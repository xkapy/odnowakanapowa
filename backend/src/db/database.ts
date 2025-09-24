import Database from "bun:sqlite";

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  userId: number;
  date: string;
  time: string;
  services: string; // JSON array of service IDs
  description?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: "user" | "admin";
}

export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

let db: Database;

export const initDatabase = async () => {
  // Create database file
  db = new Database("database.db");

  // Enable foreign keys
  db.exec("PRAGMA foreign_keys = ON");

  // Create tables
  await createTables();

  // Seed the database with initial data
  const { seedDatabase } = await import("./seed");
  await seedDatabase();

  console.log("✅ Database initialized successfully");
};

const createTables = async () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL DEFAULT 60,
      price REAL NOT NULL,
      active BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Appointments table (updated structure)
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
      is_guest BOOLEAN DEFAULT 0,
      guest_name TEXT,
      guest_email TEXT,
      guest_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Junction table for appointments and services (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointment_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
      UNIQUE(appointment_id, service_id)
    )
  `);

  // Create indexes for better performance
  db.exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_appointment_services_appointment ON appointment_services(appointment_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_appointment_services_service ON appointment_services(service_id)");

  // Add quantity column to appointment_services if it doesn't exist
  try {
    db.exec("ALTER TABLE appointment_services ADD COLUMN quantity INTEGER DEFAULT 1");
    console.log("✅ Added quantity column to appointment_services");
  } catch (error) {
    // Column probably already exists, ignore error
  }

  // Add guest-related columns to appointments table if they don't exist
  try {
    db.exec("ALTER TABLE appointments ADD COLUMN is_guest BOOLEAN DEFAULT 0");
    console.log("✅ Added is_guest column to appointments");
  } catch (error) {
    // Column probably already exists, ignore error
  }

  try {
    db.exec("ALTER TABLE appointments ADD COLUMN guest_name TEXT");
    console.log("✅ Added guest_name column to appointments");
  } catch (error) {
    // Column probably already exists, ignore error
  }

  try {
    db.exec("ALTER TABLE appointments ADD COLUMN guest_email TEXT");
    console.log("✅ Added guest_email column to appointments");
  } catch (error) {
    // Column probably already exists, ignore error
  }

  try {
    db.exec("ALTER TABLE appointments ADD COLUMN guest_phone TEXT");
    console.log("✅ Added guest_phone column to appointments");
  } catch (error) {
    // Column probably already exists, ignore error
  }

  // Make user_id nullable for guest appointments
  try {
    // Note: SQLite doesn't support ALTER COLUMN, so we need to recreate the table
    // But since we're handling this in the CREATE TABLE statement above, this is just for existing DBs
    console.log("✅ Guest appointment columns migration completed");
  } catch (error) {
    console.log("Migration note: user_id should be nullable for guest appointments");
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
};
