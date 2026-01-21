/**
 * Minimal backend that posts/reads comments from a single GitHub issue.
 *
 * Environment variables required:
 * - GITHUB_TOKEN : a personal access token (give it `public_repo` scope for public repos or `repo` for private)
 * - REPO_OWNER   : owner/org name
 * - REPO_NAME    : repository name
 * - ISSUE_NUMBER : issue number to use as the chat thread (integer)
 * - ALLOWED_ORIGIN (optional) : origin for CORS (default "*")
 * - PORT (optional) : port to listen on (default 3000)
 *
 * Endpoints:
 * - GET  /messages         -> returns issue comments
 * - POST /messages         -> body: { name, message } -> creates a comment "**name**: message"
 */
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";

const {
  GITHUB_TOKEN,
  REPO_OWNER,
  REPO_NAME,
  ISSUE_NUMBER,
  ALLOWED_ORIGIN = "*",
  PORT = 3000
} = process.env;

if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME || !ISSUE_NUMBER) {
  console.error("Missing one of required env vars: GITHUB_TOKEN, REPO_OWNER, REPO_NAME, ISSUE_NUMBER");
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGIN === "*" ? true : ALLOWED_ORIGIN }));

// Basic rate limiter for posting: 6 posts per minute per IP
const postLimiter = rateLimit({
  windowMs: 60_000,
  max: 6,
  message: { error: "Too many posts, try again later." }
});

const GH_API_BASE = "https://api.github.com";
const COMMENTS_URL = `/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments`;

// GET /messages -> fetch comments from the issue
app.get("/messages", async (req, res) => {
  try {
    const url = `${GH_API_BASE}${COMMENTS_URL}?per_page=200`;
    const r = await fetch(url, { headers: { Accept: "application/vnd.github.v3+json" } });
    if (!r.ok) {
      const text = await r.text();
      console.error("GitHub error fetching comments:", r.status, text);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
    const comments = await r.json();
    // Map to simple fields
    const out = (comments || []).map(c => ({
      id: c.id,
      user: c.user && { login: c.user.login, avatar_url: c.user.avatar_url },
      created_at: c.created_at,
      body: c.body,
      html_url: c.html_url
    }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /messages -> create a comment on the issue
app.post("/messages", postLimiter, async (req, res) => {
  try {
    const { name = "Anonymous", message } = req.body || {};
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "message required" });
    }
    // Simple sanitization: limit length
    const cleanMessage = message.slice(0, 2000);
    const cleanName = String(name).slice(0, 80);
    const body = `**${cleanName}**: ${cleanMessage}`;

    const r = await fetch(`${GH_API_BASE}${COMMENTS_URL}`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ body })
    });
    if (!r.ok) {
      const txt = await r.text();
      console.error("GitHub API error creating comment:", r.status, txt);
      return res.status(500).json({ error: "Failed to post message" });
    }
    const json = await r.json();
    return res.json({ ok: true, comment: { id: json.id, url: json.html_url } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => res.send("GitHub Issue Chat backend"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
