<?php
// ================================================
// api/tasks.php — Assigned Tasks CRUD
// UIU TA Management System
// ================================================

// 1. Start session and set headers
session_start();
header('Content-Type: application/json');

// 2. Include database connection
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Fetch tasks ──────────────────────────────────────────────
if ($method === 'GET') {
    $student_id = $_GET['student_id'] ?? null;
    $status     = $_GET['status']     ?? null;

    $where  = [];
    $params = [];

    if ($student_id) {
        $where[]  = "student_id = ?";
        $params[] = (int)$student_id;
    }
    if ($status) {
        $where[]  = "status = ?";
        $params[] = $status;
    }

    $whereClause = $where ? "WHERE " . implode(" AND ", $where) : "";

    $stmt = $pdo->prepare(
        "SELECT * FROM assigned_tasks $whereClause ORDER BY id ASC"
    );
    $stmt->execute($params);
    $tasks = $stmt->fetchAll();

    echo json_encode(["success" => true, "tasks" => $tasks]);
    exit;
}

// ── POST: Create task OR toggle/update status ─────────────────────
if ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? ($data['action'] ?? '');

    // --- Toggle / update task status ---
    if ($action === 'toggle' || $action === 'status') {
        $task_id = (int)($data['task_id'] ?? 0);
        $status  = trim($data['status']   ?? 'Completed');

        if (!$task_id) {
            echo json_encode(["success" => false, "message" => "Task ID is required"]);
            exit;
        }

        $allowed = ['Pending', 'Completed'];
        if (!in_array($status, $allowed)) {
            echo json_encode(["success" => false, "message" => "Invalid status"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE assigned_tasks SET status = ? WHERE id = ?");
        $stmt->execute([$status, $task_id]);

        echo json_encode(["success" => true, "message" => "Task status updated to: $status"]);
        exit;
    }

    // --- Create a new task (faculty assigns to student) ---
    $student_id  = (int)($data['student_id']  ?? 0);
    $course_code = trim($data['course_code']  ?? '');
    $title       = trim($data['title']        ?? '');
    $description = trim($data['description']  ?? '');
    $task_date   = trim($data['task_date']    ?? '');
    $time_slot   = trim($data['time_slot']    ?? '');
    $deadline    = trim($data['deadline']     ?? '');

    // 3. Validate required fields
    if (!$student_id || empty($title) || empty($course_code)) {
        echo json_encode(["success" => false, "message" => "Student ID, course code and title are required"]);
        exit;
    }

    // 4. Auto-number the task (get next task_number for this student)
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM assigned_tasks WHERE student_id = ?");
    $countStmt->execute([$student_id]);
    $taskNumber = (int)$countStmt->fetchColumn() + 1;

    // 5. Insert task
    $stmt = $pdo->prepare(
        "INSERT INTO assigned_tasks
         (student_id, course_code, task_number, title, description, task_date, time_slot, deadline, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')"
    );
    $stmt->execute([
        $student_id, $course_code, $taskNumber,
        $title, $description,
        $task_date ?: null,
        $time_slot ?: null,
        $deadline ?: null
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Task assigned successfully",
        "id"      => $pdo->lastInsertId()
    ]);
    exit;
}

// ── DELETE: Remove a task ─────────────────────────────────────────
if ($method === 'DELETE') {
    $data    = json_decode(file_get_contents('php://input'), true);
    $task_id = $data['id'] ?? null;

    if (!$task_id) {
        echo json_encode(["success" => false, "message" => "Task ID is required"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM assigned_tasks WHERE id = ?");
    $stmt->execute([$task_id]);
    echo json_encode(["success" => true, "message" => "Task deleted"]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request method"]);
?>
