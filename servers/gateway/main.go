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

	pubsub := redisClient.Subscribe("Microservices")
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

	log.Printf("server is listening on https://%s\n", serverAddr)
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

type receivedService struct {
	Name        string
	PathPattern string
	Address     string
	Heartbeat   int
}

// Constantly listen for "Microservices" Redis channel.
func listenForServices(pubsub *redis.PubSub, serviceList *handlers.ServiceList) {
	log.Println("listening for microservices")
	for {
		time.Sleep(time.Second)

		msg, err := pubsub.ReceiveMessage()
		if err != nil {
			log.Println(err)
		}
		svc := &receivedService{}
		err = json.Unmarshal([]byte(msg.Payload), svc)
		if err != nil {
			log.Printf("error unmarshalling received microservice JSON to struct: %v", err)
		}
		serviceList.Mx.Lock()
		_, hasSvc := serviceList.Services[svc.Name]
		// If this microservice is already in our list...
		if hasSvc {
			// Check if this specific microservice instance exists in our list by its unique address...
			_, hasInstance := serviceList.Services[svc.Name].Instances[svc.Address]
			if hasInstance {
				// If this microservice instance is in our list,
				// update its lastHeartbeat time field.
				serviceList.Services[svc.Name].Instances[svc.Address].LastHeartbeat = time.Now()
			} else {
				// If not, add this instance to our list.
				log.Println("new microservice instance found")
				serviceList.Services[svc.Name].Instances[svc.Address] = handlers.NewServiceInstance(svc.Address, time.Now())
			}

		} else {
			// If this microservice is not in our list,
			// create a new instance of that microservice
			// and add to the list.
			log.Println("new microservice found")
			instances := make(map[string]*handlers.ServiceInstance)
			instances[svc.Address] = handlers.NewServiceInstance(svc.Address, time.Now())
			serviceList.Services[svc.Name] = handlers.NewService(svc.Name, svc.PathPattern, svc.Heartbeat, instances)
		}
		serviceList.Mx.Unlock()
	}
}

// Periodically looks for service instances
// for which we haven't received a heartbeat in a while,
// and remove those instances from your list
func removeCrashedServices(serviceList *handlers.ServiceList) {
	for {
		time.Sleep(time.Second * 10)

		serviceList.Mx.Lock()
		for svcName := range serviceList.Services {
			svc := serviceList.Services[svcName]
			for addr, instance := range svc.Instances {
				if time.Now().Sub(instance.LastHeartbeat).Seconds() > float64(svc.Heartbeat)+10 {
					log.Println("crashed microservice instance removed")
					// Remove the crashed microservice instance from the service list.
					delete(svc.Instances, addr)
					// Remove the entire microservice from the service list
					// if it has no instance running.
					if len(svc.Instances) == 0 {
						log.Println("crashed microservice removed")
						delete(serviceList.Services, svcName)
					}
				}
			}
		}
		serviceList.Mx.Unlock()
	}
}
