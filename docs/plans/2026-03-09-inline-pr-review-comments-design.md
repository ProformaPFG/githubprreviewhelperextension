# Inline PR Review Comments — Design

**Date:** 2026-03-09
**Status:** Approved

## Goal

In addition to the existing summary PR comment, post GitHub inline review comments directly on the diff lines where issues are found, so reviewers can see them in the "Files changed" tab.

## Architecture

Two comment passes after analysis completes:

1. **Inline review pass** — batch-post one `pulls.createReview` with per-line comments for all issues whose line number falls within the file's diff hunk
2. **Summary comment pass** — existing behavior unchanged; post/update the full report on the PR conversation

Issues whose line number is not in the diff (e.g. issues in unchanged context outside any hunk) appear only in the summary.

## Diff Line Mapping

Each file returned by `pulls.listFiles` includes a `patch` field (unified diff). We parse it to build a `Set<number>` of new-file line numbers visible in the diff.

Parsing rules:
- `@@` lines → parse `+<start>` to set the new-file line counter
- Lines starting with `+` → increment counter, add to set (added lines)
- Context lines (no prefix) → increment counter, add to set
- Lines starting with `-` → do not increment counter (removed lines have no new-file number)

Only issues with `lineNumber` in this set are eligible for inline placement.

## Inline Comment Format

```
<!-- cra-inline -->
🔴 **Critical** · `JS-SEC-001`

**Avoid using eval()** — Executing arbitrary strings as code enables code injection attacks and bypasses Content Security Policy.
```

Fields used: `SEVERITY_ICON`, `severity`, `ruleId`, `message`, `description` (from rule metadata if available).

The `<!-- cra-inline -->` HTML comment acts as a marker for cleanup on re-runs.

## Cleanup on Re-runs

Before posting a new review:
1. Call `pulls.listReviewComments` to fetch all existing review comments on the PR
2. Filter to comments whose body contains `<!-- cra-inline -->`
3. Call `pulls.deleteReviewComment` for each stale comment

This prevents duplicate inline comments when the action re-runs on a new push to the same PR.

## API Calls Used

| Purpose | Endpoint |
|---|---|
| List diff files | `pulls.listFiles` (existing) |
| List existing inline comments | `pulls.listReviewComments` |
| Delete stale inline comments | `pulls.deleteReviewComment` |
| Post new inline review | `pulls.createReview` |
| Post/update summary comment | `issues.createComment` / `issues.updateComment` (existing) |

## Permissions

No new permissions needed — `pull-requests: write` already covers review comment creation and deletion.

## Files Changed

- `action/index.js` — add `parsePatchLines()`, `buildInlineComments()`, `cleanupInlineComments()`, `postInlineReview()` functions; call them in `run()` before posting the summary comment
- `action/dist/index.cjs` — rebuild artifact
