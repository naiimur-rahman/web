<?php

session_start();
header('Content-Type: application/json');

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $student_uni_id = $_GET['student_uni_id'] ?? null;
    $ref_no         = $_GET['ref_no']         ?? null;

    if ($student_uni_id) {
        $stmt = $pdo->prepare("SELECT * FROM appointment_letters WHERE student_uni_id = ? ORDER BY issued_at DESC");
        $stmt->execute([$student_uni_id]);
    } elseif ($ref_no) {
        $stmt = $pdo->prepare("SELECT * FROM appointment_letters WHERE ref_no = ?");
        $stmt->execute([$ref_no]);
    } else {
        $stmt = $pdo->query("SELECT * FROM appointment_letters ORDER BY issued_at DESC");
    }

    $letters = $stmt->fetchAll();
    echo json_encode(["success" => true, "letters" => $letters]);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $student_name   = trim($data['student_name']    ?? '');
    $student_uni_id = trim($data['student_uni_id']  ?? '');
    $course_title   = trim($data['course_title']    ?? '');
    $weekly_hours   = (int)($data['weekly_hours']   ?? 10);
    $stipend        = (float)($data['stipend']      ?? 8000);
    $start_date     = trim($data['start_date']      ?? date('Y-m-d'));
    $end_date       = trim($data['end_date']        ?? date('Y-m-d', strtotime('+3 months')));
    $reports_to     = trim($data['reports_to']      ?? 'Dr. Ayesha Karim, Course Instructor');

    if (empty($student_name) || empty($course_title)) {
        echo json_encode(["success" => false, "message" => "Student name and course title are required"]);
        exit;
    }

    $year  = date('Y');
    $count = (int)$pdo->query("SELECT COUNT(*) FROM appointment_letters")->fetchColumn() + 1;
    $ref   = "UIU/CS/TA/$year/" . str_pad($count, 3, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare(
        "INSERT INTO appointment_letters
         (ref_no, student_name, student_uni_id, course_title, weekly_hours, stipend,
          start_date, end_date, reports_to, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Sent')"
    );
    $stmt->execute([
        $ref, $student_name, $student_uni_id, $course_title,
        $weekly_hours, $stipend, $start_date, $end_date, $reports_to
    ]);

    if ($student_uni_id) {
        $stmt2 = $pdo->prepare(
            "UPDATE applications SET status = 'Selected'
             WHERE student_uni_id = ? AND status IN ('Shortlisted', 'Interview Scheduled')"
        );
        $stmt2->execute([$student_uni_id]);
    }

    echo json_encode([
        "success" => true,
        "message" => "Appointment letter generated successfully",
        "ref_no"  => $ref,
        "id"      => $pdo->lastInsertId()
    ]);
    exit;
}

if ($method === 'PUT') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $id     = $data['id']     ?? null;
    $status = $data['status'] ?? null;

    if (!$id || !$status) {
        echo json_encode(["success" => false, "message" => "ID and status are required"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE appointment_letters SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    echo json_encode(["success" => true, "message" => "Letter status updated"]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request method"]);
?>

