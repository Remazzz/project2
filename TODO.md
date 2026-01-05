# RBAC Implementation for Student Users

## Database Changes
- [x] Add 'student' to users.role enum in SQL dump
- [x] Add user_id column to students table
- [x] Update existing data if needed

## Backend Changes
- [x] Modify registration to assign 'student' role by default
- [x] Add role-based middleware functions in Server.js
- [x] Restrict grade endpoints for students
- [x] Add endpoint for students to get their own grades
- [x] Update Database.js methods for user-student linkage

## Frontend Changes
- [x] Modify login redirect based on role
- [x] Create student-specific grade view (modify student-grades.html)
- [x] Hide admin/teacher features for students
- [x] Add route guards
- [x] Create student version of StudentGrades.js

## Testing
- [x] Add role selection to registration form (Teacher/Student)
- [x] Test registration creates student users
- [x] Test student login redirects to student view
- [x] Test students can only see their own grades
