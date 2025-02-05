DO $$ BEGIN
 CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'video');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "type" "message_type" DEFAULT 'text' NOT NULL;