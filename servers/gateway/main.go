package main

import (
	"github.com/go-redis/redis"
	"github.com/streadway/amqp"
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

	mqAddr := os.Getenv("MQ_ADDR")
	if len(mqAddr) == 0 {
		mqAddr = ":5672"
	}

	// Create a shared Redis client.
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	// Create a shared Mongo session.
	mongoSession, err := mgo.Dial(mongoAddr)
	if err != nil {
		log.Fatalf("error dialing mongo: %v", err)
	}

	// Initialize Redis store for session state.
	sessionStore := sessions.NewRedisStore(redisClient, time.Hour)

	// Initialize Mongo store for admins.
	adminStore := admins.NewMongoStore(mongoSession, dbName, "admins")

	// Initialize HandlerContext.
	ctx := handlers.NewHandlerContext(sessionKey, sessionStore, adminStore)

	// Initialize notifier.
	notifier := handlers.NewNotifier()

	// Connect to RabbitMQ server
	// and continously listen to messages from queue.
	go listenToMQ(mqAddr, notifier)

	mux := http.NewServeMux()

	mux.HandleFunc("/v1/admins", ctx.AdminsHandler)
	mux.HandleFunc("/v1/admins/me", ctx.AdminsMeHandler)

	mux.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/mine", ctx.SessionsMineHandler)

	mux.Handle("/v1/ws", ctx.NewWebSocketsHandler(notifier))

	corsMux := handlers.NewCORSHandler(mux)

	log.Printf("Server is listening on https://%s\n", serverAddr)
	log.Fatal(http.ListenAndServeTLS(serverAddr, TLSCert, TLSKey, corsMux))
}

const maxConnRetries = 5
const qName = "NewVisitor"

func listenToMQ(addr string, notifier *handlers.Notifier) {
	conn, err := connectToMQ(addr)
	if err != nil {
		log.Fatalf("error connecting to MQ server: %s", err)
	}
	log.Printf("connected to MQ server")
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("error opening channel: %v", err)
	}
	log.Println("created MQ channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(qName, false, false, false, false, nil)
	if err != nil {
		log.Fatalf("error declaring queue: %v", err)
	}
	log.Printf("declared MQ queue: %v\n", qName)

	messages, err := ch.Consume(q.Name, "", true, false, false, false, nil)
	if err != nil {
		log.Fatalf("error listening to queue: %v", err)
	}
	log.Printf("listening for new MQ messages from %v...\n", qName)

	for msg := range messages {
		// Load messages received from RabbitMQ's eventQ channel to
		// notifier's eventQ channel, so that messages will be
		// broadcasted to all clients throught websocket.
		notifier.Notify(msg.Body)
	}
}

func connectToMQ(addr string) (*amqp.Connection, error) {
	mqURL := "amqp://" + addr
	var conn *amqp.Connection
	var err error
	for i := 1; i <= maxConnRetries; i++ {
		conn, err = amqp.Dial(mqURL)
		if err == nil {
			return conn, nil
		}
		log.Printf("error connecting to MQ server at %s: %s", mqURL, err)
		log.Printf("will attempt another connection in %d seconds", i*2)
		time.Sleep(time.Duration(i*2) * time.Second)
	}
	return nil, err
}
