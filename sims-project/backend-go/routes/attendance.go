package routes

import (
	"net/http"
	"sims-backend-go/models"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
)

func GetAttendance(c *gin.Context) {
	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	// Get all attendance records
	iter := client.Collection("attendance").Documents(ctx)
	var attendance []models.Attendance

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance"})
			return
		}

		var record models.Attendance
		doc.DataTo(&record)
		record.ID = doc.Ref.ID
		attendance = append(attendance, record)
	}

	c.JSON(http.StatusOK, gin.H{"attendance": attendance})
}

func CreateAttendance(c *gin.Context) {
	var req models.AttendanceCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	// Get user from context for teacher ID
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	token := user.(*auth.Token)

	// Create attendance record
	record := models.Attendance{
		StudentID: req.StudentID,
		ClassID:   req.ClassID,
		Date:      req.Date,
		Status:    req.Status,
		Remarks:   req.Remarks,
		TeacherID: token.UID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	docRef, _, err := client.Collection("attendance").Add(ctx, record)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create attendance record"})
		return
	}

	record.ID = docRef.ID
	c.JSON(http.StatusCreated, gin.H{"attendance": record})
}

func GetAttendanceRecord(c *gin.Context) {
	recordID := c.Param("id")

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	doc, err := client.Collection("attendance").Doc(recordID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attendance record not found"})
		return
	}

	var record models.Attendance
	doc.DataTo(&record)
	record.ID = doc.Ref.ID

	c.JSON(http.StatusOK, gin.H{"attendance": record})
}

func UpdateAttendance(c *gin.Context) {
	recordID := c.Param("id")

	var req models.AttendanceUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	// Prepare update data
	updateData := map[string]interface{}{
		"updatedAt": time.Now(),
	}

	if req.Status != nil {
		updateData["status"] = *req.Status
	}
	if req.Remarks != nil {
		updateData["remarks"] = *req.Remarks
	}
	if req.Date != nil {
		updateData["date"] = *req.Date
	}

	_, err = client.Collection("attendance").Doc(recordID).Update(ctx, updateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update attendance record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Attendance record updated successfully"})
}

func DeleteAttendance(c *gin.Context) {
	recordID := c.Param("id")

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	_, err = client.Collection("attendance").Doc(recordID).Delete(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete attendance record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Attendance record deleted successfully"})
}
