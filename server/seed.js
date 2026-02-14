import sequelize from "./config/database.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Konek Database
    await sequelize.authenticate();
    console.log("🔌 Database Connected...");

    // 2. Pastikan Tabel Ada
    await sequelize.sync();

    // 3. Cek apakah Admin sudah ada?
    const adminExists = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });

    if (adminExists) {
      console.log("⚠️  Admin user already exists. Skipping...");
      process.exit(0);
    }

    // 4. Buat Admin Baru
    // Password default diset di .env atau hardcoded di sini
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

    await User.create({
      name: "Super Administrator",
      email: process.env.ADMIN_EMAIL || "admin@gmail.com",
      password: adminPassword,
      role: "admin",
      isActive: true,
      isFirstLogin: false, // Admin seed tidak perlu ganti password saat login pertama
    });

    console.log("✅ Super Admin Created Successfully!");
    console.log(`📧 Email: ${process.env.ADMIN_EMAIL || "admin@cekat.local"}`);
    console.log(`🔑 Pass : ${adminPassword}`);
    console.log("-----------------------------------");
    console.log("Please login and change your password immediately.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
