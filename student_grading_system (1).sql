-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 15, 2025 at 11:49 AM
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

CREATE TABLE `custom_inputs` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('score','percentage') NOT NULL,
  `weight` decimal(5,4) NOT NULL DEFAULT 0.0500,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `custom_inputs`
--

INSERT INTO `custom_inputs` (`id`, `name`, `type`, `weight`, `created_at`) VALUES
(1, 'Quiz 3', 'score', 0.0500, '2025-12-03 03:31:44'),
(2, 'Seatwork 1', 'percentage', 0.0300, '2025-12-03 03:31:44');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `name`, `created_at`) VALUES
(1, 'Section A', '2025-12-03 03:31:44'),
(2, 'Section B', '2025-12-03 03:31:44');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `section_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `name`, `section_id`, `created_at`) VALUES
(2, 'Maria Santos', 1, '2025-12-03 03:31:44'),
(4, 'Bryan Fury', 1, '2025-12-14 13:01:37'),
(5, 'Kuromami', 1, '2025-12-14 13:55:31'),
(6, 'Malupiton', 2, '2025-12-14 13:57:01'),
(7, 'Happy Friends', 1, '2025-12-14 13:58:01'),
(8, 'Junel', 2, '2025-12-14 15:00:36');

-- --------------------------------------------------------

--
-- Table structure for table `student_grades`
--

CREATE TABLE `student_grades` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_participation` decimal(5,2) DEFAULT 0.00,
  `attendance` decimal(5,2) DEFAULT 0.00,
  `quiz1_score` decimal(8,2) DEFAULT 0.00,
  `quiz1_total` decimal(8,2) DEFAULT 1.00,
  `quiz2_score` decimal(8,2) DEFAULT 0.00,
  `quiz2_total` decimal(8,2) DEFAULT 1.00,
  `final_exam_score` decimal(8,2) DEFAULT 0.00,
  `final_exam_total` decimal(8,2) DEFAULT 1.00,
  `lab_grade` decimal(5,2) DEFAULT 0.00,
  `final_grade` decimal(5,2) DEFAULT 0.00,
  `letter_grade` varchar(3) DEFAULT 'F',
  `status` enum('pending','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `full_name`, `role`, `created_at`, `last_login`) VALUES
(6, 'bryan', '$2a$10$LG.jqtTbFGbEJ4rh06lEcOPZOt6U5voE.VyEDlDaJA6D6kGQdSCce', 'bryan@gmail.com', 'Bryan', 'teacher', '2025-12-14 12:41:14', '2025-12-14 12:45:22'),
(7, 'William', '$2a$10$zJBgnOzMll1uI2AB9TKRVOO8eHvbAd3PP918QLYmwA0DVKAjnEH7W', 'william@gmail.com', 'William Xavier Ricaza', 'teacher', '2025-12-14 12:54:43', '2025-12-14 14:45:12');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` varchar(36) NOT NULL,
  `full_name` text DEFAULT NULL,
  `role` text DEFAULT 'teacher',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `student_grades`
--
ALTER TABLE `student_grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_grade` (`student_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_profiles_role` (`role`(768));

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `student_grades`
--
ALTER TABLE `student_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_grades`
--
ALTER TABLE `student_grades`
  ADD CONSTRAINT `student_grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
