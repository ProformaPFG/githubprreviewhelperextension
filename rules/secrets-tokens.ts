/**
 * Token Secret Detection Rules
 *
 * Rules for detecting GitHub, Slack, and Discord tokens
 */

import type { Rule } from '../types';

export const tokenSecretRules: Rule[] = [
  {
    id: 'SEC-TOKEN-001',
    name: 'GitHub Personal Access Token',
    description: 'Detects GitHub Personal Access Tokens (classic and fine-grained)',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: 'ghp_[A-Za-z0-9]{36,}',
    patternFlags: 'g',
    message: 'GitHub Personal Access Token detected. Never commit tokens to source control.',
    remediation: 'Remove the token and use environment variables. Revoke this token immediately at github.com/settings/tokens.',
    enabled: true,
  },
  {
    id: 'SEC-TOKEN-002',
    name: 'GitHub OAuth Access Token',
    description: 'Detects GitHub OAuth Access Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: 'gho_[A-Za-z0-9]{36,}',
    patternFlags: 'g',
    message: 'GitHub OAuth Access Token detected.',
    remediation: 'Remove the token and use secure token storage. Revoke this token immediately.',
    enabled: true,
  },
  {
    id: 'SEC-TOKEN-003',
    name: 'GitHub App Installation Token',
    description: 'Detects GitHub App Installation Access Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: 'ghs_[A-Za-z0-9]{36,}',
    patternFlags: 'g',
    message: 'GitHub App Installation Token detected.',
    remediation: 'Remove the token. App installation tokens should only exist in memory during runtime.',
    enabled: true,
  },
  {
    id: 'SEC-TOKEN-004',
    name: 'GitHub App User Access Token',
    description: 'Detects GitHub App User-to-Server Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: 'ghu_[A-Za-z0-9]{36,}',
    patternFlags: 'g',
    message: 'GitHub App User Access Token detected.',
    remediation: 'Remove the token and use secure authentication flows.',
    enabled: true,
  },
  {
    id: 'SEC-TOKEN-005',
    name: 'GitHub Refresh Token',
    description: 'Detects GitHub App Refresh Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: 'ghr_[A-Za-z0-9]{36,}',
    patternFlags: 'g',
    message: 'GitHub Refresh Token detected.',
    remediation: 'Remove the token. Refresh tokens must be stored securely, never in code.',
    enabled: true,
  },
  {
    id: 'SEC-TOKEN-006',
    name: 'Slack Bot Token',
    description: 'Detects Slack Bot OAuth Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: 'xoxb-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9]{24}',
    patternFlags: 'g',
    message: 'Slack Bot Token detected.',
    remediation: 'Remove the token and regenerate it in your Slack App settings.',
    enabled: true,
  },
  {
    id: 'SEC-TOKEN-007',
    name: 'Slack User Token',
    description: 'Detects Slack User OAuth Tokens',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: 'xoxp-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9]{24,32}',
    patternFlags: 'g',
    message: 'Slack User Token detected.',
    remediation: 'Remove the token and regenerate it.',
    enabled: true,
  },
  {
    id: 'SEC-TOKEN-008',
    name: 'Slack Webhook URL',
    description: 'Detects Slack Incoming Webhook URLs',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: 'https://hooks\\.slack\\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[A-Za-z0-9]+',
    patternFlags: 'g',
    message: 'Slack Webhook URL detected. Webhooks can be used to post to your channels.',
    remediation: 'Move webhook URLs to environment variables or secrets manager.',
    enabled: true,
  },
  {
    id: 'SEC-TOKEN-009',
    name: 'Discord Webhook URL',
    description: 'Detects Discord Webhook URLs',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: 'https://discord(?:app)?\\.com/api/webhooks/[0-9]+/[A-Za-z0-9_-]+',
    patternFlags: 'g',
    message: 'Discord Webhook URL detected.',
    remediation: 'Move webhook URLs to environment variables.',
    enabled: true,
  },
];

/**
 * Export function to get token secret rules
 */
export function getTokenSecretRules(): Rule[] {
  return tokenSecretRules;
}
