import React, { createContext, useContext, useEffect, useState } from 'react';

// Development mode AuthContext - no Firebase dependencies
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data for development
const mockUsers = {
  'admin@example.com': { email: 'admin@example.com', role: 'admin', displayName: 'Admin User' },
  'teacher@example.com': { email: 'teacher@example.com', role: 'teacher', displayName: 'Teacher User' },
  'student@example.com': { email: 'student@example.com', role: 'student', displayName: 'Student User' },
  'parent@example.com': { email: 'parent@example.com', role: 'parent', displayName: 'Parent User' },
  'vice-principal@example.com': { email: 'vice-principal@example.com', role: 'vice-principal', displayName: 'Vice Principal' },
  'treasurer@example.com': { email: 'treasurer@example.com', role: 'treasurer', displayName: 'Treasurer' },
  'exam-supervisor@example.com': { email: 'exam-supervisor@example.com', role: 'exam-supervisor', displayName: 'Exam Supervisor' },
  'school-health@example.com': { email: 'school-health@example.com', role: 'school-health', displayName: 'School Health' },
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock login function
  const login = async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password !== 'password123') {
      throw new Error('Invalid credentials');
    }

    const user = mockUsers[email];
    if (!user) {
      throw new Error('User not found');
    }

    const mockUser = {
      uid: email.replace('@', '_').replace('.', '_'),
      email: user.email,
      displayName: user.displayName
    };

    setCurrentUser(mockUser);
    setUserProfile(user);
    localStorage.setItem('mockUser', JSON.stringify({ user: mockUser, profile: user }));

    return { user: mockUser };
  };

  // Mock register function
  const register = async (email, password, displayName, role = 'student') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser = {
      uid: email.replace('@', '_').replace('.', '_'),
      email,
      displayName
    };

    const profile = { ...mockUser, role };
    setCurrentUser(mockUser);
    setUserProfile(profile);
    localStorage.setItem('mockUser', JSON.stringify({ user: mockUser, profile }));

    return { user: mockUser };
  };

  // Mock logout function
  const logout = async () => {
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('mockUser');
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      try {
        const { user, profile } = JSON.parse(savedUser);
        setCurrentUser(user);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('mockUser');
      }
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
