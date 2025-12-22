// src/instrumentation.ts
export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "development"
  ) {
    const mod = await import("./instrumentation.node");
    await mod.loadSecrets();
  } else {
    console.log("✓ Production build, skipping developer profile...");
  }
}
