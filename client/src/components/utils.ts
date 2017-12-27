export const getCurrentHost = (): string => {
    if (window.location.hostname === 'visitorex.zicodeng.me') {
        return 'visitorex-api.zicodeng.me';
    }
    return 'localhost';
};

const SESSION_TOKEN_STORAGE_KEY = 'session-token';

// Get session token from local storage.
export const getSessionToken = (): String | null => {
    const sessionToken = localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
    if (sessionToken == null || sessionToken.length === 0) {
        // If no session token found in local storage,
        // redirect the user back to sign-in/sign-up page.
        window.location.replace('admin');
    }
    return sessionToken;
};

// Store session token to local storage.
export const storeSessionToken = (sessionToken: string): void => {
    localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, sessionToken);
};
