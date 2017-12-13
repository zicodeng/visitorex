package handlers

import (
	"github.com/zicodeng/visitorex/servers/gateway/models/admins"
	"time"
)

// SessionState represents session state for an authenticated admin.
type SessionState struct {
	// Time struct should be passed as value not pointer.
	BeginTime time.Time
	Admin     *admins.Admin
}
