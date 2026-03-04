import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const buildDir = path.join(root, "build");

const CLIENT_PORT = 8080;

const BUILD_PACKAGE_JSON = {
  name: "weekplanner",
  private: true,
  type: "module",
  scripts: {
    start: "node server/index.js",
    run: `concurrently "npm run start" "http-server client-dist -p ${CLIENT_PORT} -c-1"`,
  },
  dependencies: {
    dotenv: "^16.4.5",
    bcrypt: "^5.1.1",
    "cookie-parser": "^1.4.6",
    cors: "^2.8.5",
    express: "^4.21.0",
    "http-server": "^14.1.1",
    jsonwebtoken: "^9.0.2",
    sequelize: "^6.37.0",
    sqlite3: "^5.1.7",
    concurrently: "^9.0.1",
  },
};

console.log("Cleaning build/...");
rmSync(buildDir, { recursive: true, force: true });
mkdirSync(buildDir, { recursive: true });

console.log("Building frontend (Vite)...");
execSync("vite build --outDir build/client-dist", {
  cwd: root,
  stdio: "inherit",
});

console.log("Compiling server (TypeScript)...");
execSync("tsc -p server", { cwd: root, stdio: "inherit" });

console.log("Copying server to build/server...");
const serverDist = path.join(root, "server", "dist");
cpSync(serverDist, path.join(buildDir, "server"), { recursive: true });

mkdirSync(path.join(buildDir, "server", "data"), { recursive: true });

const envPath = path.join(root, ".env");
if (existsSync(envPath)) {
  console.log("Copying .env to build/...");
  cpSync(envPath, path.join(buildDir, ".env"));
} else {
  const envExample = path.join(root, ".env.example");
  if (existsSync(envExample)) {
    console.log("Copying .env.example to build/.env...");
    cpSync(envExample, path.join(buildDir, ".env"));
  }
}

console.log("Writing build/package.json...");
writeFileSync(
  path.join(buildDir, "package.json"),
  JSON.stringify(BUILD_PACKAGE_JSON, null, 2)
);

console.log("Done. Output in build/");
