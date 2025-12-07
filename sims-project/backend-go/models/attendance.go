package models

import "time"

type Attendance struct {
	ID        string    `json:"id" firestore:"id"`
	StudentID string    `json:"studentId" firestore:"studentId"`
	ClassID   string    `json:"classId" firestore:"classId"`
	Date      time.Time `json:"date" firestore:"date"`
	Status    string    `json:"status" firestore:"status"` // present, absent, late, excused
	Remarks   string    `json:"remarks" firestore:"remarks"`
	TeacherID string    `json:"teacherId" firestore:"teacherId"`
	CreatedAt time.Time `json:"createdAt" firestore:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" firestore:"updatedAt"`
}

type AttendanceCreateRequest struct {
	StudentID string    `json:"studentId" binding:"required"`
	ClassID   string    `json:"classId" binding:"required"`
	Date      time.Time `json:"date" binding:"required"`
	Status    string    `json:"status" binding:"required"`
	Remarks   string    `json:"remarks"`
}

type AttendanceUpdateRequest struct {
	Status  *string    `json:"status"`
	Remarks *string    `json:"remarks"`
	Date    *time.Time `json:"date"`
}

type AttendanceStats struct {
	TotalDays     int     `json:"totalDays"`
	PresentDays   int     `json:"presentDays"`
	AbsentDays    int     `json:"absentDays"`
	LateDays      int     `json:"lateDays"`
	ExcusedDays   int     `json:"excusedDays"`
	AttendanceRate float64 `json:"attendanceRate"`
}
