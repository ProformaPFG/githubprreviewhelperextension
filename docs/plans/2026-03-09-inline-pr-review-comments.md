# Inline PR Review Comments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Post GitHub inline review comments on diff lines in the "Files changed" tab, alongside the existing summary PR comment.

**Architecture:** Parse each file's unified diff patch to determine which line numbers are visible in the diff. For issues on those lines, batch-post one `pulls.createReview` with inline comments. On re-runs, delete stale bot inline comments before posting new ones. The existing summary comment is unchanged.

**Tech Stack:** GitHub Actions (`@actions/core`, `@actions/github`), Octokit REST API (`pulls.createReview`, `pulls.listReviewComments`, `pulls.deleteReviewComment`), Node.js 20, esbuild (bundler)

---

### Task 1: Add `parsePatchLines()` helper

**Files:**
- Modify: `action/index.js` (add function after the `meetsThreshold` block, around line 81)

**Step 1: Add the function**

Insert this function after the `meetsThreshold` function in `action/index.js`:

```js
// ------- diff line mapping -------------------------------------------------

/**
 * Parse a unified diff patch and return the Set of new-file line numbers
 * that appear in the diff (added lines + context lines).
 * Only lines in this set can receive inline review comments.
 *
 * @param {string|undefined} patch  The `patch` field from pulls.listFiles
 * @returns {Set<number>}
 */
function parsePatchLines(patch) {
  if (!patch) return new Set();
  const visible = new Set();
  let newLine = 0;

  for (const line of patch.split('\n')) {
    if (line.startsWith('@@')) {
      // e.g.  @@ -10,7 +12,9 @@
      const m = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (m) newLine = parseInt(m[1], 10) - 1;
    } else if (line.startsWith('-')) {
      // removed line — no new-file line number, skip
    } else if (line.startsWith('+')) {
      newLine++;
      visible.add(newLine);
    } else {
      // context line
      newLine++;
      visible.add(newLine);
    }
  }

  return visible;
}
```

**Step 2: Commit**

```bash
git add action/index.js
git commit -m "feat: add parsePatchLines helper for diff line mapping"
```

---

### Task 2: Add `buildInlineCommentBody()` helper

**Files:**
- Modify: `action/index.js` (add function after `parsePatchLines`)

**Step 1: Add the function**

```js
const INLINE_MARKER = '<!-- cra-inline -->';

/**
 * Build the markdown body for a single inline review comment.
 *
 * Format:
 *   <!-- cra-inline -->
 *   🔴 **Critical** · `JS-SEC-001`
 *
 *   **eval() function call detected.** — Avoid eval() entirely. Use JSON.parse()…
 *
 * @param {{ ruleId: string, severity: string, message: string, remediation?: string }} issue
 * @returns {string}
 */
function buildInlineCommentBody(issue) {
  const icon = SEVERITY_ICON[issue.severity] ?? '';
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const remediation = issue.remediation ? ` — ${issue.remediation}` : '';
  return [
    INLINE_MARKER,
    `${icon} **${cap(issue.severity)}** &nbsp;·&nbsp; \`${issue.ruleId}\``,
    '',
    `**${issue.message}**${remediation}`,
  ].join('\n');
}
```

**Step 2: Commit**

```bash
git add action/index.js
git commit -m "feat: add buildInlineCommentBody helper"
```

---

### Task 3: Add `cleanupInlineComments()` helper

**Files:**
- Modify: `action/index.js` (add function after `buildInlineCommentBody`)

**Step 1: Add the function**

```js
/**
 * Delete all existing inline review comments posted by this action
 * (identified by INLINE_MARKER in body) to prevent duplicates on re-runs.
 *
 * @param {import('@octokit/rest').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 * @param {number} prNumber
 */
async function cleanupInlineComments(octokit, owner, repo, prNumber) {
  const existing = await octokit.paginate(octokit.rest.pulls.listReviewComments, {
    owner, repo, pull_number: prNumber,
  });

  const stale = existing.filter(c => c.body?.includes(INLINE_MARKER));
  core.info(`Deleting ${stale.length} stale inline comment(s)…`);

  await Promise.all(
    stale.map(c =>
      octokit.rest.pulls.deleteReviewComment({ owner, repo, comment_id: c.id }),
    ),
  );
}
```

**Step 2: Commit**

```bash
git add action/index.js
git commit -m "feat: add cleanupInlineComments to remove stale bot comments"
```

---

### Task 4: Add `postInlineReview()` helper

**Files:**
- Modify: `action/index.js` (add function after `cleanupInlineComments`)

**Step 1: Add the function**

```js
/**
 * Collect inline comments across all analyzed files and post them as a
 * single pull request review.  Issues whose line number falls outside the
 * diff are silently skipped here (they still appear in the summary comment).
 *
 * @param {import('@octokit/rest').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 * @param {number} prNumber
 * @param {string} commitSha  pr.head.sha
 * @param {Array<{ filePath: string, patch: string|undefined, results: Array }>} fileResults
 */
