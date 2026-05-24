/**
 * Parse owner, repo, and pull number from a GitHub PR URL.
 * @returns {{ owner: string, repo: string, pullNumber: string }}
 */
export function parsePrUrl(prUrl) {
  let url;
  try {
    url = new URL(prUrl);
  } catch {
    const err = new Error("Invalid GitHub PR URL.");
    err.status = 400;
    throw err;
  }

  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (pathSegments.length < 4 || !["pull", "pulls"].includes(pathSegments[2])) {
    const err = new Error("Invalid GitHub PR URL format.");
    err.status = 400;
    throw err;
  }

  const owner = pathSegments[0];
  const repo = pathSegments[1];
  const pullNumber = pathSegments[3];

  if (!owner || !repo || !pullNumber || Number.isNaN(Number(pullNumber))) {
    const err = new Error("Invalid GitHub PR URL format.");
    err.status = 400;
    throw err;
  }

  return { owner, repo, pullNumber };
}
