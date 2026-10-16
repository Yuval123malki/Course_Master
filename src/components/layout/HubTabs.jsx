import React from 'react';
import {
  Home,
  Calendar,
  BarChart2,
  BookOpen,
  FlaskConical,
  Clock,
  Map,
  HelpCircle,
  Timer,
  FileText,
  Shapes,
  Layers,
  CheckSquare,
  AlertTriangle,
  Bookmark,
  Settings,
  Info,
  FolderArchive
} from 'lucide-react';
import { navigate } from '../../utils/dom';

const HUBS = [
  {
    routes: ['home', 'calendar', 'progress', 'plan'],
    tabs: [
      { path: 'home', label: 'סקירה יומית', icon: <Home size={15} /> },
      { path: 'calendar', label: 'יומן בחינה ויעדים', icon: <Calendar size={15} /> },
      { path: 'progress', label: 'מדדי שליטה', icon: <BarChart2 size={15} /> }
    ]
  },
  {
    routes: ['chapters', 'lab', 'complexity', 'map', 'tools'],
    tabs: [
      { path: 'chapters', label: 'פרקי הקורס', icon: <BookOpen size={15} /> },
      { path: 'lab', label: 'מעבדה חיה', icon: <FlaskConical size={15} /> },
      { path: 'complexity', label: 'סיבוכיות ונוסחאות', icon: <Clock size={15} /> },
      { path: 'map', label: 'מפת הקורס', icon: <Map size={15} /> }
    ]
  },
  {
    routes: ['practice', 'simulations', 'exams', 'patterns'],
    tabs: [
      { path: 'practice', label: 'בנק שאלות', icon: <HelpCircle size={15} /> },
      { path: 'simulations', label: 'סימולציות מבחן', icon: <Timer size={15} /> },
      { path: 'exams', label: 'ארכיון מבחנים', icon: <FileText size={15} /> },
      { path: 'patterns', label: 'תבניות פתרון', icon: <Shapes size={15} /> }
    ]
  },
  {
    routes: ['cards', 'review', 'errors', 'bookmarks'],
    tabs: [
      { path: 'cards', label: 'כרטיסיות זיכרון', icon: <Layers size={15} /> },
      { path: 'review', label: 'דף נוסחאות ויום לפני', icon: <CheckSquare size={15} /> },
      { path: 'errors', label: 'מאגר טעויות', icon: <AlertTriangle size={15} /> },
      { path: 'bookmarks', label: 'שאלות שמורות', icon: <Bookmark size={15} /> }
    ]
  },
  {
    routes: ['settings', 'help', 'sources'],
    tabs: [
      { path: 'settings', label: 'הגדרות וגיבוי', icon: <Settings size={15} /> },
      { path: 'sources', label: 'מאגר קבצים ומקורות', icon: <FolderArchive size={15} /> },
      { path: 'help', label: 'מדריך שימוש', icon: <Info size={15} /> }
    ]
  }
];

export function HubTabs({ currentRoute }) {
  const matchedHub = HUBS.find(h => h.routes.includes(currentRoute));
  if (!matchedHub) return null;

  return (
    <div className="hub-tabs-bar" role="tablist" aria-label="תתי-קטגוריות">
      {matchedHub.tabs.map(tab => {
        const isActive = currentRoute === tab.path;
        return (
          <button
            key={tab.path}
            role="tab"
            aria-selected={isActive}
            className={`hub-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
