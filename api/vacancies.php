<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $code = $data['course_code'] ?? '';
    $title = $data['course_title'] ?? '';
    $instructor = $data['instructor_name'] ?? 'Dr. Ayesha Karim';
    $term = $data['term'] ?? 'Fall 2026';
    $positions = $data['positions'] ?? 2;
    $hours = $data['weekly_hours'] ?? 10;
    $stipend = $data['stipend'] ?? 8000;
    $min_cgpa = $data['min_cgpa'] ?? 3.50;

    $stmt = $pdo->prepare("INSERT INTO vacancies (course_code, course_title, instructor_name, term, positions, weekly_hours, stipend, min_cgpa, deadline, start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '2026-09-20', '2026-09-29')");
    $stmt->execute([$code, $title, $instructor, $term, $positions, $hours, $stipend, $min_cgpa]);

    echo json_encode(["success" => true]);
} else {
    $stmt = $pdo->query("SELECT * FROM vacancies ORDER BY id ASC");
    $vacancies = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "vacancies" => $vacancies]);
}
?>
