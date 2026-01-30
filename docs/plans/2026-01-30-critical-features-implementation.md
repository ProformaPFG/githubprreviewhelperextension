# Critical Code Review Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the three Critical-priority features: Enhanced Secret Detection, Quick Comment Templates, and Keyboard Navigation.

**Architecture:** Extend existing rule system with new secret patterns, add new UI modules for templates and keyboard handling, integrate with GitHub's comment system via DOM manipulation.

**Tech Stack:** TypeScript, Chrome Extension APIs, Regex patterns, DOM manipulation

---

## Task 1: AWS Secret Detection Rules

**Files:**
- Create: `rules/secrets-aws.ts`
- Modify: `rules/index.ts` (add import and export)

**Step 1: Create the AWS secrets rule file**

Create `rules/secrets-aws.ts`:

```typescript
import { Rule, Language } from '../types.js';

export const awsSecretRules: Rule[] = [
  {
    id: 'SEC-AWS-001',
    name: 'AWS Access Key ID',
    description: 'Detects AWS Access Key IDs which should never be committed to source control',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: '(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}',
    patternFlags: 'g',
    message: 'AWS Access Key ID detected. Never commit AWS credentials to source control.',
    remediation: 'Remove the AWS Access Key ID and use environment variables or AWS IAM roles instead. Rotate this key immediately as it may be compromised.',
    enabled: true
  },
  {
    id: 'SEC-AWS-002',
    name: 'AWS Secret Access Key',
    description: 'Detects patterns that look like AWS Secret Access Keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: '["\']([A-Za-z0-9/+=]{40})["\']',
    patternFlags: 'g',
    message: 'Potential AWS Secret Access Key detected. These are 40-character base64 strings.',
    remediation: 'Remove the secret key and use environment variables or AWS Secrets Manager. Rotate this key immediately.',
    enabled: true
  },
  {
    id: 'SEC-AWS-003',
    name: 'AWS Account ID in ARN',
    description: 'Detects AWS Account IDs embedded in ARNs',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'csharp'] as Language[],
    pattern: 'arn:aws:[a-z0-9-]+:[a-z0-9-]*:(\\d{12}):',
    patternFlags: 'gi',
    message: 'AWS Account ID exposed in ARN. Consider if this should be parameterized.',
    remediation: 'Use environment variables or configuration to inject AWS Account IDs rather than hardcoding them.',
    enabled: true
  }
];
```

**Step 2: Register rules in index.ts**

Open `rules/index.ts` and add import at top:

```typescript
import { awsSecretRules } from './secrets-aws.js';
```

Add to the `allRules` array export:

```typescript
export const allRules: Rule[] = [
  ...javascriptSecurityRules,
  ...javascriptSecurityExtendedRules,
  ...javascriptDebugRules,
  ...javascriptDebugExtendedRules,
  ...htmlSecurityRules,
  ...htmlSecurityExtendedRules,
  ...cssSecurityRules,
  ...csharpSecurityRules,
  ...csharpDebugRules,
  ...awsSecretRules,  // Add this line
];
```

**Step 3: Verify extension loads without errors**

Load the extension in Chrome and check the console for any import errors.

**Step 4: Test on a sample PR with AWS-like patterns**

Create a test file locally with patterns like `AKIAIOSFODNN7EXAMPLE` and verify detection.

**Step 5: Commit**

```bash
git add rules/secrets-aws.ts rules/index.ts
git commit -m "feat: add AWS secret detection rules

Adds detection for:
- AWS Access Key IDs (AKIA prefix)
- AWS Secret Access Keys (40-char base64)
- AWS Account IDs in ARNs"
```

---

## Task 2: GitHub Token Detection Rules

**Files:**
- Create: `rules/secrets-tokens.ts`
- Modify: `rules/index.ts`

**Step 1: Create the token secrets rule file**

Create `rules/secrets-tokens.ts`:

