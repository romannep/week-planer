import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const buildDir = path.join(root, "build");

const BUILD_PACKAGE_JSON = {
  name: "weekplanner",
  private: true,
  type: "module",
  scripts: {
    start: "node server/index.js",
  },
  dependencies: {
    bcrypt: "^5.1.1",
    "cookie-parser": "^1.4.6",
    cors: "^2.8.5",
    express: "^4.21.0",
    jsonwebtoken: "^9.0.2",
    sequelize: "^6.37.0",
    sqlite3: "^5.1.7",
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

console.log("Writing build/package.json...");
writeFileSync(
  path.join(buildDir, "package.json"),
  JSON.stringify(BUILD_PACKAGE_JSON, null, 2)
);

console.log("Done. Output in build/");
