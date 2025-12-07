package models

import "time"

type Class struct {
	ID          string    `json:"id" firestore:"id"`
	Name        string    `json:"name" firestore:"name"`
	Grade       string    `json:"grade" firestore:"grade"`
	TeacherID   string    `json:"teacherId" firestore:"teacherId"`
	TeacherName string    `json:"teacherName" firestore:"teacherName"`
	Room        string    `json:"room" firestore:"room"`
	Schedule    []string  `json:"schedule" firestore:"schedule"`
	Students    []string  `json:"students" firestore:"students"`
	IsActive    bool      `json:"isActive" firestore:"isActive"`
	CreatedAt   time.Time `json:"createdAt" firestore:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt" firestore:"updatedAt"`
}

type ClassCreateRequest struct {
	Name        string   `json:"name" binding:"required"`
	Grade       string   `json:"grade" binding:"required"`
	TeacherID   string   `json:"teacherId" binding:"required"`
	TeacherName string   `json:"teacherName" binding:"required"`
	Room        string   `json:"room"`
	Schedule    []string `json:"schedule"`
}

type ClassUpdateRequest struct {
	Name        *string   `json:"name"`
	Grade       *string   `json:"grade"`
	TeacherID   *string   `json:"teacherId"`
	TeacherName *string   `json:"teacherName"`
	Room        *string   `json:"room"`
	Schedule    *[]string `json:"schedule"`
	IsActive    *bool     `json:"isActive"`
}
