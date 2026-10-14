import { useState, useEffect, useRef } from 'react';

const LEGACY_STORAGE_KEY = 'ds_course_progress_v1';
const getUserStorageKey = (userId) => `courseforge_progress_${userId || 'user-default'}_v1`;

const defaultProgress = () => ({
  version: 1,
  entries: {},
  updatedAt: Date.now()
});

class LocalStorageProvider {
  constructor(userId) {
    this.userId = userId || 'user-default';
  }

  setUserId(newId) {
    this.userId = newId || 'user-default';
  }

  async load() {
    try {
      const userKey = getUserStorageKey(this.userId);
      let data = localStorage.getItem(userKey);
      
      // Fallback: migrate legacy single-user progress to user-default if present
      if (!data && this.userId === 'user-default') {
        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyData) {
          data = legacyData;
          localStorage.setItem(userKey, legacyData);
        }
      }

      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load progress from localStorage', e);
    }
    return defaultProgress();
  }

  async save(data) {
    try {
      const userKey = getUserStorageKey(this.userId);
      localStorage.setItem(userKey, JSON.stringify(data));
      return data;
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
      throw e;
    }
  }
}

export function useProgressStore(userId = 'user-default') {
  const [progress, setProgress] = useState(defaultProgress);
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState(null);
  const [email, setEmail] = useState(null);
  const [sync, setSync] = useState('');

  const storage = useRef(new LocalStorageProvider(userId));
  const currentProgress = useRef(defaultProgress());

  const updateState = (newProg) => {
    currentProgress.current = newProg;
    setProgress(newProg);
  };

  const persist = (data) => {
    storage.current.save(data).catch(e => {
      setSync('השמירה המקומית נכשלה: ' + e.message);
    });
  };

  // Reload progress whenever active user changes
  useEffect(() => {
    let active = true;
    storage.current.setUserId(userId);
    setReady(false);

    storage.current.load().then(data => {
      if (active) {
        updateState(data);
        setReady(true);
        setSync('מסונכרן מקומית');
      }
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const put = (key, value) => {
    const now = Math.max(Date.now(), currentProgress.current.updatedAt + 1);
    const updated = {
      version: 1,
      entries: {
        ...currentProgress.current.entries,
        [key]: { value, updatedAt: now }
      },
      updatedAt: now
    };
    updateState(updated);
    persist(updated);
  };

  const importFile = async (rawJson) => {
    try {
      const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
      const merged = {
        version: 1,
        entries: {
          ...currentProgress.current.entries,
          ...(parsed.entries || {})
        },
        updatedAt: Date.now()
      };
      await storage.current.save(merged);
      updateState(merged);
      setSync('הנתונים יובאו בהצלחה');
      return true;
    } catch (e) {
      setSync('שגיאה בייבוא הנתונים: ' + e.message);
      return false;
    }
  };

  const exportData = () => {
    return JSON.stringify(currentProgress.current, null, 2);
  };

  const clearAll = async () => {
    const empty = defaultProgress();
    await storage.current.save(empty);
    updateState(empty);
    setSync('ההתקדמות אופסה');
  };

  return {
    progress,
    ready,
    put,
    account,
    email,
    sync,
    setSync,
    importFile,
    exportData,
    clearAll
  };
}
