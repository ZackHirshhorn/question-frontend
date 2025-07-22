// src/utils/localUser.ts
export const USER_ID_KEY = "userId";

export function saveUserId(id: string) {
  try {
    localStorage.setItem(USER_ID_KEY, id);
  } catch (_) { /* quota or private-mode errors – ignore */ }
}

export function getStoredUserId(): string | null {
  try {
    return localStorage.getItem(USER_ID_KEY);
  } catch {
    return null;
  }
}

export function clearStoredUserId() {
  try {
    localStorage.removeItem(USER_ID_KEY);
  } catch (_) { /* ignore */ }
}
