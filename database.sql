CREATE DATABASE IF NOT EXISTS `uiu_ta_management` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `uiu_ta_management`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `role` ENUM('student', 'faculty', 'admin') NOT NULL,
  `university_id` VARCHAR(20) DEFAULT NULL,
  `department` VARCHAR(50) DEFAULT 'CSE',
  `cgpa` DECIMAL(3,2) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `completed_credits` INT DEFAULT 0,
  `semester` VARCHAR(50) DEFAULT 'Fall 2026',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vacancies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_code` VARCHAR(20) NOT NULL,
  `course_title` VARCHAR(100) NOT NULL,
  `instructor_name` VARCHAR(100) NOT NULL,
  `term` VARCHAR(50) NOT NULL DEFAULT 'Fall 2026',
  `positions` INT NOT NULL DEFAULT 1,
  `weekly_hours` INT NOT NULL DEFAULT 10,
  `stipend` DECIMAL(10,2) NOT NULL DEFAULT 8000.00,
  `min_cgpa` DECIMAL(3,2) NOT NULL DEFAULT 3.50,
  `min_year` VARCHAR(30) DEFAULT '2nd year',
  `prereq` TINYINT(1) DEFAULT 1,
  `priority` TINYINT(1) DEFAULT 0,
  `responsibilities` TEXT,
  `deadline` DATE NOT NULL,
  `start_date` DATE NOT NULL,
  `status` ENUM('Draft', 'Open', 'Reviewing', 'Closed') DEFAULT 'Open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vacancy_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `student_uni_id` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `cgpa` DECIMAL(3,2) NOT NULL,
  `motivation` TEXT,
  `skills` TEXT,
  `status` ENUM('Pending', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected') DEFAULT 'Pending',
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`vacancy_id`) REFERENCES `vacancies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `interviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT DEFAULT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `student_uni_id` VARCHAR(20) NOT NULL,
  `course_title` VARCHAR(100) NOT NULL,
  `faculty_name` VARCHAR(100) NOT NULL,
  `interview_date` DATE NOT NULL,
  `interview_time` VARCHAR(20) NOT NULL,
  `location` VARCHAR(100) DEFAULT 'Room 836 (A)',
  `status` ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `assigned_tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `course_code` VARCHAR(20) NOT NULL,
  `task_number` INT DEFAULT 1,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `task_date` VARCHAR(50) DEFAULT NULL,
  `time_slot` VARCHAR(50) DEFAULT NULL,
  `deadline` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('Pending', 'Completed') DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_name` VARCHAR(100) NOT NULL,
  `student_uni_id` VARCHAR(20) DEFAULT NULL,
  `course_title` VARCHAR(100) NOT NULL,
  `faculty_name` VARCHAR(100) NOT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `punctuality` VARCHAR(100) DEFAULT 'Excellent - Always on time',
  `knowledge` VARCHAR(100) DEFAULT 'Excellent - Strong grasp of concepts',
  `feedback` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `appointment_letters` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref_no` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `student_uni_id` VARCHAR(20) NOT NULL,
  `course_title` VARCHAR(100) NOT NULL,
  `weekly_hours` INT NOT NULL DEFAULT 10,
  `stipend` DECIMAL(10,2) NOT NULL DEFAULT 8000.00,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `reports_to` VARCHAR(100) NOT NULL,
  `status` ENUM('Draft', 'Sent', 'Accepted') DEFAULT 'Sent',
  `issued_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `badge_text` VARCHAR(30) NOT NULL,
  `badge_class` VARCHAR(30) NOT NULL,
  `icon` VARCHAR(10) DEFAULT '📢',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`, `username`, `password`, `name`, `email`, `role`, `university_id`, `department`, `cgpa`, `completed_credits`, `semester`) VALUES
