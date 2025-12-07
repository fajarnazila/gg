package routes

import (
	"net/http"
	"sims-backend-go/config"
	"sims-backend-go/models"
	"time"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/auth"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
)

func GetUsers(c *gin.Context) {
	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	// Get all users
	iter := client.Collection("users").Documents(ctx)
	var users []models.User

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
			return
		}

		var user models.User
		doc.DataTo(&user)
		user.ID = doc.Ref.ID
		users = append(users, user)
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

func CreateUser(c *gin.Context) {
	var req models.UserCreateRequest
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

	// Create Firebase Auth user
	params := (&auth.UserToCreate{}).
		Email(req.Email).
		DisplayName(req.DisplayName).
		Disabled(false)

	userRecord, err := config.AuthClient.CreateUser(ctx, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Firebase user"})
		return
	}

	// Create user document in Firestore
	user := models.User{
		ID:                userRecord.UID,
		Email:             req.Email,
		DisplayName:       req.DisplayName,
		Role:              req.Role,
		Phone:             req.Phone,
		Address:           req.Address,
		EmergencyContact:  req.EmergencyContact,
		DateOfBirth:       req.DateOfBirth,
		Gender:            req.Gender,
		StudentID:         req.StudentID,
		ClassID:           req.ClassID,
		ParentID:          req.ParentID,
		IsActive:          true,
		LastLogin:         nil,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	_, err = client.Collection("users").Doc(userRecord.UID).Set(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user profile"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user": user})
}

func GetUser(c *gin.Context) {
	userID := c.Param("id")

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	doc, err := client.Collection("users").Doc(userID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var user models.User
	doc.DataTo(&user)
	user.ID = doc.Ref.ID

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func UpdateUser(c *gin.Context) {
	userID := c.Param("id")

	var req models.UserUpdateRequest
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

	if req.DisplayName != nil {
		updateData["displayName"] = *req.DisplayName
	}
	if req.Role != nil {
		updateData["role"] = *req.Role
	}
	if req.Phone != nil {
		updateData["phone"] = *req.Phone
	}
	if req.Address != nil {
		updateData["address"] = *req.Address
	}
	if req.EmergencyContact != nil {
		updateData["emergencyContact"] = *req.EmergencyContact
	}
	if req.ProfilePicture != nil {
		updateData["profilePicture"] = *req.ProfilePicture
	}
	if req.DateOfBirth != nil {
		updateData["dateOfBirth"] = *req.DateOfBirth
	}
	if req.Gender != nil {
		updateData["gender"] = *req.Gender
	}
	if req.StudentID != nil {
		updateData["studentId"] = *req.StudentID
	}
	if req.ClassID != nil {
		updateData["classId"] = *req.ClassID
	}
	if req.ParentID != nil {
		updateData["parentId"] = *req.ParentID
	}
	if req.IsActive != nil {
		updateData["isActive"] = *req.IsActive
	}

	_, err = client.Collection("users").Doc(userID).Update(ctx, updateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

func DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	// Delete from Firestore
	_, err = client.Collection("users").Doc(userID).Delete(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	// Delete from Firebase Auth
	err = config.AuthClient.DeleteUser(ctx, userID)
	if err != nil {
		// Log error but don't fail the request since Firestore deletion succeeded
		gin.DefaultWriter.Write([]byte("Warning: Failed to delete Firebase Auth user: " + err.Error()))
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
