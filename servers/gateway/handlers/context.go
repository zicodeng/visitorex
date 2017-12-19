package handlers

import (
	"github.com/zicodeng/visitorex/servers/gateway/models/admins"
	"github.com/zicodeng/visitorex/servers/gateway/sessions"
)

// HandlerContext will be a receiver on any of our HTTP
// handler functions that need access to globals.
type HandlerContext struct {
	signingKey string
	// The type is an Store interface
	// rather than an actual Store implementation.
	sessionStore sessions.Store
	adminStore   admins.Store
}

// NewHandlerContext constructs a new HanderContext,
// ensuring that the dependencies are valid values.
func NewHandlerContext(signingKey string, sessionStore sessions.Store, adminStore admins.Store) *HandlerContext {

	if len(signingKey) == 0 {
		panic("Signing key has length of zero")
	}

	if sessionStore == nil {
		panic("Nil session store")
	}

	if adminStore == nil {
		panic("Nil admin store")
	}

	return &HandlerContext{signingKey, sessionStore, adminStore}
}
