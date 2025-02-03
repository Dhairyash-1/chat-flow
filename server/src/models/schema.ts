import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  primaryKey,
  varchar,
  AnyPgColumn,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { pgEnum } from "drizzle-orm/pg-core"

// Users table - define first as it's referenced by other tables
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  profilePic: text("profile_pic"),
  isOnline: boolean("is_online").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const messageStatusEnum = pgEnum("message_status", [
  "sent",
  "delivered",
  "read",
])
// Messages table - define before chats since it's referenced in chats
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  senderId: uuid("sender_id").notNull(),
  chatId: uuid("chat_id").notNull(),
  status: messageStatusEnum("status").notNull().default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Chats table
export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  isGroupChat: boolean("is_group_chat").default(false),
  name: varchar("name", { length: 100 }),
  createdBy: uuid("created_by").notNull(),
  lastMessageId: uuid("last_message_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Chat Participants table
export const chatParticipants = pgTable(
  "chat_participants",
  {
    chatId: uuid("chat_id").notNull(),
    userId: uuid("user_id").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("member"),
    addedAt: timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.userId] }),
  })
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  chatParticipants: many(chatParticipants),
  createdChats: many(chats, { relationName: "createdByUser" }),
}))

export const chatsRelations = relations(chats, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [chats.createdBy],
    references: [users.id],
  }),
  lastMessage: one(messages, {
    fields: [chats.lastMessageId],
    references: [messages.id],
  }),
  participants: many(chatParticipants),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}))

export const chatParticipantsRelations = relations(
  chatParticipants,
  ({ one }) => ({
    chat: one(chats, {
      fields: [chatParticipants.chatId],
      references: [chats.id],
    }),
    user: one(users, {
      fields: [chatParticipants.userId],
      references: [users.id],
    }),
  })
)
