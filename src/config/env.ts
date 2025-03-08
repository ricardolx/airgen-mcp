import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const SECRETS = {
  OPENAI_API_KEY:
    "projects/your-project/secrets/openai-api-key/versions/latest",
} as const;

// Initialize the Secret Manager client
const secretManager = new SecretManagerServiceClient();

/**
 * Gets a secret from GCP Secret Manager with local fallback
 * @param secretName The name of the secret in GCP Secret Manager
 * @returns The secret value
 */
export async function getSecret(
  secretName: keyof typeof SECRETS
): Promise<string> {
  try {
    // Try to get from GCP Secret Manager first
    const [version] = await secretManager.accessSecretVersion({
      name: SECRETS[secretName],
    });

    if (version.payload?.data) {
      return version.payload.data.toString();
    }
    throw new Error("Secret payload is empty");
  } catch (error) {
    // Fall back to local environment variable
    const localValue = process.env[secretName];
    if (localValue) {
      return localValue;
    }
    throw new Error(
      `Failed to get secret ${secretName} from both GCP and local environment`
    );
  }
}

// Environment configuration
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
