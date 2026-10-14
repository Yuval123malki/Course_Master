import React from 'react';
import { Home, BookOpen, HelpCircle, Timer, BarChart2 } from 'lucide-react';

export function MobileNav({ currentRoute }) {
  const tabs = [
    { path: 'home', label: 'בית', icon: <Home size={21} /> },
    { path: 'chapters', label: 'ללמוד', icon: <BookOpen size={21} /> },
    { path: 'practice', label: 'לתרגל', icon: <HelpCircle size={21} /> },
    { path: 'simulations', label: 'מבחן', icon: <Timer size={21} /> },
    { path: 'progress', label: 'התקדמות', icon: <BarChart2 size={21} /> }
  ];

  const isCurrent = (path) => {
    if (currentRoute === path) return true;
    if (path === 'chapters' && currentRoute.startsWith('chapter/')) return true;
    if (path === 'practice' && currentRoute.startsWith('question/')) return true;
    if (path === 'simulations' && currentRoute.startsWith('sim/')) return true;
    return false;
  };

  return (
    <nav className="mobile-bottom site-footer" aria-label="ניווט מהיר">
      {tabs.map(item => (
        <a
          key={item.path}
          href={`#/${item.path}`}
          className={isCurrent(item.path) ? 'active' : ''}
          aria-current={isCurrent(item.path) ? 'page' : undefined}
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
