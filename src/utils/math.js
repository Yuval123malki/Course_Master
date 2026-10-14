import katex from 'katex';

/**
 * Safely renders LaTeX mathematical expressions found inside an HTML or plain text string.
 * Supports:
 * - Block math: $$formula$$ or \[formula\]
 * - Inline math: $formula$ or \(formula\)
 */
export function renderMathInHtml(html) {
  if (!html || typeof html !== 'string') return html || '';

  // 1. Process block math: $$...$$
  let processed = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: true,
        throwOnError: false
      });
    } catch (e) {
      return match;
    }
  });

  // 2. Process block math: \[...\]
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: true,
        throwOnError: false
      });
    } catch (e) {
      return match;
    }
  });

  // 3. Process inline math: \(...\)
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: false,
        throwOnError: false
      });
    } catch (e) {
      return match;
    }
  });

  // 4. Process inline math: $...$ (ensuring not matched across multiple paragraphs or empty)
  processed = processed.replace(/(?<!\\)\$([^\$\n\r]+?)\$/g, (match, expr) => {
    const trimmed = expr.trim();
    if (!trimmed) return match;
    try {
      return katex.renderToString(trimmed, {
        displayMode: false,
        throwOnError: false
      });
    } catch (e) {
      return match;
    }
  });

  return processed;
}

/**
 * Directly render a pure LaTeX formula string to HTML
 */
export function renderFormula(formula, displayMode = false) {
  if (!formula) return '';
  const clean = String(formula).replace(/^[$]+|[$]+$/g, '').trim();
  try {
    return katex.renderToString(clean, {
      displayMode,
      throwOnError: false
    });
  } catch (e) {
    return clean;
  }
}
