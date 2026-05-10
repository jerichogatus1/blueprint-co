import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  user: null,
  profile: null,
  claims: null,
  loading: true
});

export function useAuth() {
  return useContext(AuthContext);
}
