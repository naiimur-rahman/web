# UIU Teaching Assistant (TA / UGA) Management System

A web-based recruitment and management platform for **United International University (UIU)** to manage teaching assistants for students, faculty members, and administrators.

---

## Project Structure

The project is divided into 4 main portals:

| Folder | Portal | User Role | Description |
|---|---|---|---|
| `kazol/` | Landing & Login | All Users | Notice board, announcements, and login for student, faculty, and admin. |
| `tanjim/` | Student Portal | Students | View vacancies, apply for TA positions, track application status, and view assigned tasks. |
| `naimur/` | Faculty Portal | Faculty | View applicants, filter/shortlist by CGPA, schedule interviews, and submit TA reviews. |
| `bappy/` | Admin Portal | Admin / HR | Create new vacancies, shortlist candidates, and generate appointment letters with print option. |
| `api/` | PHP Backend | Server | Simple PHP scripts to connect with MySQL database. |
| `database.sql` | MySQL Database | Database | SQL file to create tables and insert sample demo data. |

---

## How to Run on XAMPP (Localhost)

### 1. Start XAMPP
1. Open **XAMPP Control Panel**.
2. Start **Apache** and **MySQL**.

### 2. Copy Project to htdocs
Make sure this project folder `web` is inside your XAMPP `htdocs` directory:
```
C:\xampp\htdocs\web
```

### 3. Import Database
1. Open your browser and go to: `http://localhost/phpmyadmin/`
2. Click on the **Import** tab at the top.
3. Click **Choose File** and select `database.sql` from the project folder.
4. Click **Go** at the bottom right.
5. The database `uiu_ta_management` and all tables will be created automatically.

### 4. Database Connection Settings
The database connection is configured in `api/db.php`:
- **Host:** `localhost`
- **Database:** `uiu_ta_management`
- **User:** `root`
- **Password:** `1234`

*(If your local MySQL root has no password, you can change `$password = "";` in `api/db.php`)*

### 5. Open the Project
Open your browser and visit:
- **Landing Page:** `http://localhost/web/`
- **Login Page:** `http://localhost/web/kazol/login.html`

---

## Demo Login Accounts

| Role | Username | Password |
|---|---|---|
| **Student** | `student` | `1234` |
| **Faculty** | `faculty` | `1234` |
| **Admin** | `admin` | `1234` |