import express from "express";
import cors from "cors";
import crypto from "crypto";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


// counts
const counts = {
  home: 0,
  pay: 0,
  success: 0,
};

app.get("/api/stats", (req, res) => {
  res.json({
    home: counts.home,
    pay: counts.pay,
    success: counts.success,
  });
});

// unique visitors
const visited = {
  home: new Set(),
  pay: new Set(),
  success: new Set(),
};

function getUserId(req) {
  const ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  const ua = req.headers["user-agent"] || "";

  return crypto
    .createHash("sha256")
    .update(ip + ua)
    .digest("hex");
}

function handleVisit(route) {
  return (req, res) => {
    const userId = getUserId(req);

    if (!visited[route].has(userId)) {
      visited[route].add(userId);
      counts[route]++;
    }

    res.json({ count: counts[route] });
  };
}

// routes
app.post("/visit/home", handleVisit("home"));
app.post("/visit/pay", handleVisit("pay"));
app.post("/visit/success", handleVisit("success"));

app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