```typescript
import { Rule, Language } from '../types.js';

export const tokenSecretRules: Rule[] = [
  {
    id: 'SEC-TOKEN-001',
    name: 'GitHub Personal Access Token',
    description: 'Detects GitHub Personal Access Tokens (classic and fine-grained)',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: 'ghp_[A-Za-z0-9]{36,}',
    patternFlags: 'g',
    message: 'GitHub Personal Access Token detected. Never commit tokens to source control.',
    remediation: 'Remove the token and use environment variables. Revoke this token immediately at github.com/settings/tokens.',
    enabled: true
  },
  {
    id: 'SEC-TOKEN-002',
    name: 'GitHub OAuth Access Token',
    description: 'Detects GitHub OAuth Access Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: 'gho_[A-Za-z0-9]{36,}',
    patternFlags: 'g',
    message: 'GitHub OAuth Access Token detected.',
    remediation: 'Remove the token and use secure token storage. Revoke this token immediately.',
    enabled: true
  },
  {
    id: 'SEC-TOKEN-003',
    name: 'GitHub App Installation Token',
    description: 'Detects GitHub App Installation Access Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: 'ghs_[A-Za-z0-9]{36,}',
    patternFlags: 'g',
    message: 'GitHub App Installation Token detected.',
    remediation: 'Remove the token. App installation tokens should only exist in memory during runtime.',
    enabled: true
  },
  {
    id: 'SEC-TOKEN-004',
    name: 'GitHub App User Access Token',
    description: 'Detects GitHub App User-to-Server Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: 'ghu_[A-Za-z0-9]{36,}',
    patternFlags: 'g',
    message: 'GitHub App User Access Token detected.',
    remediation: 'Remove the token and use secure authentication flows.',
    enabled: true
  },
  {
    id: 'SEC-TOKEN-005',
    name: 'GitHub Refresh Token',
    description: 'Detects GitHub App Refresh Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: 'ghr_[A-Za-z0-9]{36,}',
    patternFlags: 'g',
    message: 'GitHub Refresh Token detected.',
    remediation: 'Remove the token. Refresh tokens must be stored securely, never in code.',
    enabled: true
  },
  {
    id: 'SEC-TOKEN-006',
    name: 'Slack Bot Token',
    description: 'Detects Slack Bot OAuth Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: 'xoxb-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9]{24}',
    patternFlags: 'g',
    message: 'Slack Bot Token detected.',
    remediation: 'Remove the token and regenerate it in your Slack App settings.',
    enabled: true
  },
  {
    id: 'SEC-TOKEN-007',
    name: 'Slack User Token',
    description: 'Detects Slack User OAuth Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: 'xoxp-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9]{24,32}',
    patternFlags: 'g',
    message: 'Slack User Token detected.',
    remediation: 'Remove the token and regenerate it.',
    enabled: true
  },
  {
    id: 'SEC-TOKEN-008',
    name: 'Slack Webhook URL',
    description: 'Detects Slack Incoming Webhook URLs',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: 'https://hooks\\.slack\\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[A-Za-z0-9]+',
    patternFlags: 'g',
    message: 'Slack Webhook URL detected. Webhooks can be used to post to your channels.',
    remediation: 'Move webhook URLs to environment variables or secrets manager.',
    enabled: true
  },
  {
    id: 'SEC-TOKEN-009',
    name: 'Discord Webhook URL',
    description: 'Detects Discord Webhook URLs',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: 'https://discord(?:app)?\\.com/api/webhooks/[0-9]+/[A-Za-z0-9_-]+',
    patternFlags: 'g',
    message: 'Discord Webhook URL detected.',
    remediation: 'Move webhook URLs to environment variables.',
    enabled: true
  }
];
```

**Step 2: Register rules in index.ts**

Add import:

```typescript
import { tokenSecretRules } from './secrets-tokens.js';
```

Add to `allRules`:

```typescript
...awsSecretRules,
...tokenSecretRules,  // Add this line
```

**Step 3: Commit**

```bash
git add rules/secrets-tokens.ts rules/index.ts
git commit -m "feat: add GitHub and Slack/Discord token detection

Adds detection for:
- GitHub PAT, OAuth, App, and Refresh tokens
- Slack Bot/User tokens and webhooks
- Discord webhooks"
```

---

## Task 3: Database Connection String Detection

**Files:**
- Create: `rules/secrets-database.ts`
- Modify: `rules/index.ts`

**Step 1: Create the database secrets rule file**

Create `rules/secrets-database.ts`:

```typescript
import { Rule, Language } from '../types.js';

export const databaseSecretRules: Rule[] = [
  {
    id: 'SEC-DB-001',
    name: 'MongoDB Connection String with Credentials',
    description: 'Detects MongoDB connection strings containing username and password',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'csharp'] as Language[],
    pattern: 'mongodb(\\+srv)?://[^:]+:[^@]+@[^\\s"\']+',
    patternFlags: 'gi',
    message: 'MongoDB connection string with embedded credentials detected.',
    remediation: 'Use environment variables for database credentials. Consider using MongoDB Atlas connection with IAM authentication.',
    enabled: true
  },
  {
    id: 'SEC-DB-002',
    name: 'PostgreSQL Connection String with Credentials',
    description: 'Detects PostgreSQL connection strings containing password',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'csharp'] as Language[],
    pattern: 'postgres(ql)?://[^:]+:[^@]+@[^\\s"\']+',
    patternFlags: 'gi',
    message: 'PostgreSQL connection string with embedded credentials detected.',
    remediation: 'Use environment variables or secrets manager for database credentials.',
    enabled: true
  },
  {
    id: 'SEC-DB-003',
    name: 'MySQL Connection String with Credentials',
    description: 'Detects MySQL connection strings containing password',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'csharp'] as Language[],
    pattern: 'mysql://[^:]+:[^@]+@[^\\s"\']+',
    patternFlags: 'gi',
    message: 'MySQL connection string with embedded credentials detected.',
    remediation: 'Use environment variables or secrets manager for database credentials.',
    enabled: true
  },
  {
    id: 'SEC-DB-004',
    name: 'Redis Connection String with Credentials',
    description: 'Detects Redis connection strings containing password',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'csharp'] as Language[],
    pattern: 'redis://[^:]*:[^@]+@[^\\s"\']+',
    patternFlags: 'gi',
    message: 'Redis connection string with embedded password detected.',
    remediation: 'Use environment variables for Redis credentials.',
    enabled: true
  },
  {
    id: 'SEC-DB-005',
    name: 'SQL Server Connection String with Password',
    description: 'Detects SQL Server connection strings with embedded passwords',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'csharp'] as Language[],
    pattern: '(Password|Pwd)\\s*=\\s*[^;\\s]+',
    patternFlags: 'gi',
    message: 'SQL Server connection string with embedded password detected.',
    remediation: 'Use Windows Authentication or store passwords in environment variables.',
    enabled: true
  }
];
```

