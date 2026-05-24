/** In-memory webhook monitoring state (hackathon/demo). */

let latestWebhookEvent = null;

export function setLatestWebhookEvent(event) {
  latestWebhookEvent = event
    ? {
        ...event,
        updatedAt: new Date().toISOString(),
      }
    : null;
}

export function patchLatestWebhookEvent(patch) {
  if (!latestWebhookEvent) {
    setLatestWebhookEvent(patch);
    return;
  }
  setLatestWebhookEvent({ ...latestWebhookEvent, ...patch });
}

export function getGithubLiveStatus() {
  return {
    connected: true,
    latestEvent: latestWebhookEvent,
  };
}
