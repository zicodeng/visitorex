package sessions

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis"
)

// RedisStore represents a sessions.Store backed by redis.
type RedisStore struct {
	// Redis client used to talk to Redis server.
	Client *redis.Client
	// Used for key expiry time on Redis.
	SessionDuration time.Duration
}

// NewRedisStore constructs a new RedisStore.
func NewRedisStore(client *redis.Client, sessionDuration time.Duration) *RedisStore {

	// Initialize and return a new RedisStore struct.
	if client == nil {
		client = redis.NewClient(&redis.Options{
			Addr:     "127.0.0.1:6379",
			Password: "",
			DB:       0,
		})
	}

	return &RedisStore{
		Client:          client,
		SessionDuration: sessionDuration,
	}
}

// Store implementation

// Save saves the provided "sessionState" and associated sessionToken to the store.
// The "sessionState" parameter is typically a pointer to a struct containing
// all the data you want to associated with the given sessionToken.
func (rs *RedisStore) Save(sessionToken SessionToken, sessionState interface{}) error {
	// Marshal the "sessionState" to JSON.
	j, err := json.Marshal(sessionState)
	if nil != err {
		return fmt.Errorf("error marshalling struct to JSON: %v", err)
	}

	// Save it in the Redis database,
	// using "sessionToken.getRedisKey()" for the key.
	// Return any errors that occur along the way.
	err = rs.Client.Set(sessionToken.getRedisKey(), j, rs.SessionDuration).Err()
	if err != nil {
		return fmt.Errorf("error saving session state to Redis: %v", err)
	}

	return nil
}

// Get populates "sessionState" with the data previously saved
// for the given sessionToken.
func (rs *RedisStore) Get(sessionToken SessionToken, sessionState interface{}) error {

	// Use the Pipeline feature of the redis
	// package to do both the get and the reset of the expiry time
	// in just one network round trip.
	pipe := rs.Client.Pipeline()
	defer pipe.Close()

	// get is a string command that retrieves the previously-saved session state
	// for a given key from Redis.
	// It is just a command waiting to be executed.
	get := pipe.Get(sessionToken.getRedisKey())

	// Reset the expiry time, so that it doesn't get deleted until
	// the SessionDuration has elapsed.
	expire := pipe.Expire(sessionToken.getRedisKey(), rs.SessionDuration)

	// Execute all previously queued commands using one client-server roundtrip.
	pipe.Exec()

	// Handle errors that might be returned from
	// previously executed commands.

	// Extract session state data from get command.
	// If fails to get, return ErrStateNotFound.
	val, err := get.Bytes()
	if err != nil {
		return ErrStateNotFound
	}

	err = expire.Err()
	if err != nil {
		return fmt.Errorf("error setting expiry time: %v", err)
	}

	// Unmarshal it back into the "sessionState" parameter.
	err = json.Unmarshal(val, sessionState)
	if err != nil {
		return fmt.Errorf("error unmarshalling JSON to struct: %v", err)
	}

	return nil
}

// Delete deletes all state data associated with the sessionToken from the store.
func (rs *RedisStore) Delete(sessionToken SessionToken) error {
	// Delete the data stored in Redis for the provided sessionToken.
	err := rs.Client.Del(sessionToken.getRedisKey()).Err()
	if err != nil {
		return fmt.Errorf("error deleting session state: %v", err)
	}
	return nil
}

// getRedisKey() returns the Redis key to use for the sessionToken.
func (sessionToken SessionToken) getRedisKey() string {
	// Convert the SessionToken to a string and add the prefix "sessionToken:" to keep
	// SessionToken keys separate from other keys that might end up in this
	// Redis instance.
	return "sessionToken:" + sessionToken.String()
}
