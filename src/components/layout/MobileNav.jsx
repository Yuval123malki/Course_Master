import React from 'react';
import { Home, BookOpen, HelpCircle, Layers, Wand2 } from 'lucide-react';

export function MobileNav({ currentRoute }) {
  const tabs = [
    { path: 'home', label: 'בית', icon: <Home size={19} />, match: ['home', 'calendar', 'progress', 'plan'] },
    { path: 'chapters', label: 'פרקים', icon: <BookOpen size={19} />, match: ['chapters', 'lab', 'complexity', 'map', 'tools'] },
    { path: 'practice', label: 'תרגול', icon: <HelpCircle size={19} />, match: ['practice', 'simulations', 'exams', 'patterns'] },
    { path: 'cards', label: 'חזרה', icon: <Layers size={19} />, match: ['cards', 'review', 'errors', 'bookmarks'] },
    { path: 'studypack', label: 'סיכומים', icon: <Wand2 size={19} />, match: ['studypack'] }
  ];

  const isCurrent = (item) => {
    if (currentRoute === item.path) return true;
    if (item.match?.includes(currentRoute)) return true;
    if (item.path === 'chapters' && currentRoute.startsWith('chapter/')) return true;
    if (item.path === 'practice' && (currentRoute.startsWith('question/') || currentRoute.startsWith('sim/'))) return true;
    return false;
  };

  return (
    <nav className="mobile-bottom" aria-label="ניווט מהיר">
      {tabs.map(item => (
        <a
          key={item.path}
          href={`#/${item.path}`}
          className={isCurrent(item) ? 'active' : ''}
          aria-current={isCurrent(item) ? 'page' : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="site-footer" aria-label="מידע על האתר">
      <a href="#/privacy">מדיניות פרטיות</a>
      <a href="#/terms">תנאי שימוש</a>
      <a href="#/cookies">קוקיז ואחסון</a>
      <a href="#/accessibility">הצהרת נגישות</a>
    </footer>
  );
}
