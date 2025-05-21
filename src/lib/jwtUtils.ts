import {jwtDecode} from 'jwt-decode';
export enum UserRole {
    PATIENT = 'patient',
    CERTIFICATE_AUTHORITY = 'certificate_authority',
    DOCTOR = 'doctor'
}
export interface jwtPayload {
    userId: string;
    role: UserRole;
}
export const getToken = (role: UserRole): string | null => {
  const tokenKey = `${role}AccessToken`; 
  const token = localStorage.getItem(tokenKey);
  console.log(`Token for role ${role} from localStorage:`, token);
  return token;
};

// Decode the token
export const getDecodedToken = (role: UserRole): jwtPayload | null => {
  const token = getToken(role);
  if (!token) return null;

  try {
    const decoded = jwtDecode<jwtPayload>(token);
    return decoded;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};