/**
 * CourseCompiler: Synthesizes an entire Course Repository (syllabus files, lecture summaries,
 * past exam files, formula sheets, and manual chapters/notes) into a complete,
 * interactive CourseForge course dataset.
 */

export function compileCourseFromSources({
  title,
  titleEn,
  code,
  institution,
  category = 'cs',
  credits = '4.00',
  lecturers = '',
  tutors = '',
  prereq = '',
  year = 'תשפ״ו',
  semester = 'סמסטר א׳',
  examDuration = '3 שעות',
  examStructure = 'שאלות פתוחות ושאלות ברירה',
  syllabusRaw = '',
  studyMaterialsRaw = '',
  examsRaw = '',
  uploadedFiles = [],
  repositoryFiles = [],
  customTopicsList = []
}) {
  const courseId = `course-${(code || title || 'c').replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '').toLowerCase().slice(0, 16)}-${Date.now().toString().slice(-4)}`;

  // Separate repository files by their classification
  const syllabusRepoFiles = repositoryFiles.filter(f => f.category === 'syllabus');
  const summaryRepoFiles = repositoryFiles.filter(f => f.category === 'summary');
  const examRepoFiles = repositoryFiles.filter(f => f.category === 'exam');
  const formulaRepoFiles = repositoryFiles.filter(f => f.category === 'formula');

  // Combine raw texts with repository file contents
  const combinedSyllabusText = [
    syllabusRaw,
    ...syllabusRepoFiles.map(f => f.content || '')
  ].filter(Boolean).join('\n\n');

  const combinedSummariesText = [
    studyMaterialsRaw,
    ...summaryRepoFiles.map(f => `### מקור: ${f.name}\n${f.content || ''}`)
  ].filter(Boolean).join('\n\n');

  const combinedExamsText = [
    examsRaw,
    ...examRepoFiles.map(f => `// קובץ בחינה: ${f.name}\n${f.content || ''}`)
  ].filter(Boolean).join('\n\n');

  const combinedFormulasText = formulaRepoFiles
    .map(f => f.content || '')
    .filter(Boolean)
    .join('\n\n');

  // 1. Extract topics from customTopicsList, combinedSyllabusText, or summary file names
  let rawTopicTitles = customTopicsList.map(t => t.trim()).filter(Boolean);

  if (rawTopicTitles.length === 0 && combinedSyllabusText) {
    rawTopicTitles = combinedSyllabusText
      .split('\n')
      .map(l => l.replace(/^[0-9]+[.\-)]\s*/, '').replace(/^[-*•#]+\s*/, '').trim())
      .filter(l => l.length > 2 && l.length < 110 && !l.startsWith('//') && !l.includes('סילבוס'));
  }

  // If still empty, derive chapters from summary files in the repository
  if (rawTopicTitles.length === 0 && summaryRepoFiles.length > 0) {
    rawTopicTitles = summaryRepoFiles.map(f =>
      f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim()
    );
  }

  // Parse combinedSummariesText into paragraphs/sections
  const noteChunks = combinedSummariesText
    .split(/\n{2,}/)
    .map(c => c.trim())
    .filter(c => c.length > 10);

  const parsedTopics = rawTopicTitles.map((cleanTitle, idx) => {
    const topicNum = idx + 1;
    const topicId = `topic-${topicNum}`;
    const shortTag = cleanTitle.split(/[\s—–-]/).slice(0, 2).join(' ') || `פרק ${topicNum}`;

    // Match summary files or note chunks to this chapter
    const titleWords = cleanTitle.split(/\s+/).filter(w => w.length > 2);
    const matchingSummaryFiles = summaryRepoFiles.filter(f =>
      titleWords.some(w => f.name.includes(w) || (f.content || '').slice(0, 400).includes(w))
    );

    const matchingChunks = noteChunks.filter(chunk =>
      titleWords.some(w => chunk.includes(w))
    );

    // Build sections for this chapter
    const sections = [];

    if (matchingSummaryFiles.length > 0) {
      matchingSummaryFiles.forEach((sf, sIdx) => {
        const cleanBody = (sf.content || '')
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean)
          .map(l => `<p>${l}</p>`)
          .join('');
        sections.push({
          h: `${sf.name.replace(/\.[^/.]+$/, '')}`,
          html: cleanBody || `<p>סיכום מתוך הקובץ <b>${sf.name}</b>.</p>`
        });
      });
    } else if (matchingChunks.length > 0) {
      sections.push({
        h: `עקרונות יסוד והגדרות — ${cleanTitle}`,
        html: matchingChunks.map(c => `<p>${c.replace(/\n/g, '<br/>')}</p>`).join('')
      });
    } else if (summaryRepoFiles[idx]) {
      const sf = summaryRepoFiles[idx];
      sections.push({
        h: `${cleanTitle} (${sf.name.replace(/\.[^/.]+$/, '')})`,
        html: (sf.content || '')
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean)
          .map(l => `<p>${l}</p>`)
          .join('') || `<p>פרק זה מבוסס על קובץ המקור <b>${sf.name}</b>.</p>`
      });
    } else {
      sections.push({
        h: `עקרונות יסוד והגדרות — ${cleanTitle}`,
        html: `
          <p>פרק זה עוסק ב<b>${cleanTitle}</b> כפי שנלמד במסגרת הקורס <b>${title}</b>.</p>
          <div class="card">
            <div class="ttl">מושגי מפתח והגדרות</div>
            <p>הקפד לשלוט בהגדרות הפורמליות של <b>${cleanTitle}</b>, בתנאי המשפטים ובאופן היישום שלהם בשאלות בחינה.</p>
          </div>
        `
      });
    }

    sections.push({
      h: `דגשים לפתרון שאלות מבחן ב-${shortTag}`,
      html: `
        <p>בעת פתרון שאלת בחינה בנושא <b>${cleanTitle}</b>:</p>
        <ol>
          <li>רשום במפורש את ההגדרות והנתונים מתוך השאלה.</li>
          <li>זהה איזה משפט או אלגוריתם מתוך הפרק מתאים למבנה הנתון.</li>
          <li>בדוק מקרי קצה לפני ניסוח המסקנה הסופית.</li>
        </ol>
      `
    });

    const sourceNames = matchingSummaryFiles.length > 0
      ? matchingSummaryFiles.map(f => f.name)
      : [`הרצאה ${topicNum}`, `תרגול ${topicNum}`];

    return {
      id: topicId,
      n: topicNum,
      title: cleanTitle,
      tag: shortTag,
      prio: topicNum <= Math.ceil(rawTopicTitles.length * 0.45) ? 'A' : 'B',
      syl: `פרק ${topicNum} בסילבוס הקורס: ${cleanTitle}`,
      srcs: sourceNames,
      why: `נושא ליבה ב-${title} המופיע בשאלות ההוכחה והחישוב במבחני הקורס.`,
      sec: sections
    };
  });

  const finalTopics = parsedTopics.length > 0 ? parsedTopics : [
    {
      id: 'topic-1',
      n: 1,
      title: 'מבוא והגדרות יסוד',
      tag: 'מבוא',
      prio: 'A',
      syl: 'מושגי יסוד, סימונים והגדרות בסיסיות בקורס',
      srcs: ['הרצאה 1'],
      why: 'הבסיס לכל פרקי ההמשך בקורס.',
      sec: [
        {
          h: 'מושגי פתיחה',
          html: combinedSummariesText
            ? `<p>${combinedSummariesText.replace(/\n/g, '<br/>')}</p>`
            : `<p>יחידת הלימוד הראשונה של הקורס <b>${title}</b>.</p>`
        }
      ]
    },
    {
      id: 'topic-2',
      n: 2,
      title: 'משפטים מרכזיים ושיטות פתרון',
      tag: 'שיטות',
      prio: 'A',
      syl: 'טכניקות פתרון וניתוח שאלות ברמת בחינה',
      srcs: ['הרצאה 2'],
      why: 'הכלים המרכזיים לפתרון שאלות במבחן הסופי.',
      sec: [
        {
          h: 'טכניקות עבודה',
          html: `<p>העמקה בשיטות ההוכחה והחישוב המרכזיות של הקורס.</p>`
        }
      ]
    }
  ];

  // 2. Parse Questions from examRepoFiles & examsRaw
  const generatedQuestions = [];
  const generatedExamsArchive = [];

  // Process each uploaded Past Exam file into an Archive Entry + Extracted Questions
  examRepoFiles.forEach((examFile, eIdx) => {
    const cleanExamName = examFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const yearMatch = cleanExamName.match(/202[0-9]|תשפ["״]?[א-ת]/);
    const examYear = yearMatch ? yearMatch[0] : '2025';
    const blocks = (examFile.content || '')
      .split(/(?=שאלה\s*\d+|Question\s*\d+|Q\s*\d+|\n\d+[.)]\s)/i)
      .map(b => b.trim())
      .filter(b => b.length > 15);

    const examQuestionIds = [];

    if (blocks.length > 0) {
      blocks.slice(0, 12).forEach((block, bIdx) => {
        const parts = block.split(/פתרון:|Solution:|תשובה:|נימוק:/i);
        const qBody = (parts[0] || block).replace(/^(שאלה\s*\d+|Question\s*\d+|\d+[.)])[:.\-) ]*/i, '').trim();
        if (qBody.length < 8) return;

        const solBody = parts[1]
          ? `<p>${parts[1].trim().replace(/\n/g, '<br/>')}</p>`
          : `<p>פתרון מלא מבוסס על הגדרות הקורס ומשפטי המפתח מתוך קובץ הבחינה <b>${examFile.name}</b>.</p>`;

        // Match question to the most relevant topic by keyword
        let matchedTopic = finalTopics[(eIdx + bIdx) % finalTopics.length];
        for (const t of finalTopics) {
          const words = t.title.split(/\s+/).filter(w => w.length > 3);
          if (words.some(w => qBody.includes(w))) {
            matchedTopic = t;
            break;
          }
        }

        const qId = `Q-${String(generatedQuestions.length + 1).padStart(2, '0')}`;
        examQuestionIds.push({
          id: qId,
          practiceId: qId,
          number: `שאלה ${bIdx + 1}`,
          summary: qBody.slice(0, 75) + (qBody.length > 75 ? '...' : ''),
          topic: matchedTopic.title,
          type: 'שאלת מבחן מקורית'
        });

        generatedQuestions.push({
          id: qId,
          topic: matchedTopic.id,
          lvl: (bIdx % 3) + 1,
          type: 'שאלת מבחן',
          skill: matchedTopic.tag,
          origin: 'orig',
          src: `${cleanExamName}`,
          q: `<p>${qBody.replace(/\n/g, '<br/>')}</p>`,
          hints: [
            `הגדר תחילה את המושגים המרכזיים מפרק "${matchedTopic.title}".`,
            `בדוק אילו תנאים מוקדמים מתקיימים והפעל את המשפט המתאים.`
          ],
          sol: solBody,
          check: 'ודא שכל שלבי המעבר מנומקים ושאין הנחות סמויות.',
          mistake: 'הפעלת משפט ללא בדיקת תנאי הסף או התעלמות ממקרי קצה.',
          rubric: 'זיהוי השיטה (30%), פיתוח תקין (50%), נימוק מלא (20%).'
        });
      });
    }

    // Even if binary PDF/DOCX had no split blocks, create a dedicated question & archive record for the exam file
    if (examQuestionIds.length === 0) {
      const targetTopic = finalTopics[eIdx % finalTopics.length];
      const qId = `Q-${String(generatedQuestions.length + 1).padStart(2, '0')}`;
      examQuestionIds.push({
        id: qId,
        practiceId: qId,
        number: 'שאלה 1',
        summary: `שאלה מרכזית מתוך ${cleanExamName}`,
        topic: targetTopic.title,
        type: 'מבחן עבר'
      });
      generatedQuestions.push({
        id: qId,
        topic: targetTopic.id,
        lvl: 3,
        type: 'שאלת מבחן',
        skill: targetTopic.tag,
        origin: 'orig',
        src: cleanExamName,
        q: `<p>שאלת בחינה מתוך <b>${cleanExamName}</b> בנושא <b>${targetTopic.title}</b>: נתח את הנתונים, הוכח או הפרך את הטענה המרכזית ונמק כל שלב.</p>`,
        hints: [`היעזר בהגדרות הפרק "${targetTopic.title}".`],
        sol: `<p>יש לפרק את הטענה לשלבים לוגיים על בסיס המשפטים שנלמדו בפרק ולבדוק מקרי קצה.</p>`,
        check: 'בדוק עקביות עם הגדרות הקורס.',
        mistake: 'הנחה סמויה ללא הוכחה.',
        rubric: 'הגדרה (25%), הוכחה/חישוב (55%), נימוק (20%).'
      });
    }

    generatedExamsArchive.push({
      id: `exam-${courseId}-${eIdx + 1}`,
      name: cleanExamName,
      year: examYear,
      term: 'א׳',
      moed: cleanExamName.includes('ב') ? 'ב׳' : 'א׳',
      group: 'main-paper',
      questions: examQuestionIds
    });
  });

  // Also parse any manually pasted examsRaw
  if (examsRaw.trim()) {
    const manualBlocks = examsRaw
      .split(/(?=שאלה\s*\d+|Question\s*\d+|Q\d+)/i)
      .map(b => b.trim())
      .filter(b => b.length > 10);

    manualBlocks.forEach((block, idx) => {
      const parts = block.split(/פתרון:|Solution:|תשובה:/i);
      const qText = (parts[0] || block).replace(/^שאלה\s*\d+[:.\-) ]*/i, '').trim();
      const solText = parts[1]
        ? `<p>${parts[1].trim().replace(/\n/g, '<br/>')}</p>`
        : `<p>פרק את השאלה לשלבים לוגיים על בסיס המשפטים שנלמדו בפרק, ונמק כל מעבר.</p>`;
      const targetTopic = finalTopics[idx % finalTopics.length];
      const qId = `Q-${String(generatedQuestions.length + 1).padStart(2, '0')}`;

      generatedQuestions.push({
        id: qId,
        topic: targetTopic.id,
        lvl: (idx % 3) + 1,
        type: 'שאלת בחינה',
        skill: targetTopic.tag,
        origin: 'orig',
        src: `מבחן ב-${title}`,
        q: `<p>${qText.replace(/\n/g, '<br/>')}</p>`,
        hints: [
          `הגדר תחילה את המושגים המופיעים בשאלה מתוך פרק "${targetTopic.title}".`,
          `בדוק אילו תנאים מתקיימים והשתמש במשפט המרכזי של הפרק.`
        ],
        sol: solText,
        check: 'ודא שכל המעברים מנומקים ושאין הנחות סמויות.',
        mistake: 'דילוג על בדיקת תנאי הסף של המשפט.',
        rubric: 'זיהוי השיטה (30%), פיתוח תקין (50%), נימוק מלא (20%).'
      });
    });
  }

  // Ensure every chapter has at least one practice question
  finalTopics.forEach((t) => {
    const hasQ = generatedQuestions.some(q => q.topic === t.id);
    if (!hasQ) {
      const qId = `Q-${String(generatedQuestions.length + 1).padStart(2, '0')}`;
      generatedQuestions.push({
        id: qId,
        topic: t.id,
        lvl: 2,
        type: category === 'math' ? 'הוכחה וחישוב' : 'שאלה פתוחה',
        skill: t.tag,
        origin: 'orig',
        src: `תרגול ליבה — ${t.title}`,
        q: `<p>נסחו והסבירו את העיקרון המרכזי של <b>${t.title}</b>, והדגימו כיצד הוא משמש לפתרון בעיה טיפוסית בבחינה.</p>`,
        hints: [
          `התחילו מרישום ההגדרה המדויקת של ${t.tag}.`,
          `הראו דוגמה קונקרטית ובדקו שהיא מקיימת את כל הדרישות.`
        ],
        sol: `
          <p><b>שלבי הפתרון המלא:</b></p>
          <ol>
            <li><b>הגדרה פורמלית:</b> מציגים את ההגדרה המדויקת של ${t.title}.</li>
            <li><b>יישום:</b> מראים שלב אחר שלב כיצד התנאים מתקיימים במקרה הנתון.</li>
            <li><b>בדיקת קצה:</b> מוודאים שהפתרון תקף גם במקרי גבול.</li>
          </ol>
        `,
        check: 'האם כל שלב בפתרון מסתמך על הגדרה או משפט מהפרק?',
        mistake: 'הסתפקות בדוגמה פרטית כאשר נדרש נימוק כללי.',
        rubric: 'הגדרה (25%), פיתוח הפתרון (55%), בדיקה ונימוק (20%).'
      });
    }
  });

  if (generatedExamsArchive.length === 0) {
    generatedExamsArchive.push({
      id: `exam-${courseId}-1`,
      name: `מבחן לדוגמה ב-${title}`,
      year: 2026,
      term: 'א׳',
      moed: 'א׳',
      group: 'main-paper',
      questions: generatedQuestions.map(q => q.id)
    });
  }

  // 3. Synthesize Flashcards
  const generatedCards = finalTopics.map((t, idx) => ({
    id: `card-${idx + 1}`,
    topic: t.id,
    q: `${t.title} — מהו עקרון המפתח והדגש המרכזי לבחינה?`,
    a: `שליטה בהגדרה הפורמלית של ${t.tag}, בדיקת תנאי המשפט לפני הפעלתו, והקפדה על מקרי קצה.`
  }));

  // 4. Synthesize Pitfalls
  const generatedPitfalls = finalTopics.map(t => ({
    t: `מלכודת נפוצה ב${t.title}`,
    why: `הפעלת הנוסחה או המשפט של ${t.tag} מבלי לוודא שתנאי הסף מתקיימים.`,
    right: `תמיד לציין בתחילת הפתרון מדוע התנאים מתקיימים ורק אז להסיק את המסקנה.`,
    topic: t.id,
    sev: 'high'
  }));

  // 5. Synthesize Exam Simulations
  const generatedSims = [
    {
      id: `sim-${courseId}-1`,
      title: `סימולציית מבחן מלאה — ${title}`,
      level: 'מבחן סופי',
      meta: {
        duration: examDuration,
        shape: `${generatedQuestions.length} שאלות מתוך מאגר הבחינות`
      },
      items: generatedQuestions.slice(0, 8).map(q => ({
        id: q.id,
        part: 'open',
        title: `${q.id} · ${q.skill}`,
        q: q.q,
        sol: q.sol
      }))
    }
  ];

  // 6. Synthesize Formula Groups (including any uploaded formula files)
  const formulaItems = finalTopics.map(t => ({
    k: t.title,
    v: t.tag,
    n: t.why
  }));

  if (combinedFormulasText) {
    combinedFormulasText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 4)
      .slice(0, 15)
      .forEach((line, idx) => {
        const [k, ...rest] = line.split(/[:=—–-]/);
        formulaItems.unshift({
          k: (k || `נוסחה ${idx + 1}`).trim(),
          v: rest.length > 0 ? rest.join(' = ').trim() : line,
          n: 'חולץ מקובץ נוסחאות במאגר הקורס'
        });
      });
  }

  // 7. Build full Repository Inventory
  const categoryLabelsMap = {
    syllabus: 'סילבוס ותוכנית קורס',
    summary: 'סיכומים והרצאות',
    exam: 'מבחני עבר ופתרונות',
    formula: 'דף נוסחאות'
  };

  const finalInventory = [
    ...repositoryFiles.map(f => ({
      id: f.id,
      filename: f.name,
      path: `${f.category}/${f.name}`,
      size: f.sizeFormatted,
      classification: categoryLabelsMap[f.category] || 'מסמך מקור',
      preview: (f.content || '').slice(0, 300)
    })),
    ...uploadedFiles
  ];

  const categoryLabels = {
    math: 'מתמטיקה ומדעים מדויקים',
    cs: 'מדעי המחשב',
    web: 'פיתוח תוכנה',
    general: 'קורס אקדמי'
  };

  return {
    id: courseId,
    category,
    categoryLabel: categoryLabels[category] || 'קורס אקדמי',
    badgeColor: 'var(--primary)',
    isCustom: true,
    courseData: {
      COURSE: {
        name: title,
        nameEn: titleEn || title,
        code: code || '',
        inst: institution || 'מוסד אקדמי',
        year,
        semester,
        credits: `${credits} נ"ז`,
        lecturers: lecturers || 'צוות הקורס',
        tutors: tutors || '',
        prereq: prereq || ''
      },
      EXAM_FORMAT: {
        time: examDuration,
        aids: 'דף נוסחאות',
        structure: examStructure
      },
      TOPICS: finalTopics,
      QUESTIONS: generatedQuestions,
      SIMS: generatedSims,
      CARDS: generatedCards,
      PITFALLS: generatedPitfalls,
      PLANS: [
        {
          id: 'standard',
          title: 'תוכנית לימוד מומלצת',
          days: finalTopics.map((t, idx) => ({
            d: idx + 1,
            learn: `פרק ${idx + 1}: ${t.title}`,
            drill: `פתרון שאלות בנושא ${t.tag}`,
            note: 'קריאת הפרק ותרגול מעשי'
          }))
        }
      ],
      CONFLICTS: [],
      TBL_STRUCT: {
        cols: ['פרק', 'נושא מרכזי', 'עדיפות', 'מקורות במאגר'],
        rows: finalTopics.map(t => [`פרק ${t.n}`, t.title, `עדיפות ${t.prio}`, (t.srcs || []).join(', ')])
      },
      TBL_SORT: {
        cols: ['נושא', 'שיטת עבודה', 'מקרה קצה לבדיקה'],
        rows: finalTopics.map(t => [t.title, t.tag, 'ערכי קיצון / קלט ריק']),
        notes: []
      },
      FORMULAS: [
        {
          g: `נוסחאות ומושגי מפתח — ${title}`,
          src: formulaRepoFiles.length > 0 ? formulaRepoFiles.map(f => f.name).join(', ') : 'מאגר הקורס',
          items: formulaItems
        }
      ],
      LASTMIN: [
        {
          h: `דגשים לקראת הבחינה ב-${title}`,
          body: `<p>עברו על כל הגדרות היסוד מתוך ${finalTopics.length} הפרקים, תרגלו את ${generatedQuestions.length} השאלות שחולצו ממאגר המבחנים, והקפידו על חלוקת זמן נכונה (${examDuration}).</p>`
        }
      ]
    },
    examsData: {
      methodology: {
        denominator: generatedExamsArchive.length,
        topLevelQuestionCount: generatedQuestions.length,
        recentDenominator: generatedExamsArchive.length
      },
      exams: generatedExamsArchive,
      frequency: finalTopics.map(t => ({
        topic: t.id,
        examCount: 1,
        denominator: 1
      })),
      recentFrequency: [],
      year2026Frequency: []
    },
    syllabusData: {
      topics: finalTopics.map(t => ({
        id: t.id,
        name: t.title,
        subtopics: [t.tag]
      })),
      notInSyllabus: []
    },
    patternsData: {
      patterns: finalTopics.slice(0, 4).map((t, i) => ({
        id: `pat-${i + 1}`,
        name: `תבנית פתרון: ${t.title}`,
        priority: t.prio,
        examCount: 1,
        denominator: 1,
        method: `זיהוי נתוני השאלה ב-${t.tag}, הצבת הגדרות הפרק ופיתוח שלב-אחר-שלב.`,
        tips: 'נמק כל מעבר והימנע מהנחות לא מוכחות.'
      }))
    },
    inventoryData: finalInventory
  };
}
