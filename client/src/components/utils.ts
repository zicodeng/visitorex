export const getCurrentHost = (): string => {
    if (window.location.hostname === 'visitorex.zicodeng.me') {
        return 'visitorex-api.zicodeng.me';
    }
    return 'localhost';
};

// Get session token from local storage.
export const getSessionToken = (): String | null => {
    const sessionToken = localStorage.getItem('session-token');
    if (sessionToken == null || sessionToken.length === 0) {
        // If no session token found in local storage,
        // redirect the user back to sign-in/sign-up page.
        window.location.replace('admin');
    }
    return sessionToken;
};
