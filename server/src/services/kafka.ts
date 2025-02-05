import { Kafka, Producer } from "kafkajs"
import fs from "fs"
import path from "path"
import { db } from "../config/drizzle"
import { messages, users } from "../models/schema"
import { eq } from "drizzle-orm"

const kafka = new Kafka({
  brokers: [process.env.KAFKA_URL as string],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME as string,
    password: process.env.KAFKA_PASSWORD as string,
    mechanism: "plain",
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
        await db.insert(messages).values({
          chatId: parsedMsg.chatId,
          content: parsedMsg.content,
          type: parsedMsg.type,
          status: parsedMsg.status,
          senderId: parsedMsg.senderId,
          createdAt: new Date(parsedMsg.createdAt),
        })
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
