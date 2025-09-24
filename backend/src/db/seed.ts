import { getDatabase } from "./database";
import bcrypt from "bcryptjs";

export const seedDatabase = async () => {
  const db = getDatabase();

  console.log("🌱 Seeding database...");

  // Create admin user from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
  const adminFirstName = process.env.ADMIN_FIRST_NAME || "Admin";
  const adminLastName = process.env.ADMIN_LAST_NAME || "User";

  const existingAdmin = db.query("SELECT id FROM users WHERE email = ?").get(adminEmail);

  if (!existingAdmin) {
    db.query(
      `
      INSERT INTO users (email, password, firstName, lastName, role)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(adminEmail, adminPassword, adminFirstName, adminLastName, "admin");

    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  // Create all services from data.ts with correct IDs
  const services = [
    // Furniture (1-9)
    { id: 1, name: "Kanapa", description: "Cena dotyczy prania kanapy, sofy, wersalki 2-3 osobowej metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji", duration: 120, price: 200 },
    {
      id: 2,
      name: "Narożnik mały szezlong",
      description: "Cena dotyczy prania narożnika 3-4 osobowego typu szezlong bez poduszek metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
      duration: 90,
      price: 300,
    },
    {
      id: 3,
      name: "Narożnik duży L",
      description: "Cena dotyczy prania narożnika dużego 4-5 osobowego typu L bez poduszek metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
      duration: 120,
      price: 350,
    },
    {
      id: 4,
      name: "Narożnik duży U",
      description: "Cena dotyczy prania narożnika dużego 5-6 osobowego typu U bez poduszek metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
      duration: 150,
      price: 450,
    },
    { id: 5, name: "Fotel mały", description: "Cena dotyczy prania małego fotela metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji", duration: 60, price: 100 },
    { id: 6, name: "Fotel duży", description: "Cena dotyczy prania dużego fotela typu Uszak metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji", duration: 90, price: 150 },
    {
      id: 7,
      name: "Krzesło tapicerowane",
      description: "Cena dotyczy prania krzeseł tapicerowanych z oparciem oraz foteli biurkowych metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
      duration: 30,
      price: 30,
    },
    { id: 8, name: "Puf podnóżek", description: "Cena dotyczy prania pufy lub podnóżka tapicerowanego metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji", duration: 30, price: 40 },
    {
      id: 9,
      name: "Poduszka tepicerowana",
      description: "Cena dotyczy prania poduszek tapicerowanych będących elementem oparcia w kanapach, sofach, narożnikach metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
      duration: 30,
      price: 40,
    },

    // Mattress (101-102)
    {
      id: 101,
      name: "Materac pojedynczy",
      description: "Cena dotyczy prania materaca 1 osobowego do rozmiaru 120x200 cm po jednej stronie metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
      duration: 60,
      price: 150,
    },
    {
      id: 102,
      name: "Materac podwójny",
      description: "Cena dotyczy prania materaca 2 osobowego do rozmiaru 200x200 cm po jednej stronie metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
      duration: 90,
      price: 250,
    },

    // Vehicle (201-204)
    {
      id: 201,
      name: "Fotele samochodowe",
      description: "Cena dotyczy prania tapicerki samochodowej foteli przednich oraz kanapy tylnej metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
      duration: 90,
      price: 300,
    },
    { id: 202, name: "Dywanik tekstylny", description: "Cena dotyczy prania 1 szt dywanika tekstylnego metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji", duration: 30, price: 20 },
    {
      id: 203,
      name: "Podłoga samochodu",
      description: "Cena dotyczy odkurzania oraz prania podłogi samochodu osobowego metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji (zależy od wielkości pojazdu)",
      duration: 60,
      price: 200,
    },
    {
      id: 204,
      name: "Bonetowanie podsufitki",
      description: "Cena dotyczy czyszczenia oraz bonetowania podsufitki samochodu osobowego standardowych zabrudzeń w wyniku eksploatacji (zależy od wielkości pojazdu)",
      duration: 60,
      price: 150,
    },

    // Other (301-303)
    {
      id: 301,
      name: "Usuwanie plam",
      description:
        "Cena dotyczy usuwania ponadnormatywnych plam z materiałów tekstylnych spowodowanych zabrudzeniami spożywczymi oraz biologicznymi typu ( kawa, herbata, mleko, sok, artykuły spożywcze, krew, pomadka, lakier, sadza, guma, wosk, itp.) wycena uzależniona od stopnia i wielkości zabrudzeń",
      duration: 30,
      price: 50,
    },
    {
      id: 302,
      name: "Usuwnie nieprzyjemnych zapachów",
      description: "Cena obejmuje neutralizację nieprzyjemnych zapachów spowodowanych zabrudzeniami pochodzenia biologicznego np. mocz, kał, itp. cena może różnic się od stopnia zabrudzeń",
      duration: 30,
      price: 100,
    },
    {
      id: 303,
      name: "Osuszanie",
      description: "Cena dotyczy usługi osuszania mebli tapicerowanych po praniu ekstrakcyjnym w wyniku czego przyspiesza możliwość natychmiastowego użytkowania",
      duration: 30,
      price: 50,
    },
  ];

  for (const service of services) {
    const existing = db.query("SELECT id FROM services WHERE id = ?").get(service.id);
    if (!existing) {
      db.query(
        `
        INSERT INTO services (id, name, description, duration, price)
        VALUES (?, ?, ?, ?, ?)
      `
      ).run(service.id, service.name, service.description, service.duration, service.price);
    }
  }

  console.log("✅ Services seeded");
  console.log("🌱 Database seeding completed");
};

// Run seeding if called directly
if (import.meta.main) {
  const { initDatabase } = await import("./database");
  await initDatabase();
  await seedDatabase();
}
