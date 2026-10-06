# UIU TA Management System

A full-stack Teaching Assistant Management System for United International University built with HTML, CSS, JavaScript, PHP, and MySQL.

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** PHP 8+ with PDO
- **Database:** MySQL
- **Server:** XAMPP (Apache + MySQL)

## Setup Instructions

### 1. Prerequisites
- Install [XAMPP](https://www.apachefriends.org/)
- Start Apache and MySQL from XAMPP Control Panel

### 2. Project Setup
1. Copy the project folder to `C:\xampp\htdocs\web\`
2. The folder should be named `web-main (1)\web-main` or rename to `ta-system`
3. Access: `http://localhost/web/web-main%20(1)/web-main/kazol/index.html`

### 3. Database Setup
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Create a new database named `uiu_ta_management`
3. Import the `database.sql` file
4. Verify the `users` table exists

### 4. Database Configuration
Open `api/db.php` and verify:
```php
$host = 'localhost';
$dbname = 'uiu_ta_management';
$username = 'root';
$password = ''; // Change to '1234' if your MySQL root password is 1234
```

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Student | student | 1234 |
| Student | tauhid | 1234 |
| Faculty | faculty | 1234 |
| Admin | admin | 1234 |

## Registration

**New Student:** Login page → "New Student? Register" → Enter Student ID, Email, Password

**New Teacher:** Login page → "New Teacher? Register" → Enter Faculty ID, Email, Password

**Admin:** Admin accounts are not publicly registerable. Use the seeded admin account.

## Features

### Student
- Dashboard with live stats, notices, and upcoming deadlines
- Browse available TA positions with search
- Apply for positions (prevents duplicate applications)
- Track application status with visual timeline
- View assigned tasks and mark as complete
- Editable profile with photo upload

### Faculty
- Dashboard with hiring statistics
- View and manage all applicant applications
- Shortlist candidates
- Schedule interviews
- Assign tasks to accepted TAs
- Write performance reviews
- Editable profile with photo upload

### Admin
- System-wide statistics dashboard
- Create and publish TA vacancies
- Shortlist candidates
- Generate appointment letters
- Editable profile with photo upload

## File Structure
```
web-main/
├── api/              # PHP backend APIs
│   ├── db.php        # Database connection
│   ├── auth.php      # Login/logout/session
│   ├── register.php  # New user registration
│   ├── profile.php   # Profile CRUD + picture upload
│   ├── vacancies.php # TA vacancy management
│   ├── applications.php # Application management
│   ├── interviews.php   # Interview scheduling
│   ├── tasks.php        # Task assignment
│   ├── reviews.php      # TA performance reviews
│   ├── notices.php      # Announcements
│   ├── letters.php      # Appointment letters
│   └── stats.php        # Dashboard statistics
├── kazol/            # Public pages (login, landing)
├── tanjim/           # Student portal
├── naimur/           # Faculty portal
├── bappy/            # Admin portal
├── uploads/profiles/ # Profile picture storage
└── database.sql      # Full database schema + seed data
```