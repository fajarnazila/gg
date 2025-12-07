package models

import "time"

type Grade struct {
	ID            string    `json:"id" firestore:"id"`
	StudentID     string    `json:"studentId" firestore:"studentId"`
	ClassID       string    `json:"classId" firestore:"classId"`
	Subject       string    `json:"subject" firestore:"subject"`
	Score         float64   `json:"score" firestore:"score"`
	Grade         string    `json:"grade" firestore:"grade"` // A, B, C, D, F
	GradeType     string    `json:"gradeType" firestore:"gradeType"` // midterm, final, quiz, assignment, project
	Semester      string    `json:"semester" firestore:"semester"`
	AcademicYear  string    `json:"academicYear" firestore:"academicYear"`
	Remarks       string    `json:"remarks" firestore:"remarks"`
	TeacherID     string    `json:"teacherId" firestore:"teacherId"`
	CreatedAt     time.Time `json:"createdAt" firestore:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt" firestore:"updatedAt"`
}

type GradeCreateRequest struct {
	StudentID    string  `json:"studentId" binding:"required"`
	ClassID      string  `json:"classId" binding:"required"`
	Subject      string  `json:"subject" binding:"required"`
	Score        float64 `json:"score" binding:"required"`
	Grade        string  `json:"grade" binding:"required"`
	GradeType    string  `json:"gradeType" binding:"required"`
	Semester     string  `json:"semester" binding:"required"`
	AcademicYear string  `json:"academicYear" binding:"required"`
	Remarks      string  `json:"remarks"`
}

type GradeUpdateRequest struct {
	Score        *float64 `json:"score"`
	Grade        *string  `json:"grade"`
	GradeType    *string  `json:"gradeType"`
	Semester     *string  `json:"semester"`
	AcademicYear *string  `json:"academicYear"`
	Remarks      *string  `json:"remarks"`
}

type GradeStats struct {
	AverageScore    float64 `json:"averageScore"`
	TotalGrades     int     `json:"totalGrades"`
	GradeA          int     `json:"gradeA"`
	GradeB          int     `json:"gradeB"`
	GradeC          int     `json:"gradeC"`
	GradeD          int     `json:"gradeD"`
	GradeF          int     `json:"gradeF"`
	PassRate        float64 `json:"passRate"`
}
