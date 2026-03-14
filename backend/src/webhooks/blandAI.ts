const BLAND_AI_KEY = process.env.BLAND_API_KEY;

if (!BLAND_AI_KEY) {
  throw new Error("Missing BLAND_API_KEY in environment variables");
}
