package main

import (
	"github.com/go-redis/redis"
	"github.com/zicodeng/visitorex/servers/gateway/sessions"
	"log"
	"net/http"
	"os"
	"time"
)

// main is the main entry point for the server.
func main() {

	// Path to TLS public certificate.
	TLSCert := os.Getenv("TLS_CERT")
	// Path to the associated private key.
	TLSKey := os.Getenv("TLS_KEY")
	if len(TLSCert) == 0 || len(TLSKey) == 0 {
		log.Fatal("Please set TLS_CERT and TLS_KEY environment variables")
	}

	// sessionKey is the signing key for session token.
	sessionKey := os.Getenv("SESSION_KEY")
	if len(sessionKey) == 0 {
		log.Fatal("Please set SESSION_KEY environment variable")
	}

	// Address the server should listen on.
	// If empty, default to ":443".
	serverAddr := os.Getenv("SERVER_ADDR")
	if len(serverAddr) == 0 {
		serverAddr = ":443"
	}

	// Set up Redis connection.
	redisAddr := os.Getenv("REDIS_ADDR")
	if len(redisAddr) == 0 {
		redisAddr = ":6379"
	}

	// Shared Redis client.
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	// Redis store for session state.
	sessionStore := sessions.NewRedisStore(redisClient, time.Hour)

	// Initialize HandlerContext.
	ctx := handlers.NewHandlerContext(sessionKey, sessionStore)

	mux := http.NewServeMux()

	log.Printf("Server is listening on https://%s\n", serverAddr)
	log.Fatal(http.ListenAndServeTLS(serverAddr, TLSCert, TLSKey, mux))
}
