# GitHub Code Review Assistant

A browser extension that provides automated code analysis for GitHub pull requests, detecting security vulnerabilities and code quality issues.

## 📋 Overview

GitHub Code Review Assistant is a Chrome/Edge extension that enhances your GitHub code review workflow by automatically analyzing code changes in pull requests. It detects **131 different security and quality issues** across multiple languages, helping developers identify potential problems before merging code.

## ✨ Features

### Core Analysis
- **Automated Code Analysis**: Automatically analyzes code on GitHub PR pages
- **131+ Detection Rules**: Comprehensive rule set covering:
  - **Security vulnerabilities** (SQL injection, XSS, CSRF, command injection, etc.)
  - **Code quality issues** (TODO comments, loose equality, error handling, etc.)
  - **Debug code detection** (console.log, debugger statements, test credentials)
  - **Secret detection** (API keys, AWS credentials, database passwords, private keys)
  - **HTML accessibility** (WCAG 2.1 accessibility checks)
  - **TypeScript quality** (type safety, proper error suppression)
- **Multi-language Support**: JavaScript, TypeScript, HTML, CSS, C#, JSX, TSX
- **Real-time Feedback**: Provides instant feedback on PR file changes

### Visual Interface
- **Color-coded Badges**: Inline badges highlight issue severity:
  - 🔴 **Critical**: Severe security or functional issues
  - 🟡 **Warning**: Potential problems that need attention
  - 🔵 **Info**: Informational suggestions for improvement
- **Summary Panel**: Organized view of all issues with filtering by severity and category
- **Inline Tooltips**: Hover over badges for detailed explanations and remediation advice
- **Visual Annotations**: Issues highlighted directly in the code diff

### Productivity Features
- **Keyboard Navigation**: Navigate files and issues with keyboard shortcuts (j/k/n/p)
- **Quick Comment Templates**: Pre-defined comment templates for common review feedback
- **Export Reports**: Export analysis results as markdown for documentation
- **Configurable Settings**: Customize rules, domains, and behavior via options page
- **Non-intrusive**: Seamlessly integrates with GitHub's existing UI

## 🚀 Installation

### From Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ProformaPFG/githubprreviewhelperextension.git
   cd githubprreviewhelperextension
   ```

2. **Install dependencies** (required for building):
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```
   This compiles TypeScript files, bundles scripts, and prepares the extension in the `dist/` directory.

4. **Load the extension in Chrome/Edge**:
   - Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the `dist/` directory from the cloned repository

5. **Verify installation**:
   - You should see the "GitHub Code Review Assistant" extension in your extensions list
   - The extension icon will appear in your browser toolbar

## 📖 Usage

1. **Navigate to a GitHub Pull Request**:
   - Visit any GitHub repository
   - Open a pull request
   - Go to the "Files changed" tab

2. **Automatic Analysis**:
   - The extension automatically activates when you're on a GitHub PR files page
   - Code analysis runs in the background
   - Issues are highlighted directly in the code view with inline badges

3. **View Results**:
   - **Inline badges**: Color-coded badges appear next to code lines with issues
   - **Tooltips**: Hover over badges for detailed explanations and remediation steps
   - **Summary panel**: Click the extension icon to open the full issues panel
   - **Filtering**: Filter issues by severity (Critical/Warning/Info) or category (Security/Debug/Secrets/Quality/Accessibility)

4. **Keyboard Navigation** (optional):
   - `j` / `k` - Navigate between files
   - `n` / `p` - Navigate between issues
   - `?` - Show keyboard shortcuts help
   - `Escape` - Close panels

5. **Quick Comments**:
   - Use numbered shortcuts (1-9) to insert common review comments
   - Customize templates in the settings page

6. **Configure Settings**:
   - Click the extension icon and select "Options"
   - Enable/disable specific rules or rule categories
   - Add GitHub Enterprise domains
   - Customize keyboard shortcuts and comment templates

## 🏗️ Project Structure

