package models

import "time"

type Payment struct {
	ID            string    `json:"id" firestore:"id"`
	StudentID     string    `json:"studentId" firestore:"studentId"`
	Amount        float64   `json:"amount" firestore:"amount"`
	Currency      string    `json:"currency" firestore:"currency"`
	Description   string    `json:"description" firestore:"description"`
	PaymentType   string    `json:"paymentType" firestore:"paymentType"` // tuition, activity, book, uniform, etc.
	Status        string    `json:"status" firestore:"status"` // pending, paid, overdue, cancelled
	DueDate       time.Time `json:"dueDate" firestore:"dueDate"`
	PaidDate      *time.Time `json:"paidDate" firestore:"paidDate"`
	PaymentMethod string    `json:"paymentMethod" firestore:"paymentMethod"` // cash, transfer, online
	Reference     string    `json:"reference" firestore:"reference"`
	ProcessedBy   string    `json:"processedBy" firestore:"processedBy"`
	AcademicYear  string    `json:"academicYear" firestore:"academicYear"`
	Semester      string    `json:"semester" firestore:"semester"`
	CreatedAt     time.Time `json:"createdAt" firestore:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt" firestore:"updatedAt"`
}

type PaymentCreateRequest struct {
	StudentID     string    `json:"studentId" binding:"required"`
	Amount        float64   `json:"amount" binding:"required"`
	Description   string    `json:"description" binding:"required"`
	PaymentType   string    `json:"paymentType" binding:"required"`
	DueDate       time.Time `json:"dueDate" binding:"required"`
	PaymentMethod string    `json:"paymentMethod"`
	AcademicYear  string    `json:"academicYear" binding:"required"`
	Semester      string    `json:"semester" binding:"required"`
}

type PaymentUpdateRequest struct {
	Amount        *float64   `json:"amount"`
	Description   *string    `json:"description"`
	PaymentType   *string    `json:"paymentType"`
	Status        *string    `json:"status"`
	DueDate       *time.Time `json:"dueDate"`
	PaidDate      *time.Time `json:"paidDate"`
	PaymentMethod *string    `json:"paymentMethod"`
	Reference     *string    `json:"reference"`
}

type PaymentStats struct {
	TotalAmount     float64 `json:"totalAmount"`
	PaidAmount      float64 `json:"paidAmount"`
	PendingAmount   float64 `json:"pendingAmount"`
	OverdueAmount   float64 `json:"overdueAmount"`
	TotalPayments   int     `json:"totalPayments"`
	PaidPayments    int     `json:"paidPayments"`
	PendingPayments int     `json:"pendingPayments"`
	OverduePayments int     `json:"overduePayments"`
}
