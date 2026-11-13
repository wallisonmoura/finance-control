// A login that stopped being valid (signed out by a password change, or
// expired). The 401s that mean this carry the header, so the app can tell them
// from a wrong password; the route clears the cookie and shows the login
// notice. Lives in shared because the app's fetch wrapper reads it too.
export const SESSION_ENDED_HEADER = 'x-session-ended';

export const SESSION_ENDED_URL = '/api/auth/session-ended';
