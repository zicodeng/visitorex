package admins

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2/bson"
	"io"
	"net/mail"
	"strings"
)

const gravatarBasePhotoURL = "https://www.gravatar.com/avatar/"

var bcryptCost = 13

// Admin represents an admin account in the database.
type Admin struct {
	ID        bson.ObjectId `json:"id" bson:"_id"`
	Email     string        `json:"email"`
	PassHash  []byte        `json:"-"` // Stored, but not encoded to clients.
	UserName  string        `json:"userName"`
	FirstName string        `json:"firstName"`
	LastName  string        `json:"lastName"`
	PhotoURL  string        `json:"photoURL"`
}

// Credentials represents admin sign-in credentials.
type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// NewAdmin represents a new admin signing up for an account.
type NewAdmin struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	PasswordConf string `json:"passwordConf"`
	UserName     string `json:"userName"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
}

// Updates represents allowed updates to an admin profile.
type Updates struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

// Validate validates the new admin and returns an error if
// any of the validation rules fail, or nil if its valid.
func (newAdmin *NewAdmin) Validate() error {

	// Email field must be a valid email address.
	_, err := mail.ParseAddress(newAdmin.Email)
	if err != nil {
		return fmt.Errorf("Error parsing email: %v", err)
	}

	// Password must be at least 6 characters.
	if len(newAdmin.Password) < 6 {
		return fmt.Errorf("Password must be at least 6 characters")
	}

	// Password and PasswordConf must match.
	if newAdmin.Password != newAdmin.PasswordConf {
		return fmt.Errorf("Password must match password confirmation")
	}

	// UserName must be non-zero length.
	if len(newAdmin.UserName) == 0 {
		return fmt.Errorf("Username must be non-zero length")
	}

	// FirstName must be non-zero length.
	if len(newAdmin.FirstName) == 0 {
		return fmt.Errorf("First name must be non-zero length")
	}

	// LastName must be non-zero length.
	if len(newAdmin.LastName) == 0 {
		return fmt.Errorf("Last name must be non-zero length")
	}

	return nil
}

// ToAdmin converts the NewAdmin to a Admin, setting the
// PhotoURL and PassHash fields appropriately.
func (newAdmin *NewAdmin) ToAdmin() (*Admin, error) {

	// Construct a Admin based on NewAdmin.
	admin := &Admin{
		ID:        bson.NewObjectId(),
		UserName:  newAdmin.UserName,
		FirstName: newAdmin.FirstName,
		LastName:  newAdmin.LastName,
	}

	// Trim leading and trailing whitespace from an email address.
	email := strings.TrimSpace(newAdmin.Email)

	// Force all characters in the email to be lower-case.
	email = strings.ToLower(email)

	// Update Email field.
	admin.Email = email

	// md5 hash the final email string.
	h := md5.New()
	io.WriteString(h, email)
	result := hex.EncodeToString(h.Sum(nil))

	// Set the PhotoURL field of the new Admin to
	// the Gravatar PhotoURL for the admin's email address.
	photoURL := gravatarBasePhotoURL + result
	admin.PhotoURL = photoURL

	// Call .SetPassword() to set the PassHash
	// field of the Admin to a hash of the NewAdmin.Password.
	err := admin.SetPassword(newAdmin.Password)
	if err != nil {
		return nil, fmt.Errorf("error setting password hash of the Admin: %v", err)
	}

	return admin, nil
}

// FullName returns the admin's full name, in the form:
// "<FirstName> <LastName>"
// If either first or last name is an empty string, no
// space is put betweeen the names.
func (admin *Admin) FullName() string {
	return strings.TrimSpace(admin.FirstName + " " + admin.LastName)
}

// SetPassword hashes the password and stores it in the PassHash field.
func (admin *Admin) SetPassword(password string) error {
	// Automatically generates salt while hashing.
	// second parameter is the adaptive cost factor,
	// which controls the speed at which the algorithm runs.
	// The higher the cost factor, the slower the algorithm runs.
	// It wants the password as a byte slice, so convert using []byte()
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return fmt.Errorf("error generating bcrypt hash: %v", err)
	}
	admin.PassHash = passwordHash
	return nil
}

// Authenticate compares the plaintext password against the stored hash
// and returns an error if they don't match, or nil if they do.
func (admin *Admin) Authenticate(password string) error {
	err := bcrypt.CompareHashAndPassword(admin.PassHash, []byte(password))
	if err != nil {
		return fmt.Errorf("invalid password: %v", err)
	}
	return nil
}
