package routes

import (
	"net/http"
	"sims-backend-go/models"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
)

func GetGrades(c *gin.Context) {
	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	// Get all grades
	iter := client.Collection("grades").Documents(ctx)
	var grades []models.Grade

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch grades"})
			return
		}

		var grade models.Grade
		doc.DataTo(&grade)
		grade.ID = doc.Ref.ID
		grades = append(grades, grade)
	}

	c.JSON(http.StatusOK, gin.H{"grades": grades})
}

func CreateGrade(c *gin.Context) {
	var req models.GradeCreateRequest
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

	// Create grade record
	grade := models.Grade{
		StudentID:    req.StudentID,
		ClassID:      req.ClassID,
		Subject:      req.Subject,
		Score:        req.Score,
		Grade:        req.Grade,
		GradeType:    req.GradeType,
		Semester:     req.Semester,
		AcademicYear: req.AcademicYear,
		Remarks:      req.Remarks,
		TeacherID:    token.UID,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	docRef, _, err := client.Collection("grades").Add(ctx, grade)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create grade"})
		return
	}

	grade.ID = docRef.ID
	c.JSON(http.StatusCreated, gin.H{"grade": grade})
}

func GetGrade(c *gin.Context) {
	gradeID := c.Param("id")

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	doc, err := client.Collection("grades").Doc(gradeID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grade not found"})
		return
	}

	var grade models.Grade
	doc.DataTo(&grade)
	grade.ID = doc.Ref.ID

	c.JSON(http.StatusOK, gin.H{"grade": grade})
}

func UpdateGrade(c *gin.Context) {
	gradeID := c.Param("id")

	var req models.GradeUpdateRequest
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

	if req.Score != nil {
		updateData["score"] = *req.Score
	}
	if req.Grade != nil {
		updateData["grade"] = *req.Grade
	}
	if req.GradeType != nil {
		updateData["gradeType"] = *req.GradeType
	}
	if req.Semester != nil {
		updateData["semester"] = *req.Semester
	}
	if req.AcademicYear != nil {
		updateData["academicYear"] = *req.AcademicYear
	}
	if req.Remarks != nil {
		updateData["remarks"] = *req.Remarks
	}

	_, err = client.Collection("grades").Doc(gradeID).Update(ctx, updateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update grade"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Grade updated successfully"})
}

func DeleteGrade(c *gin.Context) {
	gradeID := c.Param("id")

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	_, err = client.Collection("grades").Doc(gradeID).Delete(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete grade"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Grade deleted successfully"})
}
