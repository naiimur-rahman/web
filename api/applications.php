<?php

session_start();
header('Content-Type: application/json');

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $student_id    = $_GET['student_id']    ?? null;
    $vacancy_id    = $_GET['vacancy_id']    ?? null;
    $status_filter = $_GET['status']        ?? null;
    $id            = $_GET['id']            ?? null;

    if ($id) {
        $stmt = $pdo->prepare(
            "SELECT a.*, v.course_title, v.course_code, v.instructor_name, v.stipend, v.weekly_hours
             FROM applications a
             JOIN vacancies v ON a.vacancy_id = v.id
             WHERE a.id = ?"
        );
        $stmt->execute([$id]);
        $app = $stmt->fetch();
        echo json_encode(["success" => true, "application" => $app]);
        exit;
    }

    $where  = [];
    $params = [];

    if ($student_id) {
        $where[]  = "a.student_id = ?";
        $params[] = $student_id;
    }
    if ($vacancy_id) {
        $where[]  = "a.vacancy_id = ?";
        $params[] = $vacancy_id;
    }
    if ($status_filter) {
        $where[]  = "a.status = ?";
        $params[] = $status_filter;
    }

    $whereClause = $where ? "WHERE " . implode(" AND ", $where) : "";

    $stmt = $pdo->prepare(
        "SELECT a.*, v.course_title, v.course_code, v.instructor_name, v.deadline
         FROM applications a
         JOIN vacancies v ON a.vacancy_id = v.id
         $whereClause
         ORDER BY a.applied_at DESC"
    );
    $stmt->execute($params);
    $apps = $stmt->fetchAll();

    echo json_encode(["success" => true, "applications" => $apps]);
    exit;
}

if ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? ($data['action'] ?? '');

    if ($action === 'status') {
        $app_id = $data['application_id'] ?? null;
        $status = $data['status'] ?? null;

        if (!$app_id || !$status) {
            echo json_encode(["success" => false, "message" => "Application ID and status are required"]);
            exit;
        }

        $allowed = ['Pending', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
        if (!in_array($status, $allowed)) {
            echo json_encode(["success" => false, "message" => "Invalid status value"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE applications SET status = ? WHERE id = ?");
        $stmt->execute([$status, $app_id]);

        echo json_encode(["success" => true, "message" => "Application status updated to: $status"]);
        exit;
    }

    $vacancy_id     = (int)($data['vacancy_id']     ?? 0);
    $student_id     = (int)($data['student_id']     ?? 0);
    $student_name   = trim($data['student_name']    ?? '');
    $student_uni_id = trim($data['student_uni_id']  ?? '');
    $email          = trim($data['email']            ?? '');
    $cgpa           = (float)($data['cgpa']         ?? 0);
    $motivation     = trim($data['motivation']       ?? '');
    $skills         = trim($data['skills']           ?? '');

    if (!$vacancy_id || !$student_id || empty($student_name)) {
        echo json_encode(["success" => false, "message" => "Missing required application fields"]);
        exit;
    }

    $checkStmt = $pdo->prepare(
        "SELECT id FROM applications WHERE vacancy_id = ? AND student_id = ? LIMIT 1"
    );
    $checkStmt->execute([$vacancy_id, $student_id]);
    if ($checkStmt->fetch()) {
        echo json_encode(["success" => false, "message" => "You have already applied for this position"]);
        exit;
    }

    $vacStmt = $pdo->prepare("SELECT status, deadline FROM vacancies WHERE id = ?");
    $vacStmt->execute([$vacancy_id]);
    $vacancy = $vacStmt->fetch();
    if (!$vacancy) {
        echo json_encode(["success" => false, "message" => "Vacancy not found"]);
        exit;
    }
    if ($vacancy['status'] === 'Closed') {
        echo json_encode(["success" => false, "message" => "This vacancy is no longer accepting applications"]);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO applications
         (vacancy_id, student_id, student_name, student_uni_id, email, cgpa, motivation, skills, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')"
    );
    $stmt->execute([
        $vacancy_id, $student_id, $student_name, $student_uni_id,
        $email, $cgpa, $motivation, $skills
    ]);

    $newId = $pdo->lastInsertId();
    echo json_encode([
        "success" => true,
        "message" => "Application submitted successfully",
        "id"      => $newId
    ]);
    exit;
}

if ($method === 'DELETE') {
    $data  = json_decode(file_get_contents('php://input'), true);
    $id    = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Application ID is required"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM applications WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true, "message" => "Application withdrawn"]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request method"]);
?>