(1, 'student', '1234', 'Tanjim Tazwar', 'tkhan222146@bscse.uiu.ac.bd', 'student', '011222146', 'Computer Science & Engineering', 3.55, 104, '10th Fall 2026'),
(2, 'tauhid', '1234', 'Md. Tauhid Tazwar Khan', 'tauhid@bscse.uiu.ac.bd', 'student', '01122212345', 'Computer Science & Engineering', 3.82, 110, '10th Fall 2026'),
(3, 'nusrat', '1234', 'Nusrat Jahan', 'nusrat@bscse.uiu.ac.bd', 'student', '01122114567', 'Computer Science & Engineering', 3.78, 115, '11th Fall 2026'),
(4, 'tanvir', '1234', 'Tanvir Hasan', 'tanvir@bscse.uiu.ac.bd', 'student', '01122011234', 'Computer Science & Engineering', 3.65, 108, '10th Fall 2026'),
(5, 'nabila', '1234', 'Nabila Sultana', 'nabila.sultana@uiu.edu', 'student', '20-41032', 'Computer Science & Engineering', 3.91, 120, '11th Fall 2026'),
(6, 'faculty', '1234', 'Mr. Mahmudul Hasan', 'mahmudul@cse.uiu.ac.bd', 'faculty', 'FAC-082', 'Computer Science & Engineering', NULL, NULL, 'Fall 2026'),
(7, 'admin', '1234', 'Dr. Ayesha Karim', 'ayesha.karim@uiu.ac.bd', 'admin', 'ADM-001', 'Computer Science & Engineering', NULL, NULL, 'Fall 2026');

INSERT INTO `vacancies` (`id`, `course_code`, `course_title`, `instructor_name`, `term`, `positions`, `weekly_hours`, `stipend`, `min_cgpa`, `min_year`, `prereq`, `priority`, `responsibilities`, `deadline`, `start_date`, `status`) VALUES
(1, 'CSE 4165', 'Web Programming TA', 'Mr. Mahmudul Hasan', 'Fall 2026', 2, 10, 8000.00, 3.50, '3rd year', 1, 1, 'Lead two weekly lab sections, hold 3 office hours, and grade assignments.', '2026-09-15', '2026-09-29', 'Open'),
(2, 'CSE 4141', 'Database Management Systems TA', 'Dr. Rahman', 'Fall 2026', 1, 8, 7500.00, 3.50, '3rd year', 1, 0, 'Support SQL lab assignments, project demonstrations and grading.', '2026-09-18', '2026-09-29', 'Open'),
(3, 'CSE 2213', 'Data Structure and Algorithms TA', 'Dr. Ahmed', 'Fall 2026', 2, 10, 8000.00, 3.60, '2nd year', 1, 1, 'Help students solve algorithmic problem sets, C++ pointer fundamentals.', '2026-09-20', '2026-09-29', 'Open'),
(4, 'CS 340', 'Operating Systems TA', 'Dr. Karim', 'Fall 2026', 2, 10, 8000.00, 3.50, '3rd year', 1, 0, 'Linux kernel process management labs and concurrency evaluation.', '2026-09-25', '2026-09-30', 'Reviewing');

INSERT INTO `applications` (`id`, `vacancy_id`, `student_id`, `student_name`, `student_uni_id`, `email`, `cgpa`, `motivation`, `skills`, `status`, `applied_at`) VALUES
(1, 1, 1, 'Tanjim Tazwar', '011222146', 'tkhan222146@bscse.uiu.ac.bd', 3.55, 'Passionate about modern web technologies and mentoring junior students.', 'HTML, CSS, JavaScript, PHP, MySQL', 'Pending', '2026-09-02 10:14:00'),
(2, 2, 1, 'Tanjim Tazwar', '011222146', 'tkhan222146@bscse.uiu.ac.bd', 3.55, 'Secured A in Database Systems, strong knowledge of SQL query optimization.', 'MySQL, Oracle SQL, ER Modeling, Normalization', 'Selected', '2026-08-29 14:22:00'),
(3, 3, 1, 'Tanjim Tazwar', '011222146', 'tkhan222146@bscse.uiu.ac.bd', 3.55, 'Eager to assist with introductory data structures.', 'C++, STL, Trees, Graphs', 'Rejected', '2026-08-25 09:30:00'),
(4, 1, 2, 'Md. Tauhid Tazwar Khan', '01122212345', 'tauhid@bscse.uiu.ac.bd', 3.82, 'Completed top course project in Web Dev.', 'React, Node.js, PHP, Vanilla CSS', 'Shortlisted', '2026-09-03 11:00:00'),
(5, 1, 3, 'Nusrat Jahan', '01122114567', 'nusrat@bscse.uiu.ac.bd', 3.78, 'Demonstrated excellent project presentation.', 'Frontend UI/UX, Full-stack Web', 'Shortlisted', '2026-09-03 12:45:00'),
(6, 1, 4, 'Tanvir Hasan', '01122011234', 'tanvir@bscse.uiu.ac.bd', 3.65, 'Strong command of backend routing and authentication.', 'JavaScript, REST APIs, PHP', 'Interview Scheduled', '2026-09-04 15:10:00');

