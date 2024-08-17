import { db } from "../config/drizzle"
import { eq } from "drizzle-orm"
import { Request, Response } from "express"
import { users } from "../models/schema"
import { Webhook } from "svix"

export const syncUserWithDb = async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error("You need a WEBHOOK_SECRET in your .env")
  }

  // Get the headers and body
  const headers = req.headers
  const payload = req.body

  // Get the Svix headers for verification
  const svix_id = headers["svix-id"]
  const svix_timestamp = headers["svix-timestamp"]
  const svix_signature = headers["svix-signature"]

  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id as string,
      "svix-timestamp": svix_timestamp as string,
      "svix-signature": svix_signature as string,
    })
  } catch (err) {
    console.log("Error verifying webhook:", err.message)
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  const { id } = evt.data
  const eventType = evt.type
  console.log(`Webhook with an ID of ${id} and type of ${eventType}`)
  // console.log("Webhook body:", evt.data)

  if (eventType === "user.created") {
    const {
      id,
      username,
      first_name,
      last_name,
      email_addresses,
      profile_image_url,
    } = evt.data
    const [newUser] = await db
      .insert(users)
      .values({
        // @ts-ignore
        clerkId: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name || ""}`,
        username,
        online: false,
        profilePic: profile_image_url,
      })
      .returning()

    res.status(201).json({ data: newUser })
  }
  if (eventType === "user.updated") {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      username,
      profile_image_url,
    } = evt.data
    const updatedData = {
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name || ""}`,
      username: username,
      online: false,
      profilePic: profile_image_url,
    }
    const [updatedUser] = await db
      .update(users)
      .set(updatedData)
      .where(eq(users.clerkId, id))
      .returning()
    res.status(200).json({ data: updatedUser })
  }
  if (eventType === "user.deleted") {
    const { id } = evt.data
    await db.delete(users).where(eq(users.clerkId, id))
    res.status(200).json({ message: "user deleted successfully" })
  }
}
