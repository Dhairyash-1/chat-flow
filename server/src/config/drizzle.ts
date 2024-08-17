import { config } from "dotenv"
config({
  path: ".env",
})
import { drizzle } from "drizzle-orm/neon-http"
import { neon, Pool } from "@neondatabase/serverless"

const sql = neon(process.env.DB_URL!)

export const db = drizzle(sql)