INSERT INTO `interviews` (`id`, `application_id`, `student_name`, `student_uni_id`, `course_title`, `faculty_name`, `interview_date`, `interview_time`, `location`, `status`) VALUES
(1, 4, 'Md. Tauhid Tazwar Khan', '01122212345', 'Web Programming', 'Mr. Mahmudul Hasan', '2026-08-22', '10:00 AM', 'Room 836 (A)', 'Scheduled'),
(2, 5, 'Nusrat Jahan', '01122114567', 'Web Programming', 'Mr. Mahmudul Hasan', '2026-08-22', '11:00 AM', 'Room 836 (A)', 'Scheduled'),
(3, 6, 'Tanvir Hasan', '01122011234', 'Web Programming', 'Mr. Mahmudul Hasan', '2026-08-23', '10:30 AM', 'Room 836 (A)', 'Completed');

INSERT INTO `assigned_tasks` (`id`, `student_id`, `course_code`, `task_number`, `title`, `description`, `task_date`, `time_slot`, `deadline`, `status`) VALUES
(1, 1, 'CSE 4141', 1, 'Conduct Lab Session', 'Assist students during the Database Systems laboratory session.', 'Sep 10, 2026', '10:00 AM - 12:00 PM', 'Sep 10, 2026', 'Completed'),
(2, 1, 'CSE 4141', 2, 'Check Assignments', 'Check and organize submitted database assignments.', NULL, NULL, 'Sep 12, 2026', 'Completed'),
(3, 1, 'CSE 4141', 3, 'Prepare Lab Materials', 'Prepare required materials and examples for the upcoming lab.', NULL, NULL, 'Sep 14, 2026', 'Pending'),
(4, 1, 'CSE 4141', 4, 'Student Support', 'Help students with course-related questions during office hours.', 'Sep 16, 2026', '02:00 PM - 04:00 PM', 'Sep 16, 2026', 'Pending'),
(5, 1, 'CSE 4141', 5, 'Submit Weekly Report', 'Submit the weekly TA activity report to the assigned faculty member.', NULL, NULL, 'Sep 18, 2026', 'Pending');

INSERT INTO `reviews` (`id`, `student_name`, `student_uni_id`, `course_title`, `faculty_name`, `rating`, `punctuality`, `knowledge`, `feedback`) VALUES
(1, 'Ashfaq Hossain', '011211155', 'Web Programming', 'Mr. Mahmudul Hasan', 5, 'Excellent - Always on time', 'Excellent - Strong grasp of concepts', 'Outstanding commitment and proactive help with student queries in lab.'),
(2, 'Sadia Jahan', '011211244', 'Database Systems', 'Mr. Mahmudul Hasan', 4, 'Good - Mostly reliable', 'Excellent - Strong grasp of concepts', 'Very solid SQL skills, provides helpful feedback to students.'),
(3, 'Rafiq Ahmed', '011211099', 'Data Structures', 'Mr. Mahmudul Hasan', 4, 'Good - Mostly reliable', 'Good - Solid understanding', 'Reliable and assists well during problem solving sessions.');

INSERT INTO `appointment_letters` (`id`, `ref_no`, `student_name`, `student_uni_id`, `course_title`, `weekly_hours`, `stipend`, `start_date`, `end_date`, `reports_to`, `status`) VALUES
(1, 'UIU/CS/TA/2026/014', 'Nabila Sultana', '20-41032', 'CS 201 — Data Structures', 10, 8000.00, '2026-09-29', '2026-12-19', 'Dr. Ayesha Karim, Course Instructor', 'Sent'),
(2, 'UIU/CS/TA/2026/015', 'Tanvir Ahmed', '20-40877', 'MATH 150 — Calculus I', 8, 7000.00, '2026-09-29', '2026-12-19', 'Dr. Ayesha Karim, Course Instructor', 'Sent');

INSERT INTO `notices` (`id`, `title`, `description`, `badge_text`, `badge_class`, `icon`) VALUES
(1, 'Fall 2026 Applications Live', 'The portal is now open for Fall 2026 TA applications. Submit before the deadline.', 'Open', 'status-open', '📢'),
(2, 'CSE Dept. Interviews', 'Shortlisted candidates for CSE department will receive interview schedules soon.', 'Interview', 'status-interview', '📅'),
(3, 'Spring 2026 Results', 'Final selections for Spring 2026 have been published on the notice board.', 'Released', 'status-released', '✅'),
(4, 'Urgent: Data Structures TA', 'Immediate requirement for 2 TAs for Data Structures course. Apply ASAP.', 'Urgent', 'status-urgent', '⚠️');
