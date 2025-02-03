import { clerkClient } from "@clerk/express"

export async function main() {
  try {
    await clerkClient.users.updateUserMetadata(
      "user_2rIscSwd6hDWbDasjruLhQrDWFi",
      {
        publicMetadata: {
          userId: "f8fc6d1e-7d07-4ecb-9ca7-6163ea778810",
        },
      }
    )
    console.log("suc")
  } catch (error) {
    console.error("failed", error)
  }
}
