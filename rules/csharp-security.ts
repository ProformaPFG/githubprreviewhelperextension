/**
 * C# Security Rules (18 rules)
 * 
 * Comprehensive security vulnerability detection for C# code
 * Covers SQL injection, command injection, deserialization, cryptography, etc.
 */

import type { Rule } from '../types.js';

export const csharpSecurityRules: Rule[] = [
  {
    id: 'CS-SEC-001',
    name: 'SQL Injection - String Concatenation',
    description: 'String concatenation in SQL queries can lead to SQL injection',
    category: 'security',
    severity: 'critical',
    languages: ['csharp'],
    pattern: '["\']SELECT\\s+.*["\']\\s*\\+|["\']INSERT\\s+.*["\']\\s*\\+|["\']UPDATE\\s+.*["\']\\s*\\+|["\']DELETE\\s+.*["\']\\s*\\+',
    patternFlags: 'gi',
    message: 'SQL query built with string concatenation. Use parameterized queries instead.',
    remediation:
      'Use parameterized queries with SqlCommand.Parameters or Entity Framework with LINQ. Never concatenate user input into SQL strings.',
    enabled: true,
    examples: {
      bad: 'string query = "SELECT * FROM Users WHERE Id = " + userId;',
      good: 'using (SqlCommand cmd = new SqlCommand("SELECT * FROM Users WHERE Id = @id", connection))\n{\n  cmd.Parameters.AddWithValue("@id", userId);\n}',
    },
  },

  {
    id: 'CS-SEC-002',
    name: 'SQL Injection - String Format',
    description: 'String.Format in SQL queries can lead to SQL injection',
    category: 'security',
    severity: 'critical',
    languages: ['csharp'],
    pattern: 'String\\.Format\\s*\\(\\s*["\'][^"\']*SELECT|String\\.Format\\s*\\(\\s*["\'][^"\']*INSERT|String\\.Format\\s*\\(\\s*["\'][^"\']*UPDATE|String\\.Format\\s*\\(\\s*["\'][^"\']*DELETE',
    patternFlags: 'gi',
    message: 'SQL query built with String.Format. Use parameterized queries instead.',
    remediation:
      'Use parameterized queries with SqlCommand.Parameters. String.Format should never be used for SQL query construction.',
    enabled: true,
    examples: {
      bad: 'string query = string.Format("SELECT * FROM Users WHERE Id = {0}", userId);',
      good: 'using (SqlCommand cmd = new SqlCommand("SELECT * FROM Users WHERE Id = @id", connection))\n{\n  cmd.Parameters.AddWithValue("@id", userId);\n}',
    },
  },

  {
    id: 'CS-SEC-003',
    name: 'SQL Injection - String Interpolation',
    description: 'String interpolation in SQL queries can lead to SQL injection',
    category: 'security',
    severity: 'critical',
    languages: ['csharp'],
    pattern: '\\$["\'].*\\{.*\\}.*SELECT|\\$["\'].*\\{.*\\}.*INSERT|\\$["\'].*\\{.*\\}.*UPDATE|\\$["\'].*\\{.*\\}.*DELETE',
    patternFlags: 'gi',
    message: 'SQL query built with string interpolation. Use parameterized queries instead.',
    remediation:
      'Use parameterized queries with SqlCommand.Parameters. String interpolation should never be used for SQL construction.',
    enabled: true,
    examples: {
      bad: 'string query = $"SELECT * FROM Users WHERE Id = {userId}";',
      good: 'using (SqlCommand cmd = new SqlCommand("SELECT * FROM Users WHERE Id = @id", connection))\n{\n  cmd.Parameters.AddWithValue("@id", userId);\n}',
    },
  },

  {
    id: 'CS-SEC-004',
    name: 'Command Injection',
    description: 'Process.Start with user input can lead to command injection',
    category: 'security',
    severity: 'critical',
    languages: ['csharp'],
    pattern: 'Process\\.Start\\s*\\(\\s*(?:userInput|input|args|command|\\w+Param|param\\w+)',
    patternFlags: 'gi',
    message: 'Process.Start with user input detected. This can lead to command injection.',
    remediation:
      'Validate and sanitize all input before passing to Process.Start. Better: use API calls instead of shell commands. Avoid user input in process arguments.',
    enabled: true,
    examples: {
      bad: 'Process.Start("cmd.exe", "/c " + userCommand);',
      good: 'Process.Start(new ProcessStartInfo\n{\n  FileName = "cmd.exe",\n  Arguments = "/c " + EscapeArgument(userCommand),\n  UseShellExecute = false\n});',
    },
  },

  {
    id: 'CS-SEC-005',
    name: 'Path Traversal',
    description: 'File operations with user input can lead to path traversal attacks',
    category: 'security',
    severity: 'warning',
    languages: ['csharp'],
    pattern: '(File|Directory)\\.(ReadAllText|WriteAllText|Delete|Exists)\\s*\\(\\s*(?:userPath|input|path|args|param)',
    patternFlags: 'gi',
    message: 'File operation with user-controlled path detected. Validate the path.',
    remediation:
      'Validate file paths against a whitelist. Use Path.GetFullPath and ensure it doesn\'t escape the allowed directory. Consider using sandboxed file access.',
    enabled: true,
    examples: {
      bad: 'string content = File.ReadAllText(userPath);',
      good: 'string path = Path.GetFullPath(userPath);\nif (!IsAllowedPath(path)) throw new UnauthorizedAccessException();\nstring content = File.ReadAllText(path);',
    },
  },

  {
    id: 'CS-SEC-006',
    name: 'XXE Vulnerability',
    description: 'XmlDocument without secure settings can be vulnerable to XXE attacks',
    category: 'security',
    severity: 'critical',
    languages: ['csharp'],
    pattern: 'new\\s+XmlDocument\\s*\\(\\)|XmlDocument\\s+\\w+\\s*=\\s*new\\s+XmlDocument\\s*\\(\\)',
    patternFlags: 'gi',
    message: 'XmlDocument instantiation detected without XXE protection. Configure secure settings.',
    remediation:
      'Disable DTD processing and external entity resolution: xmlDoc.XmlResolver = null; or use XmlReaderSettings with ProhibitDtd = true.',
    enabled: true,
    examples: {
      bad: 'var xmlDoc = new XmlDocument();\nxmlDoc.Load(xmlPath);',
      good: 'var xmlDoc = new XmlDocument();\nxmlDoc.XmlResolver = null;\nvar settings = new XmlReaderSettings { ProhibitDtd = true };\nusing (var reader = XmlReader.Create(xmlPath, settings))\n  xmlDoc.Load(reader);',
    },
  },

  {
    id: 'CS-SEC-007',
    name: 'Insecure Deserialization - BinaryFormatter',
    description: 'BinaryFormatter is vulnerable to deserialization attacks',
    category: 'security',
    severity: 'critical',
    languages: ['csharp'],
    pattern: 'new\\s+BinaryFormatter|BinaryFormatter\\s*\\w+\\s*=\\s*new',
    patternFlags: 'gi',
    message: 'BinaryFormatter detected. This is vulnerable to deserialization attacks.',
    remediation:
      'Avoid BinaryFormatter entirely. Use JSON serialization (JsonSerializer, Newtonsoft.Json) or protobuf. If you must deserialize, use SerializationBinder to control types.',
    enabled: true,
    examples: {
      bad: 'var formatter = new BinaryFormatter();\nvar obj = formatter.Deserialize(stream);',
      good: 'var options = new JsonSerializerOptions { TypeInfoResolver = new DefaultJsonTypeInfoResolver() };\nvar obj = JsonSerializer.Deserialize<MyClass>(stream, options);',
    },
  },

  {
    id: 'CS-SEC-008',
    name: 'Insecure Deserialization - JSON TypeNameHandling',
    description: 'TypeNameHandling.All allows arbitrary type instantiation',
    category: 'security',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'TypeNameHandling\\s*=\\s*TypeNameHandling\\.All',
    patternFlags: 'gi',
    message: 'TypeNameHandling.All detected. This allows arbitrary object instantiation.',
    remediation:
      'Use TypeNameHandling.None or TypeNameHandling.Objects with a custom SerializationBinder to restrict types.',
    enabled: true,
    examples: {
      bad: 'var settings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All };',
      good: 'var settings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.None };',
    },
  },

  {
    id: 'CS-SEC-009',
    name: 'Missing [Authorize] Attribute',
    description: 'Public controller actions without [Authorize] can be accessed anonymously',
    category: 'security',
    severity: 'warning',
    languages: ['csharp'],
    pattern: '(public|protected)\\s+(async\\s+)?\\w+\\s+\\w+\\s*\\(.*\\)\\s*\\{',
    patternFlags: 'gi',
    message: 'Public controller action detected. Ensure proper authorization is in place.',
    remediation:
      'Add [Authorize] attribute to controller or actions that require authentication. Use [AllowAnonymous] only when intentional.',
    enabled: false,
    examples: {
      bad: 'public ActionResult GetUser(int id) { return View(userService.GetUser(id)); }',
      good: '[Authorize]\npublic ActionResult GetUser(int id) { return View(userService.GetUser(id)); }',
    },
  },

  {
    id: 'CS-SEC-010',
    name: 'Missing [ValidateAntiForgeryToken]',
    description: 'POST actions without CSRF protection are vulnerable to attacks',
    category: 'security',
    severity: 'warning',
    languages: ['csharp'],
    pattern: '\\[HttpPost\\]\\s+public|\\[HttpPost\\]\\s+protected|POST.*public|POST.*protected',
    patternFlags: 'gi',
    message: '[HttpPost] action detected without CSRF protection. Add [ValidateAntiForgeryToken].',
    remediation:
      'Add [ValidateAntiForgeryToken] to POST, PUT, and DELETE actions. Include @Html.AntiForgeryToken() in forms.',
    enabled: true,
    examples: {
      bad: '[HttpPost]\npublic ActionResult Save(UserModel user) { /* ... */ }',
      good: '[HttpPost]\n[ValidateAntiForgeryToken]\npublic ActionResult Save(UserModel user) { /* ... */ }',
    },
  },

  {
    id: 'CS-SEC-011',
    name: 'Hardcoded Connection String',
    description: 'Connection strings with credentials should never be hardcoded',
    category: 'security',
    severity: 'critical',
    languages: ['csharp'],
    pattern: 'connectionString\\s*=\\s*["\'][^"\']*Password["\']|connectionString\\s*=\\s*["\'][^"\']*uid["\']|connectionString\\s*=\\s*["\'][^"\']*pwd["\']',
    patternFlags: 'gi',
    message: 'Hardcoded connection string with credentials detected. Use configuration or secrets manager.',
    remediation:
      'Store connection strings in appsettings.json (not in source control) or use Azure Key Vault, AWS Secrets Manager, or similar.',
    enabled: true,
    examples: {
      bad: 'string conn = "Server=myserver;Database=mydb;User Id=sa;Password=secret123;";',
      good: 'string conn = Configuration.GetConnectionString("DefaultConnection");',
    },
  },

  {
    id: 'CS-SEC-012',
    name: 'Hardcoded Password',
    description: 'Passwords and secrets should never be hardcoded in source code',
    category: 'security',
    severity: 'critical',
    languages: ['csharp'],
    pattern: '(password|passwd|pwd|secret)\\s*=\\s*["\'][^"\']+["\']',
    patternFlags: 'gi',
    message: 'Hardcoded password detected. Move to configuration or secrets manager.',
    remediation:
      'Never store passwords in code. Use environment variables, configuration files (not in source control), or secure secrets management.',
    enabled: true,
    examples: {
      bad: 'string password = "MySecretPassword123";',
      good: 'string password = Environment.GetEnvironmentVariable("DB_PASSWORD");',
    },
  },

  {
    id: 'CS-SEC-013',
    name: 'Weak Cryptography',
    description: 'MD5 and SHA1 are cryptographically weak and should not be used',
    category: 'security',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'MD5\\.Create|SHA1\\.Create|new\\s+MD5Cng|new\\s+SHA1Managed',
    patternFlags: 'gi',
    message: 'Weak cryptography algorithm detected (MD5 or SHA1). Use SHA256 or stronger.',
    remediation:
      'Use SHA256, SHA512, or other modern cryptographic algorithms. Use HMACSHA256 for message authentication codes.',
    enabled: true,
    examples: {
      bad: 'using (var hash = MD5.Create()) { var hashBytes = hash.ComputeHash(data); }',
      good: 'using (var hash = SHA256.Create()) { var hashBytes = hash.ComputeHash(data); }',
    },
  },

  {
    id: 'CS-SEC-014',
    name: 'Response Write Unencoded',
    description: 'Response.Write without encoding can lead to XSS vulnerabilities',
    category: 'security',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'Response\\.Write\\s*\\(\\s*(?!HttpUtility\\.HtmlEncode)',
    patternFlags: 'gi',
    message: 'Response.Write with potentially unencoded output detected. Encode for HTML context.',
    remediation:
      'Use Response.Write(HttpUtility.HtmlEncode(data)) or better yet, use Razor views with @data which auto-encodes.',
    enabled: true,
    examples: {
      bad: 'Response.Write("<p>" + userInput + "</p>");',
      good: 'Response.Write("<p>" + HttpUtility.HtmlEncode(userInput) + "</p>");',
    },
  },

  {
    id: 'CS-SEC-015',
    name: 'LDAP Injection',
    description: 'LDAP filter concatenation can lead to LDAP injection attacks',
    category: 'security',
    severity: 'critical',
    languages: ['csharp'],
    pattern: 'SearchFilter\\s*=.*\\+|ldapFilter.*\\+|ldap.*\\+.*username|ldap.*\\+.*userid',
    patternFlags: 'gi',
    message: 'LDAP filter built with string concatenation. Use parameterized LDAP queries.',
    remediation:
      'Use Directory Services properly by parameterizing LDAP filters. Escape special characters or use proper LDAP query builders.',
    enabled: true,
    examples: {
      bad: 'string filter = "(&(uid=" + username + "))";',
      good: 'string filter = $"(&(uid={EscapeLdapSearchFilter(username)}))";',
    },
  },

  {
    id: 'CS-SEC-016',
    name: 'Regex Denial of Service',
    description: 'Complex regex patterns can cause ReDoS attacks',
    category: 'security',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'new\\s+Regex\\s*\\(\\s*userPattern|new\\s+Regex\\s*\\(.*\\(.*\\+.*\\).*\\+',
    patternFlags: 'gi',
    message: 'Regex with user input detected. This can cause ReDoS attacks.',
    remediation:
      'Never allow user-provided regex patterns. Use RegexOptions.IgnoreCase, not ReDoS-vulnerable patterns. Add timeout.',
    enabled: true,
    examples: {
      bad: 'new Regex(userPattern, RegexOptions.Compiled);',
      good: 'new Regex(safePattern, RegexOptions.Compiled, TimeSpan.FromMilliseconds(100));',
    },
  },

  {
    id: 'CS-SEC-017',
    name: 'Insecure Cookie',
    description: 'Cookies without Secure and HttpOnly flags can be stolen',
    category: 'security',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'new\\s+HttpCookie\\s*\\(["\']|response\\.Cookies\\.Add',
    patternFlags: 'gi',
    message: 'HttpCookie created without Secure/HttpOnly flags. Set these flags.',
    remediation:
      'Always set Secure = true and HttpOnly = true on authentication cookies. Use response.Cookies.Add with proper flags.',
    enabled: true,
    examples: {
      bad: 'var cookie = new HttpCookie("auth", token);',
      good: 'var cookie = new HttpCookie("auth", token) { Secure = true, HttpOnly = true, SameSite = SameSiteMode.Strict };',
    },
  },

  {
    id: 'CS-SEC-018',
    name: 'Weak Random for Security',
    description: 'System.Random is not cryptographically secure and should not be used for security tokens',
    category: 'security',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'new\\s+Random\\s*\\(\\)|Random\\s+\\w+\\s*=\\s*new\\s+Random|\\w+\\.Next',
    patternFlags: 'gi',
    message: 'System.Random used for security purposes. Use RNGCryptoServiceProvider or RandomNumberGenerator.',
    remediation:
      'Use RNGCryptoServiceProvider or the newer RandomNumberGenerator class for generating cryptographic random bytes.',
    enabled: true,
    examples: {
      bad: 'var random = new Random();\nvar token = random.Next();',
      good: 'using (var rng = new RNGCryptoServiceProvider())\n{\n  byte[] bytes = new byte[32];\n  rng.GetBytes(bytes);\n}',
    },
  },
];

/**
 * Export function to get C# security rules
 */
export function getCSharpSecurityRules(): Rule[] {
  return csharpSecurityRules;
}
