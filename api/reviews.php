<?php

session_start();
header('Content-Type: application/json');

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $student_name   = $_GET['student_name']    ?? null;
    $student_uni_id = $_GET['student_uni_id']  ?? null;
    $faculty_name   = $_GET['faculty_name']    ?? null;

    $where  = [];
    $params = [];

    if ($student_name) {
        $where[]  = "student_name = ?";
        $params[] = $student_name;
    }
    if ($student_uni_id) {
        $where[]  = "student_uni_id = ?";
        $params[] = $student_uni_id;
    }
    if ($faculty_name) {
        $where[]  = "faculty_name = ?";
        $params[] = $faculty_name;
    }

    $whereClause = $where ? "WHERE " . implode(" AND ", $where) : "";

    $stmt = $pdo->prepare(
        "SELECT * FROM reviews $whereClause ORDER BY created_at DESC"
    );
    $stmt->execute($params);
    $reviews = $stmt->fetchAll();

    echo json_encode(["success" => true, "reviews" => $reviews]);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $student_name   = trim($data['student_name']    ?? '');
    $student_uni_id = trim($data['student_uni_id']  ?? '');
    $course_title   = trim($data['course_title']    ?? 'Web Programming');
    $faculty_name   = trim($data['faculty_name']    ?? 'Mr. Mahmudul Hasan');
    $rating         = (int)($data['rating']         ?? 5);
    $punctuality    = trim($data['punctuality']     ?? 'Excellent - Always on time');
    $knowledge      = trim($data['knowledge']       ?? 'Excellent - Strong grasp of concepts');
    $feedback       = trim($data['feedback']        ?? '');

    if (empty($student_name) || empty($course_title)) {
        echo json_encode(["success" => false, "message" => "Student name and course title are required"]);
        exit;
    }

    $rating = max(1, min(5, $rating));

    $existStmt = $pdo->prepare(
        "SELECT id FROM reviews WHERE student_name = ? AND course_title = ? AND faculty_name = ? LIMIT 1"
    );
    $existStmt->execute([$student_name, $course_title, $faculty_name]);
    $existing = $existStmt->fetch();

    if ($existing) {

        $stmt = $pdo->prepare(
            "UPDATE reviews
             SET rating = ?, punctuality = ?, knowledge = ?, feedback = ?, created_at = NOW()
             WHERE id = ?"
        );
        $stmt->execute([$rating, $punctuality, $knowledge, $feedback, $existing['id']]);
        echo json_encode(["success" => true, "message" => "Review updated successfully"]);
    } else {

        $stmt = $pdo->prepare(
            "INSERT INTO reviews
             (student_name, student_uni_id, course_title, faculty_name, rating, punctuality, knowledge, feedback)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $student_name, $student_uni_id, $course_title,
            $faculty_name, $rating, $punctuality, $knowledge, $feedback
        ]);
        echo json_encode([
            "success" => true,
            "message" => "Review submitted successfully",
            "id"      => $pdo->lastInsertId()
        ]);
    }
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request method"]);
?>

