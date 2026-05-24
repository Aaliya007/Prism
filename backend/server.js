import "./config/env.js";
import express from "express";
import cors from "cors";
import { getEnv, getIntegrationStatus } from "./config/env.js";
import { analyzePullRequest } from "./services/analyzePullRequest.js";
import githubRoutes from "./routes/githubWebhook.js";

const app = express();
const PORT = getEnv("PORT") || 5000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.send("PRISM Backend Running");
});

app.get("/api/integrations", (req, res) => {
  res.json(getIntegrationStatus());
});

app.use("/github", githubRoutes);

app.post("/analyze-pr", async (req, res) => {
  try {
    const { prUrl, branch, reviewerNotes, uploadedFileNames } = req.body;
    const result = await analyzePullRequest({
      prUrl,
      branch,
      reviewerNotes,
      uploadedFileNames,
    });
    res.json(result);
  } catch (error) {
    console.error(error.response?.data || error.message);
    const status = error.status || error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to analyze PR. Please verify the GitHub PR URL and token access.";
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  const status = getIntegrationStatus();
  console.log(`Server running on port ${PORT}`);
  console.log(
    `GitHub token: ${status.github.configured ? "loaded" : "missing"} | Gemini key: ${status.gemini.configured ? "loaded" : "missing"}`
  );
  console.log("GitHub webhook: POST /github/webhook");
  console.log("GitHub live status: GET /github/live-status");
});
