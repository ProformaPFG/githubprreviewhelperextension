# GitHub Code Review Assistant - Feature Enhancement Design

**Date:** 2026-01-30
**Status:** Approved
**Constraint:** Fully offline (no external API calls)

## Overview

Enhancement of the GitHub Code Review Assistant Chrome extension to address critical daily code review pain points: missing context, security blind spots, consistency enforcement, and time efficiency.

## Target User Profile

- Full-stack developer reviewing PRs daily
- Occasional infrastructure/DevOps reviews
- Needs offline-first functionality
- Pain points: context switching, repetitive feedback, large PRs, security blind spots

---

## Feature 1: Dependency Awareness

### Problem
Changing a file without considering files that depend on it leads to missed bugs.

### Solution
Parse imports/exports from changed files and cross-reference to surface:
- Files that import changed code but aren't in the PR
- Missing export alerts
- Broken import detection

### Implementation
- **File:** `utils/dependency-graph.ts`
- Parse `import`/`require`/`using` statements via regex
- Build mini dependency graph from PR files
- Show alerts as new badge type (link icon)

### UI
New "Dependencies" section in summary panel:
```
Files that import changed code (not in PR):
   src/components/UserProfile.tsx imports UserService
   src/pages/Settings.tsx imports UserService
```

---

## Feature 2: Historical Context & File Risk Signals

### Problem
No visibility into whether a file is stable core code vs. high-churn hotspot.

### Solution
Surface git metadata from GitHub's DOM:
- File age badge (last modified date)
- Churn indicator (modification frequency)
- Stale file warning (6+ months untouched)
- Primary author context

### Implementation
- **File:** `utils/git-metadata.ts`
- Parse GitHub's embedded commit metadata
- Scrape blame data from DOM
- Cache per PR session

### UI
File health indicator next to each file header:
```
src/services/AuthService.ts
   Dormant (last change: 8 months ago)
   Primary author: @alice
```

Risk assessment section in summary panel for high-risk files.

---

## Feature 3: Enhanced Secret Detection

### Problem
Current secret detection is basic; secrets come in many forms.

### Solution
Comprehensive secret patterns with smart context awareness:

**New Patterns:**
- AWS Keys: `AKIA[0-9A-Z]{16}`
- GitHub Tokens: `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_` prefixes
- Database Connection Strings: `mongodb://`, `postgres://`, `mysql://` with credentials
- Private Keys: PEM format headers
- Slack/Discord Webhooks
- Generic high-entropy strings in suspicious contexts

**Smart Filtering:**
- Ignore patterns in test files, mocks, example configs
- Ignore environment variable references
- Path-based severity adjustment

### Implementation
- **Files:** `rules/secrets-aws.ts`, `rules/secrets-cloud.ts`, `rules/secrets-generic.ts`
- **File:** `utils/entropy.ts` for generic detection

### UI
Secrets always shown first with distinct styling:
```
POTENTIAL SECRETS DETECTED (review immediately)
   Line 42: AWS Access Key pattern detected
   Line 87: Database connection string with embedded password
```

---

## Feature 4: Configurable Consistency Rules

### Problem
Team conventions for naming and architecture are tedious to enforce manually.

### Solution
User-configurable pattern rules:

**Naming Conventions:**
```javascript
{
  "naming": {
    "react-components": {
      "pattern": "^[A-Z][a-zA-Z]+\\.tsx$",
      "message": "React components should be PascalCase"
    },
    "hooks": {
      "pattern": "^use[A-Z][a-zA-Z]+\\.ts$",
      "message": "Hooks should start with 'use'"
    }
  }
}
```

**Architecture Boundaries:**
```javascript
{
  "boundaries": {
    "no-direct-db-from-components": {
      "from": "src/components/**",
      "cannotImport": ["src/database/**"],
      "message": "Components must not import database layer directly"
    }
  }
}
```

### Implementation
- **Files:** `rules/conventions/naming-rules.ts`, `rules/conventions/boundaries.ts`
- New settings section for custom rules
- Import path resolver for boundary checking

### UI
Violations in "Conventions" category with clear messages.

---

## Feature 5: Review Efficiency Tools

### Problem
Time wasted on repetitive comments, navigating large PRs, context switching.

### A. Quick Comment Templates

Keyboard shortcut (`Ctrl+Shift+T`) opens command palette:
```
[1] Please add unit tests for this change
[2] Missing error handling - what happens if this fails?
[3] Could you add a comment explaining why this approach?
[4] This duplicates logic in [file] - consider extracting
[5] LGTM - nice clean implementation
```

- User-configurable templates
- Variable support: `{filename}`, `{line}`, `{author}`

**File:** `ui/quick-comments.ts`

### B. Large PR Navigator

For PRs with 10+ files or 300+ lines:
```
PR Overview (47 files, 1,247 lines)

By Risk:
  High (3)    AuthService.ts, migrations/, .env.example
  Medium (12) API routes, components
  Low (32)    Tests, types, configs

By Type:
  [Backend]  14 files
  [Frontend] 23 files
  [Tests]    10 files
```

**File:** `ui/pr-navigator.ts`

### C. Keyboard Navigation

- `J` / `K` - Jump to next/previous file
- `N` / `P` - Jump to next/previous flagged issue
- `Ctrl+G` - Go to file by name (fuzzy search)
- `Esc` - Close any extension panel
- `?` - Show keyboard shortcuts overlay

**File:** `ui/keyboard-handler.ts`

---

## Implementation Priority

### Critical (Implement First)
| Feature | Effort |
|---------|--------|
| Enhanced Secret Detection | Medium |
| Quick Comment Templates | Low |
| Keyboard Navigation | Low |

### High Value (Implement Second)
| Feature | Effort |
|---------|--------|
| Dependency Awareness | High |
| Large PR Navigator | Medium |
| Architecture Boundary Rules | Medium |

### Important (Implement Third)
| Feature | Effort |
|---------|--------|
| Historical Context Signals | Medium |
| Naming Convention Rules | Low |

---

## New File Structure

```
rules/
  secrets-aws.ts          (new)
  secrets-cloud.ts        (new)
  secrets-generic.ts      (new)
  conventions/
    naming-rules.ts       (new)
    boundaries.ts         (new)
utils/
  dependency-graph.ts     (new)
  entropy.ts              (new)
  git-metadata.ts         (new)
ui/
  pr-navigator.ts         (new)
  quick-comments.ts       (new)
  keyboard-handler.ts     (new)
```

---

## Success Criteria

1. **Secret Detection:** Catches AWS keys, GitHub tokens, connection strings with <5% false positive rate
2. **Dependency Awareness:** Surfaces missed files in 80%+ of cases where imports exist
3. **Templates:** Reduces time on common feedback by 50%+
4. **Navigation:** Large PRs (300+ lines) can be triaged in under 2 minutes
5. **Conventions:** Zero manual enforcement needed for configured rules
