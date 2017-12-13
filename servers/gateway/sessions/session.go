package sessions

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
)

const headerAuthorization = "Authorization"
const paramAuthorization = "auth"
const schemeBearer = "Bearer "

// ErrNoSessionToken is used when no session token was found in the Authorization header.
var ErrNoSessionToken = errors.New("no session token found in " + headerAuthorization + " header")

// ErrInvalidScheme is used when the authorization scheme is not supported.
var ErrInvalidScheme = errors.New("authorization scheme not supported")

// BeginSession creates a new session token, saves the "sessionState" to the store, adds an
// Authorization header to the response with the created session token,
// and returns the new session token.
func BeginSession(signingKey string, store Store, sessionState interface{}, w http.ResponseWriter) (SessionToken, error) {

	// Create a new session token.
	sessionToken, err := NewSessionToken(signingKey)
	if err != nil {
		return InvalidSessionToken, fmt.Errorf("error creating a new session ID: %v", err)
	}

	// Save the sessionState to the store.
	err = store.Save(sessionToken, sessionState)
	if err != nil {
		return InvalidSessionToken, fmt.Errorf("error saving session state: %v", err)
	}

	// Add a header to the ResponseWriter that looks like this:
	// "Authorization: Bearer <SessionToken>"
	// where "<SessionToken>" is replaced with the newly-created session token.
	w.Header().Add(headerAuthorization, schemeBearer+sessionToken.String())

	return sessionToken, nil
}

// GetSessionToken extracts and validates the session token from the request headers.
func GetSessionToken(r *http.Request, signingKey string) (SessionToken, error) {

	// Get the value of the Authorization header.
	val := r.Header.Get(headerAuthorization)

	// If no Authorization header is present, get the "auth" query string parameter.
	if len(val) == 0 {
		val = r.URL.Query().Get("auth")
		if len(val) == 0 {
			return InvalidSessionToken, ErrNoSessionToken
		}
	}

	// The value of a valid Authorization header should look like this:
	// "Bearer <SessionToken>"
	// If Bearer is missing, return InvalidSessionToken and ErrInvalidScheme.
	if !strings.HasPrefix(val, schemeBearer) {
		return InvalidSessionToken, ErrInvalidScheme
	}

	// Get the session token part.
	unverifiedSessionToken := strings.TrimPrefix(val, schemeBearer)

	// Validate session token from the request header.
	sessionToken, err := ValidateToken(unverifiedSessionToken, signingKey)
	if err != nil {
		return InvalidSessionToken, fmt.Errorf("error validating session token received from request: %v", err)
	}

	return sessionToken, nil
}

// GetState extracts the session token from the request,
// gets the associated state from the provided store into
// the "sessionState" parameter, and returns the session token.
func GetState(r *http.Request, signingKey string, store Store, sessionState interface{}) (SessionToken, error) {

	// Get the session token from the request.
	sessionToken, err := GetSessionToken(r, signingKey)
	if err != nil {
		return sessionToken, fmt.Errorf("error getting session token: %v", err)
	}

	// Get the data associated with that session token from the store.
	err = store.Get(sessionToken, sessionState)
	if err != nil {
		return sessionToken, err
	}

	return sessionToken, nil
}

// EndSession extracts the session token from the request,
// and deletes the associated data in the provided store, returning
// the extracted session token.
func EndSession(r *http.Request, signingKey string, store Store) (SessionToken, error) {

	// Get the session token from the request.
	sessionToken, err := GetSessionToken(r, signingKey)
	if err != nil {
		return sessionToken, fmt.Errorf("error getting session token: %v", err)
	}

	// Delete the data associated with it in the store.
	err = store.Delete(sessionToken)
	if err != nil {
		return sessionToken, fmt.Errorf("error deleting session state: %v", err)
	}

	return sessionToken, nil
}
