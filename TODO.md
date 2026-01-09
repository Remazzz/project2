# TODO: Fix Download Button on Student Grades Page

## Issue
The download button on the student-grades.html page was not working for students.

## Root Cause
- StudentGradesStudent.js had a DOMContentLoaded listener that never fired because the script was loaded dynamically after the DOM was ready.
- This meant setupEventListeners() was never called, so the download button's event listener was never attached.
- Additionally, the downloadGradeReport function uses getSubjectName which depends on the subjects array, but subjects were only loaded for teachers/admins.

## Solution
- Removed the DOMContentLoaded wrapper from StudentGradesStudent.js.
- Simplified setupEventListeners() to only handle the download button.
- Removed the download button listener from StudentGrades.js setupEventListeners to avoid conflicts.
- Added initializeSubjects() call for students so they can load subjects needed for download functionality.
- In HTML's setupRoleBasedUI, added setupEventListeners() call for students and downloadGradeReport listener for teachers/admins.

## Changes Made
- [x] Modified src/StudentGradesStudent.js: Removed DOMContentLoaded listener and simplified setupEventListeners.
- [x] Modified public/student-grades.html: Added initializeSubjects() for students and setupEventListeners() call, plus downloadGradeReport listener for teachers/admins.
- [x] Modified src/StudentGrades.js: Removed download button event listener from setupEventListeners to prevent conflicts.

## Testing
- The download button should now work for students, generating a CSV file with their grade report.
- Teachers/admins should still have working download functionality.
