import { Router } from "express";
import { analyzePullRequest } from "../services/analyzePullRequest.js";
import {
  getGithubLiveStatus,
  patchLatestWebhookEvent,
  setLatestWebhookEvent,
} from "../lib/githubLiveState.js";

const router = Router();

const ALLOWED_ACTIONS = new Set(["opened", "synchronize", "reopened"]);

function buildEventFromPayload(body) {
  const pr = body?.pull_request;
  const repository = body?.repository;
  const owner =
    repository?.owner?.login ??
    (repository?.full_name ? repository.full_name.split("/")[0] : null);

  return {
    repo: repository?.full_name ?? (owner && repository?.name ? `${owner}/${repository.name}` : null),
    prTitle: pr?.title ?? null,
    prUrl: pr?.html_url ?? null,
    author: pr?.user?.login ?? null,
    branch: pr?.head?.ref ?? null,
    action: body?.action ?? null,
    eventType: "pull_request",
    receivedAt: new Date().toISOString(),
    status: "received",
  };
}

async function runWebhookAnalysis(eventMeta) {
  patchLatestWebhookEvent({ status: "analyzing" });

  try {
    const analysisResult = await analyzePullRequest({
      prUrl: eventMeta.prUrl,
      branch: eventMeta.branch,
    });

    patchLatestWebhookEvent({
      status: "completed",
      completedAt: new Date().toISOString(),
      analysisResult,
    });

    console.log("[PRISM] Webhook analysis completed:", eventMeta.prUrl);
  } catch (error) {
    console.error("[PRISM] Webhook analysis failed:", error.message);
    patchLatestWebhookEvent({
      status: "failed",
      failedAt: new Date().toISOString(),
      error: error.message,
    });
  }
}

router.post("/webhook", (req, res) => {
  try {
    const githubEvent = req.headers["x-github-event"];

    if (githubEvent !== "pull_request") {
      return res.json({
        ok: true,
        ignored: true,
        reason: `Unsupported event type: ${githubEvent ?? "unknown"}`,
      });
    }

    const action = req.body?.action;
    if (!ALLOWED_ACTIONS.has(action)) {
      return res.json({
        ok: true,
        ignored: true,
        action,
        message: "Event acknowledged; no analysis triggered.",
      });
    }

    const eventMeta = buildEventFromPayload(req.body);

    if (!eventMeta.prUrl || !eventMeta.repo) {
      return res.status(400).json({
        ok: false,
        error: "Invalid webhook payload: missing PR URL or repository.",
      });
    }

    setLatestWebhookEvent(eventMeta);
    console.log("Webhook PR received:", eventMeta.prUrl, `(${action})`);

    res.json({
      ok: true,
      message: "Webhook accepted; analysis started.",
      event: {
        repo: eventMeta.repo,
        prTitle: eventMeta.prTitle,
        prUrl: eventMeta.prUrl,
        author: eventMeta.author,
        action: eventMeta.action,
        receivedAt: eventMeta.receivedAt,
        status: "analyzing",
      },
    });

    runWebhookAnalysis(eventMeta).catch((err) => {
      console.error("[PRISM] Unhandled webhook analysis error:", err.message);
    });
  } catch (error) {
    console.error("[PRISM] Webhook handler error:", error.message);
    res.status(500).json({ ok: false, error: "Webhook processing failed." });
  }
});

router.get("/live-status", (_req, res) => {
  const status = getGithubLiveStatus();
  const event = status.latestEvent;

  if (!event) {
    return res.json({
      connected: status.connected,
      latestEvent: null,
      message: "No webhook events received yet.",
    });
  }

  const { analysisResult, ...publicEvent } = event;

  res.json({
    connected: status.connected,
    latestEvent: {
      ...publicEvent,
      hasAnalysisResult: Boolean(analysisResult),
    },
    analysisResult: event.status === "completed" ? analysisResult : undefined,
  });
});

export default router;
