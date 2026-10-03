<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $student = $data['student_name'] ?? 'TA';
    $course = $data['course_title'] ?? 'Web Programming';
    $faculty = $data['faculty_name'] ?? 'Mr. Mahmudul Hasan';
    $rating = $data['rating'] ?? 5;
    $punctuality = $data['punctuality'] ?? 'Excellent';
    $knowledge = $data['knowledge'] ?? 'Excellent';
    $feedback = $data['feedback'] ?? '';

    $stmt = $pdo->prepare("INSERT INTO reviews (student_name, course_title, faculty_name, rating, punctuality, knowledge, feedback) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$student, $course, $faculty, $rating, $punctuality, $knowledge, $feedback]);

    echo json_encode(["success" => true, "message" => "Review submitted successfully"]);
} else {
    $stmt = $pdo->query("SELECT * FROM reviews ORDER BY id DESC");
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "reviews" => $reviews]);
}
?>
