package sessions

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
)

// InvalidSessionToken represents an empty, invalid session token.
const InvalidSessionToken SessionToken = ""

// idLength is the length of the ID portion.
const idLength = 32

// signedLength is the full length of the signed session ID
// (ID portion plus signature).
const signedLength = idLength + sha256.Size

// SessionToken represents a valid, digitally-signed session ID.
// This is a base64 URL encoded string created from a byte slice
// where the first "idLength" bytes are crytographically random
// bytes representing the unique session ID, and the remaining bytes
// are an HMAC hash of those ID bytes (i.e., a digital signature).
// The byte slice layout is like so:
// +-----------------------------------------------------+
// |...32 crypto random bytes...|HMAC hash of those bytes|
// +-----------------------------------------------------+
type SessionToken string

// ErrInvalidID is returned when an invalid session id is passed to ValidateID().
var ErrInvalidToken = errors.New("Invalid session token")

// NewSessionToken creates and returns a new digitally-signed session ID (session token),
// using "signingKey" as the HMAC signing key. An error is returned only
// if there was an error generating random bytes for the session ID.
func NewSessionToken(signingKey string) (SessionToken, error) {
	// If "signingKey" is zero-length, return InvalidSessionToken
	// and an error indicating that it may not be empty.
	if len(signingKey) == 0 {
		return InvalidSessionToken, fmt.Errorf("signing key cannot be zero")
	}

	// Create a slice of bytes to store decoded session token.
	resultBytes := make([]byte, signedLength)

	// Create a slice of bytes to store session ID (cryptographically random bytes).
	sessionID := make([]byte, idLength)

	// Generate cryptographically random bytes for the new session ID.
	if _, err := rand.Read(sessionID); err != nil {
		return InvalidSessionToken, fmt.Errorf("error generating cryptographically random bytes: %v", err)
	}

	// Copy it to resultBytes.
	copy(resultBytes, sessionID)

	// Create a new HMAC hasher.
	h := hmac.New(sha256.New, []byte(signingKey))

	// Generate hashed session ID.
	h.Write(sessionID)

	// Calculate the HMAC signature.
	sig := h.Sum(nil)

	// Copy the HMAC signature to resultBytes.
	copy(resultBytes[idLength:], sig)

	// Generate a new "base64-based and digitally-signed Session ID", which will be our session token.
	sessionToken := SessionToken(base64.URLEncoding.EncodeToString(resultBytes))

	return sessionToken, nil
}

// ValidateToken validates the string in the "sessionToken" parameter
// using the "signingKey" as the HMAC signing key
// and returns an error if invalid, or a SessionToken if valid.
func ValidateToken(sessionToken string, signingKey string) (SessionToken, error) {

	// Base64 decode the session token to a slice of bytes.
	// dst represents the decoded session token.
	dst, err := base64.URLEncoding.DecodeString(sessionToken)
	if err != nil {
		return InvalidSessionToken, fmt.Errorf("error decoding provided session token: %v", err)
	}

	// Get old session ID and its signature.
	sessionID := dst[:idLength]
	oldSig := dst[idLength:]

	// Create a new HMAC hasher.
	h := hmac.New(sha256.New, []byte(signingKey))

	// Generate a new hashed session ID.
	h.Write(sessionID)

	// Calculate a new HMAC signature.
	newSig := h.Sum(nil)

	// If the old HMAC signature and new one are not equal,
	// it means this session token is invalid.
	if !hmac.Equal(oldSig, newSig) {
		return InvalidSessionToken, ErrInvalidToken
	}

	return SessionToken(sessionToken), nil
}

// String returns a string representation of the sessionToken.
func (sessionToken SessionToken) String() string {
	return string(sessionToken)
}
