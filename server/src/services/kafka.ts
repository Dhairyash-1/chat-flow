import { Kafka, Producer } from "kafkajs"
import fs from "fs"
import path from "path"
import { db } from "../config/drizzle"
import { chats, messages, users } from "../models/schema"
import { eq } from "drizzle-orm"

const ca = Buffer.from(process.env.KAFKA_CA_BASE64!, "base64").toString("utf-8")

const kafka = new Kafka({
  brokers: [process.env.KAFKA_URL!],
  ssl: {
    ca: [ca],
  },
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
  },
})

let producer: Producer | null = null

export async function createProducer() {
  if (producer) return producer

  const _producer = kafka.producer()
  await _producer.connect()
  producer = _producer
  return producer
}

export async function produceMessage(message: {
  type: "image" | "text" | "video"
  id: string | number
  chatId: string
  content: string
  status: "sent" | "delivered" | "read"
  senderId: string
  createdAt: string
}) {
  const producer = await createProducer()
  await producer.send({
    messages: [
      { key: `message-${message.id}}`, value: JSON.stringify(message) },
    ],
    topic: "MESSAGES",
  })
  console.log("MESSAGE PRODUCED TO KAFKA BROKER")
  return true
}

export async function startMessageConsumer() {
  const consumer = kafka.consumer({ groupId: "default" })
  await consumer.connect()
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true })

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return

      console.log("message consumed")
      const parsedMsg = JSON.parse(message.value.toString())

      try {
        const message = await db
          .insert(messages)
          // @ts-ignore
          .values({
            chatId: parsedMsg.chatId,
            content: parsedMsg.content,
            type: parsedMsg.type,
            status: parsedMsg.status,
            senderId: parsedMsg.senderId,
            createdAt: new Date(parsedMsg.createdAt),
          })
          .returning()
        // update the lastmessage
        await db
          .update(chats)
          // @ts-ignore

          .set({ lastMessageId: message[0].id })
          .where(eq(chats.id, message[0].chatId))
      } catch (error) {
        console.log("Error in inserting msg to db", error)
        pause()
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }])
        }, 60 * 1000)
      }
    },
  })
}

export default kafka
