package handlers

import (
	"encoding/json"
	"fmt"
	"github.com/zicodeng/visitorex/servers/gateway/models/admins"
	"github.com/zicodeng/visitorex/servers/gateway/sessions"
	"net/http"
	"time"
)

// AdminsHandler handles requests for the "admins" resource,
// and allows clients to create new admin accounts.
func (ctx *HandlerContext) AdminsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	// Create a new admin.
	case "POST":
		// Create an empty Admin to hold decoded request body.
		newAdmin := &admins.NewAdmin{}

		err := json.NewDecoder(r.Body).Decode(newAdmin)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error decoding request body: %v", err), http.StatusBadRequest)
			return
		}

		// Validate the NewAdmin.
		err = newAdmin.Validate()
		if err != nil {
			http.Error(w, fmt.Sprintf("Error validating new admin: %v", err), http.StatusBadRequest)
			return
		}

		// Ensure there isn't already a admin in the admin store with the same email address.
		_, err = ctx.adminStore.GetByEmail(newAdmin.Email)
		if err == nil {
			http.Error(w, "Admin with the same email already exists", http.StatusBadRequest)
			return
		}

		// Ensure there isn't already a admin in the admin store with the same admin name.
		_, err = ctx.adminStore.GetByUserName(newAdmin.UserName)
		if err == nil {
			http.Error(w, "Admin with the same username already exists", http.StatusBadRequest)
			return
		}

		// Insert the new admin into the admin store.
		admin, err := ctx.adminStore.Insert(newAdmin)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error inserting new admin: %v", err), http.StatusInternalServerError)
			return
		}

		beginNewSession(ctx, admin, w)

	default:
		http.Error(w, "Expect POST method only", http.StatusMethodNotAllowed)
		return
	}
}

// AdminsMeHandler handles requests for the "current admin" resource.
func (ctx *HandlerContext) AdminsMeHandler(w http.ResponseWriter, r *http.Request) {
	// Get session state from session store.
	sessionState := &SessionState{}
	sessionID, err := sessions.GetState(r, ctx.signingKey, ctx.sessionStore, sessionState)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error getting session state: %v", err), http.StatusUnauthorized)
		return
	}

	switch r.Method {

	// Get the current admin from the session state and respond with that admin encoded as JSON object.
	case "GET":
		w.Header().Add(headerContentType, contentTypeJSON)
		err = json.NewEncoder(w).Encode(sessionState.Admin)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error encoding SessionState Struct to JSON: %v", err), http.StatusInternalServerError)
			return
		}

	// Update the current admin with the JSON in the request body,
	// and respond with the newly updated admin, encoded as a JSON object.
	case "PATCH":
		// Get Updates struct from request body.
		updates := &admins.Updates{}
		err := json.NewDecoder(r.Body).Decode(updates)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error decoding request body: %v", err), http.StatusBadRequest)
			return
		}

		// Update in-memory session state.
		sessionState.Admin.FirstName = updates.FirstName
		sessionState.Admin.LastName = updates.LastName

		// Update session store.
		err = ctx.sessionStore.Save(sessionID, sessionState)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error saving updated session state to session store: %v", err), http.StatusInternalServerError)
			return
		}

		// Update admin store.
		err = ctx.adminStore.Update(sessionState.Admin.ID, updates)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating admin store: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Add(headerContentType, contentTypeJSON)
		err = json.NewEncoder(w).Encode(sessionState.Admin)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error encoding SessionState Struct to JSON: %v", err), http.StatusInternalServerError)
			return
		}

	// If clients send requests that are neither GET nor PATCH...
	default:
		http.Error(w, "Expect GET or PATCH method only", http.StatusMethodNotAllowed)
		return
	}
}

var invalidCredentials = "Invalid credentials"

// SessionsHandler handles requests for the "sessions" resource,
// and allows clients to begin a new session using an existing admin's credentials.
func (ctx *HandlerContext) SessionsHandler(w http.ResponseWriter, r *http.Request) {
	// Method must be POST.
	if r.Method != "POST" {
		http.Error(w, "Expect POST method only", http.StatusMethodNotAllowed)
		return
	}

	// Decode the request body into a admins.Credentials struct.
	credentials := &admins.Credentials{}
	err := json.NewDecoder(r.Body).Decode(credentials)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error decoding request body: %v", err), http.StatusBadRequest)
		return
	}

	// Get the admin with the provided email from the adminStore.
	// If not found, respond with an http.StatusUnauthorized error
	// and the message "Invalid credentials".
	admin, err := ctx.adminStore.GetByEmail(credentials.Email)
	if err != nil {
		http.Error(w, invalidCredentials, http.StatusUnauthorized)
		return
	}

	// Authenticate the admin using the provided password.
	// If that fails, respond with an http.StatusUnauthorized error
	// and the message "invalid credentials".
	err = admin.Authenticate(credentials.Password)
	if err != nil {
		http.Error(w, invalidCredentials, http.StatusUnauthorized)
		return
	}

	beginNewSession(ctx, admin, w)
}

// SessionsMineHandler handles requests for the "current session" resource,
// and allows clients to end that session.
func (ctx *HandlerContext) SessionsMineHandler(w http.ResponseWriter, r *http.Request) {
	// Method must be DELETE.
	if r.Method != "DELETE" {
		http.Error(w, "Expect DELETE method only", http.StatusMethodNotAllowed)
		return
	}

	// Get session state from session store.
	sessionState := &SessionState{}
	_, err := sessions.GetState(r, ctx.signingKey, ctx.sessionStore, sessionState)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error getting session state: %v", err), http.StatusUnauthorized)
		return
	}

	// End the current session.
	_, err = sessions.EndSession(r, ctx.signingKey, ctx.sessionStore)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error ending session: %v", err), http.StatusInternalServerError)
		return
	}

	w.Write([]byte("Signed out"))
}

// begineNewSession begins a new session
// and respond to the client with the Admin encoded as a JSON object.
func beginNewSession(ctx *HandlerContext, admin *admins.Admin, w http.ResponseWriter) {
	sessionState := SessionState{
		BeginTime: time.Now(),
		Admin:     admin,
	}

	_, err := sessions.BeginSession(ctx.signingKey, ctx.sessionStore, sessionState, w)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error beginning session: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Add(headerContentType, contentTypeJSON)
	w.WriteHeader(http.StatusCreated)

	err = json.NewEncoder(w).Encode(admin)
	if err != nil {
		http.Error(w, "Error encoding Admin struct to JSON", http.StatusInternalServerError)
		return
	}
}
