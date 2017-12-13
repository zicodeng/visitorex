package admins

import (
	"fmt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// MongoStore implements Store for MongoDB.
type MongoStore struct {
	session *mgo.Session
	dbname  string
	colname string // collection name
}

// NewMongoStore constructs a new MongoStore.
func NewMongoStore(session *mgo.Session, dbName string, collectionName string) *MongoStore {
	if session == nil {
		panic("nil pointer passed for session")
	}
	return &MongoStore{
		session: session,
		dbname:  dbName,
		colname: collectionName,
	}
}

// GetByID returns the Admin with the given ID.
func (store *MongoStore) GetByID(id bson.ObjectId) (*Admin, error) {
	// Create an empty Admin struct to hold admin data retrieved from MongoDB.
	admin := &Admin{}
	err := store.session.DB(store.dbname).C(store.colname).FindId(id).One(admin)
	if err != nil {
		return nil, fmt.Errorf("error retrieving data from MongoDB: %v", err)
	}
	return admin, nil
}

// GetByEmail returns the Admin with the given email.
func (store *MongoStore) GetByEmail(email string) (*Admin, error) {
	admin := &Admin{}
	q := bson.M{"email": email}
	err := store.session.DB(store.dbname).C(store.colname).Find(q).One(admin)
	if err != nil {
		return nil, fmt.Errorf("error retrieving data from MongoDB: %v", err)
	}
	return admin, nil
}

// GetByUserName returns the Admin with the given Username.
func (store *MongoStore) GetByUserName(username string) (*Admin, error) {
	admin := &Admin{}
	q := bson.M{"username": username}
	err := store.session.DB(store.dbname).C(store.colname).Find(q).One(admin)
	if err != nil {
		return nil, fmt.Errorf("error retrieving data from MongoDB: %v", err)
	}
	return admin, nil
}

// Insert converts the NewAdmin to a Admin, inserts
// it into the database, and returns it.
func (store *MongoStore) Insert(newAdmin *NewAdmin) (*Admin, error) {
	admin, err := newAdmin.ToAdmin()
	if err != nil {
		return nil, fmt.Errorf("error converting NewAdmin to Admin: %v", err)
	}

	err = store.session.DB(store.dbname).C(store.colname).Insert(admin)
	if err != nil {
		return nil, fmt.Errorf("error inserting data into MongoDB: %v", err)
	}

	return admin, nil
}

// Update applies update to the given admin ID.
func (store *MongoStore) Update(adminID bson.ObjectId, updates *Updates) error {
	if updates == nil {
		return fmt.Errorf("Updates is nil")
	}

	change := mgo.Change{
		Update:    bson.M{"$set": updates}, // $set sends a PATCH
		ReturnNew: true,                    // Get back new version rather than old version of the data.
	}
	admin := &Admin{}

	_, err := store.session.DB(store.dbname).C(store.colname).FindId(adminID).Apply(change, admin)
	if err != nil {
		return fmt.Errorf("error updating MongoDB: %v", err)
	}

	return nil
}

// Delete deletes the admin with the given ID.
func (store *MongoStore) Delete(adminID bson.ObjectId) error {
	err := store.session.DB(store.dbname).C(store.colname).RemoveId(adminID)
	if err != nil {
		return fmt.Errorf("error deleting data: %v", err)
	}

	return nil
}
