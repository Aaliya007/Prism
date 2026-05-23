export function buildReviewUserPrompt({
  repoName,
  prTitle,
  prNumber,
  author,
  authorAvatar,
  branch,
  changedFiles,
  reviewerNotes,
  uploadedFileNames,
  diffText,
}) {
  const filesList = (changedFiles ?? [])
    .map(
      (f) =>
        `- ${f.name} (+${f.additions} / -${f.deletions}, ${f.changes} changes, status: ${f.status})`
    )
    .join("\n");

  const uploadedSection =
    uploadedFileNames?.length > 0
      ? `\nUploaded context files (names only):\n${uploadedFileNames.map((n) => `- ${n}`).join("\n")}\n`
      : "";

  const notesSection = reviewerNotes?.trim()
    ? `\nReviewer focus areas:\n${reviewerNotes.trim()}\n`
    : "";

  return `
Analyze this pull request. Use the metadata, file list, and diff below.

Fill repoName, prTitle, prNumber, author, authorAvatar, and branch from the metadata block.
Populate filesAnalyzed from the changed files list (exact names and counts).

## PR metadata
- Repository: ${repoName}
- Title: ${prTitle}
- PR number: ${prNumber}
- Author: ${author}
- Author avatar URL: ${authorAvatar}
- Branch: ${branch}

## Changed files
${filesList || "(no files listed)"}
${notesSection}${uploadedSection}
## Diff / patches
${diffText || "(no patch content available — base review on file list and metadata only)"}
`.trim();
}
