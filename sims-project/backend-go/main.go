package main

import (
	"log"
	"os"
	"sims-backend-go/config"
	"sims-backend-go/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Initialize Firebase
	if err := config.InitializeFirebase(); err != nil {
		log.Fatal("Failed to initialize Firebase:", err)
	}

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)
	if os.Getenv("GIN_MODE") == "debug" {
		gin.SetMode(gin.DebugMode)
	}

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // In production, specify your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "accept", "origin", "Cache-Control", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check endpoint
	r.GET("/api/health", routes.HealthCheck)

	// Auth routes (public)
	auth := r.Group("/api/auth")
	{
		auth.POST("/verify", routes.VerifyToken)
		auth.POST("/login", routes.Login)
		auth.POST("/logout", routes.Logout)
		auth.POST("/signup", routes.SignUp)
	}

	// Protected routes
	api := r.Group("/api")
	api.Use(config.FirebaseAuthMiddleware())
	{
		// Auth routes (protected)
		authProtected := api.Group("/auth")
		{
			authProtected.GET("/profile", routes.GetProfile)
			authProtected.PUT("/profile", routes.UpdateProfile)
			authProtected.POST("/change-password", routes.ChangePassword)
		}

		// User management (admin/vice_principal)
		users := api.Group("/users")
		users.Use(config.RoleMiddleware("admin", "vice_principal"))
		{
			users.GET("", routes.GetUsers)
			users.POST("", routes.CreateUser)
			users.GET("/:id", routes.GetUser)
			users.PUT("/:id", routes.UpdateUser)
			users.DELETE("/:id", routes.DeleteUser)
		}

		// Class management (admin/vice_principal)
		classes := api.Group("/classes")
		classes.Use(config.RoleMiddleware("admin", "vice_principal"))
		{
			classes.GET("", routes.GetClasses)
			classes.POST("", routes.CreateClass)
			classes.GET("/:id", routes.GetClass)
			classes.PUT("/:id", routes.UpdateClass)
			classes.DELETE("/:id", routes.DeleteClass)
		}

		// Attendance management (admin/teacher)
		attendance := api.Group("/attendance")
		attendance.Use(config.RoleMiddleware("admin", "teacher"))
		{
			attendance.GET("", routes.GetAttendance)
			attendance.POST("", routes.CreateAttendance)
			attendance.GET("/:id", routes.GetAttendanceRecord)
			attendance.PUT("/:id", routes.UpdateAttendance)
			attendance.DELETE("/:id", routes.DeleteAttendance)
		}

		// Grade management (admin/teacher/exam_supervisor)
		grades := api.Group("/grades")
		grades.Use(config.RoleMiddleware("admin", "teacher", "exam_supervisor"))
		{
			grades.GET("", routes.GetGrades)
			grades.POST("", routes.CreateGrade)
			grades.GET("/:id", routes.GetGrade)
			grades.PUT("/:id", routes.UpdateGrade)
			grades.DELETE("/:id", routes.DeleteGrade)
		}

		// Payment management (admin/treasurer)
		payments := api.Group("/payments")
		payments.Use(config.RoleMiddleware("admin", "treasurer"))
		{
			payments.GET("", routes.GetPayments)
			payments.POST("", routes.CreatePayment)
			payments.GET("/:id", routes.GetPayment)
			payments.PUT("/:id", routes.UpdatePayment)
			payments.DELETE("/:id", routes.DeletePayment)
		}
	}

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}
