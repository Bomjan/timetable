package db

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/Bomjan/timetable/backend/models"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var Database *mongo.Database
var InMemoryMode = false

// In-Memory Storage for Testing
var Store = struct {
	Subjects  []interface{}
	Teachers  []interface{}
	Classes   []interface{}
	Timetable []interface{}
	Overrides []interface{}
}{
	Subjects:  []interface{}{},
	Teachers:  []interface{}{},
	Classes:   []interface{}{},
	Timetable: []interface{}{},
	Overrides: []interface{}{},
}

func Connect() {
	log.Println("Connecting to MongoDB...")
	models.LoadConfig()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var uri string
	if strings.Contains(models.AppConfig.DBHost, "mongodb.net") {
		// Atlas / SRV connection
		uri = fmt.Sprintf("mongodb+srv://%s:%s@%s/%s?retryWrites=true&w=majority",
			models.AppConfig.DBUser,
			models.AppConfig.DBPassword,
			models.AppConfig.DBHost,
			models.AppConfig.DBName)
	} else {
		// Local or standard connection
		if models.AppConfig.DBUser != "" && models.AppConfig.DBPassword != "" {
			uri = fmt.Sprintf("mongodb://%s:%s@%s:%s",
				models.AppConfig.DBUser,
				models.AppConfig.DBPassword,
				models.AppConfig.DBHost,
				models.AppConfig.DBPort)
		} else {
			uri = fmt.Sprintf("mongodb://%s:%s",
				models.AppConfig.DBHost,
				models.AppConfig.DBPort)
		}
	}

	// Secret URI for logging (mask password)
	logURI := uri
	if models.AppConfig.DBPassword != "" {
		logURI = strings.Replace(uri, models.AppConfig.DBPassword, "****", 1)
	}
	log.Printf("Connecting with URI: %s", logURI)

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err == nil {
		err = client.Ping(ctx, nil)
	}

	if err != nil {
		log.Printf("Failed to connect to MongoDB: %v", err)
		log.Println("Switching to IN-MEMORY mode for testing.")
		InMemoryMode = true
		return
	}

	Client = client
	Database = client.Database(models.AppConfig.DBName)
	log.Printf("Successfully connected to MongoDB database: %s", models.AppConfig.DBName)
}
