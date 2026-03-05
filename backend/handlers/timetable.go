package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sundrabomjan/timetable/backend/db"
	"github.com/sundrabomjan/timetable/backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetTimetable(c *gin.Context) {
	classIDStr := c.Param("class_id")
	classID, _ := primitive.ObjectIDFromHex(classIDStr)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var entries []models.TimetableEntry
	cursor, err := db.Database.Collection("timetables").Find(ctx, bson.M{"class_id": classID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	cursor.All(ctx, &entries)

	// Add conflict info
	for i := range entries {
		if !entries[i].TeacherID.IsZero() {
			count, _ := db.Database.Collection("timetables").CountDocuments(ctx, bson.M{
				"day":        entries[i].Day,
				"period":     entries[i].Period,
				"teacher_id": entries[i].TeacherID,
				"class_id":   bson.M{"$ne": entries[i].ClassID},
			})
			if count > 0 {
				entries[i].HasConflict = true
			}
		}
	}
	c.JSON(http.StatusOK, entries)
}

func UpdateSlot(c *gin.Context) {
	var entry models.TimetableEntry
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"class_id": entry.ClassID,
		"day":      entry.Day,
		"period":   entry.Period,
	}

	update := bson.M{"$set": entry}
	opts := options.Update().SetUpsert(true)
	_, err := db.Database.Collection("timetables").UpdateOne(ctx, filter, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func SwapSlots(c *gin.Context) {
	var req struct {
		ClassID primitive.ObjectID `json:"class_id"`
		Slot1   struct {
			Day    int `json:"day"`
			Period int `json:"period"`
		} `json:"slot1"`
		Slot2 struct {
			Day    int `json:"day"`
			Period int `json:"period"`
		} `json:"slot2"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var entry1, entry2 models.TimetableEntry
	db.Database.Collection("timetables").FindOne(ctx, bson.M{"class_id": req.ClassID, "day": req.Slot1.Day, "period": req.Slot1.Period}).Decode(&entry1)
	db.Database.Collection("timetables").FindOne(ctx, bson.M{"class_id": req.ClassID, "day": req.Slot2.Day, "period": req.Slot2.Period}).Decode(&entry2)

	// Update Slot 1 with Data 2
	filter1 := bson.M{"class_id": req.ClassID, "day": req.Slot1.Day, "period": req.Slot1.Period}
	update1 := bson.M{"$set": bson.M{"subject_id": entry2.SubjectID, "teacher_id": entry2.TeacherID, "duration": entry2.Duration}}
	db.Database.Collection("timetables").UpdateOne(ctx, filter1, update1)

	// Update Slot 2 with Data 1
	filter2 := bson.M{"class_id": req.ClassID, "day": req.Slot2.Day, "period": req.Slot2.Period}
	update2 := bson.M{"$set": bson.M{"subject_id": entry1.SubjectID, "teacher_id": entry1.TeacherID, "duration": entry1.Duration}}
	db.Database.Collection("timetables").UpdateOne(ctx, filter2, update2)

	c.JSON(http.StatusOK, gin.H{"status": "swapped"})
}

func MergeSlots(c *gin.Context) {
	// Logic to merge consecutive slots (simplified: set duration of first, remove second)
	var req struct {
		ClassID primitive.ObjectID `json:"class_id"`
		Day     int                `json:"day"`
		Period  int                `json:"period"`
		Count   int                `json:"count"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update first slot duration
	db.Database.Collection("timetables").UpdateOne(ctx, 
		bson.M{"class_id": req.ClassID, "day": req.Day, "period": req.Period},
		bson.M{"$set": bson.M{"duration": req.Count}},
	)

	// Remove subsequent slots that are now part of the block
	for i := 1; i < req.Count; i++ {
		db.Database.Collection("timetables").DeleteOne(ctx, 
			bson.M{"class_id": req.ClassID, "day": req.Day, "period": req.Period + i},
		)
	}

	c.JSON(http.StatusOK, gin.H{"status": "merged"})
}

func SplitSlot(c *gin.Context) {
	var req struct {
		ClassID primitive.ObjectID `json:"class_id"`
		Day     int                `json:"day"`
		Period  int                `json:"period"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var entry models.TimetableEntry
	db.Database.Collection("timetables").FindOne(ctx, bson.M{"class_id": req.ClassID, "day": req.Day, "period": req.Period}).Decode(&entry)

	if entry.Duration > 1 {
		// Reset duration
		db.Database.Collection("timetables").UpdateOne(ctx,
			bson.M{"class_id": req.ClassID, "day": req.Day, "period": req.Period},
			bson.M{"$set": bson.M{"duration": 1}},
		)
		// Usually we'd create empty slots for the rest, but "OFF" is default if missing
	}

	c.JSON(http.StatusOK, gin.H{"status": "split"})
}

func GetWeeklyOverride(c *gin.Context) {
	// ... implementation for overrides
}

func SaveWeeklyOverride(c *gin.Context) {
	// ... implementation for overrides
}
