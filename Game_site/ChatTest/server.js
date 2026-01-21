import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const {
  GITHUB_TOKEN,
  REPO_OWNER,
  REPO_NAME,
  ISSUE_NUMBER,
  ALLOWED_ORIGIN = "*",
  PORT = 3000
} = process.env;

if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME || !ISSUE_NUMBER) {
  console.error("Please set GITHUB_TOKEN, REPO_OWNER, REPO_NAME and ISSUE_NUMBER in .env");
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cors({
  origin: ALLOWED_ORIGIN === "*" ? true : ALLOWED_ORIGIN,
}));

// Basic rate limiter: adjust as needed
const posterLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 5,           // max 5 posts per IP per minute
  message: { error: "Too many posts, try again later." }
});

// Helper to call GitHub API
async function ghFetch(path, opts = {}) {
  const url = `https://api.github.com${path}`;
  const headers = Object.assign({
    Accept: "application/vnd.github.v3+json",
    Authorization: `token ${GITHUB_TOKEN}`
  }, opts.headers || {});
  const res = await fetch(url, Object.assign({}, opts, { headers }));
  return res;
}

// GET comments (chat history) from the configured issue
app.get("/messages", async (req, res) => {
  try {
    const path = `/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments?per_page=100`;
    const ghRes = await ghFetch(path);
    if (!ghRes.ok) {
      const t = await ghRes.text();
      console.error("GitHub API error:", ghRes.status, t);
      return res.status(500).json({ error: "Failed to fetch messages from GitHub" });
    }
    const comments = await ghRes.json();
    const messages = comments.map(c => ({
      id: c.id,
      body: c.body,
      user: c.user && { login: c.user.login, avatar_url: c.user.avatar_url },
      created_at: c.created_at,
      html_url: c.html_url
    }));
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// POST a new message -> creates a comment on the single issue
// Accepts JSON { displayName?: string, message: string }
app.post("/messages", posterLimiter, async (req, res) => {
  try {
    const { displayName, message } = req.body;
    if (!message || typeof message !== "string") return res.status(400).json({ error: "message required" });

    // Limit length for safety
    const safeMessage = message.slice(0, 4000);

    // Build the comment body: include display name so the comment shows who the sender wanted to be
    const name = (displayName && String(displayName).slice(0, 100).trim()) || "Anonymous";
    const commentBody = `**${escapeMarkdown(name)}**\n\n${escapeMarkdown(safeMessage)}`;

    const path = `/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments`;
    const ghRes = await ghFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentBody })
    });

    if (!ghRes.ok) {
      const t = await ghRes.text();
      console.error("GitHub API error creating comment:", ghRes.status, t);
      return res.status(500).json({ error: "Failed to create message on GitHub" });
    }
    const created = await ghRes.json();
    res.json({ ok: true, comment: { id: created.id, url: created.html_url } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

function escapeMarkdown(s) {
  // Very small sanitizer: escape backticks and leading > to avoid quoting abuse.
  return String(s).replace(/`/g, "\\`").replace(/^>/gm, "\\>");
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
