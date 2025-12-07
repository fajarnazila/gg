package routes

import (
	"net/http"
	"sims-backend-go/models"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
)

func GetClasses(c *gin.Context) {
	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	// Get all classes
	iter := client.Collection("classes").Documents(ctx)
	var classes []models.Class

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch classes"})
			return
		}

		var class models.Class
		doc.DataTo(&class)
		class.ID = doc.Ref.ID
		classes = append(classes, class)
	}

	c.JSON(http.StatusOK, gin.H{"classes": classes})
}

func CreateClass(c *gin.Context) {
	var req models.ClassCreateRequest
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

	// Create class document
	class := models.Class{
		Name:        req.Name,
		Grade:       req.Grade,
		TeacherID:   req.TeacherID,
		TeacherName: req.TeacherName,
		Room:        req.Room,
		Schedule:    req.Schedule,
		Students:    []string{}, // Start with empty students list
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	docRef, _, err := client.Collection("classes").Add(ctx, class)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create class"})
		return
	}

	class.ID = docRef.ID
	c.JSON(http.StatusCreated, gin.H{"class": class})
}

func GetClass(c *gin.Context) {
	classID := c.Param("id")

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	doc, err := client.Collection("classes").Doc(classID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	var class models.Class
	doc.DataTo(&class)
	class.ID = doc.Ref.ID

	c.JSON(http.StatusOK, gin.H{"class": class})
}

func UpdateClass(c *gin.Context) {
	classID := c.Param("id")

	var req models.ClassUpdateRequest
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

	if req.Name != nil {
		updateData["name"] = *req.Name
	}
	if req.Grade != nil {
		updateData["grade"] = *req.Grade
	}
	if req.TeacherID != nil {
		updateData["teacherId"] = *req.TeacherID
	}
	if req.TeacherName != nil {
		updateData["teacherName"] = *req.TeacherName
	}
	if req.Room != nil {
		updateData["room"] = *req.Room
	}
	if req.Schedule != nil {
		updateData["schedule"] = *req.Schedule
	}
	if req.IsActive != nil {
		updateData["isActive"] = *req.IsActive
	}

	_, err = client.Collection("classes").Doc(classID).Update(ctx, updateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update class"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Class updated successfully"})
}

func DeleteClass(c *gin.Context) {
	classID := c.Param("id")

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	_, err = client.Collection("classes").Doc(classID).Delete(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete class"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Class deleted successfully"})
}
