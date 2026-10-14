import React from 'react';
import { sanitizeHtml } from '../../utils/dom';

export function RichText({ html, className = 'rich' }) {
  if (!html) return null;
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={sanitizeHtml(html)}
    />
  );
}
