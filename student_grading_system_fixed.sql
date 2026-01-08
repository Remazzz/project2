-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 19, 2024 at 10:30 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_grading_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `custom_inputs`
--

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS `custom_input_values`;
DROP TABLE IF EXISTS `student_grades`;
DROP TABLE IF EXISTS `custom_inputs`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `subjects`;
DROP TABLE IF EXISTS `sections`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `custom_inputs` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('score','percentage') NOT NULL,
  `weight` decimal(5,4) NOT NULL DEFAULT 0.0500,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_input_values`
--

CREATE TABLE `custom_input_values` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `custom_input_id` int(11) NOT NULL,
  `score_value` decimal(8,2) DEFAULT NULL,
  `total_value` decimal(8,2) DEFAULT NULL,
  `percentage_value` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_grades`
--

CREATE TABLE `student_grades` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_participation` decimal(5,2) DEFAULT 0.00,
  `attendance` decimal(5,2) DEFAULT 0.00,
  `quiz1_score` decimal(8,2) DEFAULT 0.00,
  `quiz1_total` decimal(8,2) DEFAULT 1.00,
  `quiz2_score` decimal(8,2) DEFAULT 0.00,
  `quiz2_total` decimal(8,2) DEFAULT 1.00,
  `midterm_exam_score` decimal(8,2) DEFAULT 0.00,
  `midterm_exam_total` decimal(8,2) DEFAULT 1.00,
  `final_exam_score` decimal(8,2) DEFAULT 0.00,
  `final_exam_total` decimal(8,2) DEFAULT 1.00,
  `lab_grade` decimal(5,2) DEFAULT 0.00,
  `final_grade` decimal(5,2) DEFAULT 0.00,
  `letter_grade` varchar(3) DEFAULT 'F',
  `status` enum('pending','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `section_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','teacher','student') DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `custom_inputs`
--
ALTER TABLE `custom_inputs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `custom_input_values`
--
ALTER TABLE `custom_input_values`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_input` (`student_id`,`custom_input_id`),
  ADD KEY `custom_input_id` (`custom_input_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_grades`
--
ALTER TABLE `student_grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_subject` (`student_id`,`subject_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `custom_inputs`
--
ALTER TABLE `custom_inputs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `custom_input_values`
--
ALTER TABLE `custom_input_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_grades`
--
ALTER TABLE `student_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `custom_input_values`
--
ALTER TABLE `custom_input_values`
  ADD CONSTRAINT `custom_input_values_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `custom_input_values_ibfk_2` FOREIGN KEY (`custom_input_id`) REFERENCES `custom_inputs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_grades`
--
ALTER TABLE `student_grades`
  ADD CONSTRAINT `student_grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_grades_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `full_name`, `role`, `created_at`, `last_login`) VALUES
(1, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@school.com', 'Administrator', 'admin', '2024-12-19 09:30:00', NULL),
(2, 'teacher1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher@school.com', 'Teacher One', 'teacher', '2024-12-19 09:30:00', NULL),
(3, 'student1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student1@school.com', 'Rey Mark Malabarbas', 'student', '2024-12-19 09:30:00', NULL),
(4, 'student2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student2@school.com', 'Maria Santos', 'student', '2024-12-19 09:30:00', NULL),
(5, 'student3', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student3@school.com', 'John Doe', 'student', '2024-12-19 09:30:00', NULL);

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `name`, `created_at`) VALUES
(1, 'Assign Section', '2024-12-19 09:30:00'),
(2, 'Section A', '2024-12-19 09:30:00');

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `name`, `section_id`, `user_id`, `created_at`) VALUES
(1, 'Rey Mark Malabarbas', 1, 3, '2024-12-19 09:30:00'),
(2, 'Maria Santos', 1, 4, '2024-12-19 09:30:00'),
(3, 'John Doe', 2, 5, '2024-12-19 09:30:00');

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `name`, `teacher_id`, `created_at`) VALUES
(1, 'Mathematics', 2, '2024-12-19 09:30:00'),
(2, 'Science', 2, '2024-12-19 09:30:00'),
(3, 'English', 2, '2024-12-19 09:30:00'),
(4, 'Filipino', 2, '2024-12-19 09:30:00'),
(5, 'Araling Panlipunan', 2, '2024-12-19 09:30:00'),
(6, 'ESP', 2, '2024-12-19 09:30:00'),
(7, 'MAPEH', 2, '2024-12-19 09:30:00'),
(8, 'TVE', 2, '2024-12-19 09:30:00'),
(9, 'Business Math', 2, '2024-12-19 09:30:00');

--
-- Dumping data for table `custom_inputs`
--

INSERT INTO `custom_inputs` (`id`, `name`, `type`, `weight`, `created_at`) VALUES
(1, 'Quiz 3', 'score', 0.0500, '2024-12-19 09:30:00'),
(2, 'Seatwork 1', 'percentage', 0.0300, '2024-12-19 09:30:00');

--
-- Dumping data for table `student_grades`
--

INSERT INTO `student_grades` (`id`, `student_id`, `subject_id`, `class_participation`, `attendance`, `quiz1_score`, `quiz1_total`, `quiz2_score`, `quiz2_total`, `final_exam_score`, `final_exam_total`, `lab_grade`, `final_grade`, `letter_grade`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 85.00, 90.00, 80.00, 100.00, 85.00, 100.00, 88.00, 100.00, 82.00, 85.50, 'B', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(2, 1, 2, 88.00, 92.00, 90.00, 100.00, 87.00, 100.00, 91.00, 100.00, 85.00, 89.20, 'A-', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(3, 1, 3, 82.00, 88.00, 75.00, 100.00, 80.00, 100.00, 82.00, 100.00, 78.00, 81.40, 'B-', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(4, 1, 4, 90.00, 95.00, 92.00, 100.00, 88.00, 100.00, 95.00, 100.00, 90.00, 92.80, 'A-', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(5, 2, 1, 78.00, 85.00, 70.00, 100.00, 75.00, 100.00, 76.00, 100.00, 74.00, 76.20, 'C+', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(6, 2, 2, 85.00, 90.00, 82.00, 100.00, 80.00, 100.00, 84.00, 100.00, 81.00, 83.60, 'B', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(7, 2, 3, 80.00, 87.00, 78.00, 100.00, 82.00, 100.00, 80.00, 100.00, 79.00, 80.80, 'B-', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(8, 2, 4, 88.00, 92.00, 85.00, 100.00, 90.00, 100.00, 87.00, 100.00, 86.00, 87.60, 'B+', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(9, 3, 1, 92.00, 96.00, 95.00, 100.00, 93.00, 100.00, 97.00, 100.00, 94.00, 95.20, 'A', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(10, 3, 2, 89.00, 93.00, 88.00, 100.00, 91.00, 100.00, 90.00, 100.00, 89.00, 90.00, 'A-', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(11, 3, 3, 91.00, 94.00, 89.00, 100.00, 92.00, 100.00, 93.00, 100.00, 91.00, 91.80, 'A-', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00'),
(12, 3, 4, 94.00, 97.00, 96.00, 100.00, 95.00, 100.00, 98.00, 100.00, 96.00, 96.20, 'A', 'completed', '2024-12-19 09:30:00', '2024-12-19 09:30:00');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
