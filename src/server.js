import express from "express";
import cors from "cors";
import crypto from "crypto";
import "dotenv/config";
import { QuickDB } from "quick.db";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const db = new QuickDB();

function getUserId(req) {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "";
  const ua = req.headers["user-agent"] || "";

  return crypto
    .createHash("sha256")
    .update(ip + ua)
    .digest("hex");
}

app.get("/api/stats", async (req, res) => {
  const password = req.query.password;

  if (!password || password !== "Nikhil@6:30") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const home = (await db.get("counts.home")) || 0;
  const pay = (await db.get("counts.pay")) || 0;
  const success = (await db.get("counts.success")) || 0;

  res.json({ home, pay, success });
});

function handleVisit(route) {
  return async (req, res) => {
    const userId = getUserId(req);
    const visitedKey = `visited.${route}.${userId}`;
    const countKey = `counts.${route}`;

    const alreadyVisited = await db.get(visitedKey);

    if (!alreadyVisited) {
      await db.set(visitedKey, true);
      await db.add(countKey, 1);
    }

    const count = (await db.get(countKey)) || 0;
    res.json({ count });
  };
}

app.post("/visit/home", handleVisit("home"));
app.post("/visit/pay", handleVisit("pay"));
app.post("/visit/success", handleVisit("success"));

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});