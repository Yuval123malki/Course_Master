/**
 * FileExtractor: Client-side file parser and auto-classifier for Course Repositories.
 * Supports .docx (via DecompressionStream ZIP/XML extraction), .pdf, .txt, .md, .tex, .csv, .json
 */

export const REPO_CATEGORIES = {
  syllabus: { id: 'syllabus', label: 'סילבוס ותוכנית קורס', badge: 'סילבוס' },
  summary: { id: 'summary', label: 'סיכומים, הרצאות ותרגולים', badge: 'סיכום / הרצאה' },
  exam: { id: 'exam', label: 'מבחני עבר ופתרונות', badge: 'מבחן עבר' },
  formula: { id: 'formula', label: 'דפי נוסחאות ומושגים', badge: 'דף נוסחאות' }
};

/**
 * Automatically classify a file based on its filename and extracted text
 */
export function autoClassifyFile(filename = '', text = '') {
  const lowerName = filename.toLowerCase();
  const sample = (filename + ' ' + text.slice(0, 800)).toLowerCase();

  if (
    lowerName.includes('syllabus') ||
    lowerName.includes('סילבוס') ||
    lowerName.includes('תוכנית הקורס') ||
    sample.includes('סילבוס הקורס') ||
    sample.includes('מטרות הקורס')
  ) {
    return 'syllabus';
  }

  if (
    lowerName.includes('exam') ||
    lowerName.includes('test') ||
    lowerName.includes('moed') ||
    lowerName.includes('מבחן') ||
    lowerName.includes('בחינה') ||
    lowerName.includes('מועד') ||
    lowerName.includes('שאלון') ||
    lowerName.includes('פתרון') ||
    /שאלה\s*[1-9]/.test(sample)
  ) {
    return 'exam';
  }

  if (
    lowerName.includes('formula') ||
    lowerName.includes('cheat') ||
    lowerName.includes('נוסחאות') ||
    lowerName.includes('דף עזר')
  ) {
    return 'formula';
  }

  return 'summary';
}

/**
 * Extract readable text from a .docx file in the browser by reading ZIP local file entries
 * and decompressing `word/document.xml` using Web DecompressionStream('deflate-raw').
 */
async function extractDocxText(file) {
  try {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const view = new DataView(buf);

    let offset = 0;
    const decoder = new TextDecoder('utf-8');

    while (offset + 30 < bytes.length) {
      // Local file header signature = 0x04034b50
      if (view.getUint32(offset, true) !== 0x04034b50) {
        offset++;
        continue;
      }

      const compression = view.getUint16(offset + 8, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const fileNameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);

      const nameBytes = bytes.slice(offset + 30, offset + 30 + fileNameLen);
      const entryName = decoder.decode(nameBytes);
      const dataStart = offset + 30 + fileNameLen + extraLen;

      if (entryName === 'word/document.xml' && compressedSize > 0 && dataStart + compressedSize <= bytes.length) {
        const compressedData = bytes.slice(dataStart, dataStart + compressedSize);
        let xmlText = '';

        if (compression === 0) {
          xmlText = decoder.decode(compressedData);
        } else if (compression === 8 && typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          writer.write(compressedData);
          writer.close();
          const decompressedBuf = await new Response(ds.readable).arrayBuffer();
          xmlText = decoder.decode(decompressedBuf);
        }

        if (xmlText) {
          return xmlText
            .replace(/<\/w:p>/g, '\n')
            .replace(/<w:tab\/>/g, ' ')
            .replace(/<w:br[^/>]*\/>/g, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        }
      }

      offset = dataStart + Math.max(1, compressedSize);
    }
  } catch (e) {
    // Fallback below
  }

  // Fallback raw text scan
  const raw = await file.text();
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\u0590-\u05FFa-zA-Z0-9\s.,?!:;()\-+=/*^]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract readable text from a PDF file by scanning uncompressed text streams and UTF-8/ASCII strings
 */
async function extractPdfText(file) {
  try {
    const raw = await file.text();
    const matches = [];

    // Extract parenthesized PDF text literals (...)
    const literalRegex = /\(([^()]{3,200})\)/g;
    let m;
    while ((m = literalRegex.exec(raw)) !== null) {
      const cleaned = m[1]
        .replace(/\\[nrt]/g, ' ')
        .replace(/[^\u0590-\u05FFa-zA-Z0-9\s.,?!:;()\-]/g, '')
        .trim();
      if (cleaned.length > 3 && /[a-zA-Z\u0590-\u05FF]{2,}/.test(cleaned)) {
        matches.push(cleaned);
      }
    }

    if (matches.length > 5) {
      return matches.join('\n');
    }
  } catch (e) {}

  return `// קובץ PDF מקורי: ${file.name}\nמסמך מקור שצורף למאגר הקורס (${(file.size / 1024).toFixed(1)} KB).`;
}

/**
 * Universal file reader returning a structured repository file item
 */
export async function parseRepositoryFile(file, forcedCategory = null) {
  const ext = file.name.split('.').pop().toLowerCase();
  let extractedText = '';
  let parsedJson = null;

  if (ext === 'json') {
    try {
      const raw = await file.text();
      parsedJson = JSON.parse(raw);
      extractedText = raw;
    } catch (e) {
      extractedText = await file.text();
    }
  } else if (ext === 'docx') {
    extractedText = await extractDocxText(file);
  } else if (ext === 'pdf') {
    extractedText = await extractPdfText(file);
  } else {
    try {
      extractedText = await file.text();
    } catch (e) {
      extractedText = '';
    }
  }

  const category = forcedCategory || autoClassifyFile(file.name, extractedText);

  return {
    id: `repo-file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    ext,
    sizeBytes: file.size,
    sizeFormatted: file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    category,
    content: extractedText,
    parsedJson,
    addedAt: Date.now()
  };
}
