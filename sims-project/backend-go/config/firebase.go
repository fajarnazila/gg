package config

import (
	"context"
	"log"
	"os"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"google.golang.org/api/option"
	"github.com/gin-gonic/gin"
)

var (
	FirebaseApp *firebase.App
	AuthClient  *auth.Client
)

func InitializeFirebase() {
	ctx := context.Background()

	// Check if we should use Firebase
	if os.Getenv("NODE_ENV") == "development" && os.Getenv("USE_FIREBASE") != "true" {
		log.Println("Running in development mode without Firebase authentication")
		return
	}

	// Initialize Firebase
	opt := option.WithCredentialsFile("firebase-service-account.json")
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v", err)
	}

	// Initialize Auth client
	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("error initializing auth client: %v", err)
	}

	FirebaseApp = app
	AuthClient = authClient

	log.Println("Firebase Admin SDK initialized successfully")
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", os.Getenv("CORS_ORIGIN"))
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{"error": "Access token required"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenString := ""
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenString = authHeader[7:]
		} else {
			c.JSON(401, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		// Verify token
		token, err := AuthClient.VerifyIDToken(context.Background(), tokenString)
		if err != nil {
			c.JSON(403, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Store user info in context
		c.Set("user", token)
		c.Next()
	}
}

func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(401, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		token := user.(*auth.Token)
		role := token.Claims["role"]

		if role == nil {
			// Default role for backward compatibility
			role = "student"
		}

		roleStr, ok := role.(string)
		if !ok {
			c.JSON(403, gin.H{"error": "Invalid role format"})
			c.Abort()
			return
		}

		// Check if user role is allowed
		allowed := false
		for _, allowedRole := range allowedRoles {
			if roleStr == allowedRole {
				allowed = true
				break
			}
		}

		if !allowed {
			c.JSON(403, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}
