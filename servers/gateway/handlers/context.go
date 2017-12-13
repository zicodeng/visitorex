package handlers

import (
	"github.com/zicodeng/visitorex/servers/gateway/sessions"
)

// HandlerContext will be a receiver on any of our HTTP
// handler functions that need access to globals.
type HandlerContext struct {
	SigningKey string
	// The type is an Store interface
	// rather than an actual Store implementation.
	SessionStore sessions.Store
}

// NewHandlerContext constructs a new HanderContext,
// ensuring that the dependencies are valid values.
func NewHandlerContext(signingKey string, sessionStore sessions.Store) *HandlerContext {

	if len(signingKey) == 0 {
		panic("signing key has length of zero")
	}

	if sessionStore == nil {
		panic("nil session store")
	}

	return &HandlerContext{signingKey, sessionStore}
}
