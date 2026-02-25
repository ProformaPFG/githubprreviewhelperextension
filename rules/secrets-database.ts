/**
 * Database Secret Detection Rules
 *
 * Rules for detecting database connection strings with embedded credentials
 */

import type { Rule } from '../types';

export const databaseSecretRules: Rule[] = [
  {
    id: 'SEC-DB-001',
    name: 'MongoDB Connection String with Credentials',
    description: 'Detects MongoDB connection strings containing username and password',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'csharp'],
    pattern: 'mongodb(\\+srv)?://[^:]+:[^@]+@[^\\s"\']+',
    patternFlags: 'gi',
    message: 'MongoDB connection string with embedded credentials detected.',
    remediation: 'Use environment variables for database credentials. Consider using MongoDB Atlas connection with IAM authentication.',
    enabled: true,
  },
  {
    id: 'SEC-DB-002',
    name: 'PostgreSQL Connection String with Credentials',
    description: 'Detects PostgreSQL connection strings containing password',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'csharp'],
    pattern: 'postgres(ql)?://[^:]+:[^@]+@[^\\s"\']+',
    patternFlags: 'gi',
    message: 'PostgreSQL connection string with embedded credentials detected.',
    remediation: 'Use environment variables or secrets manager for database credentials.',
    enabled: true,
  },
  {
    id: 'SEC-DB-003',
    name: 'MySQL Connection String with Credentials',
    description: 'Detects MySQL connection strings containing password',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'csharp'],
    pattern: 'mysql://[^:]+:[^@]+@[^\\s"\']+',
    patternFlags: 'gi',
    message: 'MySQL connection string with embedded credentials detected.',
    remediation: 'Use environment variables or secrets manager for database credentials.',
    enabled: true,
  },
  {
    id: 'SEC-DB-004',
    name: 'Redis Connection String with Credentials',
    description: 'Detects Redis connection strings containing password',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'csharp'],
    pattern: 'redis://[^:]*:[^@]+@[^\\s"\']+',
    patternFlags: 'gi',
    message: 'Redis connection string with embedded password detected.',
    remediation: 'Use environment variables for Redis credentials.',
    enabled: true,
  },
  {
    id: 'SEC-DB-005',
    name: 'SQL Server Connection String with Password',
    description: 'Detects SQL Server connection strings with embedded passwords',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte', 'html', 'csharp'],
    pattern: '(Password|Pwd)\\s*=\\s*[^;\\s]+',
    patternFlags: 'gi',
    message: 'SQL Server connection string with embedded password detected.',
    remediation: 'Use Windows Authentication or store passwords in environment variables.',
    enabled: true,
  },
];

/**
 * Export function to get database secret rules
 */
export function getDatabaseSecretRules(): Rule[] {
  return databaseSecretRules;
}
