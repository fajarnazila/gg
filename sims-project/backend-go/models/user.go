package models

import "time"

type User struct {
	ID                string    `json:"id" firestore:"id"`
	Email             string    `json:"email" firestore:"email"`
	DisplayName       string    `json:"displayName" firestore:"displayName"`
	Role              string    `json:"role" firestore:"role"` // admin, teacher, student, parent, vice_principal, treasurer, exam_supervisor, school_health
	Phone             string    `json:"phone" firestore:"phone"`
	Address           string    `json:"address" firestore:"address"`
	EmergencyContact  string    `json:"emergencyContact" firestore:"emergencyContact"`
	ProfilePicture    string    `json:"profilePicture" firestore:"profilePicture"`
	DateOfBirth       *time.Time `json:"dateOfBirth" firestore:"dateOfBirth"`
	Gender            string    `json:"gender" firestore:"gender"`
	StudentID         string    `json:"studentId" firestore:"studentId"`
	ClassID           string    `json:"classId" firestore:"classId"`
	ParentID          string    `json:"parentId" firestore:"parentId"`
	IsActive          bool      `json:"isActive" firestore:"isActive"`
	LastLogin         *time.Time `json:"lastLogin" firestore:"lastLogin"`
	CreatedAt         time.Time `json:"createdAt" firestore:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt" firestore:"updatedAt"`
}

type UserCreateRequest struct {
	Email            string     `json:"email" binding:"required,email"`
	DisplayName      string     `json:"displayName" binding:"required"`
	Role             string     `json:"role" binding:"required"`
	Phone            string     `json:"phone"`
	Address          string     `json:"address"`
	EmergencyContact string     `json:"emergencyContact"`
	DateOfBirth      *time.Time `json:"dateOfBirth"`
	Gender           string     `json:"gender"`
	StudentID        string     `json:"studentId"`
	ClassID          string     `json:"classId"`
	ParentID         string     `json:"parentId"`
}

type UserUpdateRequest struct {
	DisplayName      *string    `json:"displayName"`
	Role             *string    `json:"role"`
	Phone            *string    `json:"phone"`
	Address          *string    `json:"address"`
	EmergencyContact *string    `json:"emergencyContact"`
	ProfilePicture   *string    `json:"profilePicture"`
	DateOfBirth      *time.Time `json:"dateOfBirth"`
	Gender           *string    `json:"gender"`
	StudentID        *string    `json:"studentId"`
	ClassID          *string    `json:"classId"`
	ParentID         *string    `json:"parentId"`
	IsActive         *bool      `json:"isActive"`
}

type AuthResponse struct {
	UID         string `json:"uid"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	DisplayName string `json:"displayName"`
	Profile     User   `json:"profile"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required"`
}

type UpdateProfileRequest struct {
	DisplayName      string `json:"displayName"`
	Phone            string `json:"phone"`
	Address          string `json:"address"`
	EmergencyContact string `json:"emergencyContact"`
	ProfilePicture   string `json:"profilePicture"`
}
