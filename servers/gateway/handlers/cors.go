package handlers

import (
	"net/http"
)

// CORSHandler is a middleware handler that wraps another http.Handler
// to do some pre- and/or post-processing of the request.
type CORSHandler struct {
	Handler http.Handler
}

// NewCORSHandler wraps another handler into CORSHandler.
func NewCORSHandler(handlerToWrap http.Handler) *CORSHandler {
	return &CORSHandler{handlerToWrap}
}

// ServeHTTP is a method of CORSHandler.
// Now our CORSHandler is a http.Handler.
func (ch *CORSHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	w.Header().Add(headerAccessControlAllowOrigin, "*")
	w.Header().Add(headerAccessControlAllowMethods, "GET, PUT, POST, PATCH, DELETE")
	w.Header().Add(headerAccessControlAllowHeaders, "Content-Type, Authorization")
	w.Header().Add(headerAccessControlExposeHeaders, "Authorization")
	w.Header().Add(headerAccessControlMaxAge, "600")

	// If this is preflight request, the method will
	// be OPTIONS, so call the real handler only if
	// the method is something else.
	if r.Method != "OPTIONS" {
		ch.Handler.ServeHTTP(w, r)
	}
}
