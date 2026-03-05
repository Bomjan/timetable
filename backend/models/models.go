package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Subject struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name string             `bson:"name" json:"name"`
	Code string             `bson:"code" json:"code"`
}

type Teacher struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name       string             `bson:"name" json:"name"`
	SubjectIDs []primitive.ObjectID `bson:"subject_ids" json:"subject_ids"`
}

type Class struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name string             `bson:"name" json:"name"`
}

type TimetableEntry struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ClassID     primitive.ObjectID `bson:"class_id" json:"class_id"`
	Day         int                `bson:"day" json:"day"` // 1-5 (Mon-Fri)
	Period      int                `bson:"period" json:"period"` // 1-7
	SubjectID   primitive.ObjectID `bson:"subject_id,omitempty" json:"subject_id"`
	TeacherID   primitive.ObjectID `bson:"teacher_id,omitempty" json:"teacher_id"`
	Duration    int                `bson:"duration" json:"duration"` // Default 1
	Week        int                `bson:"week,omitempty" json:"week,omitempty"` // 0 for default
	SubjectName string             `bson:"-" json:"subject_name,omitempty"`
	TeacherName string             `bson:"-" json:"teacher_name,omitempty"`
	HasConflict bool               `bson:"-" json:"has_conflict"` // Virtual field
}

type WeeklyOverride struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	WeekNumber int                `bson:"week_number" json:"week_number"`
	ClassID    primitive.ObjectID `bson:"class_id" json:"class_id"`
	Entries    []TimetableEntry   `bson:"entries" json:"entries"`
}
