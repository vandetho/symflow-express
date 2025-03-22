import { Sequelize } from "sequelize";

// Create a new Sequelize instance
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false, // Disable logging
});

// Test connection
sequelize.authenticate()
    .then(() => console.log("✅ Database connected"))
    .catch((err) => console.error("❌ Database connection error:", err));