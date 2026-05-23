import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.use(cors());
app.use(express.json());

/*
========================================
HOME ROUTE
========================================
*/

app.get("/", (req, res) => {
  res.send("PRISM Backend Running");
});

/*
========================================
ANALYZE PR ROUTE
========================================
*/

app.post("/analyze-pr", async (req, res) => {
  try {
    const { prUrl } = req.body;
    if (!prUrl) {
      return res.status(400).json({ error: "Missing prUrl in request body." });
    }

    let url;
    try {
      url = new URL(prUrl);
    } catch (parseError) {
      return res.status(400).json({ error: "Invalid GitHub PR URL." });
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);
    if (pathSegments.length < 4 || !["pull", "pulls"].includes(pathSegments[2])) {
      return res.status(400).json({ error: "Invalid GitHub PR URL format." });
    }

    const owner = pathSegments[0];
    const repo = pathSegments[1];
    const pullNumber = pathSegments[3];

    if (!owner || !repo || !pullNumber || Number.isNaN(Number(pullNumber))) {
      return res.status(400).json({ error: "Invalid GitHub PR URL format." });
    }

    /*
    ========================================
    FETCH PR DETAILS
    ========================================
    */

    const headers = {};
    if (GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
    }

    const prResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      { headers }
    );

    /*
    ========================================
    FETCH FILES CHANGED
    ========================================
    */

    const filesResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
      { headers }
    );

    const prData = prResponse.data;
    const filesData = filesResponse.data;

    /*
    ========================================
    CREATE FILES ANALYZED
    ========================================
    */

    const filesAnalyzed = filesData.map((file) => ({
      name: file.filename,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      status: file.status,
    }));

    /*
    ========================================
    MOCK AI RESPONSE
    (Temporary until Gemini integration)
    ========================================
    */

    const responseData = {
      repoName: repo,

      prTitle: prData.title,

      prNumber: prData.number,

      author: prData.user.login,

      authorAvatar: prData.user.avatar_url,

      branch: prData.head.ref,

      createdAt: prData.created_at,

      changedFiles: prData.changed_files,

      additions: prData.additions,

      deletions: prData.deletions,

      mergeConfidence: 8.2,

      overallRisk: "Medium",

      summary:
        "Moderate deployment risk detected due to authentication-related modifications and elevated contributor sensitivity.",

      securityFindings: [
        {
          severity: "Critical",
          title: "Potential token exposure",
          description:
            "Environment variable may be exposed to client-side bundle.",
          file: "config/bootstrap.ts",
          line: 84,
        },
      ],

      performanceRisks: [
        {
          severity: "Medium",
          title: "Repeated parser allocation",
          description:
            "Parser object initialized repeatedly inside loop.",
          file: "engine/review.ts",
          line: 211,
        },
      ],

      maintainabilityIssues: [
        {
          severity: "High",
          title: "Complex state transitions",
          description:
            "Multiple useEffect dependencies increase debugging difficulty.",
          file: "hooks/useReviewState.ts",
          line: 43,
        },
      ],

      humanRisks: [
        {
          severity: "Medium",
          title: "New contributor touching critical auth flow",
          description:
            "Contributor has limited commit history in authentication modules.",
        },
      ],

      aiAgents: [
        {
          name: "Security Agent",
          status: "Active",
          findings: 3,
        },
        {
          name: "Performance Agent",
          status: "Active",
          findings: 2,
        },
        {
          name: "Maintainability Agent",
          status: "Active",
          findings: 5,
        },
        {
          name: "Human Risk Agent",
          status: "Active",
          findings: 1,
        },
      ],

      timeline: [
        {
          time: "09:12",
          title: "Pull request ingested",
          detail: "Analyzing changed files",
        },
        {
          time: "09:14",
          title: "Security analysis completed",
          detail: "1 critical issue detected",
        },
        {
          time: "09:16",
          title: "Human-aware risk evaluated",
          detail: "Contributor sensitivity elevated",
        },
      ],

      reviewComments: [
        {
          severity: "Critical",
          tag: "Security",
          file: "config/bootstrap.ts",
          line: 84,
          body:
            "Potential secret exposure detected. Move token to secure server-side environment access.",
        },
      ],

      filesAnalyzed,
    };

    res.json(responseData);

  } catch (error) {
    console.error(error.response?.data || error.message);

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      "Failed to analyze PR. Please verify the GitHub PR URL and token access.";

    res.status(status).json({ error: message });
  }
});

/*
========================================
START SERVER
========================================
*/

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});