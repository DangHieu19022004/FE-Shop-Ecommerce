import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const CurrentDir = dirname(fileURLToPath(import.meta.url));
const LoginSource = readFileSync(join(CurrentDir, "Login.vue"), "utf8");

if (LoginSource.includes("AuthMessage")) {
  throw new Error("login redirect must not append AuthMessage query to the URL");
}

console.log("login redirect self-check passed");
