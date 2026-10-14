import React, { createContext, useContext, useState, useEffect } from 'react';

const USERS_STORAGE_KEY = 'courseforge_users_v2';
const ACTIVE_USER_STORAGE_KEY = 'courseforge_active_user_v2';

const DEFAULT_USERS = [
  {
    id: 'user-default',
    name: 'יובל מלכי',
    email: 'yuval@campus.ac.il',
    avatar: '🎓',
    targetGrade: 95,
    institution: 'המסלול האקדמי המכללה למינהל',
    degree: 'מדעי המחשב .B.Sc',
    studyStreak: 7,
    createdAt: Date.now()
  }
];

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed loading users from storage', e);
    }
    return DEFAULT_USERS;
  });

  const [activeUserId, setActiveUserId] = useState(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return DEFAULT_USERS[0].id;
  });

  // Persist users list
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  // Persist active user ID
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, activeUserId);
    } catch (e) {}
  }, [activeUserId]);

  const currentUser = users.find(u => u.id === activeUserId) || users[0] || DEFAULT_USERS[0];

  const switchUser = (userId) => {
    if (users.some(u => u.id === userId)) {
      setActiveUserId(userId);
    }
  };

  const createUser = ({ name, email, avatar = '🎓', targetGrade = 90, institution = '', degree = '' }) => {
    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'סטודנט חדש',
      email: email?.trim() || '',
      avatar,
      targetGrade: Number(targetGrade) || 90,
      institution: institution.trim() || 'מוסד אקדמי',
      degree: degree.trim() || 'תואר ראשון',
      studyStreak: 1,
      createdAt: Date.now()
    };

    setUsers(prev => [...prev, newUser]);
    setActiveUserId(newUser.id);
    return newUser;
  };

  const updateUser = (userId, updates) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...updates, updatedAt: Date.now() } : u))
    );
  };

  const deleteUser = (userId) => {
    if (users.length <= 1) {
      alert('לא ניתן למחוק את הפרופיל היחיד במערכת.');
      return false;
    }
    const remaining = users.filter(u => u.id !== userId);
    setUsers(remaining);
    if (activeUserId === userId) {
      setActiveUserId(remaining[0].id);
    }
    return true;
  };

  return (
    <UserContext.Provider
      value={{
        users,
        activeUserId,
        currentUser,
        switchUser,
        createUser,
        updateUser,
        deleteUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
