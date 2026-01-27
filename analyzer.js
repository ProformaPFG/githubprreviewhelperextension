/**
 * Analysis Engine - Core pattern matching and rule execution
 * 
 * Responsible for:
 * - Loading and executing rules against code
 * - Pattern matching with regex
 * - Line number calculation
 * - Result deduplication and aggregation
 */

/**
 * Calculate the line number where a match occurred
 * @param {string} code Full code string
 * @param {number} matchPosition Position of match in string
 * @returns {number} Line number (1-indexed)
 */
function calculateLineNumber(code, matchPosition) {
  const lineCount = code.substring(0, matchPosition).split('\n').length;
  return lineCount;
}

/**
 * Extract the matched text from code
 * @param {string} code Full code string
 * @param {RegExpExecArray} match RegExp match result
 * @returns {string} The matched text
 */
function extractMatchedText(code, match) {
  return match[0];
}

/**
 * Get column position of match
 * @param {string} code Full code string
 * @param {number} matchPosition Position in string
 * @returns {number} Column number (0-indexed)
 */
function getColumnNumber(code, matchPosition) {
  const lastNewline = code.lastIndexOf('\n', matchPosition);
  const column = matchPosition - (lastNewline + 1);
  return column;
}

/**
 * Execute a single rule against code
 * @param {string} code Code to analyze
 * @param {Object} rule Rule to execute
 * @param {string} filePath Path of the file
 * @returns {Array} Array of analysis results
 */
function executeRule(code, rule, filePath) {
  const results = [];
  
  try {
    if (!rule.enabled) {
      return results;
    }
    
    const flags = rule.patternFlags || 'gi';
    const regex = new RegExp(rule.pattern, flags);
    let match;
    
    while ((match = regex.exec(code)) !== null) {
      const lineNumber = calculateLineNumber(code, match.index);
      const columnNumber = getColumnNumber(code, match.index);
      const matchedText = extractMatchedText(code, match);
      
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        message: rule.message,
        remediation: rule.remediation,
        severity: rule.severity,
        category: rule.category,
        lineNumber: lineNumber,
        columnNumber: columnNumber,
        matchedText: matchedText,
      });
    }
  } catch (error) {
    console.error(`Error executing rule ${rule.id}:`, error);
  }
  
  return results;
}

/**
 * Deduplicate results by ruleId and line number
 * @param {Array} results Array of results to deduplicate
 * @returns {Array} Deduplicated results
 */
function deduplicateResults(results) {
  const seen = new Set();
  const deduped = [];
  
  results.forEach(result => {
    const key = `${result.ruleId}:${result.lineNumber}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(result);
    }
  });
  
  return deduped;
}

/**
 * Analyze code against rules
 * @param {string} code Code to analyze
 * @param {string} language Programming language
 * @param {Array} rules Rules to apply
 * @param {string} filePath File path
 * @returns {Object} Analysis results
 */
function analyzeCode(code, language, rules, filePath) {
  const allResults = [];
  
  // Filter rules for this language
  const applicableRules = rules.filter(rule => 
    rule.languages.includes(language) && rule.enabled
  );
  
  // Execute each rule
  applicableRules.forEach(rule => {
    const ruleResults = executeRule(code, rule, filePath);
    allResults.push(...ruleResults);
  });
  
  // Deduplicate results
  const deduplicatedResults = deduplicateResults(allResults);
  
  // Sort by line number
  deduplicatedResults.sort((a, b) => a.lineNumber - b.lineNumber);
  
  return {
    filePath: filePath,
    language: language,
    results: deduplicatedResults,
  };
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeCode,
    executeRule,
    calculateLineNumber,
    extractMatchedText,
    getColumnNumber,
    deduplicateResults,
  };
}