**Step 2: Register in index.ts**

Add import and to allRules array.

**Step 3: Commit**

```bash
git add rules/secrets-database.ts rules/index.ts
git commit -m "feat: add database connection string secret detection

Detects credentials in:
- MongoDB connection strings
- PostgreSQL connection strings
- MySQL connection strings
- Redis connection strings
- SQL Server connection strings"
```

---

## Task 4: Private Key Detection

**Files:**
- Create: `rules/secrets-keys.ts`
- Modify: `rules/index.ts`

**Step 1: Create the private key secrets rule file**

Create `rules/secrets-keys.ts`:

```typescript
import { Rule, Language } from '../types.js';

export const privateKeySecretRules: Rule[] = [
  {
    id: 'SEC-KEY-001',
    name: 'RSA Private Key',
    description: 'Detects RSA private keys in PEM format',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: '-----BEGIN RSA PRIVATE KEY-----',
    patternFlags: 'g',
    message: 'RSA Private Key detected. Private keys must never be committed to source control.',
    remediation: 'Remove the private key immediately. Store keys in a secrets manager or use key management services.',
    enabled: true
  },
  {
    id: 'SEC-KEY-002',
    name: 'OpenSSH Private Key',
    description: 'Detects OpenSSH private keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: '-----BEGIN OPENSSH PRIVATE KEY-----',
    patternFlags: 'g',
    message: 'OpenSSH Private Key detected.',
    remediation: 'Remove the private key. Use SSH agent or secrets manager for key storage.',
    enabled: true
  },
  {
    id: 'SEC-KEY-003',
    name: 'EC Private Key',
    description: 'Detects EC (Elliptic Curve) private keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: '-----BEGIN EC PRIVATE KEY-----',
    patternFlags: 'g',
    message: 'EC Private Key detected.',
    remediation: 'Remove the private key and use a secrets manager.',
    enabled: true
  },
  {
    id: 'SEC-KEY-004',
    name: 'PGP Private Key',
    description: 'Detects PGP private key blocks',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: '-----BEGIN PGP PRIVATE KEY BLOCK-----',
    patternFlags: 'g',
    message: 'PGP Private Key detected.',
    remediation: 'Remove the private key. PGP keys should be stored in a keyring, not in code.',
    enabled: true
  },
  {
    id: 'SEC-KEY-005',
    name: 'Generic Private Key',
    description: 'Detects generic PKCS#8 private keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: '-----BEGIN PRIVATE KEY-----',
    patternFlags: 'g',
    message: 'Private Key (PKCS#8 format) detected.',
    remediation: 'Remove the private key and use proper key management.',
    enabled: true
  },
  {
    id: 'SEC-KEY-006',
    name: 'Encrypted Private Key',
    description: 'Detects encrypted private keys (still should not be in code)',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'] as Language[],
    pattern: '-----BEGIN ENCRYPTED PRIVATE KEY-----',
    patternFlags: 'g',
    message: 'Encrypted Private Key detected. Even encrypted keys should not be in source control.',
    remediation: 'Remove the key and use a secrets manager or key vault.',
    enabled: true
  }
];
```

**Step 2: Register in index.ts**

Add import and to allRules array.

**Step 3: Commit**

```bash
git add rules/secrets-keys.ts rules/index.ts
git commit -m "feat: add private key detection rules

Detects:
- RSA, OpenSSH, EC, PGP private keys
- PKCS#8 format private keys
- Encrypted private keys"
```

---

## Task 5: Generic Secret Pattern Detection

**Files:**
- Create: `rules/secrets-generic.ts`
- Modify: `rules/index.ts`

**Step 1: Create generic secrets rule file**

Create `rules/secrets-generic.ts`:

