<?php
// ================================================
// api/interviews.php — Interview Schedule CRUD
// UIU TA Management System
// ================================================

// 1. Start session and set headers
session_start();
header('Content-Type: application/json');

// 2. Include database connection
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Fetch interviews ─────────────────────────────────────────
if ($method === 'GET') {
    $student_uni_id = $_GET['student_uni_id'] ?? null;
    $student_id     = $_GET['student_id']     ?? null;
    $app_id         = $_GET['application_id'] ?? null;
    $status_filter  = $_GET['status']         ?? null;

    $where  = [];
    $params = [];

    // Filter by application_id (linked interview)
    if ($app_id) {
        $where[]  = "application_id = ?";
        $params[] = $app_id;
    }
    // Filter by student university ID
    if ($student_uni_id) {
        $where[]  = "student_uni_id = ?";
        $params[] = $student_uni_id;
    }
    // Filter by status
    if ($status_filter) {
        $where[]  = "status = ?";
        $params[] = $status_filter;
    }

    $whereClause = $where ? "WHERE " . implode(" AND ", $where) : "";

    $stmt = $pdo->prepare(
        "SELECT * FROM interviews $whereClause ORDER BY interview_date ASC, interview_time ASC"
    );
    $stmt->execute($params);
    $interviews = $stmt->fetchAll();

    echo json_encode(["success" => true, "interviews" => $interviews]);
    exit;
}

// ── POST: Schedule a new interview OR update status ───────────────
if ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? ($data['action'] ?? '');

    // --- Update interview status ---
    if ($action === 'status') {
        $interview_id = $data['interview_id'] ?? null;
        $status       = $data['status']       ?? null;

        if (!$interview_id || !$status) {
            echo json_encode(["success" => false, "message" => "Interview ID and status are required"]);
            exit;
        }

        $allowed = ['Scheduled', 'Completed', 'Cancelled'];
        if (!in_array($status, $allowed)) {
            echo json_encode(["success" => false, "message" => "Invalid status"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE interviews SET status = ? WHERE id = ?");
        $stmt->execute([$status, $interview_id]);

        echo json_encode(["success" => true, "message" => "Interview status updated"]);
        exit;
    }

    // --- Schedule a new interview ---
    $app_id         = $data['application_id']  ?? null;
    $student_name   = trim($data['student_name']   ?? '');
    $student_uni_id = trim($data['student_uni_id'] ?? '');
    $course_title   = trim($data['course_title']   ?? 'Web Programming');
    $faculty_name   = trim($data['faculty_name']   ?? 'Mr. Mahmudul Hasan');
    $interview_date = trim($data['interview_date'] ?? '');
    $interview_time = trim($data['interview_time'] ?? '');
    $location       = trim($data['location']       ?? 'Room 836 (A)');

    // 3. Validate required fields
    if (empty($student_name) || empty($interview_date) || empty($interview_time)) {
        echo json_encode(["success" => false, "message" => "Student name, date and time are required"]);
        exit;
    }

    // 4. Insert interview record
    $stmt = $pdo->prepare(
        "INSERT INTO interviews
         (application_id, student_name, student_uni_id, course_title, faculty_name,
          interview_date, interview_time, location, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled')"
    );
    $stmt->execute([
        $app_id, $student_name, $student_uni_id,
        $course_title, $faculty_name,
        $interview_date, $interview_time, $location
    ]);

    // 5. Also update the application status to "Interview Scheduled" if app_id provided
    if ($app_id) {
        $stmt2 = $pdo->prepare("UPDATE applications SET status = 'Interview Scheduled' WHERE id = ?");
        $stmt2->execute([$app_id]);
    }

    echo json_encode([
        "success" => true,
        "message" => "Interview scheduled successfully",
        "id"      => $pdo->lastInsertId()
    ]);
    exit;
}

// ── DELETE: Cancel interview ──────────────────────────────────────
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Interview ID is required"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE interviews SET status = 'Cancelled' WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true, "message" => "Interview cancelled"]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request method"]);
?>
