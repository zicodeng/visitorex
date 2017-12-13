package main

import (
	"github.com/go-redis/redis"
	"github.com/zicodeng/visitorex/servers/gateway/handlers"
	"github.com/zicodeng/visitorex/servers/gateway/models/admins"
	"github.com/zicodeng/visitorex/servers/gateway/sessions"
	"gopkg.in/mgo.v2"
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

	dbName := os.Getenv("DB_NAME")
	if len(dbName) == 0 {
		log.Fatal("Please set DB_NAME environment variable")
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

	// Set up MongoDB connection.
	mongoAddr := os.Getenv("MONGO_ADDR")
	if len(mongoAddr) == 0 {
		mongoAddr = ":27017"
	}

	// Shared Redis client.
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	// Create a Mongo session.
	mongoSession, err := mgo.Dial(mongoAddr)
	if err != nil {
		log.Fatalf("error dialing mongo: %v", err)
	}

	// Redis store for session state.
	sessionStore := sessions.NewRedisStore(redisClient, time.Hour)

	// Mongo store for admin.
	adminStore := admins.NewMongoStore(mongoSession, dbName, "admins")

	// Initialize HandlerContext.
	ctx := handlers.NewHandlerContext(sessionKey, sessionStore, adminStore)

	mux := http.NewServeMux()

	mux.HandleFunc("/v1/admins", ctx.AdminsHandler)
	mux.HandleFunc("/v1/admins/me", ctx.AdminsMeHandler)

	mux.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/mine", ctx.SessionsMineHandler)

	corsMux := handlers.NewCORSHandler(mux)

	log.Printf("Server is listening on https://%s\n", serverAddr)
	log.Fatal(http.ListenAndServeTLS(serverAddr, TLSCert, TLSKey, corsMux))
}
