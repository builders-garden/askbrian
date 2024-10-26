import * as dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
  NEYNAR_API_KEY: z.string().trim().min(1),
  FARCASTER_SIGNER_UUID: z.string().trim().min(1),
  FARCASTER_CHANNEL_ID: z.string().trim().min(1),
  FARCASTER_REPLY_TO_CAST_HASH: z.string().trim().min(1),
  PORT: z
    .string()
    .trim()
    .default("3000")
    .transform((v) => parseInt(v)),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z
    .string()
    .transform((val) => (val ? parseInt(val) : undefined))
    .optional(),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  WEBHOOK_KEY: z.string().trim().min(1),
  XMTP_ENV: z.enum(["production", "dev"]).default("dev"),
  // BRIANBOT
  BRIANBOT_WARPCAST_API_KEY: z.string(),
  BRIANBOT_WEBHOOK_NAME: z.string().trim().min(1),
  BRIANBOT_WEBHOOK_TARGET_BASE_URL: z.string().url().trim().min(1),
  BRIANBOT_FARCASTER_FID: z
    .string()
    .transform((val) => (val ? parseInt(val) : undefined)),
  BRIANBOT_XMTP_PRIVATE_KEY: z.string().trim().min(1),
  BRIAN_SHARED_SECRET: z.string().trim().min(1),
});

const { data, success, error } = envSchema.safeParse(process.env);

if (!success) {
  console.error(
    `An error has occurred while parsing environment variables:${error.errors.map(
      (e) => ` ${e.path.join(".")} is ${e.message}`
    )}`
  );
  process.exit(1);
}

export type EnvSchemaType = z.infer<typeof envSchema>;
export const env = data;
