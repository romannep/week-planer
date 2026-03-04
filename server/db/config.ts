import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const serverDir = path.join(__dirname, "..");
export const dbPath = process.env.DATABASE_PATH
  ? path.resolve(serverDir, process.env.DATABASE_PATH)
  : path.join(serverDir, "data", "weekplanner.sqlite");
