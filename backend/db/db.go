package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var Database *mongo.Database
var InMemoryMode = false

// In-Memory Storage for Testing
var Store = struct {
	Subjects []interface{}
	Teachers []interface{}
	Classes  []interface{}
	Timetable []interface{}
	Overrides []interface{}
}{
	Subjects: []interface{}{},
	Teachers: []interface{}{},
	Classes:  []interface{}{},
	Timetable: []interface{}{},
	Overrides: []interface{}{},
}


func Connect() {
	log.Println("Connecting to MongoDB...")
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second) // Shorter timeout
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err == nil {
		err = client.Ping(ctx, nil)
	}

	if err != nil {
		log.Println("MongoDB not found. Switching to IN-MEMORY mode for testing.")
		InMemoryMode = true
		return
	}

	Client = client
	Database = client.Database("timetable_db")
	log.Println("Connected to MongoDB")
}
