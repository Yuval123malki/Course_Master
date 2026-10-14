import courseData from '../../data/courseData.json';
import examsData from '../../data/examsData.json';
import patternsData from '../../data/patternsData.json';
import syllabusData from '../../data/syllabusData.json';
import inventoryData from '../../data/inventoryData.json';

export {
  courseData,
  examsData,
  patternsData,
  syllabusData,
  inventoryData
};

export const {
  COURSE,
  EXAM_FORMAT,
  CONVENTIONS,
  CONFLICTS,
  PRIORITY_LEGEND,
  PLANS,
  STATUSES,
  SOURCES,
  COVERAGE,
  SYLLABUS,
  NOT_TAUGHT,
  COURSEMAP,
  PRIORITY_NOTE,
  PRIORITIES,
  PRIORITY_D,
  TOP_PATTERNS_NOTE,
  TOPICS,
  TOPIC_NAMES,
  TASK_TYPES,
  EXAMS,
  PATTERN_DENOM,
  PATTERNS,
  RECENT_STYLE,
  QUESTIONS,
  SIMS,
  TBL_STRUCT,
  TBL_SORT,
  CHOOSE,
  RECOG,
  TEMPLATES,
  PITFALLS,
  CARDS,
  LASTMIN,
  FORMULA_WARN,
  FORMULAS
} = courseData;

export const topicsMap = Object.fromEntries(TOPICS.map(t => [t.id, t]));
