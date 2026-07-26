import { createContext } from 'react';
import type { UserProfile } from '../types';

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (phoneNumber: string, containerId: string) => Promise<any>;
  confirmOtp: (otp: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
