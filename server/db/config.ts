import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const dbPath = path.join(__dirname, "..", "data", "weekplanner.sqlite");
