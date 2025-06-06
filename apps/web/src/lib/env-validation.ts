import { z } from "zod";

const envSchema = z.object({
  // AI Services
  DEEPSEEK_API_KEY: z.string().min(1, "DeepSeek API key is required"),
  GOOGLE_AI_API_KEY: z.string().min(1, "Google AI API key is required"),

  // Database & Auth
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Supabase service role key is required"),

  // Optional integrations
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment validation failed:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });

    // In production, we should fail hard
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment configuration");
    }

    // In development, create a mock env with warnings
    console.warn("⚠️  Using fallback environment values for development");
    env = {
      DEEPSEEK_API_KEY: "mock-deepseek-key",
      GOOGLE_AI_API_KEY: "mock-google-key",
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key",
      SUPABASE_SERVICE_ROLE_KEY:
        process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-key",
      NODE_ENV: "development" as const,
    };
  } else {
    throw error;
  }
}

export { env };
