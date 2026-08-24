import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import express from "express";
import cors from "cors";
import compression from "compression";
import { CAPABILITIES, generateReply } from "../shared/ai.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const PORT = Number(process.env.SERVER_PORT ?? process.env.PORT ?? 3001);
const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "64kb" }));

// Simple request logger so activity is visible in the terminal during dev.
app.use((req, _res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get("/api/capabilities", (_req, res) => {
  res.json({ capabilities: CAPABILITIES });
});

app.post("/api/chat", (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message : "";
  if (message.length > 2000) {
    res.status(400).json({ error: "Message too long (max 2000 characters)." });
    return;
  }
  const result = generateReply(message);
  res.json({
    ...result,
    id: `msg_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
  });
});

// In production, serve the built client and fall back to index.html for SPA routes.
if (isProduction) {
  const clientDir = path.join(projectRoot, "dist", "client");
  if (!fs.existsSync(clientDir)) {
    console.warn(`[warn] Client build not found at ${clientDir}. Run "npm run build" first.`);
  }
  app.use(express.static(clientDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

app.listen(PORT, () => {
  const mode = isProduction ? "production" : "development";
  console.log(`my-ai server (${mode}) listening on http://localhost:${PORT}`);
});
