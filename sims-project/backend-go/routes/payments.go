package routes

import (
	"net/http"
	"sims-backend-go/models"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
)

func GetPayments(c *gin.Context) {
	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	// Get all payments
	iter := client.Collection("payments").Documents(ctx)
	var payments []models.Payment

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments"})
			return
		}

		var payment models.Payment
		doc.DataTo(&payment)
		payment.ID = doc.Ref.ID
		payments = append(payments, payment)
	}

	c.JSON(http.StatusOK, gin.H{"payments": payments})
}

func CreatePayment(c *gin.Context) {
	var req models.PaymentCreateRequest
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

	// Create payment record
	payment := models.Payment{
		StudentID:     req.StudentID,
		Amount:        req.Amount,
		Currency:      "IDR",
		Description:   req.Description,
		PaymentType:   req.PaymentType,
		Status:        "pending",
		DueDate:       req.DueDate,
		PaymentMethod: req.PaymentMethod,
		AcademicYear:  req.AcademicYear,
		Semester:      req.Semester,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	docRef, _, err := client.Collection("payments").Add(ctx, payment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment"})
		return
	}

	payment.ID = docRef.ID
	c.JSON(http.StatusCreated, gin.H{"payment": payment})
}

func GetPayment(c *gin.Context) {
	paymentID := c.Param("id")

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	doc, err := client.Collection("payments").Doc(paymentID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	var payment models.Payment
	doc.DataTo(&payment)
	payment.ID = doc.Ref.ID

	c.JSON(http.StatusOK, gin.H{"payment": payment})
}

func UpdatePayment(c *gin.Context) {
	paymentID := c.Param("id")

	var req models.PaymentUpdateRequest
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

	if req.Amount != nil {
		updateData["amount"] = *req.Amount
	}
	if req.Description != nil {
		updateData["description"] = *req.Description
	}
	if req.PaymentType != nil {
		updateData["paymentType"] = *req.PaymentType
	}
	if req.Status != nil {
		updateData["status"] = *req.Status
		if *req.Status == "paid" {
			now := time.Now()
			updateData["paidDate"] = &now
		}
	}
	if req.DueDate != nil {
		updateData["dueDate"] = *req.DueDate
	}
	if req.PaymentMethod != nil {
		updateData["paymentMethod"] = *req.PaymentMethod
	}
	if req.Reference != nil {
		updateData["reference"] = *req.Reference
	}

	_, err = client.Collection("payments").Doc(paymentID).Update(ctx, updateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment updated successfully"})
}

func DeletePayment(c *gin.Context) {
	paymentID := c.Param("id")

	ctx := c.Request.Context()
	client, err := firestore.NewClient(ctx, firestore.DetectProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}
	defer client.Close()

	_, err = client.Collection("payments").Doc(paymentID).Delete(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete payment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment deleted successfully"})
}
