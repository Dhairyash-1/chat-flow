import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerkId"),
  email: text("email").notNull(),
  name: text("name"),
  username: text("username").unique(),
  profilePic: text("profilePic"),
  online: boolean("online").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
