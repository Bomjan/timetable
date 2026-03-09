package handlers

import (
	"context"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/Bomjan/timetable/backend/db"
	"github.com/Bomjan/timetable/backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetTimetable(c *gin.Context) {
	classIDStr := c.Param("class_id")
	classID, _ := primitive.ObjectIDFromHex(classIDStr)

	if db.InMemoryMode {
		entries := []models.TimetableEntry{}
		for _, v := range db.Store.Timetable {
			entry := v.(models.TimetableEntry)
			if entry.ClassID == classID {
				entries = append(entries, entry)
			}
		}

		// Conflict detection for in-memory mode
		for i := range entries {
			if !entries[i].TeacherID.IsZero() {
				var count int64
				for _, v := range db.Store.Timetable {
					e := v.(models.TimetableEntry)
					if e.Day == entries[i].Day && e.Period == entries[i].Period && e.TeacherID.Hex() == entries[i].TeacherID.Hex() {
						if e.ClassID.Hex() != entries[i].ClassID.Hex() {
							count++
						}
					}
				}
				if count > 0 {
					entries[i].HasConflict = true
				}
			}
		}

		c.JSON(http.StatusOK, entries)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	entries := []models.TimetableEntry{}
	cursor, err := db.Database.Collection("timetables").Find(ctx, bson.M{"class_id": classID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	cursor.All(ctx, &entries)

	// Add conflict info
	for i := range entries {
		if !entries[i].TeacherID.IsZero() {
			var count int64
			if db.InMemoryMode {
				for _, v := range db.Store.Timetable {
					e := v.(models.TimetableEntry)
					if e.Day == entries[i].Day && e.Period == entries[i].Period && e.TeacherID.Hex() == entries[i].TeacherID.Hex() {
						log.Printf("Match found: Teacher=%s, ClassE=%s, ClassEntry=%s", e.TeacherID.Hex(), e.ClassID.Hex(), entries[i].ClassID.Hex())
						if e.ClassID.Hex() != entries[i].ClassID.Hex() {
							log.Println("CONFLICT DETECTED in in-memory mode!")
							count++
						}
					}
				}
			} else {
				count, _ = db.Database.Collection("timetables").CountDocuments(ctx, bson.M{
					"day":        entries[i].Day,
					"period":     entries[i].Period,
					"teacher_id": entries[i].TeacherID,
					"class_id":   bson.M{"$ne": entries[i].ClassID},
				})
			}
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

	if db.InMemoryMode {
		found := false
		for i, v := range db.Store.Timetable {
			e := v.(models.TimetableEntry)
			if e.ClassID == entry.ClassID && e.Day == entry.Day && e.Period == entry.Period {
				db.Store.Timetable[i] = entry
				found = true
				break
			}
		}
		if !found {
			db.Store.Timetable = append(db.Store.Timetable, entry)
		}
		c.JSON(http.StatusOK, gin.H{"status": "success"})
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

	if db.InMemoryMode {
		var idx1, idx2 = -1, -1
		var entry1, entry2 models.TimetableEntry
		for i, v := range db.Store.Timetable {
			e := v.(models.TimetableEntry)
			if e.ClassID == req.ClassID && e.Day == req.Slot1.Day && e.Period == req.Slot1.Period {
				idx1 = i
				entry1 = e
			}
			if e.ClassID == req.ClassID && e.Day == req.Slot2.Day && e.Period == req.Slot2.Period {
				idx2 = i
				entry2 = e
			}
		}
		if idx1 != -1 && idx2 != -1 {
			// Swap fields
			entry1.Day, entry1.Period, entry2.Day, entry2.Period = entry2.Day, entry2.Period, entry1.Day, entry1.Period
			db.Store.Timetable[idx1] = entry2
			db.Store.Timetable[idx2] = entry1
		}
		c.JSON(http.StatusOK, gin.H{"status": "swapped"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var entry1, entry2 models.TimetableEntry
	err1 := db.Database.Collection("timetables").FindOne(ctx, bson.M{
		"class_id": req.ClassID,
		"day":      req.Slot1.Day,
		"period":   req.Slot1.Period,
	}).Decode(&entry1)

	err2 := db.Database.Collection("timetables").FindOne(ctx, bson.M{
		"class_id": req.ClassID,
		"day":      req.Slot2.Day,
		"period":   req.Slot2.Period,
	}).Decode(&entry2)

	// If neither exists, nothing to swap
	if err1 != nil && err2 != nil {
		c.JSON(http.StatusOK, gin.H{"status": "swapped (empty)"})
		return
	}

	// If entry 1 exists, move it to slot 2
	if err1 == nil {
		db.Database.Collection("timetables").UpdateOne(ctx,
			bson.M{"_id": entry1.ID},
			bson.M{"$set": bson.M{"day": req.Slot2.Day, "period": req.Slot2.Period}},
		)
	}

	// If entry 2 exists, move it to slot 1
	if err2 == nil {
		db.Database.Collection("timetables").UpdateOne(ctx,
			bson.M{"_id": entry2.ID},
			bson.M{"$set": bson.M{"day": req.Slot1.Day, "period": req.Slot1.Period}},
		)
	}

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

	if db.InMemoryMode {
		for i, v := range db.Store.Timetable {
			e := v.(models.TimetableEntry)
			if e.ClassID == req.ClassID && e.Day == req.Day && e.Period == req.Period {
				e.Duration = req.Count
				db.Store.Timetable[i] = e
				break
			}
		}
		// Remove subsequent
		for i := 1; i < req.Count; i++ {
			for j := 0; j < len(db.Store.Timetable); j++ {
				e := db.Store.Timetable[j].(models.TimetableEntry)
				if e.ClassID == req.ClassID && e.Day == req.Day && e.Period == req.Period+i {
					db.Store.Timetable = append(db.Store.Timetable[:j], db.Store.Timetable[j+1:]...)
					j--
				}
			}
		}
		c.JSON(http.StatusOK, gin.H{"status": "merged"})
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

	if db.InMemoryMode {
		for i, v := range db.Store.Timetable {
			e := v.(models.TimetableEntry)
			if e.ClassID == req.ClassID && e.Day == req.Day && e.Period == req.Period {
				e.Duration = 1
				db.Store.Timetable[i] = e
				break
			}
		}
		c.JSON(http.StatusOK, gin.H{"status": "split"})
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

func SaveTimetable(c *gin.Context) {
	var req struct {
		ClassID primitive.ObjectID      `json:"class_id"`
		Entries []models.TimetableEntry `json:"entries"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if db.InMemoryMode {
		newTimetable := []interface{}{}
		for _, v := range db.Store.Timetable {
			e := v.(models.TimetableEntry)
			if e.ClassID != req.ClassID {
				newTimetable = append(newTimetable, v)
			}
		}
		for _, e := range req.Entries {
			e.ClassID = req.ClassID
			newTimetable = append(newTimetable, e)
		}
		db.Store.Timetable = newTimetable
		c.JSON(http.StatusOK, gin.H{"status": "saved"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Delete existing for this class
	db.Database.Collection("timetables").DeleteMany(ctx, bson.M{"class_id": req.ClassID})

	// 2. Insert new entries
	if len(req.Entries) > 0 {
		var docs []interface{}
		for _, e := range req.Entries {
			e.ClassID = req.ClassID
			if e.ID.IsZero() {
				e.ID = primitive.NewObjectID()
			}
			docs = append(docs, e)
		}
		_, err := db.Database.Collection("timetables").InsertMany(ctx, docs)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "saved"})
}

func GetWeeklyOverride(c *gin.Context) {
	classIDStr := c.Param("class_id")
	weekStr := c.Param("week")
	classID, _ := primitive.ObjectIDFromHex(classIDStr)
	week, _ := strconv.Atoi(weekStr)

	if db.InMemoryMode {
		entries := []models.TimetableEntry{}
		for _, v := range db.Store.Overrides {
			entry := v.(models.TimetableEntry)
			if entry.ClassID == classID && entry.Week == week {
				entries = append(entries, entry)
			}
		}
		c.JSON(http.StatusOK, entries)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	entries := []models.TimetableEntry{}
	cursor, err := db.Database.Collection("weekly_overrides").Find(ctx, bson.M{"class_id": classID, "week": week})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	cursor.All(ctx, &entries)
	c.JSON(http.StatusOK, entries)
}

func SaveWeeklyOverride(c *gin.Context) {
	var req struct {
		ClassID primitive.ObjectID     `json:"class_id"`
		Week    int                    `json:"week"`
		Entries []models.TimetableEntry `json:"entries"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if db.InMemoryMode {
		// Clean existing for this week
		newOverrides := []interface{}{}
		for _, v := range db.Store.Overrides {
			e := v.(models.TimetableEntry)
			if e.ClassID != req.ClassID || e.Week != req.Week {
				newOverrides = append(newOverrides, v)
			}
		}
		for _, e := range req.Entries {
			e.ClassID = req.ClassID
			e.Week = req.Week
			newOverrides = append(newOverrides, e)
		}
		db.Store.Overrides = newOverrides
		c.JSON(http.StatusOK, gin.H{"status": "saved"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Delete existing overrides for this week
	db.Database.Collection("weekly_overrides").DeleteMany(ctx, bson.M{"class_id": req.ClassID, "week": req.Week})

	// 2. Insert new entries
	if len(req.Entries) > 0 {
		var docs []interface{}
		for _, e := range req.Entries {
			e.ClassID = req.ClassID
			e.Week = req.Week
			docs = append(docs, e)
		}
		_, err := db.Database.Collection("weekly_overrides").InsertMany(ctx, docs)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "saved"})
}

func ClearTimetable(c *gin.Context) {
	classIDStr := c.Param("class_id")
	classID, _ := primitive.ObjectIDFromHex(classIDStr)

	if db.InMemoryMode {
		newTimetable := []interface{}{}
		for _, v := range db.Store.Timetable {
			e := v.(models.TimetableEntry)
			if e.ClassID != classID {
				newTimetable = append(newTimetable, v)
			}
		}
		db.Store.Timetable = newTimetable
		c.JSON(http.StatusOK, gin.H{"status": "cleared"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := db.Database.Collection("timetables").DeleteMany(ctx, bson.M{"class_id": classID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "cleared"})
}