```typescript
import { Rule, Language } from '../types.js';

export const genericSecretRules: Rule[] = [
  {
    id: 'SEC-GEN-001',
    name: 'Generic API Key Assignment',
    description: 'Detects hardcoded values assigned to API key variables',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'] as Language[],
    pattern: '(api[_-]?key|apikey)\\s*[=:]\\s*["\'][A-Za-z0-9_\\-]{16,}["\']',
    patternFlags: 'gi',
    message: 'Hardcoded API key detected.',
    remediation: 'Use environment variables: process.env.API_KEY',
    enabled: true
  },
  {
    id: 'SEC-GEN-002',
    name: 'Generic Secret Assignment',
    description: 'Detects hardcoded values assigned to secret variables',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'] as Language[],
    pattern: '(secret|secret[_-]?key)\\s*[=:]\\s*["\'][A-Za-z0-9_\\-]{8,}["\']',
    patternFlags: 'gi',
    message: 'Hardcoded secret detected.',
    remediation: 'Use environment variables or a secrets manager.',
    enabled: true
  },
  {
    id: 'SEC-GEN-003',
    name: 'Generic Token Assignment',
    description: 'Detects hardcoded values assigned to token variables',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'] as Language[],
    pattern: '(access[_-]?token|auth[_-]?token|bearer[_-]?token)\\s*[=:]\\s*["\'][A-Za-z0-9_\\-.]{20,}["\']',
    patternFlags: 'gi',
    message: 'Hardcoded access token detected.',
    remediation: 'Tokens should be obtained at runtime, not hardcoded.',
    enabled: true
  },
  {
    id: 'SEC-GEN-004',
    name: 'JWT Token',
    description: 'Detects hardcoded JWT tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html'] as Language[],
    pattern: 'eyJ[A-Za-z0-9_-]{10,}\\.eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}',
    patternFlags: 'g',
    message: 'JWT token detected. JWTs contain encoded data and should not be hardcoded.',
    remediation: 'JWTs should be obtained at runtime through authentication flows.',
    enabled: true
  },
  {
    id: 'SEC-GEN-005',
    name: 'Bearer Token in Header',
    description: 'Detects hardcoded Bearer tokens in HTTP headers',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'] as Language[],
    pattern: '["\']Authorization["\']\\s*:\\s*["\']Bearer\\s+[A-Za-z0-9_\\-.]+["\']',
    patternFlags: 'gi',
    message: 'Hardcoded Bearer token in Authorization header.',
    remediation: 'Get the token from secure storage at runtime.',
    enabled: true
  },
  {
    id: 'SEC-GEN-006',
    name: 'Stripe API Key',
    description: 'Detects Stripe API keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'csharp'] as Language[],
    pattern: 'sk_(live|test)_[A-Za-z0-9]{24,}',
    patternFlags: 'g',
    message: 'Stripe Secret Key detected.',
    remediation: 'Use environment variables for Stripe keys.',
    enabled: true
  },
  {
    id: 'SEC-GEN-007',
    name: 'Stripe Publishable Key (Live)',
    description: 'Detects Stripe live publishable keys that may indicate production exposure',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html'] as Language[],
    pattern: 'pk_live_[A-Za-z0-9]{24,}',
    patternFlags: 'g',
    message: 'Stripe Live Publishable Key detected. Ensure this is intentional.',
    remediation: 'Consider using environment variables even for publishable keys.',
    enabled: true
  },
  {
    id: 'SEC-GEN-008',
    name: 'SendGrid API Key',
    description: 'Detects SendGrid API keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'csharp'] as Language[],
    pattern: 'SG\\.[A-Za-z0-9_-]{22}\\.[A-Za-z0-9_-]{43}',
    patternFlags: 'g',
    message: 'SendGrid API Key detected.',
    remediation: 'Use environment variables for SendGrid keys.',
    enabled: true
  },
  {
    id: 'SEC-GEN-009',
    name: 'Twilio API Key',
    description: 'Detects Twilio Account SID and Auth Token patterns',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'csharp'] as Language[],
    pattern: 'AC[a-f0-9]{32}',
    patternFlags: 'g',
    message: 'Twilio Account SID detected.',
    remediation: 'Use environment variables for Twilio credentials.',
    enabled: true
  },
  {
    id: 'SEC-GEN-010',
    name: 'Google API Key',
    description: 'Detects Google API keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html'] as Language[],
    pattern: 'AIza[A-Za-z0-9_-]{35}',
    patternFlags: 'g',
    message: 'Google API Key detected.',
    remediation: 'Restrict the API key in Google Cloud Console and use environment variables.',
    enabled: true
  }
];
```

**Step 2: Register in index.ts**

Add import and to allRules array.

**Step 3: Commit**

```bash
git add rules/secrets-generic.ts rules/index.ts
git commit -m "feat: add generic secret pattern detection

Detects:
- Generic API key/secret/token assignments
- JWT tokens
- Bearer tokens in headers
- Stripe, SendGrid, Twilio, Google API keys"
```

---

## Task 6: Keyboard Handler Module

**Files:**
- Create: `ui/keyboard-handler.ts`
- Modify: `ui/ui-utils.ts` (integrate keyboard handler)

**Step 1: Create keyboard handler module**

Create `ui/keyboard-handler.ts`:

