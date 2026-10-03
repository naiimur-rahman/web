<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $student_name = $data['student_name'] ?? '';
    $student_uni_id = $data['student_uni_id'] ?? '';
    $course_title = $data['course_title'] ?? 'Web Programming';
    $faculty_name = $data['faculty_name'] ?? 'Mr. Mahmudul Hasan';
    $interview_date = $data['interview_date'] ?? date('Y-m-d');
    $interview_time = $data['interview_time'] ?? '11:30 AM';
    $location = $data['location'] ?? 'Room 836 (A)';

    $stmt = $pdo->prepare("INSERT INTO interviews (student_name, student_uni_id, course_title, faculty_name, interview_date, interview_time, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled')");
    $stmt->execute([$student_name, $student_uni_id, $course_title, $faculty_name, $interview_date, $interview_time, $location]);

    echo json_encode(["success" => true, "message" => "Interview scheduled successfully"]);
} else {
    $stmt = $pdo->query("SELECT * FROM interviews ORDER BY id DESC");
    $interviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "interviews" => $interviews]);
}
?>
