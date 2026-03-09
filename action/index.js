/**
 * GitHub Action entry point for Code Review Assistant
 *
 * Fetches PR files via GitHub API, runs the extension's analysis rules,
 * and posts a formatted comment summarising all issues found.
 */

import * as core from '@actions/core';
import * as github from '@actions/github';
import { analyzeCode } from '../dist/analyzer.js';
import { getAllRules } from '../dist/rules/index.js';

// ------- language detection (mirrors utils/language.ts) -------------------

const EXTENSION_TO_LANGUAGE = {
  html: 'html', htm: 'html',
  css: 'css', scss: 'css', sass: 'css', less: 'css',
  js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'tsx', jsx: 'jsx',
  cs: 'csharp',
  svelte: 'svelte',
};

function detectLanguage(filePath) {
  const m = filePath.match(/\.([^.]+)$/);
  return m ? (EXTENSION_TO_LANGUAGE[m[1].toLowerCase()] ?? null) : null;
}

// ------- comment formatting ------------------------------------------------

const SEVERITY_ICON = { critical: '🔴', warning: '⚠️', info: 'ℹ️' };
const COMMENT_MARKER = '<!-- code-review-assistant-report -->';

function buildComment(fileResults, summary) {
  const lines = [COMMENT_MARKER, '## 🔍 Code Review Assistant\n'];

  if (summary.total === 0) {
    lines.push('✅ **No issues found** — great work!');
    return lines.join('\n');
  }

  lines.push(
    `| Severity | Count |`,
    `|----------|------:|`,
    `| 🔴 Critical | ${summary.critical} |`,
    `| ⚠️  Warning  | ${summary.warning} |`,
    `| ℹ️  Info     | ${summary.info} |`,
    `| **Total**   | **${summary.total}** |`,
    '',
  );

  for (const file of fileResults) {
    if (file.results.length === 0) continue;
    lines.push(
      `<details>`,
      `<summary><strong>${file.filePath}</strong> &nbsp;—&nbsp; ${file.results.length} issue(s)</summary>`,
      '',
      '| Line | Severity | Rule | Message |',
      '|-----:|----------|------|---------|',
    );
    for (const issue of file.results) {
      const icon = SEVERITY_ICON[issue.severity] ?? '';
      const msg = issue.message.replace(/\|/g, '\\|');
      lines.push(
        `| ${issue.lineNumber} | ${icon} ${issue.severity} | \`${issue.ruleId}\` | ${msg} |`,
      );
    }
    lines.push('', '</details>', '');
  }

  lines.push('---', '_Powered by [GitHub Code Review Assistant](https://github.com/marketplace)_');
  return lines.join('\n');
}

// ------- severity filtering ------------------------------------------------

const SEVERITY_RANK = { info: 0, warning: 1, critical: 2 };

function meetsThreshold(severity, threshold) {
  return (SEVERITY_RANK[severity] ?? 0) >= (SEVERITY_RANK[threshold] ?? 0);
}

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

// ------- inline comment formatting ----------------------------------------

const INLINE_MARKER = '<!-- cra-inline -->';

/**
 * Build the markdown body for a single inline review comment.
 *
 * Format:
 *   <!-- cra-inline -->
 *   🔴 **Critical** &nbsp;·&nbsp; `JS-SEC-001`
 *
 *   **eval() function call detected.** — Avoid eval() entirely…
 *
 * @param {{ ruleId: string, severity: string, message: string, remediation?: string }} issue
 * @returns {string}
 */
function buildInlineCommentBody(issue) {
  const icon = SEVERITY_ICON[issue.severity] ?? '';
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const remediation = issue.remediation ? ` — ${issue.remediation}` : '';
  const ruleId = issue.ruleId ?? 'unknown';
  const message = issue.message || '(no message)';
  return [
    INLINE_MARKER,
    `${icon} **${cap(issue.severity)}** &nbsp;·&nbsp; \`${ruleId}\``,
    '',
    `**${message}**${remediation}`,
  ].join('\n');
}

// ------- inline comment cleanup --------------------------------------------

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

// ------- inline review posting ---------------------------------------------

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

  try {
    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      commit_id: commitSha,
      event: 'COMMENT',
      comments,
    });
  } catch (err) {
    core.warning(`Could not post inline review comments: ${err.message}`);
  }
}

// ------- label management --------------------------------------------------

async function ensureLabelExists(octokit, owner, repo, labelName) {
  try {
    await octokit.rest.issues.getLabel({ owner, repo, name: labelName });
  } catch (err) {
    if (err.status === 404) {
      await octokit.rest.issues.createLabel({
        owner, repo, name: labelName, color: 'e11d48',
        description: 'PR has critical issues that need to be addressed',
      });
      core.info(`Created label "${labelName}"`);
    } else {
      throw err;
    }
  }
}

