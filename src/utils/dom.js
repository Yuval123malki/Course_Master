import DOMPurify from 'dompurify';
import { renderMathInHtml } from './math';

export const currentRoute = () => {
  const raw = window.location.hash.slice(2).split('?')[0];
  if (!raw) {
    return 'home';
  }
  return decodeURIComponent(raw);
};

export const navigate = (path) => {
  window.location.hash = '/' + path;
  window.scrollTo({ top: 0, behavior: 'instant' });
};

export const getProgressValue = (progress, key, defaultValue) => {
  return progress?.entries?.[key]?.value ?? defaultValue;
};

// Configure DOMPurify to allow KaTeX math and SVG tags
const PURIFY_CONFIG = {
  ADD_TAGS: [
    'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'msubsup',
    'mfrac', 'msqrt', 'mroot', 'mtext', 'mspace', 'annotation', 'svg', 'path', 'line', 'rect', 'circle', 'g'
  ],
  ADD_ATTR: [
    'xmlns', 'display', 'mathvariant', 'dir', 'aria-hidden', 'viewBox', 'width',
    'height', 'rx', 'ry', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
    'marker-end', 'text-anchor', 'font-size', 'tabindex'
  ]
};

export const sanitizeHtml = (html) => {
  if (!html) return { __html: '' };

  // 1. First render LaTeX math formulas into KaTeX HTML/MathML
  let withMath = renderMathInHtml(String(html));

  // 2. Format headings and pre tags
  let processed = withMath
    .replace(/<h4(\s[^>]*)?>/gi, (match, attrs = '') => `<h3${attrs}>`)
    .replace(/<\/h4>/gi, '</h3>')
    .replace(/<pre(\s[^>]*)?>/gi, (match, attrs = '') => `<pre tabindex="0"${attrs}>`);

  // 3. Sanitize safely with DOMPurify
  const clean = DOMPurify.sanitize(processed, PURIFY_CONFIG);

  return { __html: clean };
};
