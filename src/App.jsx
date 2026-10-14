import React, { useState, useEffect } from 'react';
import { CourseProvider, useCourse } from './context/CourseStore';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, useUser } from './context/UserContext';
import { useProgressStore } from './context/ProgressStore';
import { currentRoute, navigate } from './utils/dom';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav, Footer } from './components/layout/MobileNav';
import { SearchDialog } from './components/search/SearchDialog';
import { UserModal } from './components/account/UserModal';
import { SummaryExportModal } from './components/common/SummaryExportModal';

// Pages
import { MasterDashboard } from './pages/MasterDashboard';
import { CourseEditorPage } from './pages/CourseEditorPage';
import { HomePage } from './pages/HomePage';
import { CalendarPage } from './pages/CalendarPage';
import { StudyPackPage } from './pages/StudyPackPage';
import { CourseMapPage } from './pages/CourseMapPage';
import { StudyPlanPage } from './pages/StudyPlanPage';
import { ChaptersPage } from './pages/ChaptersPage';
import { ChapterDetailPage } from './pages/ChapterDetailPage';
import { LabPage } from './pages/LabPage';
import { ComplexityPage } from './pages/ComplexityPage';
import { ToolsPage } from './pages/ToolsPage';
import { ReviewPage } from './pages/ReviewPage';
import { PracticePage } from './pages/PracticePage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { CardsPage } from './pages/CardsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { SimulationsPage } from './pages/SimulationsPage';
import { SimulationDetailPage } from './pages/SimulationDetailPage';
import { ExamsPage } from './pages/ExamsPage';
import { PatternsPage } from './pages/PatternsPage';
import { ErrorsPage } from './pages/ErrorsPage';
import { ProgressPage } from './pages/ProgressPage';
import { SourcesPage } from './pages/SourcesPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { PrivacyPage, TermsPage, CookiesPage, AccessibilityPage } from './pages/LegalPages';

function AppContent() {
  const [route, setRoute] = useState(currentRoute);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isExportPdfOpen, setExportPdfOpen] = useState(false);

  const { activeUserId } = useUser();
  const store = useProgressStore(activeUserId);
  const { activeCourse } = useCourse();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(currentRoute());
      setMobileOpen(false);
      setSearchOpen(false);
      setAccountOpen(false);
      setExportPdfOpen(false);
    };

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAccountOpen(false);
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setAccountOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const renderContent = () => {
    if (!store.ready) {
      return <div className="surface">טוען את המערכת...</div>;
    }

    // Studio & Master Dashboard Routes
    if (route === 'courses' || route === 'studio') {
      return <MasterDashboard />;
    }
    if (route.startsWith('studio/edit/')) {
      const editCourseId = route.replace('studio/edit/', '');
      return <CourseEditorPage courseId={editCourseId} />;
    }

    // Course Study Routes
    if (route === 'home') return <HomePage store={store} openExportPdf={() => setExportPdfOpen(true)} />;
    if (route === 'studypack') return <StudyPackPage store={store} />;
    if (route === 'calendar') return <CalendarPage store={store} />;
    if (route === 'map') return <CourseMapPage />;
    if (route === 'plan') return <StudyPlanPage store={store} />;
    if (route === 'chapters') return <ChaptersPage store={store} />;
    if (route.startsWith('chapter/')) {
      return (
        <ChapterDetailPage
          id={route.split('/')[1]}
          store={store}
          focus={focusMode}
          setFocus={setFocusMode}
        />
      );
    }
    if (route === 'lab') return <LabPage />;
    if (route === 'complexity') return <ComplexityPage />;
    if (route === 'tools') return <ToolsPage />;
    if (route === 'review') return <ReviewPage />;
    if (route === 'practice') return <PracticePage store={store} />;
    if (route.startsWith('question/')) {
      return <QuestionDetailPage id={route.split('/')[1]} store={store} />;
    }
    if (route === 'cards') return <CardsPage store={store} />;
    if (route === 'bookmarks') return <BookmarksPage store={store} />;
    if (route === 'simulations') return <SimulationsPage store={store} />;
    if (route.startsWith('sim/')) {
      return <SimulationDetailPage key={route} id={route.split('/')[1]} store={store} />;
    }
    if (route === 'exams') return <ExamsPage />;
    if (route === 'patterns') return <PatternsPage />;
    if (route === 'errors') return <ErrorsPage store={store} />;
    if (route === 'progress') return <ProgressPage store={store} />;
    if (route === 'sources') return <SourcesPage />;
    if (route === 'settings') return <SettingsPage store={store} openAccount={() => setAccountOpen(true)} />;
    if (route === 'help') return <HelpPage />;
    if (route === 'privacy') return <PrivacyPage />;
    if (route === 'terms') return <TermsPage />;
    if (route === 'cookies') return <CookiesPage />;
    if (route === 'accessibility') return <AccessibilityPage />;

    return <HomePage store={store} />;
  };

  const isExamMode = route.startsWith('sim/');
  const shellClass = `app-shell ${focusMode ? 'focus-mode ' : ''}${isCollapsed ? 'collapsed ' : ''}${isExamMode ? 'exam-mode ' : ''}`;

  return (
    <div className={shellClass}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={e => {
          e.preventDefault();
          const main = document.getElementById('main-content');
          main?.focus();
          main?.scrollIntoView();
        }}
      >
        דלג לתוכן הראשי
      </a>

      <Sidebar
        currentRoute={route}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
        isCollapsed={isCollapsed}
        setCollapsed={setCollapsed}
        store={store}
      />

      {isMobileOpen && (
        <div className="drawer-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <div className="main-wrap">
        <Topbar
          currentRoute={route}
          setMobileOpen={setMobileOpen}
          openSearch={() => setSearchOpen(true)}
          openAccount={() => setAccountOpen(true)}
          openExportPdf={() => setExportPdfOpen(true)}
          store={store}
        />

        <main id="main-content" tabIndex={-1} className="main-content" key={`${activeCourse?.id}-${route}`}>
          {renderContent()}
        </main>

        <Footer />
      </div>

      <MobileNav currentRoute={route} />

      {isSearchOpen && <SearchDialog close={() => setSearchOpen(false)} />}
      {isAccountOpen && <UserModal store={store} close={() => setAccountOpen(false)} />}
      {isExportPdfOpen && <SummaryExportModal close={() => setExportPdfOpen(false)} />}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <CourseProvider>
          <AppContent />
        </CourseProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
