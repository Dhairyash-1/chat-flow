import { uuid } from "drizzle-orm/pg-core"
import { pgTable } from "drizzle-orm/pg-core"

const Message = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
})
