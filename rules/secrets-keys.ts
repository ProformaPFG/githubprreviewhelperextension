/**
 * Private Key Detection Rules
 *
 * Rules for detecting private keys in various formats
 */

import type { Rule } from '../types';

export const privateKeySecretRules: Rule[] = [
  {
    id: 'SEC-KEY-001',
    name: 'RSA Private Key',
    description: 'Detects RSA private keys in PEM format',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'],
    pattern: '-----BEGIN RSA PRIVATE KEY-----',
    patternFlags: 'g',
    message: 'RSA Private Key detected. Private keys must never be committed to source control.',
    remediation: 'Remove the private key immediately. Store keys in a secrets manager or use key management services.',
    enabled: true,
  },
  {
    id: 'SEC-KEY-002',
    name: 'OpenSSH Private Key',
    description: 'Detects OpenSSH private keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'],
    pattern: '-----BEGIN OPENSSH PRIVATE KEY-----',
    patternFlags: 'g',
    message: 'OpenSSH Private Key detected.',
    remediation: 'Remove the private key. Use SSH agent or secrets manager for key storage.',
    enabled: true,
  },
  {
    id: 'SEC-KEY-003',
    name: 'EC Private Key',
    description: 'Detects EC (Elliptic Curve) private keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'],
    pattern: '-----BEGIN EC PRIVATE KEY-----',
    patternFlags: 'g',
    message: 'EC Private Key detected.',
    remediation: 'Remove the private key and use a secrets manager.',
    enabled: true,
  },
  {
    id: 'SEC-KEY-004',
    name: 'PGP Private Key',
    description: 'Detects PGP private key blocks',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'],
    pattern: '-----BEGIN PGP PRIVATE KEY BLOCK-----',
    patternFlags: 'g',
    message: 'PGP Private Key detected.',
    remediation: 'Remove the private key. PGP keys should be stored in a keyring, not in code.',
    enabled: true,
  },
  {
    id: 'SEC-KEY-005',
    name: 'Generic Private Key',
    description: 'Detects generic PKCS#8 private keys',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'],
    pattern: '-----BEGIN PRIVATE KEY-----',
    patternFlags: 'g',
    message: 'Private Key (PKCS#8 format) detected.',
    remediation: 'Remove the private key and use proper key management.',
    enabled: true,
  },
  {
    id: 'SEC-KEY-006',
    name: 'Encrypted Private Key',
    description: 'Detects encrypted private keys (still should not be in code)',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'csharp'],
    pattern: '-----BEGIN ENCRYPTED PRIVATE KEY-----',
    patternFlags: 'g',
    message: 'Encrypted Private Key detected. Even encrypted keys should not be in source control.',
    remediation: 'Remove the key and use a secrets manager or key vault.',
    enabled: true,
  },
];

/**
 * Export function to get private key secret rules
 */
export function getPrivateKeySecretRules(): Rule[] {
  return privateKeySecretRules;
}
