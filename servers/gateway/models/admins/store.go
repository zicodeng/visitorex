package admins

import (
	"errors"
	"gopkg.in/mgo.v2/bson"
)

// ErrAdminNotFound is returned when the admin can't be found.
var ErrAdminNotFound = errors.New("Admin not found")

// Store represents a store for Users.
type Store interface {
	// GetByID returns the Admin with the given ID.
	GetByID(id bson.ObjectId) (*Admin, error)

	// GetByEmail returns the Admin with the given email.
	GetByEmail(email string) (*Admin, error)

	// GetByUserName returns the Admin with the given Username.
	GetByUserName(username string) (*Admin, error)

	// Insert converts the NewUser to a Admin, inserts
	// it into the database, and returns it.
	Insert(newAdmin *NewAdmin) (*Admin, error)

	// Update applies UserUpdates to the given admin ID.
	Update(adminID bson.ObjectId, updates *Updates) error

	// Delete deletes the admin with the given ID.
	Delete(adminID bson.ObjectId) error
}
