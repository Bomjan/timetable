package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/Bomjan/timetable/backend/db"
	"github.com/Bomjan/timetable/backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetSubjects(c *gin.Context) {
	if db.InMemoryMode {
		c.JSON(http.StatusOK, db.Store.Subjects)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	subjects := []models.Subject{}
	cursor, err := db.Database.Collection("subjects").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	cursor.All(ctx, &subjects)
	c.JSON(http.StatusOK, subjects)
}

func CreateSubject(c *gin.Context) {
	var subject models.Subject
	if err := c.ShouldBindJSON(&subject); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// GENERATE ID (Fixes Mongo Duplicate Key Error)
	subject.ID = primitive.NewObjectID()

	if db.InMemoryMode {
		db.Store.Subjects = append(db.Store.Subjects, subject)
		c.JSON(http.StatusOK, subject)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := db.Database.Collection("subjects").InsertOne(ctx, subject)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, subject)
}

func GetTeachers(c *gin.Context) {
	if db.InMemoryMode {
		c.JSON(http.StatusOK, db.Store.Teachers)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	teachers := []models.Teacher{}
	cursor, err := db.Database.Collection("teachers").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	cursor.All(ctx, &teachers)
	c.JSON(http.StatusOK, teachers)
}

func CreateTeacher(c *gin.Context) {
	var teacher models.Teacher
	if err := c.ShouldBindJSON(&teacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	teacher.ID = primitive.NewObjectID()

	if db.InMemoryMode {
		db.Store.Teachers = append(db.Store.Teachers, teacher)
		c.JSON(http.StatusOK, teacher)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := db.Database.Collection("teachers").InsertOne(ctx, teacher)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, teacher)
}

func GetClasses(c *gin.Context) {
	if db.InMemoryMode {
		c.JSON(http.StatusOK, db.Store.Classes)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	classes := []models.Class{}
	cursor, err := db.Database.Collection("classes").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	cursor.All(ctx, &classes)
	c.JSON(http.StatusOK, classes)
}

func CreateClass(c *gin.Context) {
	var class models.Class
	if err := c.ShouldBindJSON(&class); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	class.ID = primitive.NewObjectID()

	if db.InMemoryMode {
		db.Store.Classes = append(db.Store.Classes, class)
		c.JSON(http.StatusOK, class)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := db.Database.Collection("classes").InsertOne(ctx, class)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, class)
}
func DeleteClass(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := primitive.ObjectIDFromHex(idStr)

	if db.InMemoryMode {
		for i, v := range db.Store.Classes {
			if v.(models.Class).ID == id {
				db.Store.Classes = append(db.Store.Classes[:i], db.Store.Classes[i+1:]...)
				break
			}
		}
		c.JSON(http.StatusOK, gin.H{"status": "deleted"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := db.Database.Collection("classes").DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}

func DeleteSubject(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := primitive.ObjectIDFromHex(idStr)

	if db.InMemoryMode {
		for i, v := range db.Store.Subjects {
			if v.(models.Subject).ID == id {
				db.Store.Subjects = append(db.Store.Subjects[:i], db.Store.Subjects[i+1:]...)
				break
			}
		}
		c.JSON(http.StatusOK, gin.H{"status": "deleted"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := db.Database.Collection("subjects").DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}

func DeleteTeacher(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := primitive.ObjectIDFromHex(idStr)

	if db.InMemoryMode {
		for i, v := range db.Store.Teachers {
			if v.(models.Teacher).ID == id {
				db.Store.Teachers = append(db.Store.Teachers[:i], db.Store.Teachers[i+1:]...)
				break
			}
		}
		c.JSON(http.StatusOK, gin.H{"status": "deleted"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := db.Database.Collection("teachers").DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}
