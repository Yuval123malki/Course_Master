import courseData from '../../../data/courseData.json';
import examsData from '../../../data/examsData.json';
import patternsData from '../../../data/patternsData.json';
import syllabusData from '../../../data/syllabusData.json';
import inventoryData from '../../../data/inventoryData.json';

const vercelCourseData = {
  ...courseData,
  COURSE: {
    ...courseData.COURSE,
    name: 'מבני נתונים (גרסת Vercel - 623411)',
    nameEn: 'Data Structures (Vercel Edition)',
    srcNote: 'עותק מלא המסונכרן ישירות מול https://site-teal-alpha-64.vercel.app/ עם סילבוס, שאלות, סימולציות ומבחנים.'
  }
};

export const dataStructuresVercelCourse = {
  id: 'ds-vercel',
  category: 'cs',
  categoryLabel: 'מדעי המחשב',
  badgeColor: '#0ea5e9',
  icon: 'Binary',
  courseData: vercelCourseData,
  examsData,
  patternsData,
  syllabusData,
  inventoryData
};
