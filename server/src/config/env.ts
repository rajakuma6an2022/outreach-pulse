import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),

  SMTP_HOST: z.string().default("sandbox.smtp.mailtrap.io"),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  MAIL_FROM: z.string().default("OutreachPulse <no-reply@outreachpulse.test>"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;