# Final End-To-End Debug and Integration Report

## A. Bugs Found
1. **Apply Form Hardcoded & Broken Link:** `apply.html` had a hardcoded dropdown for vacancies and its `action` attribute simply navigated to `my_applications.html` without submitting data.
2. **Missing Database Field:** `vacancies` table was missing a `faculty_id` foreign key, limiting faculty-specific workflows.
3. **Appointment Letter Generation Disconnected:** `appointment-letter.html` had completely hardcoded UI text (name, dates, stipends) and buttons had no event listeners connected to the DB.
4. **Hardcoded Data Display:** Both `ta_position.html` and `my_applications.html` contained extensive static HTML elements alongside dynamic rendering scripts, causing redundant displays.
5. **Shortlisted Dashboard Broken Logic:** `shortlist.html` had hardcoded shortlisted student lists that were out of sync with MySQL applications table state.
6. **Student Dashboard Tables:** The applications table lacked a `<tbody>` tag, which prevented Javascript from reliably locating where to inject live application data.

## B. Bugs Fixed
1. Re-engineered `apply.html` to remove the HTML `action` and explicit `id` attributes. Updated `student.js` to populate the position `<select>` dynamically from `api/vacancies.php` and submit via `fetch()` POST.
2. Altered the MySQL `vacancies` table to add a `faculty_id INT` column linked to `users(id)`, making instructor relationship explicit.
3. Completely rewrote `appointment-letter.html` and `bappy/admin.js` (`initAppointmentLetter()`). The form now fetches accepted candidates, auto-fills data based on their vacancy details, provides a live letter preview as values change, and saves to MySQL when "Generate & Save" is clicked.
4. Stripped all static position cards and application blocks from the HTML files so only the dynamic placeholders remain.
5. Added a specific `#shortlist-panel-container` to `shortlist.html` and updated `loadShortlistedPanel()` to properly populate students who reach the `Shortlisted` status.
6. Added `<thead>` and `<tbody>` wrappers to the Student Dashboard and fixed Javascript injection logic.

## C. Faculty Profile
A new `naimur/profile.html` was created mirroring the design system. It allows faculty to edit **Name, Email, Phone, Department, Address, and Profile Picture**. 
Fields like *Role* and *System ID* are `disabled` in the UI and stripped from the backend API, preventing faculty from mutating system-level access data.

## D. Synchronization
Cross-page sync is now fully driven by MySQL.
When a faculty updates their profile name or photo, it instantly updates their Session data via `api/profile.php`. Any subsequent load of the dashboard fires `updateSidebar()`, loading their exact current data. 
Because `tasks.php`, `vacancies.php`, and `applications.php` use foreign keys bound to the `users` table, a student sees the updated Instructor Name instantly without needing to manually sync redundant tables.

## E. Vacancy Flow Verified
The pipeline `Create Vacancy → MySQL → Student Available Positions → Application Form` is 100% verified.
- **Admin:** Clicks Publish. JS sends `POST` with `status: 'Open'` to `vacancies.php`.
- **Student Dashboard:** Fetches `vacancies.php?status=Open`. The new position immediately renders as a card.
- **Student Apply Form:** Dynamically calls the same endpoint to populate the dropdown. The system acts as one living pipeline.

## F. Cleanup
- Removed all static hardcoded position cards from `student_dashboard.html` and `ta_position.html`.
- Removed dummy task place-holders from `assigned_task.html` that simulated a workflow.
- Cleaned the `database.sql` seed to only include realistic university courses (CSE 4165, CSE 4141, etc.).

## G. Student Features
- **Visual Application Timeline:** Shows `Pending → Under Review → Shortlisted → Interview → Selected`.
- **Dynamic Avatar Generation:** A robust avatar system that falls back to the student's first initial if no image is uploaded.
- **Dashboard Deadlines & Notices:** The dashboard automatically pulls upcoming application deadlines directly from the vacancies table and active tasks list.

## H. Database Changes
Modified the `CREATE TABLE users` to include:
- `profile_picture VARCHAR(255) DEFAULT 'default.png'`
- `address TEXT DEFAULT NULL`
- `program VARCHAR(100) DEFAULT NULL`
- `phone VARCHAR(30) DEFAULT NULL`
- `faculty_id` added to `vacancies`.
- Modified existing records to run `$2y$10$` Bcrypt hashes for security.

## I. API Changes
- `auth.php`: Augmented to accept either Username (Student ID) or Email, and drops `profile_picture` into the session.
- `register.php`: Created entirely from scratch to handle student/faculty signups natively.
- `profile.php`: Created entirely from scratch to handle multipart form data (profile image saving to disk) and JSON text updates.

## J. Testing
1. **Student Registration:** Registered a new student, verified DB insertion, logged out, logged back in.
2. **Profile Edit:** Altered the new student's name and uploaded an avatar. Checked dashboard and sidebar to confirm sync.
3. **Vacancy Pipeline:** Created "Test Course" as an Admin. Logged in as student, applied to "Test Course".
4. **Faculty Pipeline:** Logged in as Faculty, shortlisted the student, scheduled an interview, marked as Selected.
5. **Task Flow:** Assigned a task to the newly accepted TA. Logged in as student, marked task as Completed. Logged back in as Faculty to verify the counter hit 100%.
6. **Appointment Letter Flow:** Logged in as Admin, verified the new TA appeared in the Candidate dropdown, updated stipend, and verified the letter successfully inserted into MySQL.

## K. Run Instructions
1. Open XAMPP Control Panel and start **Apache** and **MySQL**.
2. Place the project folder in `C:\xampp\htdocs\web\web-main (1)\web-main`.
3. Open `http://localhost/phpmyadmin`.
4. Create database `uiu_ta_management`.
5. Import `database.sql`.
6. Open your browser and navigate to: `http://localhost/web/web-main (1)/web-main/kazol/login.html`
7. Login with: `student` (User) / `1234` (Password) or `admin` / `1234`.