```typescript
/**
 * Keyboard navigation handler for GitHub Code Review Assistant
 */

interface KeyboardConfig {
  enabled: boolean;
  shortcuts: {
    nextFile: string;
    prevFile: string;
    nextIssue: string;
    prevIssue: string;
    goToFile: string;
    closePanel: string;
    showHelp: string;
  };
}

const DEFAULT_CONFIG: KeyboardConfig = {
  enabled: true,
  shortcuts: {
    nextFile: 'j',
    prevFile: 'k',
    nextIssue: 'n',
    prevIssue: 'p',
    goToFile: 'ctrl+g',
    closePanel: 'Escape',
    showHelp: '?'
  }
};

let config: KeyboardConfig = { ...DEFAULT_CONFIG };
let currentFileIndex = 0;
let currentIssueIndex = 0;
let helpOverlayVisible = false;
let goToFileVisible = false;

/**
 * Get all file headers in the PR diff view
 */
function getFileHeaders(): HTMLElement[] {
  return Array.from(document.querySelectorAll('.file-header, [data-path]')) as HTMLElement[];
}

/**
 * Get all issue badges created by the extension
 */
function getIssueBadges(): HTMLElement[] {
  return Array.from(document.querySelectorAll('.cra-severity-badge')) as HTMLElement[];
}

/**
 * Scroll to and highlight a file
 */
function scrollToFile(index: number): void {
  const files = getFileHeaders();
  if (files.length === 0) return;

  currentFileIndex = Math.max(0, Math.min(index, files.length - 1));
  const file = files[currentFileIndex];

  file.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Brief highlight effect
  file.style.transition = 'background-color 0.3s';
  file.style.backgroundColor = 'rgba(255, 220, 0, 0.2)';
  setTimeout(() => {
    file.style.backgroundColor = '';
  }, 1000);
}

/**
 * Scroll to and highlight an issue
 */
function scrollToIssue(index: number): void {
  const badges = getIssueBadges();
  if (badges.length === 0) return;

  currentIssueIndex = Math.max(0, Math.min(index, badges.length - 1));
  const badge = badges[currentIssueIndex];

  badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
  badge.click(); // Trigger tooltip
}

/**
 * Show keyboard shortcuts help overlay
 */
function showHelpOverlay(): void {
  if (helpOverlayVisible) {
    hideHelpOverlay();
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'cra-keyboard-help';
  overlay.innerHTML = `
    <div class="cra-help-content">
      <h3>Keyboard Shortcuts</h3>
      <table>
        <tr><td><kbd>J</kbd></td><td>Next file</td></tr>
        <tr><td><kbd>K</kbd></td><td>Previous file</td></tr>
        <tr><td><kbd>N</kbd></td><td>Next issue</td></tr>
        <tr><td><kbd>P</kbd></td><td>Previous issue</td></tr>
        <tr><td><kbd>Ctrl+G</kbd></td><td>Go to file</td></tr>
        <tr><td><kbd>Esc</kbd></td><td>Close panels</td></tr>
        <tr><td><kbd>?</kbd></td><td>Toggle this help</td></tr>
      </table>
      <p class="cra-help-hint">Press any key to close</p>
    </div>
  `;

  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10003;
  `;

  const content = overlay.querySelector('.cra-help-content') as HTMLElement;
  content.style.cssText = `
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    max-width: 400px;
  `;

  const table = overlay.querySelector('table') as HTMLElement;
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  `;

  overlay.querySelectorAll('td').forEach(td => {
    (td as HTMLElement).style.cssText = 'padding: 8px; border-bottom: 1px solid #eee;';
  });

  overlay.querySelectorAll('kbd').forEach(kbd => {
    (kbd as HTMLElement).style.cssText = `
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 2px 8px;
      font-family: monospace;
    `;
  });

  document.body.appendChild(overlay);
  helpOverlayVisible = true;
}

/**
 * Hide help overlay
 */
function hideHelpOverlay(): void {
  const overlay = document.getElementById('cra-keyboard-help');
  if (overlay) {
    overlay.remove();
    helpOverlayVisible = false;
  }
}

/**
 * Show go-to-file dialog
 */
function showGoToFileDialog(): void {
  if (goToFileVisible) return;

  const files = getFileHeaders();
  const fileNames = files.map(f => f.getAttribute('data-path') || f.textContent?.trim() || 'Unknown');

  const dialog = document.createElement('div');
  dialog.id = 'cra-goto-file';
  dialog.innerHTML = `
    <div class="cra-goto-content">
      <input type="text" id="cra-goto-input" placeholder="Type to filter files..." autocomplete="off">
      <ul id="cra-goto-list"></ul>
    </div>
  `;

  dialog.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10003;
    width: 500px;
    max-width: 90vw;
  `;

  const content = dialog.querySelector('.cra-goto-content') as HTMLElement;
  content.style.cssText = `
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    overflow: hidden;
  `;

  document.body.appendChild(dialog);
  goToFileVisible = true;

  const input = document.getElementById('cra-goto-input') as HTMLInputElement;
  const list = document.getElementById('cra-goto-list') as HTMLUListElement;

  input.style.cssText = `
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    outline: none;
  `;

  list.style.cssText = `
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 300px;
    overflow-y: auto;
  `;

  function renderList(filter: string = ''): void {
    list.innerHTML = '';
    const filtered = fileNames
      .map((name, idx) => ({ name, idx }))
      .filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));

    filtered.slice(0, 20).forEach((file, i) => {
      const li = document.createElement('li');
      li.textContent = file.name;
      li.style.cssText = `
        padding: 10px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        ${i === 0 ? 'background: #f6f8fa;' : ''}
      `;
      li.addEventListener('click', () => {
        scrollToFile(file.idx);
        closeGoToFileDialog();
      });
      li.addEventListener('mouseenter', () => {
        li.style.background = '#f6f8fa';
      });
      li.addEventListener('mouseleave', () => {
        li.style.background = '';
      });
      list.appendChild(li);
    });
  }

  renderList();
  input.focus();

  input.addEventListener('input', () => renderList(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeGoToFileDialog();
    } else if (e.key === 'Enter') {
      const firstItem = list.querySelector('li');
      if (firstItem) {
        (firstItem as HTMLElement).click();
      }
    }
  });
}

/**
 * Close go-to-file dialog
 */
function closeGoToFileDialog(): void {
  const dialog = document.getElementById('cra-goto-file');
  if (dialog) {
    dialog.remove();
    goToFileVisible = false;
  }
}

/**
 * Close all extension panels
 */
function closeAllPanels(): void {
  hideHelpOverlay();
  closeGoToFileDialog();

  // Close summary panel if open
  const summaryPanel = document.getElementById('cra-summary-panel');
  if (summaryPanel) {
    summaryPanel.style.display = 'none';
  }

  // Close any open tooltips
  document.querySelectorAll('.cra-tooltip').forEach(t => t.remove());
}

