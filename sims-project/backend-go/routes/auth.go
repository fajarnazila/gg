package routes

import (
	"net/http"
	"sims-backend-go/config"
	"sims-backend-go/models"
	"time"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/auth"
	"github.com/gin-gonic/gin"
)

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
		"uptime":    "N/A", // Could implement uptime tracking
	})
}

func VerifyToken(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	token := user.(*auth.Token)

	// Get user profile from Firestore
	ctx := c.Request.Context()
	client, err := config.FirebaseApp.Firestore(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	userDoc, err := client.Collection("users").Doc(token.UID).Get(ctx)
	var role string = "student" // default role
	if err == nil && userDoc.Exists() {
		var userData models.User
		userDoc.DataTo(&userData)
		role = userData.Role
	}

	c.JSON(http.StatusOK, gin.H{
		"uid":    token.UID,
		"email":  token.Claims["email"],
		"role":   role,
		"profile": userDoc.Data(),
	})
}

func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// In Firebase, login is typically handled on the frontend
	// This endpoint can be used for custom authentication logic
	c.JSON(http.StatusOK, gin.H{
		"message": "Use Firebase Auth on frontend for login",
		"redirect": "/dashboard",
	})
}

func Logout(c *gin.Context) {
	// In Firebase, logout is typically handled on the client side
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func GetProfile(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	token := user.(*auth.Token)

	ctx := c.Request.Context()
	client, err := config.FirebaseApp.Firestore(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	userDoc, err := client.Collection("users").Doc(token.UID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
		return
	}

	var userData models.User
	userDoc.DataTo(&userData)

	c.JSON(http.StatusOK, gin.H{
		"uid":         token.UID,
		"email":       token.Claims["email"],
		"role":        userData.Role,
		"profile":     userData,
		"lastLogin":   userData.LastLogin,
		"isActive":    userData.IsActive,
	})
}

func UpdateProfile(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	token := user.(*auth.Token)

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()
	client, err := config.FirebaseApp.Firestore(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	// Prepare update data
	updateData := map[string]interface{}{
		"updatedAt": time.Now(),
	}

	if req.DisplayName != "" {
		updateData["displayName"] = req.DisplayName
	}
	if req.Phone != "" {
		updateData["phone"] = req.Phone
	}
	if req.Address != "" {
		updateData["address"] = req.Address
	}
	if req.EmergencyContact != "" {
		updateData["emergencyContact"] = req.EmergencyContact
	}
	if req.ProfilePicture != "" {
		updateData["profilePicture"] = req.ProfilePicture
	}

	// Update Firestore
	_, err = client.Collection("users").Doc(token.UID).Update(ctx, updateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	// Update Firebase Auth display name if provided
	if req.DisplayName != "" {
		_, err = config.AuthClient.UpdateUser(ctx, token.UID, (&auth.UserToUpdate{}).DisplayName(req.DisplayName))
		if err != nil {
			// Log error but don't fail the request
			gin.DefaultWriter.Write([]byte("Warning: Failed to update Firebase Auth display name: " + err.Error()))
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

func ChangePassword(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	token := user.(*auth.Token)

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update password in Firebase Auth
	_, err := config.AuthClient.UpdateUser(c.Request.Context(), token.UID, (&auth.UserToUpdate{}).Password(req.NewPassword))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to change password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}
