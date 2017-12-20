package handlers

import (
	"fmt"
	"github.com/zicodeng/visitorex/servers/gateway/sessions"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// WebSocketsHandler is a handler for WebSocket upgrade requests.
type WebSocketsHandler struct {
	notifier *Notifier
	upgrader *websocket.Upgrader
	ctx      *HandlerContext
}

// NewWebSocketsHandler constructs a new WebSocketsHandler.
func (ctx *HandlerContext) NewWebSocketsHandler(notifier *Notifier) *WebSocketsHandler {
	return &WebSocketsHandler{
		notifier: notifier,
		upgrader: &websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin:     func(r *http.Request) bool { return true },
		},
		ctx: ctx,
	}
}

// ServeHTTP implements the http.Handler interface for the WebSocketsHandler.
func (wsh *WebSocketsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Users must be authenticated to upgrade to a WebSocket.
	// if we get an error when retrieving the session state,
	// respond with an http.StatusUnauthorized.
	sessionState := &SessionState{}
	_, err := sessions.GetState(r, wsh.ctx.signingKey, wsh.ctx.sessionStore, sessionState)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error getting session state: %v", err), http.StatusUnauthorized)
		return
	}

	// Upgrade the connection to a WebSocket, and add the
	// new websock.Conn to the Notifier.
	conn, err := wsh.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	// Each request will be running on its own goroutine,
	// and represent a different client.
	// So whenever we receive a new request, and ServeHTTP is called,
	// we need to add that request as a new client to our Notifier's clients field.
	wsh.notifier.AddClient(conn)
}

// Notifier is an object that handles WebSocket notifications.
type Notifier struct {
	clients       []*websocket.Conn
	eventQ        chan []byte
	addClientQ    chan *websocket.Conn
	removeClientQ chan *websocket.Conn
}

// NewNotifier constructs a new Notifier.
func NewNotifier() *Notifier {
	// Construct a new Notifier
	// and call the .start() method on
	// a new goroutine to start the
	// event notification loop.
	notifier := &Notifier{
		eventQ: make(chan []byte),
	}
	go notifier.start()
	return notifier
}

// AddClient adds a new client to the Notifier.
func (n *Notifier) AddClient(client *websocket.Conn) {
	n.addClientQ <- client

	// Process incoming control messages from the client.
	// Once this client is added to the list, it will constantly
	// send control messages to our server. If at one point,
	// we get an error when reading those control messages,
	// it informs us that connection is lost, and we need to
	// remove it from the list.
	for {
		if _, _, err := client.NextReader(); err != nil {
			// Remove it from the list
			n.removeClientQ <- client
			return
		}
	}
}

// Notify broadcasts the event to all WebSocket clients
// by sending an event to the eventQ.
func (n *Notifier) Notify(event []byte) {
	// Add "event" to the "n.eventQ"
	n.eventQ <- event
}

// Start starts the notification loop.
func (n *Notifier) start() {
	for {
		select {
		case event := <-n.eventQ:
			// Loop through all the existing clients,
			// and send messages to all of them.
			for _, client := range n.clients {
				if err := client.WriteMessage(websocket.TextMessage, event); err != nil {
					n.removeClientQ <- client
				}
			}

		case clientToAdd := <-n.addClientQ:
			n.clients = append(n.clients, clientToAdd)

		case clientToRemove := <-n.removeClientQ:
			clientToRemove.Close()
			newClients := make([]*websocket.Conn, 0, len(n.clients)-1)
			for _, client := range n.clients {
				if client != clientToRemove {
					newClients = append(newClients, client)
				}
			}
			n.clients = newClients

		default:
		}
	}
}