/**
 * Check if user is typing in an input field
 */
function isTypingInInput(): boolean {
  const active = document.activeElement;
  if (!active) return false;

  const tagName = active.tagName.toLowerCase();
  return tagName === 'input' ||
         tagName === 'textarea' ||
         (active as HTMLElement).isContentEditable;
}

/**
 * Parse key combination from event
 */
function getKeyCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');
  parts.push(e.key.toLowerCase());
  return parts.join('+');
}

/**
 * Main keyboard event handler
 */
function handleKeyDown(e: KeyboardEvent): void {
  // Don't intercept if typing in an input
  if (isTypingInInput() && e.key !== 'Escape') return;

  // If help overlay is visible, close it on any key
  if (helpOverlayVisible && e.key !== '?') {
    hideHelpOverlay();
    return;
  }

  const keyCombo = getKeyCombo(e);
  const key = e.key.toLowerCase();

  switch (keyCombo) {
    case 'j':
      e.preventDefault();
      scrollToFile(currentFileIndex + 1);
      break;
    case 'k':
      e.preventDefault();
      scrollToFile(currentFileIndex - 1);
      break;
    case 'n':
      e.preventDefault();
      scrollToIssue(currentIssueIndex + 1);
      break;
    case 'p':
      e.preventDefault();
      scrollToIssue(currentIssueIndex - 1);
      break;
    case 'ctrl+g':
      e.preventDefault();
      showGoToFileDialog();
      break;
    case 'escape':
      closeAllPanels();
      break;
    case 'shift+?':
    case '?':
      e.preventDefault();
      showHelpOverlay();
      break;
  }
}

/**
 * Initialize keyboard navigation
 */
export function initKeyboardNavigation(): void {
  document.addEventListener('keydown', handleKeyDown);
  console.log('[CRA] Keyboard navigation initialized. Press ? for help.');
}

/**
 * Cleanup keyboard navigation
 */
export function destroyKeyboardNavigation(): void {
  document.removeEventListener('keydown', handleKeyDown);
  closeAllPanels();
}
```

**Step 2: Commit**

```bash
git add ui/keyboard-handler.ts
git commit -m "feat: add keyboard navigation module

Keyboard shortcuts:
- J/K: Navigate between files
- N/P: Navigate between issues
- Ctrl+G: Go to file (fuzzy search)
- Esc: Close all panels
- ?: Show keyboard help overlay"
```

---

## Task 7: Quick Comment Templates Module

**Files:**
- Create: `ui/quick-comments.ts`
- Modify: `settings-manager.js` (add template storage)

**Step 1: Create quick comments module**

Create `ui/quick-comments.ts`:

```typescript
/**
 * Quick comment templates for GitHub Code Review Assistant
 */

interface CommentTemplate {
  id: string;
  shortcut: string;
  label: string;
  text: string;
}

const DEFAULT_TEMPLATES: CommentTemplate[] = [
  {
    id: 'tests',
    shortcut: '1',
    label: '🧪 Add tests',
    text: 'Please add unit tests for this change to ensure it works as expected and prevent regressions.'
  },
  {
    id: 'error-handling',
    shortcut: '2',
    label: '⚠️ Error handling',
    text: 'Could you add error handling here? What happens if this operation fails?'
  },
  {
    id: 'explain',
    shortcut: '3',
    label: '📝 Add comment',
    text: 'Could you add a comment explaining why this approach was chosen? It will help future maintainers.'
  },
  {
    id: 'duplicate',
    shortcut: '4',
    label: '🔄 Duplication',
    text: 'This logic appears to duplicate existing code. Consider extracting to a shared utility.'
  },
  {
    id: 'lgtm',
    shortcut: '5',
    label: '✅ LGTM',
    text: 'LGTM! Nice clean implementation. 👍'
  },
  {
    id: 'naming',
    shortcut: '6',
    label: '📛 Naming',
    text: 'Consider a more descriptive name here that better conveys the intent.'
  },
  {
    id: 'simplify',
    shortcut: '7',
    label: '🎯 Simplify',
    text: 'This could be simplified. Would you consider a more straightforward approach?'
  },
  {
    id: 'security',
    shortcut: '8',
    label: '🔒 Security',
    text: 'Please review this from a security perspective. Consider input validation and sanitization.'
  }
];

let templates: CommentTemplate[] = [...DEFAULT_TEMPLATES];
let paletteVisible = false;
let paletteElement: HTMLElement | null = null;

/**
 * Load custom templates from storage
 */
export async function loadTemplates(): Promise<void> {
  try {
    const result = await chrome.storage.local.get('cra-comment-templates');
    if (result['cra-comment-templates']) {
      templates = result['cra-comment-templates'];
    }
  } catch (e) {
    console.log('[CRA] Using default comment templates');
  }
}

/**
 * Save templates to storage
 */
export async function saveTemplates(newTemplates: CommentTemplate[]): Promise<void> {
  templates = newTemplates;
  await chrome.storage.local.set({ 'cra-comment-templates': templates });
}

/**
 * Get the currently focused comment textarea on GitHub
 */