```
githubprreviewhelperextension/
├── manifest.json              # Extension configuration and metadata
├── package.json               # Node.js dependencies and build scripts
├── tsconfig.json              # TypeScript configuration
│
├── content.js                 # Main content script (runs on GitHub PR pages)
├── background.js              # Background service worker
├── popup.html                 # Extension popup interface
├── popup.js                   # Popup logic
├── options.html               # Settings/options page
│
├── analyzer.js                # Core analysis engine (pattern matching, rule execution)
├── analysis-integration.ts    # Connects analyzer with settings and rules
├── settings-manager.ts        # User preferences and configuration management
├── types.ts                   # TypeScript type definitions
│
├── rules/                     # Analysis rules organized by language and category
│   ├── index.ts               # Central export point for all rules
│   ├── javascript-security.ts # JavaScript security rules
│   ├── javascript-quality.ts  # JavaScript code quality rules
│   ├── typescript-quality.ts  # TypeScript-specific quality rules
│   ├── csharp-security.ts     # C# security rules
│   ├── html-security.ts       # HTML security rules
│   ├── html-accessibility.ts  # HTML accessibility rules (WCAG 2.1)
│   ├── css-security.ts        # CSS security rules
│   ├── secrets-*.ts           # Secret detection rules (AWS, tokens, keys, etc.)
│   └── *-debug*.ts            # Debug code detection rules
│
├── ui/                        # UI components and interactions
│   ├── summary-panel.ts       # Issue summary panel with filtering
│   ├── inline-annotator.ts   # Inline badge annotations
│   ├── tooltip.ts             # Hover tooltips for issues
│   ├── keyboard-handler.ts   # Keyboard navigation shortcuts
│   ├── quick-comments.ts     # Quick comment templates
│   └── ui-styles.css         # Component-specific styles
│
├── utils/                     # Utility functions
│   ├── dom.ts                 # DOM manipulation helpers
│   └── language.ts            # Language detection utilities
│
├── scripts/                   # Build scripts
│   ├── bundle-content.js      # Bundles content script with esbuild
│   └── copy-assets.js         # Copies assets to dist/ folder
│
├── icons/                     # Extension icons
│   ├── icon-16.png            # 16x16 icon
│   ├── icon-48.png            # 48x48 icon
│   └── icon-128.png           # 128x128 icon
│
├── docs/                      # Documentation and planning
│   └── plans/                 # Feature design documents
│
├── dist/                      # Built extension (generated by npm run build)
│
└── README.md                  # This file
```

## 🛠️ Development

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Comes with Node.js
- **Google Chrome or Microsoft Edge**: For testing the extension
- **TypeScript knowledge**: Helpful for contributing to the codebase

### Setting Up Development Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mlaplante/githubprreviewhelperextension.git
   cd githubprreviewhelperextension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   This installs TypeScript, esbuild, and Chrome types.

3. **Build the extension**:
   ```bash
   npm run build
   ```
   This command:
   - Cleans the `dist/` directory
   - Compiles TypeScript files to JavaScript
   - Bundles the content script with esbuild
   - Copies assets (HTML, CSS, icons, manifest) to `dist/`

4. **Load in browser**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` directory

5. **Make your changes**:
   - Edit TypeScript/JavaScript files in the project root or subdirectories
   - The extension uses Manifest V3 for modern browser compatibility
   - TypeScript provides type safety and better IDE support

6. **Rebuild and test**:
   ```bash
   npm run build
   ```
   Then:
   - Go to `chrome://extensions/`
   - Click the refresh icon on the extension card
   - Navigate to a GitHub PR to test your changes

### Development Scripts

- **`npm run build`**: Full build pipeline (clean, compile, bundle, copy assets)
- **`npm run compile`**: Compile TypeScript files only
- **`npm run watch`**: Watch mode for TypeScript compilation
- **`npm run clean`**: Remove the `dist/` directory
- **`npm run package`**: Build and create a ZIP file for distribution

### Key Files for Development

- **`analyzer.js`**: Core pattern matching and rule execution engine
- **`analysis-integration.ts`**: Connects analyzer with settings and rules
- **`rules/index.ts`**: Central point for registering new rules
- **`settings-manager.ts`**: Manages user preferences and configuration
- **`content.js`**: Main entry point that runs on GitHub PR pages
- **`ui/` directory**: All UI components (panels, tooltips, keyboard handling)

### Adding New Rules

1. Choose or create the appropriate rule file in `rules/`:
   - `javascript-security.ts` for JavaScript security issues
   - `typescript-quality.ts` for TypeScript quality issues
   - etc.

2. Define your rule following the `Rule` interface in `types.ts`:
   ```typescript
   {
     id: 'UNIQUE-ID-001',
     name: 'Rule Name',
     description: 'What this rule detects',
     severity: 'critical' | 'warning' | 'info',
     category: 'Security' | 'Debug' | 'Quality' | 'Secrets' | 'Accessibility',
     pattern: /your-regex-pattern/g,
     languages: ['javascript', 'typescript'],
     remediation: 'How to fix this issue',
     enabled: true
   }
   ```

