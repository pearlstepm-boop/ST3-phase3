import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, OrgAccessConfig } from '../types';

// Default organization domain rules
export const DEFAULT_ORG_CONFIG: OrgAccessConfig = {
  // Allow Thai health organizations + common academic/gov domains + user's current account
  allowedDomains: ['moph.go.th', 'ddc.mail.go.th', 'anamai.mail.go.th', 'dmh.mail.go.th', 'thaigov.go.th', 'go.th', 'ac.th'],
  allowedEmails: ['pearlstepm@gmail.com'], // Primary user's email pre-authorized
  enforceDomainCheck: false, // Can be toggled in admin settings
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.setCustomParameters({
  prompt: 'select_account'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const getCachedAccessToken = (): string | null => cachedAccessToken;

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Check if user email is authorized according to organization policy
export const checkOrgAuthorization = (email: string | null | undefined, config: OrgAccessConfig): boolean => {
  if (!email) return false;
  if (!config.enforceDomainCheck) return true; // If not strictly enforcing, all signed in users have access
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Direct email match
  if (config.allowedEmails.some(e => e.toLowerCase() === normalizedEmail)) {
    return true;
  }
  
  // Domain match
  const parts = normalizedEmail.split('@');
  if (parts.length === 2) {
    const domain = parts[1];
    return config.allowedDomains.some(d => domain === d || domain.endsWith('.' + d));
  }
  
  return false;
};

// Listen to auth state
export const subscribeToAuth = (
  callback: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedAccessToken = null;
    }
    callback(user, cachedAccessToken);
  });
};

// Sign in with Google Popup
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('ไม่สามารถรับ Access Token จาก Google Authentication ได้');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign out
export const logOutGoogle = async () => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (err) {
    console.error('Sign-out failed:', err);
  }
};
