export const getCurrentHost = (): string => {
    if (window.location.hostname === 'visitorex.zicodeng.me') {
        return 'visitorex-api.zicodeng.me';
    }
    return 'localhost:3000';
};

export const SESSION_TOKEN_STORAGE_KEY = 'session-token';

// Get session token from local storage.
export const getSessionToken = (): String | null => {
    const sessionToken = localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
    if (!sessionToken) {
        // If no session token found in local storage,
        // redirect the user back to sign-in/sign-up page.
        window.location.replace('/admin-auth');
    }
    return sessionToken;
};

// Store session token to local storage.
export const storeSessionToken = (sessionToken: string): void => {
    localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, sessionToken);
    window.location.replace('/dashboard/overview');
};

// Remove session token in local storage.
export const removeSessionToken = (): void => {
    localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
    window.location.replace('/admin-auth');
};
