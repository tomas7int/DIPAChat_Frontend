import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';

// Simple mock user interface
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  mfaStatus: { enabled: boolean; phoneNumber?: string } | null;
  refreshMFAStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Hardcoded test users
const TEST_USERS: Record<string, { password: string; isAdmin: boolean }> = {
  'admin@test.com': { password: 'admin123', isAdmin: true },
  'user@test.com': { password: 'user123', isAdmin: false },
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mfaStatus, setMfaStatus] = useState<{ enabled: boolean; phoneNumber?: string } | null>(null);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('dev_user');
    const storedIsAdmin = localStorage.getItem('dev_isAdmin') === 'true';
    
    if (storedUser) {
      setUser({
        uid: `mock-${Date.now()}`,
        email: storedUser,
        displayName: storedUser.split('@')[0],
      });
      setIsAdmin(storedIsAdmin);
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check hardcoded users
    const testUser = TEST_USERS[email];
    if (testUser && testUser.password === password) {
      const mockUser: MockUser = {
        uid: `mock-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
      };
      setUser(mockUser);
      setIsAdmin(testUser.isAdmin);
      localStorage.setItem('dev_user', email);
      localStorage.setItem('dev_isAdmin', String(testUser.isAdmin));
      toast.success('Logged in successfully (UI Test Mode)');
    } else {
      // Allow any email/password for UI testing
      const mockUser: MockUser = {
        uid: `mock-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
      };
      setUser(mockUser);
      setIsAdmin(false);
      localStorage.setItem('dev_user', email);
      localStorage.setItem('dev_isAdmin', 'false');
      toast.success('Logged in successfully (UI Test Mode)');
    }
  };

  const signup = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: MockUser = {
      uid: `mock-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
    };
    setUser(mockUser);
    setIsAdmin(false);
    localStorage.setItem('dev_user', email);
    localStorage.setItem('dev_isAdmin', 'false');
    toast.success('Account created successfully (UI Test Mode)');
  };

  const logout = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('dev_user');
    localStorage.removeItem('dev_isAdmin');
    toast.success('Logged out successfully');
  };

  const resetPassword = async (email: string) => {
    toast.info('Password reset not available in UI test mode');
  };

  const refreshMFAStatus = async () => {
    // Mock MFA status
    setMfaStatus({ enabled: false });
  };

  const value: AuthContextType = {
    user,
    loading,
    isAdmin,
    login,
    signup,
    logout,
    resetPassword,
    mfaStatus,
    refreshMFAStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
