/**
 * AWS Secret Detection Rules
 *
 * Rules for detecting AWS credentials and sensitive identifiers
 */

import type { Rule } from '../types';

export const awsSecretRules: Rule[] = [
  {
    id: 'SEC-AWS-001',
    name: 'AWS Access Key ID',
    description: 'Detects AWS Access Key IDs which should never be committed to source control',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: '(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}',
    patternFlags: 'g',
    message: 'AWS Access Key ID detected. Never commit AWS credentials to source control.',
    remediation: 'Remove the AWS Access Key ID and use environment variables or AWS IAM roles instead. Rotate this key immediately as it may be compromised.',
    enabled: true,
  },
  {
    id: 'SEC-AWS-002',
    name: 'AWS Secret Access Key',
    description: 'Detects patterns that look like AWS Secret Access Keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'css', 'csharp'],
    pattern: '["\']([A-Za-z0-9/+=]{40})["\']',
    patternFlags: 'g',
    message: 'Potential AWS Secret Access Key detected. These are 40-character base64 strings.',
    remediation: 'Remove the secret key and use environment variables or AWS Secrets Manager. Rotate this key immediately.',
    enabled: true,
  },
  {
    id: 'SEC-AWS-003',
    name: 'AWS Account ID in ARN',
    description: 'Detects AWS Account IDs embedded in ARNs',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'csharp'],
    pattern: 'arn:aws:[a-z0-9-]+:[a-z0-9-]*:(\\d{12}):',
    patternFlags: 'gi',
    message: 'AWS Account ID exposed in ARN. Consider if this should be parameterized.',
    remediation: 'Use environment variables or configuration to inject AWS Account IDs rather than hardcoding them.',
    enabled: true,
  },
];

/**
 * Export function to get AWS secret rules
 */
export function getAWSSecretRules(): Rule[] {
  return awsSecretRules;
}
