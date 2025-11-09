import { createContext } from 'react';

/**
 * Authentication context for user session data.
 * Provides user, token, login, and logout functions.
 */
export const AuthContext = createContext(null);