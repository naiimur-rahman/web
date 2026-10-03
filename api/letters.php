<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $name = $data['student_name'] ?? '';
    $uni_id = $data['student_uni_id'] ?? '20-41032';
    $course = $data['course_title'] ?? 'CS 201 — Data Structures';
    $hours = $data['weekly_hours'] ?? 10;
    $stipend = $data['stipend'] ?? 8000;
    $start = $data['start_date'] ?? '2026-09-29';
    $end = $data['end_date'] ?? '2026-12-19';
    $reports = $data['reports_to'] ?? 'Dr. Ayesha Karim';
    $ref = "UIU/CS/TA/2026/" . rand(100, 999);

    $stmt = $pdo->prepare("INSERT INTO appointment_letters (ref_no, student_name, student_uni_id, course_title, weekly_hours, stipend, start_date, end_date, reports_to, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Sent')");
    $stmt->execute([$ref, $name, $uni_id, $course, $hours, $stipend, $start, $end, $reports]);

    echo json_encode(["success" => true, "ref_no" => $ref]);
} else {
    $stmt = $pdo->query("SELECT * FROM appointment_letters ORDER BY id DESC");
    $letters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "letters" => $letters]);
}
?>
