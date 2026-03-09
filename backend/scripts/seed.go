package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Bomjan/timetable/backend/db"
	"github.com/Bomjan/timetable/backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	fmt.Println("Starting database seed...")
	
	// Load config and connect to DB
	models.LoadConfig()
	db.Connect()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Clear existing collections
	fmt.Println("Clearing existing collections...")
	db.Database.Collection("classes").Drop(ctx)
	db.Database.Collection("subjects").Drop(ctx)
	db.Database.Collection("teachers").Drop(ctx)
	db.Database.Collection("timetables").Drop(ctx)

	// 2. Create Classes
	fmt.Println("Creating classes...")
	classes := []models.Class{
		{ID: primitive.NewObjectID(), Name: "Grade 10A"},
		{ID: primitive.NewObjectID(), Name: "Grade 10B"},
		{ID: primitive.NewObjectID(), Name: "Grade 11 Science"},
	}
	for _, c := range classes {
		db.Database.Collection("classes").InsertOne(ctx, c)
	}

	// 3. Create Subjects
	fmt.Println("Creating subjects...")
	subjects := []models.Subject{
		{ID: primitive.NewObjectID(), Name: "Mathematics", Code: "MATH101"},
		{ID: primitive.NewObjectID(), Name: "Physics", Code: "PHYS101"},
		{ID: primitive.NewObjectID(), Name: "Chemistry", Code: "CHEM101"},
		{ID: primitive.NewObjectID(), Name: "English Literature", Code: "ENG101"},
		{ID: primitive.NewObjectID(), Name: "Computer Science", Code: "CS101"},
		{ID: primitive.NewObjectID(), Name: "History", Code: "HIST101"},
		{ID: primitive.NewObjectID(), Name: "Physical Education", Code: "PE101"},
	}
	for _, s := range subjects {
		db.Database.Collection("subjects").InsertOne(ctx, s)
	}

	// 4. Create Teachers
	fmt.Println("Creating teachers...")
	teachers := []models.Teacher{
		{ID: primitive.NewObjectID(), Name: "Mr. Alan Turing", SubjectIDs: []primitive.ObjectID{subjects[0].ID, subjects[4].ID}},
		{ID: primitive.NewObjectID(), Name: "Ms. Marie Curie", SubjectIDs: []primitive.ObjectID{subjects[1].ID, subjects[2].ID}},
		{ID: primitive.NewObjectID(), Name: "Mr. William Shakespeare", SubjectIDs: []primitive.ObjectID{subjects[3].ID, subjects[5].ID}},
		{ID: primitive.NewObjectID(), Name: "Coach Carter", SubjectIDs: []primitive.ObjectID{subjects[6].ID}},
	}
	for _, t := range teachers {
		db.Database.Collection("teachers").InsertOne(ctx, t)
	}

	// 5. Generate Timetable for Grade 10A
	fmt.Println("Generating timetable for Grade 10A...")
	class10A := classes[0]
	
	// Format: {Day, Period, SubjectIndex, TeacherIndex, Duration}
	schedule10A := []struct{ day, period, subjectIdx, teacherIdx, duration int }{
		// Monday
		{1, 1, 0, 0, 2}, // Math (double period)
		{1, 3, 3, 2, 1}, // English
		{1, 4, 1, 1, 1}, // Physics
		{1, 5, 2, 1, 1}, // Chemistry
		{1, 6, 6, 3, 1}, // PE
		
		// Tuesday
		{2, 1, 4, 0, 2}, // CS (double period)
		{2, 3, 0, 0, 1}, // Math
		{2, 4, 5, 2, 1}, // History
		{2, 5, 3, 2, 2}, // English (double)
		
		// Wednesday
		{3, 1, 2, 1, 2}, // Chemistry (double)
		{3, 3, 1, 1, 1}, // Physics
		{3, 4, 0, 0, 1}, // Math
		{3, 5, 4, 0, 1}, // CS
		{3, 6, 6, 3, 1}, // PE
		
		// Thursday
		{4, 1, 1, 1, 2}, // Physics (double)
		{4, 3, 5, 2, 2}, // History (double)
		{4, 5, 0, 0, 1}, // Math
		{4, 6, 3, 2, 1}, // English
		
		// Friday
		{5, 1, 0, 0, 1}, // Math
		{5, 2, 4, 0, 1}, // CS
		{5, 3, 2, 1, 1}, // Chemistry
		{5, 4, 1, 1, 1}, // Physics
		{5, 5, 6, 3, 2}, // PE (double)
	}

	var timetableEntries []interface{}
	for _, s := range schedule10A {
		entry := models.TimetableEntry{
			ClassID:     class10A.ID,
			Day:         s.day,
			Period:      s.period,
			SubjectID:   subjects[s.subjectIdx].ID,
			SubjectName: subjects[s.subjectIdx].Name,
			TeacherID:   teachers[s.teacherIdx].ID,
			TeacherName: teachers[s.teacherIdx].Name,
			Duration:    s.duration,
			Week:        0, // Default week
		}
		timetableEntries = append(timetableEntries, entry)
	}

	// Grade 10B getting some classes so it's not empty
	fmt.Println("Generating timetable for Grade 10B...")
	class10B := classes[1]
	schedule10B := []struct{ day, period, subjectIdx, teacherIdx, duration int }{
		{1, 1, 3, 2, 1}, // English
		{1, 2, 4, 0, 1}, // CS
		{1, 3, 1, 1, 2}, // Physics
		{1, 5, 0, 0, 1}, // Math
	}
	for _, s := range schedule10B {
		entry := models.TimetableEntry{
			ClassID:     class10B.ID,
			Day:         s.day,
			Period:      s.period,
			SubjectID:   subjects[s.subjectIdx].ID,
			SubjectName: subjects[s.subjectIdx].Name,
			TeacherID:   teachers[s.teacherIdx].ID,
			TeacherName: teachers[s.teacherIdx].Name,
			Duration:    s.duration,
			Week:        0,
		}
		timetableEntries = append(timetableEntries, entry)
	}

	if len(timetableEntries) > 0 {
		_, err := db.Database.Collection("timetables").InsertMany(ctx, timetableEntries)
		if err != nil {
			log.Fatalf("Failed to insert timetable entries: %v", err)
		}
	}

	fmt.Println("✅ Database successfully seeded with dummy data!")
	fmt.Println("Loaded:")
	fmt.Printf("- %d Classes\n", len(classes))
	fmt.Printf("- %d Subjects\n", len(subjects))
	fmt.Printf("- %d Teachers\n", len(teachers))
	fmt.Printf("- %d Timetable Entries\n", len(timetableEntries))
}
