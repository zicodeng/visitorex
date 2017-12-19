package handlers

import (
	"encoding/json"
	"github.com/zicodeng/visitorex/servers/gateway/models/admins"
	"github.com/zicodeng/visitorex/servers/gateway/sessions"
	"log"
	"net/http"
	"net/http/httputil"
	"regexp"
	"sync"
	"time"
)

// ServiceList contains a list of services.
type ServiceList struct {
	services map[string]*service
	mx       sync.RWMutex
}

// NewServiceList creates a new ServiceList.
func NewServiceList() *ServiceList {
	return &ServiceList{
		services: make(map[string]*service),
	}
}

// service represents any microservice our gateway
// will be received from Redis "microservice" channel.
type service struct {
	name              string
	pathPatternRegexp *regexp.Regexp
	heartbeat         int // The microservice's normal heartbeat.
	// The key of the instances map is this instance's unique address.
	instances map[string]*serviceInstance
	proxy     *httputil.ReverseProxy
}

// newService creates a new microservice.
func newService(
	name string,
	pathPatternRegexp *regexp.Regexp,
	heartbeat int,
	instances map[string]*serviceInstance) *service {
	addrs := []string{}
	for addr := range instances {
		addrs = append(addrs, addr)
	}
	proxy := newServiceProxy(addrs)
	return &service{name, pathPatternRegexp, heartbeat, instances, proxy}
}

// serviceInstance is an instance of a given microservice.
// A microservice might have multiple instances for balancing loads.
type serviceInstance struct {
	address       string
	lastHeartbeat time.Time
}

// newServiceInstance creates a new microservice instance.
func newServiceInstance(addr string, lastHeartbeat time.Time) *serviceInstance {
	return &serviceInstance{addr, lastHeartbeat}
}

// ReceivedService represents microservice information received from Redis Pub/Sub.
type ReceivedService struct {
	Name        string
	PathPattern string
	Address     string
	Heartbeat   int
}

// Register either registers a new microservice if it doesn't exist,
// or register a new microservice instance if that microservice already exists in the list.
func (serviceList *ServiceList) Register(receivedSvc *ReceivedService) {
	serviceList.mx.Lock()
	svc, hasSvc := serviceList.services[receivedSvc.Name]
	// If this microservice is already in our list...
	if hasSvc {
		// Check if this specific microservice instance exists in our list by its unique address...
		instance, hasInstance := svc.instances[receivedSvc.Address]
		if hasInstance {
			// If this microservice instance is in our list,
			// update its lastHeartbeat time field.
			instance.lastHeartbeat = time.Now()
		} else {
			// If not, add this instance to our list.
			log.Printf("Microservice %s: new instance with address %s found\n", receivedSvc.Name, receivedSvc.Address)
			svc.instances[receivedSvc.Address] = newServiceInstance(receivedSvc.Address, time.Now())
		}
	} else {
		// If this microservice is not in our list,
		// create a new instance of that microservice
		// and add to the list.
		log.Printf("New microservice %s found\n", receivedSvc.Name)
		log.Printf("Microservice %s: new instance with address %s found\n", receivedSvc.Name, receivedSvc.Address)
		instances := make(map[string]*serviceInstance)
		instances[receivedSvc.Address] = newServiceInstance(receivedSvc.Address, time.Now())
		serviceList.services[receivedSvc.Name] = newService(
			receivedSvc.Name,
			regexp.MustCompile(receivedSvc.PathPattern),
			receivedSvc.Heartbeat,
			instances,
		)
	}
	serviceList.mx.Unlock()
}

// Remove either removes a dangling microservice if it does not have any active instance running,
// or remove a crashed microservice instance.
func (serviceList *ServiceList) Remove() {
	serviceList.mx.Lock()
	defer serviceList.mx.Unlock()

	if len(serviceList.services) == 0 {
		return
	}

	for svcName, svc := range serviceList.services {
		for addr, instance := range svc.instances {
			if time.Now().Sub(instance.lastHeartbeat).Seconds() > float64(svc.heartbeat)+10 {
				log.Printf("Microservice %s: crashed instance with address %s removed", svcName, addr)
				// Remove the crashed microservice instance from the service list.
				delete(svc.instances, addr)
				// Remove the entire microservice from the service list
				// if it has no instance running.
				if len(svc.instances) == 0 {
					log.Printf("Dangling microservice %s removed\n", svcName)
					delete(serviceList.services, svcName)
				}
			}
		}
	}
}

// DSDHandler is a dynamic service discovery middleware handler
// that checks the requested resource path
// against the pathPattern properties of the services field.
type DSDHandler struct {
	handler     http.Handler
	serviceList *ServiceList
	ctx         *HandlerContext
}

// NewDSDHandler wraps another handler into DSDHandler.
func NewDSDHandler(handlerToWrap http.Handler, serviceList *ServiceList, ctx *HandlerContext) *DSDHandler {
	return &DSDHandler{handlerToWrap, serviceList, ctx}
}

// ServeHTTP is a method of DSDHandler.
// Now our DSDHandler is a http.Handler.
func (dsdh *DSDHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Validate the user.
	user := dsdh.getCurrentUser(r)
	if user != nil {
		userJSON, err := json.Marshal(user)
		if err != nil {
			log.Printf("error marshaling user: %v", err)
		}
		r.Header.Add("X-User", string(userJSON))
	} else {
		// If there is no user found,
		// explicitly remove X-User header to
		// prevent a hacker who tries to sneak in
		// by setting a fake X-User header in the request.
		r.Header.Del("X-User")
	}

	// Use the received microservice path pattern
	// to determine which microservice should this requset
	// be forwarded to.
	dsdh.serviceList.mx.RLock()
	for _, svc := range dsdh.serviceList.services {
		pattern := svc.pathPatternRegexp
		if pattern.MatchString(r.URL.Path) {
			dsdh.serviceList.mx.RUnlock()
			svc.proxy.ServeHTTP(w, r)
			// Return this function if we find a match,
			// and request is routed to our microservice.
			return
		}
	}
	dsdh.serviceList.mx.RUnlock()

	// If no match is found,
	// it means this request should not be forwarded to any microservices,
	// just call our real handler to handle it.
	dsdh.handler.ServeHTTP(w, r)
}

// newServiceProxy forwards relevant requests to microservices based on resource path.
// The microservices should have corresponding handlers that can handle those requests.
func newServiceProxy(addrs []string) *httputil.ReverseProxy {
	i := 0
	mutex := sync.Mutex{}
	return &httputil.ReverseProxy{
		Director: func(r *http.Request) {
			mutex.Lock()
			r.URL.Host = addrs[i%len(addrs)]
			i++
			mutex.Unlock()
			r.URL.Scheme = "http"
		},
	}
}

func (dsdh *DSDHandler) getCurrentUser(r *http.Request) *admins.Admin {
	sessionState := &SessionState{}
	_, err := sessions.GetState(r, dsdh.ctx.signingKey, dsdh.ctx.sessionStore, sessionState)
	if err != nil {
		return nil
	}
	return sessionState.Admin
}
