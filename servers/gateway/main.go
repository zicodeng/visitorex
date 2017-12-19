package main

import (
	"encoding/json"
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

var svcChannel = "Microservices"

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
		log.Fatalf("Error dialing mongo: %v", err)
	}

	// Initialize Redis store for session state.
	sessionStore := sessions.NewRedisStore(redisClient, time.Hour)

	// Initialize Mongo store for admins.
	adminStore := admins.NewMongoStore(mongoSession, dbName, "admins")

	// Initialize HandlerContext.
	ctx := handlers.NewHandlerContext(sessionKey, sessionStore, adminStore)

	// Initialize notifier.
	notifier := handlers.NewNotifier()

	pubsub := redisClient.Subscribe(svcChannel)
	serviceList := handlers.NewServiceList()
	go listenForServices(pubsub, serviceList)
	go removeCrashedServices(serviceList)

	// Connect to RabbitMQ server
	// and continously listen to messages from queue.
	go listenToMQ(mqAddr, notifier)

	mux := http.NewServeMux()

	mux.HandleFunc("/v1/admins", ctx.AdminsHandler)
	mux.HandleFunc("/v1/admins/me", ctx.AdminsMeHandler)

	mux.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/mine", ctx.SessionsMineHandler)

	mux.Handle("/v1/ws", ctx.NewWebSocketsHandler(notifier))

	// Chained middlewares.
	// Wraps mux inside DSDHandler.
	dsdMux := handlers.NewDSDHandler(mux, serviceList, ctx)
	// Wraps mux inside CORSHandler.
	corsMux := handlers.NewCORSHandler(dsdMux)

	log.Printf("Server is listening on https://%s\n", serverAddr)
	log.Fatal(http.ListenAndServeTLS(serverAddr, TLSCert, TLSKey, corsMux))
}

const maxConnRetries = 5
const visitorQueue = "VisitorQueue"

func listenToMQ(addr string, notifier *handlers.Notifier) {
	conn, err := connectToMQ(addr)
	if err != nil {
		log.Fatalf("Error connecting to MQ server: %s", err)
	}
	log.Printf("Connected to MQ server")
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Error opening channel: %v", err)
	}
	log.Println("Created MQ channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(visitorQueue, false, false, false, false, nil)
	if err != nil {
		log.Fatalf("Error declaring queue: %v", err)
	}
	log.Printf("Declared MQ queue: %v\n", visitorQueue)

	messages, err := ch.Consume(q.Name, "", true, false, false, false, nil)
	if err != nil {
		log.Fatalf("Error listening to queue: %v", err)
	}
	log.Printf("Listening for new MQ messages from %v...\n", visitorQueue)

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
		log.Printf("Error connecting to MQ server at %s: %s", mqURL, err)
		log.Printf("Will attempt another connection in %d seconds", i*2)
		time.Sleep(time.Duration(i*2) * time.Second)
	}
	return nil, err
}

// Constantly listen for "Microservices" Redis channel.
func listenForServices(pubsub *redis.PubSub, serviceList *handlers.ServiceList) {
	log.Println("Listening for microservices")
	for {
		msg, err := receivePubSubMessage(pubsub)
		// If there is still an error receiving message even after retries,
		// return this function.
		if err != nil {
			log.Println(err)
			return
		}
		svc := &handlers.ReceivedService{}
		err = json.Unmarshal([]byte(msg.Payload), svc)
		if err != nil {
			log.Printf("Error unmarshalling received microservice JSON to struct: %v", err)
		}
		serviceList.Register(svc)
	}
}

var maxReceiveMessageRetries = 5

// If there is an error receiving Redis Pub/Sub messages,
// that's probably because the Redis server is no longer reachable.
// If that's the case, try to receive the message again for a max number of retries.
func receivePubSubMessage(pubsub *redis.PubSub) (*redis.Message, error) {
	var msg *redis.Message
	var err error
	for i := 0; i < maxReceiveMessageRetries; i++ {
		// pubsub.ReceiveMessage() will block until there is a message to receive.
		msg, err = pubsub.ReceiveMessage()
		if err == nil {
			return msg, nil
		}
		log.Printf("Error receiving message from Redis Pub/Sub: %s", err)
		log.Printf("Will try again in %d seconds", i*2)
		time.Sleep(time.Duration(i*2) * time.Second)
	}
	return nil, err
}

// Periodically looks for service instances
// for which we haven't received a heartbeat in a while,
// and remove those instances from your list
func removeCrashedServices(serviceList *handlers.ServiceList) {
	for {
		time.Sleep(time.Second * 10)
		serviceList.Remove()
	}
}