async function postInlineReview(octokit, owner, repo, prNumber, commitSha, fileResults) {
  const comments = [];

  for (const file of fileResults) {
    const diffLines = parsePatchLines(file.patch);

    for (const issue of file.results) {
      if (!diffLines.has(issue.lineNumber)) continue;

      comments.push({
        path: file.filePath,
        line: issue.lineNumber,
        side: 'RIGHT',
        body: buildInlineCommentBody(issue),
      });
    }
  }

  if (comments.length === 0) {
    core.info('No inline comments to post (no issues fall within diff lines).');
    return;
  }

  core.info(`Posting ${comments.length} inline comment(s) via PR review…`);

  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    commit_id: commitSha,
    event: 'COMMENT',
    comments,
  });
}
```

**Step 2: Commit**

```bash
git add action/index.js
git commit -m "feat: add postInlineReview to batch-post inline comments"
```

---

### Task 5: Wire everything into `run()`

**Files:**
- Modify: `action/index.js` — update the `for (const file of changedFiles)` loop and add calls after analysis

**Step 1: Store the `patch` field alongside analysis results**

In the `for (const file of changedFiles)` loop, the `rawResults` object is pushed to `allFileResults`. We need the patch stored there too. Find this block:

```js
      const rawResults = analyzeCode(code, language, allRules, file.filename);

      // Apply severity threshold filter
      rawResults.results = rawResults.results.filter(r =>
        meetsThreshold(r.severity, severityThreshold),
      );

      if (rawResults.results.length === 0) continue;

      allFileResults.push(rawResults);
```

Replace it with:

```js
      const rawResults = analyzeCode(code, language, allRules, file.filename);

      // Apply severity threshold filter
      rawResults.results = rawResults.results.filter(r =>
        meetsThreshold(r.severity, severityThreshold),
      );

      if (rawResults.results.length === 0) continue;

      // Store the diff patch for inline comment placement
      rawResults.patch = file.patch;

      allFileResults.push(rawResults);
```

**Step 2: Add cleanup + inline review calls after the analysis loop**

Find this block (just after the analysis loop closes):

```js
    core.info(`Analysis complete: ${summary.total} issue(s) found (${criticalCount} critical, ${warningCount} warning, ${infoCount} info)`);

    // Post or update PR comment
    const commentBody = buildComment(allFileResults, summary);
```

Insert the two new calls between those lines:

```js
    core.info(`Analysis complete: ${summary.total} issue(s) found (${criticalCount} critical, ${warningCount} warning, ${infoCount} info)`);

    // Post inline review comments on diff lines
    await cleanupInlineComments(octokit, owner, repo, prNumber);
    await postInlineReview(octokit, owner, repo, prNumber, pr.head.sha, allFileResults);

    // Post or update PR comment
    const commentBody = buildComment(allFileResults, summary);
```

**Step 3: Commit**

```bash
git add action/index.js
git commit -m "feat: wire inline review into run() alongside summary comment"
```

---

### Task 6: Rebuild the action bundle

The GitHub Action runs `action/dist/index.cjs`, not the source file directly. Rebuild it.

**Step 1: Run the build**

```bash
npm run build:action
```

Expected output:
```
  action/dist/index.cjs  ...kb

⚡ Done in ...ms
✅  Action bundle written to action/dist/index.cjs
```

**Step 2: Commit the bundle**

```bash
git add action/dist/index.cjs
git commit -m "build: rebuild action bundle with inline review support"
```

---

### Task 7: Smoke-test with a real PR (manual verification)

**Step 1: Push the branch and open a PR**

The action triggers on `pull_request` events. Open (or re-open) a PR that contains files matching any supported extension (`.js`, `.ts`, `.cs`, etc.) with at least one known-bad pattern (e.g. `eval(userInput)`).

**Step 2: Watch the Action run**

Go to the PR's **Checks** tab → **Code Review** → view logs. Confirm:
- `Deleting N stale inline comment(s)` appears (0 on first run is fine)
- `Posting N inline comment(s) via PR review…` appears with a count > 0

**Step 3: Check the Files changed tab**

Open the PR's **Files changed** tab. Inline comments should appear directly below the flagged lines, showing severity, rule ID, message, and remediation.

**Step 4: Check the Conversation tab**

The existing summary comment should still be present and unchanged.

**Step 5: Force-push to the same branch to test cleanup**

Make a trivial change and push. Verify the old inline comments are removed and new ones appear — no duplicates.
