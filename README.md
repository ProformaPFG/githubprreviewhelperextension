# GitHub Code Review Assistant

A browser extension that provides automated code analysis for GitHub pull requests, detecting security vulnerabilities and code quality issues.

## 📋 Overview

GitHub Code Review Assistant is a Chrome/Edge extension that enhances your GitHub code review workflow by automatically analyzing code changes in pull requests. It detects up to 76 different security and quality issues, helping developers identify potential problems before merging code.

## ✨ Features

- **Automated Code Analysis**: Automatically analyzes code on GitHub PR pages
- **Security Detection**: Identifies security vulnerabilities in code changes
- **Quality Checks**: Detects code quality issues and potential bugs
- **Real-time Feedback**: Provides instant feedback on PR file changes
- **Visual Indicators**: Uses color-coded badges to highlight issue severity:
  - 🔴 **Critical**: Severe security or functional issues
  - 🟡 **Warning**: Potential problems that need attention
  - 🔵 **Info**: Informational suggestions for improvement
- **Non-intrusive**: Seamlessly integrates with GitHub's existing UI

## 🚀 Installation

### From Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mlaplante/githubprreviewhelperextension.git
   cd githubprreviewhelperextension
   ```

2. **Load the extension in Chrome/Edge**:
   - Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the cloned repository directory

3. **Verify installation**:
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
   - Issues are highlighted directly in the code view

3. **View Results**:
   - Look for color-coded badges next to code changes
   - Click the extension icon in your toolbar to see the status
   - Review detected issues and their severity levels

## 🏗️ Project Structure

```
githubprreviewhelperextension/
├── manifest.json       # Extension configuration and metadata
├── content.js          # Content script that runs on GitHub PR pages
├── background.js       # Background service worker
├── popup.html          # Extension popup interface
├── ui-styles.css       # Styling for UI elements
├── icons/              # Extension icons
│   ├── icon-16.png     # 16x16 icon
│   ├── icon-48.png     # 48x48 icon
│   └── icon-128.png    # 128x128 icon
└── README.md           # This file
```

## 🛠️ Development

### Prerequisites

- Google Chrome or Microsoft Edge browser
- Basic knowledge of JavaScript and browser extensions

### Setting Up Development Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mlaplante/githubprreviewhelperextension.git
   cd githubprreviewhelperextension
   ```

2. **Make your changes**:
   - Edit the relevant files (`content.js`, `background.js`, etc.)
   - The extension uses Manifest V3 for modern browser compatibility

3. **Test your changes**:
   - Go to `chrome://extensions/`
   - Click the refresh icon on the extension card
   - Navigate to a GitHub PR to test your changes

### Key Files

- **`manifest.json`**: Defines extension metadata, permissions, and configuration
- **`content.js`**: Main logic that runs on GitHub PR pages
- **`background.js`**: Service worker for background tasks
- **`popup.html`**: UI for the extension popup
- **`ui-styles.css`**: Styles for badges and UI elements

## 🔒 Permissions

The extension requires the following permissions:

- **`activeTab`**: To interact with the current GitHub PR page
- **`storage`**: To save user preferences and settings
- **Host Permissions**: Limited to GitHub PR pages (`github.com` and `*.github.com`)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

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

## 📞 Contact

For questions or feedback, please open an issue on the GitHub repository.

---

**Note**: This extension is designed to assist with code reviews, not replace human judgment. Always use your best judgment when reviewing code changes.
