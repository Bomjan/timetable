package main

import (
	"github.com/Bomjan/timetable/backend/db"
	"github.com/Bomjan/timetable/backend/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db.Connect()

	r := gin.Default()
	r.Use(cors.Default())

	// Basic Entities
	r.GET("/subjects", handlers.GetSubjects)
	r.POST("/subjects", handlers.CreateSubject)
	r.GET("/teachers", handlers.GetTeachers)
	r.POST("/teachers", handlers.CreateTeacher)
	r.GET("/classes", handlers.GetClasses)
	r.POST("/classes", handlers.CreateClass)
	r.DELETE("/classes/:id", handlers.DeleteClass)

	// Timetable
	r.GET("/timetable/:class_id", handlers.GetTimetable)
	r.POST("/timetable/swap", handlers.SwapSlots)
	r.POST("/timetable/update", handlers.UpdateSlot)
	r.POST("/timetable/merge", handlers.MergeSlots)
	r.POST("/timetable/split", handlers.SplitSlot)

	// Overrides
	r.GET("/overrides/:class_id/:week", handlers.GetWeeklyOverride)
	r.POST("/overrides", handlers.SaveWeeklyOverride)

	r.Run(":8080")
}