async function syncCriticalLabel(octokit, owner, repo, prNumber, labelName, hasCriticals) {
  if (!labelName) return;

  const currentLabels = await octokit.paginate(octokit.rest.issues.listLabelsOnIssue, {
    owner, repo, issue_number: prNumber,
  });
  const hasLabel = currentLabels.some(l => l.name === labelName);

  if (hasCriticals && !hasLabel) {
    await ensureLabelExists(octokit, owner, repo, labelName);
    await octokit.rest.issues.addLabels({ owner, repo, issue_number: prNumber, labels: [labelName] });
    core.info(`Added label "${labelName}" to PR #${prNumber}`);
  } else if (!hasCriticals && hasLabel) {
    await octokit.rest.issues.removeLabel({ owner, repo, issue_number: prNumber, name: labelName });
    core.info(`Removed label "${labelName}" from PR #${prNumber}`);
  }
}

// ------- main action -------------------------------------------------------

async function run() {
  try {
    const token = core.getInput('github-token', { required: true });
    const failOnCritical = core.getInput('fail-on-critical') === 'true';
    const severityThreshold = core.getInput('severity-threshold') || 'info';
    const labelOnCritical = core.getInput('label-on-critical');

    const octokit = github.getOctokit(token);
    const ctx = github.context;

    if (!ctx.payload.pull_request) {
      core.info('Not a pull request — skipping analysis.');
      return;
    }

    const pr = ctx.payload.pull_request;
    const { owner, repo } = ctx.repo;
    const prNumber = pr.number;

    core.info(`Analyzing PR #${prNumber} (${owner}/${repo})…`);

    // Fetch changed files (GitHub API pages at 100 per call)
    const changedFiles = await octokit.paginate(octokit.rest.pulls.listFiles, {
      owner, repo, pull_number: prNumber, per_page: 100,
    });

    const allRules = getAllRules();
    const allFileResults = [];
    let criticalCount = 0, warningCount = 0, infoCount = 0;

    for (const file of changedFiles) {
      if (file.status === 'removed') continue;

      const language = detectLanguage(file.filename);
      if (!language) {
        core.debug(`Skipping ${file.filename} — unsupported extension`);
        continue;
      }

      core.info(`  Analyzing ${file.filename} (${language})`);

      let code;
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner, repo, path: file.filename, ref: pr.head.sha,
        });
        if (Array.isArray(data) || data.type !== 'file') continue;
        code = Buffer.from(data.content, 'base64').toString('utf-8');
      } catch (err) {
        core.warning(`Could not fetch ${file.filename}: ${err.message}`);
        continue;
      }

      const rawResults = analyzeCode(code, language, allRules, file.filename);

      // Apply severity threshold filter
      rawResults.results = rawResults.results.filter(r =>
        meetsThreshold(r.severity, severityThreshold),
      );

      if (rawResults.results.length === 0) continue;

      // Store the diff patch so postInlineReview can map issues to diff lines
      rawResults.patch = file.patch;

      allFileResults.push(rawResults);
      for (const r of rawResults.results) {
        if (r.severity === 'critical') criticalCount++;
        else if (r.severity === 'warning') warningCount++;
        else infoCount++;
      }
    }

    const summary = {
      total: criticalCount + warningCount + infoCount,
      critical: criticalCount,
      warning: warningCount,
      info: infoCount,
    };

    core.info(`Analysis complete: ${summary.total} issue(s) found (${criticalCount} critical, ${warningCount} warning, ${infoCount} info)`);

    // Post inline review comments on diff lines
    await cleanupInlineComments(octokit, owner, repo, prNumber);
    await postInlineReview(octokit, owner, repo, prNumber, pr.head.sha, allFileResults);

    // Post or update PR comment
    const commentBody = buildComment(allFileResults, summary);

    const existingComments = await octokit.paginate(octokit.rest.issues.listComments, {
      owner, repo, issue_number: prNumber,
    });

    const botComment = existingComments.find(c =>
      c.user?.type === 'Bot' && c.body?.includes(COMMENT_MARKER),
    );

    if (botComment) {
      await octokit.rest.issues.updateComment({
        owner, repo, comment_id: botComment.id, body: commentBody,
      });
      core.info('Updated existing review comment.');
    } else {
      await octokit.rest.issues.createComment({
        owner, repo, issue_number: prNumber, body: commentBody,
      });
      core.info('Posted new review comment.');
    }

    // Action outputs
    core.setOutput('total-issues', String(summary.total));
    core.setOutput('critical-issues', String(summary.critical));
    core.setOutput('warning-issues', String(summary.warning));

    // Manage PR label based on critical findings
    await syncCriticalLabel(octokit, owner, repo, prNumber, labelOnCritical, criticalCount > 0);

    if (failOnCritical && criticalCount > 0) {
      core.setFailed(`Found ${criticalCount} critical issue(s) — please review before merging.`);
    }
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