3. Export your rule in the appropriate getter function

4. Import and export it in `rules/index.ts`

5. Rebuild and test:
   ```bash
   npm run build
   ```

## 🔍 Detection Capabilities

The extension includes **131 rules** across multiple categories:

### Security (48 rules)
- **JavaScript/HTML Security**: XSS, unsafe DOM manipulation, eval(), postMessage issues
- **C# Security**: SQL injection, command injection, path traversal, insecure deserialization
- **CSS Security**: Data URI vulnerabilities, import injection
- **Secret Detection**: 
  - AWS credentials and access keys
  - API tokens (GitHub, Stripe, Slack, etc.)
  - Database connection strings
  - Private keys (RSA, SSH, PGP)
  - Generic secret patterns

### Code Quality (18 rules)
- **JavaScript Quality**: 
  - TODO/FIXME/HACK comments
  - Loose equality (==) vs strict (===)
  - for...in loop warnings
  - Error handling issues
  - Magic numbers
- **TypeScript Quality**:
  - @ts-ignore and @ts-nocheck usage
  - Type safety bypasses (as any)
  - Non-null assertions (!)
- **C# Quality**: Naming conventions, code smells, best practices

### Debug Code Detection (27 rules)
- console.log, console.debug, debugger statements
- Test credentials and hardcoded passwords
- Development-only code markers
- Profiling and timing code

### HTML Accessibility (4 rules)
- WCAG 2.1 accessibility checks:
  - Missing alt attributes on images
  - Missing lang attributes on HTML
  - Button type attributes
  - Anchor tags without href

### By Language
- **JavaScript/TypeScript**: 50+ rules
- **HTML**: 12 rules
- **CSS**: 5 rules
- **C#**: 38 rules
- **Cross-language**: 26 rules (secrets, generic patterns)

All rules include:
- Clear descriptions
- Severity classification
- Remediation guidance
- Language-specific pattern matching

## ⚙️ Configuration

The extension can be configured through the Options page (accessible via the extension popup):

### Rule Management
- Enable/disable individual rules or entire categories
- Create custom rules with your own patterns
- Import/export rule configurations

### GitHub Integration
- Add GitHub Enterprise domains for use with private instances
- Enable/disable analysis for private repositories
- Configure analysis timeout and file size limits

### UI Preferences
- Toggle dark mode
- Auto-show summary panel on page load
- Show/hide line numbers in results
- Customize keyboard shortcuts

### Privacy Settings
- Control analytics collection
- Enable/disable error reporting

## 🔒 Permissions

The extension requires the following permissions:

- **`activeTab`**: To interact with the current GitHub PR page
- **`storage`**: To save user preferences and settings
- **Host Permissions**: Limited to GitHub PR pages (`github.com` and `*.github.com`)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute
- **Add new rules**: Expand detection capabilities
- **Improve UI/UX**: Enhance the interface and user experience
- **Fix bugs**: Help maintain code quality
- **Write documentation**: Improve guides and examples
- **Test and report**: Find issues and provide feedback

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the project structure
4. Add tests if applicable
5. Build and test your changes (`npm run build`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request with a clear description

### Code Style
- Use TypeScript for new code
- Follow existing patterns and conventions
- Add JSDoc comments for public functions
- Keep rules modular and well-documented

## 📝 License

This project is open source. Please check the repository for license information.

## 🐛 Issues and Support

If you encounter any issues or have suggestions for improvement:

1. Check existing issues on GitHub
2. Create a new issue with a detailed description
3. Include steps to reproduce any bugs

## 🙏 Acknowledgments

- Built for the GitHub community
- Inspired by the need for better automated code review tools
- Uses Chrome Extension Manifest V3 for modern browser support
- TypeScript for type safety and maintainability
- esbuild for fast bundling
- Comprehensive rule set covering security, quality, and accessibility

## 🔄 Version History

**v1.1.1** (Current)
- 131 detection rules across multiple languages
- TypeScript-based architecture
- Configurable settings and rule management
- Enhanced UI with summary panel, tooltips, and keyboard navigation
- Quick comment templates for common review feedback
- Build system with TypeScript compilation and bundling

## 📞 Contact

For questions or feedback, please open an issue on the GitHub repository.

---

**Note**: This extension is designed to assist with code reviews, not replace human judgment. Always use your best judgment when reviewing code changes.
