import dotenv from "dotenv"
dotenv.config()
import type { Config } from "drizzle-kit"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/models/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
}) satisfies Config
