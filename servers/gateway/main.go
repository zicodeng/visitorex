package main

import (
	"log"
	"net/http"
	"os"
)

// main is the main entry point for the server.
func main() {

	// Address the server should listen on.
	// If empty, default to ":443".
	serverAddr := os.Getenv("SERVER_ADDR")
	if len(serverAddr) == 0 {
		serverAddr = ":443"
	}

	// Path to TLS public certificate.
	TLSCert := os.Getenv("TLS_CERT")
	// Path to the associated private key.
	TLSKey := os.Getenv("TLS_KEY")
	if len(TLSCert) == 0 || len(TLSKey) == 0 {
		log.Fatal("Please set TLS_CERT and TLS_KEY environment variables")
	}

	mux := http.NewServeMux()

	log.Printf("Server is listening on https://%s\n", serverAddr)
	log.Fatal(http.ListenAndServeTLS(serverAddr, TLSCert, TLSKey, mux))
}