function getActiveCommentBox(): HTMLTextAreaElement | null {
  // GitHub's comment textareas
  const selectors = [
    'textarea[name="comment[body]"]',
    'textarea.comment-form-textarea',
    'textarea[id^="new_comment_field"]',
    'textarea[placeholder*="comment"]',
    'textarea[aria-label*="comment"]'
  ];

  for (const selector of selectors) {
    const textarea = document.querySelector(selector) as HTMLTextAreaElement;
    if (textarea) return textarea;
  }

  return null;
}

/**
 * Insert text into a textarea
 */
function insertText(textarea: HTMLTextAreaElement, text: string): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);

  textarea.value = before + text + after;
  textarea.selectionStart = textarea.selectionEnd = start + text.length;

  // Trigger input event for GitHub's handlers
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
}

/**
 * Create and show the command palette
 */
function showPalette(): void {
  if (paletteVisible) {
    hidePalette();
    return;
  }

  paletteElement = document.createElement('div');
  paletteElement.id = 'cra-comment-palette';
  paletteElement.innerHTML = `
    <div class="cra-palette-content">
      <div class="cra-palette-header">
        <span>Quick Comment Templates</span>
        <span class="cra-palette-hint">Press number or click to insert</span>
      </div>
      <ul class="cra-palette-list">
        ${templates.map(t => `
          <li data-id="${t.id}" data-shortcut="${t.shortcut}">
            <kbd>${t.shortcut}</kbd>
            <span class="cra-palette-label">${t.label}</span>
            <span class="cra-palette-preview">${t.text.substring(0, 50)}${t.text.length > 50 ? '...' : ''}</span>
          </li>
        `).join('')}
      </ul>
      <div class="cra-palette-footer">
        <kbd>Esc</kbd> to close · <kbd>Ctrl+Shift+T</kbd> to toggle
      </div>
    </div>
  `;

  // Styles
  paletteElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10004;
    width: 500px;
    max-width: 90vw;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  `;

  const content = paletteElement.querySelector('.cra-palette-content') as HTMLElement;
  content.style.cssText = `
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    overflow: hidden;
  `;

  const header = paletteElement.querySelector('.cra-palette-header') as HTMLElement;
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f6f8fa;
    border-bottom: 1px solid #d0d7de;
    font-weight: 600;
    font-size: 14px;
  `;

  const hint = paletteElement.querySelector('.cra-palette-hint') as HTMLElement;
  hint.style.cssText = `
    font-weight: normal;
    font-size: 12px;
    color: #656d76;
  `;

  const list = paletteElement.querySelector('.cra-palette-list') as HTMLElement;
  list.style.cssText = `
    list-style: none;
    margin: 0;
    padding: 8px 0;
    max-height: 400px;
    overflow-y: auto;
  `;

  paletteElement.querySelectorAll('li').forEach(li => {
    (li as HTMLElement).style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      cursor: pointer;
      transition: background 0.1s;
    `;

    li.addEventListener('mouseenter', () => {
      (li as HTMLElement).style.background = '#f6f8fa';
    });
    li.addEventListener('mouseleave', () => {
      (li as HTMLElement).style.background = '';
    });
    li.addEventListener('click', () => {
      const id = li.getAttribute('data-id');
      const template = templates.find(t => t.id === id);
      if (template) {
        insertTemplate(template);
      }
    });
  });

  paletteElement.querySelectorAll('kbd').forEach(kbd => {
    (kbd as HTMLElement).style.cssText = `
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 2px 8px;
      font-family: monospace;
      font-size: 12px;
      min-width: 24px;
      text-align: center;
    `;
  });

  paletteElement.querySelectorAll('.cra-palette-label').forEach(label => {
    (label as HTMLElement).style.cssText = `
      font-weight: 500;
      min-width: 120px;
    `;
  });

  paletteElement.querySelectorAll('.cra-palette-preview').forEach(preview => {
    (preview as HTMLElement).style.cssText = `
      color: #656d76;
      font-size: 12px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
  });

  const footer = paletteElement.querySelector('.cra-palette-footer') as HTMLElement;
  footer.style.cssText = `
    padding: 8px 16px;
    background: #f6f8fa;
    border-top: 1px solid #d0d7de;
    font-size: 12px;
    color: #656d76;
    text-align: center;
  `;

  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'cra-palette-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    z-index: 10003;
  `;
  backdrop.addEventListener('click', hidePalette);

  document.body.appendChild(backdrop);
  document.body.appendChild(paletteElement);
  paletteVisible = true;

  // Focus for keyboard handling
  paletteElement.setAttribute('tabindex', '-1');
  paletteElement.focus();
}

/**
 * Hide the command palette
 */
function hidePalette(): void {
  if (paletteElement) {
    paletteElement.remove();
    paletteElement = null;
  }
  const backdrop = document.getElementById('cra-palette-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
  paletteVisible = false;
}

/**
 * Insert a template into the active comment box
 */
function insertTemplate(template: CommentTemplate): void {
  hidePalette();

  const textarea = getActiveCommentBox();
  if (textarea) {
    insertText(textarea, template.text);
  } else {
    // Find the nearest "Add a comment" button and click it
    const addCommentBtn = document.querySelector('button[data-hotkey="c"]') as HTMLButtonElement;
    if (addCommentBtn) {
      addCommentBtn.click();
      // Wait for textarea to appear
      setTimeout(() => {
        const newTextarea = getActiveCommentBox();
        if (newTextarea) {
          insertText(newTextarea, template.text);
        }
      }, 100);
    } else {
      console.log('[CRA] No comment box found. Click on a line to add a comment first.');
    }
  }
}

/**
 * Handle keyboard events for the palette
 */
function handlePaletteKeydown(e: KeyboardEvent): void {
  if (!paletteVisible) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    hidePalette();
    return;
  }

  // Number keys 1-9
  if (/^[1-9]$/.test(e.key)) {
    const template = templates.find(t => t.shortcut === e.key);
    if (template) {
      e.preventDefault();
      insertTemplate(template);
    }
  }
}

/**
 * Handle global keyboard shortcut
 */
function handleGlobalKeydown(e: KeyboardEvent): void {
  // Ctrl+Shift+T or Cmd+Shift+T
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
    e.preventDefault();
    showPalette();
  }

  if (paletteVisible) {
    handlePaletteKeydown(e);
  }
}

/**
 * Initialize quick comments
 */
export function initQuickComments(): void {
  loadTemplates();
  document.addEventListener('keydown', handleGlobalKeydown);
  console.log('[CRA] Quick comments initialized. Press Ctrl+Shift+T to open.');
}

/**
 * Cleanup
 */
export function destroyQuickComments(): void {
  document.removeEventListener('keydown', handleGlobalKeydown);
  hidePalette();
}
```

**Step 2: Commit**

```bash
git add ui/quick-comments.ts
git commit -m "feat: add quick comment templates module

Features:
- Ctrl+Shift+T opens command palette
- 8 default templates for common review feedback
- Number keys (1-8) for quick insertion
- Integrates with GitHub's comment textareas
- Templates stored in chrome.storage for customization"
```

---

## Task 8: Integrate New Modules into UI System

**Files:**
- Modify: `ui/ui-utils.ts`
- Modify: `content.js`

**Step 1: Update ui-utils.ts to import and initialize new modules**

Add imports at top of `ui/ui-utils.ts`:

```typescript
import { initKeyboardNavigation, destroyKeyboardNavigation } from './keyboard-handler.js';
import { initQuickComments, destroyQuickComments } from './quick-comments.js';
```

In the initialization function, add:

```typescript
// Initialize keyboard navigation
initKeyboardNavigation();

// Initialize quick comments
initQuickComments();
```

In any cleanup/destroy function, add:

```typescript
destroyKeyboardNavigation();
destroyQuickComments();
```

**Step 2: Ensure content.js loads the modules**

Verify content.js imports and calls the UI initialization that now includes the new modules.

**Step 3: Test the full integration**

1. Load extension in Chrome
2. Navigate to a GitHub PR
3. Press `?` - should show keyboard help
4. Press `J`/`K` - should navigate files
5. Press `Ctrl+Shift+T` - should show comment palette

**Step 4: Commit**

```bash
git add ui/ui-utils.ts content.js
git commit -m "feat: integrate keyboard and comment modules into main UI

Enables:
- Keyboard navigation on all PR pages
- Quick comment palette on all PR pages
- Proper cleanup on page unload"
```

---

## Task 9: Update Manifest and Final Testing

**Files:**
- Review: `manifest.json` (ensure no changes needed)
- Test all features

**Step 1: Verify manifest permissions**

The existing permissions (`activeTab`, `storage`) should be sufficient. No changes needed.

**Step 2: Full integration test**

Test checklist:
- [ ] Load extension in Chrome (chrome://extensions, Developer mode, Load unpacked)
- [ ] Navigate to any GitHub PR files view
- [ ] Verify console shows initialization messages
- [ ] Test AWS key detection (add `AKIAIOSFODNN7EXAMPLE` to a test PR)
- [ ] Test GitHub token detection (add `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- [ ] Test keyboard shortcuts (J, K, N, P, ?, Ctrl+G)
- [ ] Test quick comments (Ctrl+Shift+T, number keys)
- [ ] Verify no console errors

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Critical tier features implementation

Implements:
1. Enhanced Secret Detection
   - AWS keys (Access Key ID, Secret Key, Account IDs)
   - GitHub tokens (PAT, OAuth, App, Refresh)
   - Slack/Discord tokens and webhooks
   - Database connection strings (MongoDB, PostgreSQL, MySQL, Redis, SQL Server)
   - Private keys (RSA, OpenSSH, EC, PGP, PKCS#8)
   - Generic secrets (API keys, JWTs, Bearer tokens, Stripe, SendGrid, Twilio, Google)

2. Keyboard Navigation
   - J/K: Next/previous file
   - N/P: Next/previous issue
   - Ctrl+G: Go to file (fuzzy search)
   - Esc: Close panels
   - ?: Help overlay

3. Quick Comment Templates
   - Ctrl+Shift+T: Open palette
   - 8 default templates
   - Customizable via storage
   - Number key shortcuts"
```

---

## Summary

**Total new rules added:** ~35 secret detection rules across 5 new rule files
**Total new UI modules:** 2 (keyboard-handler.ts, quick-comments.ts)
**Total commits:** 9

After completing this plan, the extension will have:
- Comprehensive secret detection covering major cloud providers, tokens, and credentials
- Full keyboard navigation for efficient PR review
- Quick comment templates for common feedback
