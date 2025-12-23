// src/instrumentation.node.ts
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { GoogleAuth } from "google-auth-library";

async function getGcloudAccount(): Promise<string | null> {
  try {
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/userinfo.email"],
    });
    const client = await auth.getClient();
    const credentials = await client.getAccessToken();

    // Fetch directly without quota project issues
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${credentials.token}`
    );
    const data = await response.json();
    return data.email || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

//NOTE: PREFIX "RAW:" IF YOU NEED TO RUN MULTI-REPO LOCAL DEVELOPMENT
export async function loadSecrets() {
  const isProd = process.env.USE_PROD === "true";
  const ENV_SUFFIX = isProd ? "PROD" : "SUPERSTAR";

  console.log(`Loading developer profile...`);
  console.log(`Mode: ${isProd ? "PROD" : "DEV"}`);
  const client = new SecretManagerServiceClient();
  const PROJECT_ID = "terra-469920";

  try {
    await client.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/SUPABASE_SERVICE_ROLE_KEY_${ENV_SUFFIX}/versions/latest`,
    });
  } catch (err: any) {
    if (err.message.includes("Could not load the default credentials")) {
      console.error(
        "\n✗ GCP Authentication failed. Are you sure you're a Terra developer?"
      );
      console.error(
        "  If you are, run: 'gcloud auth application-default login' and sign in with your Terra credentials.\n"
      );
      process.exit(1);
    }
    if (err.code === 7 || err.message.includes("PERMISSION_DENIED")) {
      console.error(
        "\n✗ Nice try! You don't have access to production secrets."
      );
      process.exit(1);
    }
    throw err;
  }

  const SECRETS: Record<string, string> = {
    SUPABASE_SERVICE_ROLE_KEY: `SUPABASE_SERVICE_ROLE_KEY_${ENV_SUFFIX}`,
    TERRA_API_URL: `TERRA_API_URL_${ENV_SUFFIX}`,
    TERRA_API_KEY: `TERRA_API_KEY_${ENV_SUFFIX}`,
    STRIPE_SECRET_KEY: `STRIPE_SECRET_KEY_${ENV_SUFFIX}`,
    GCP_CREDENTIALS_JSON: `GCP_CREDENTIALS_JSON_${ENV_SUFFIX}`,
    GOOGLE_CLOUD_BUCKET: `GOOGLE_CLOUD_BUCKET_${ENV_SUFFIX}`,
    GOOGLE_GENERATIVE_AI_API_KEY: `GOOGLE_GENAI_API_KEY`,
    SENDGRID_API_KEY: "SENDGRID_API_KEY",
    POSTHOG_PERSONAL_API_KEY: "POSTHOG_PERSONAL_API_KEY",
    ANTHROPIC_API_KEY: "ANTHROPIC_API_KEY",
    TERMINAL_49_API_KEY: "TERMINAL_49_API_KEY",
    TWILIO_ACCOUNT_SID: "TWILIO_ACCOUNT_SID",
    TWILIO_AUTH_TOKEN: "TWILIO_AUTH_TOKEN",
    AFTERSHIP_API_KEY: "AFTERSHIP_API_KEY",
  };

  for (const [envName, secretName] of Object.entries(SECRETS)) {
    if (secretName.startsWith("RAW:")) {
      process.env[envName] = secretName.slice(4);
      continue;
    }
    try {
      const [version] = await client.accessSecretVersion({
        name: `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`,
      });
      process.env[envName] = version.payload?.data?.toString();
    } catch (err: any) {
      console.error(`✗ Failed to load ${secretName}`);
    }
  }

  const email = await getGcloudAccount();
  console.log(
    `\n✓ Welcome ${
      email || "developer"
    }. You are working on the Terra OMS. Happy coding :)`
  );
}
