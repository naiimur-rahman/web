<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? ($data['action'] ?? '');

    if ($action == 'status') {
        $stmt = $pdo->prepare("UPDATE applications SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['application_id']]);
        echo json_encode(["success" => true]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO applications (vacancy_id, student_id, student_name, student_uni_id, email, cgpa, motivation, skills, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')");
        $stmt->execute([
            $data['vacancy_id'] ?? 1,
            $data['student_id'] ?? 1,
            $data['student_name'] ?? 'Student',
            $data['student_uni_id'] ?? '011222146',
            $data['email'] ?? 'student@uiu.ac.bd',
            $data['cgpa'] ?? 3.50,
            $data['motivation'] ?? '',
            $data['skills'] ?? ''
        ]);
        echo json_encode(["success" => true]);
    }
} else {
    $student_id = $_GET['student_id'] ?? null;
    if ($student_id) {
        $stmt = $pdo->prepare("SELECT a.*, v.course_title, v.course_code FROM applications a JOIN vacancies v ON a.vacancy_id = v.id WHERE a.student_id = ? ORDER BY a.id DESC");
        $stmt->execute([$student_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM applications ORDER BY id DESC");
    }
    $apps = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "applications" => $apps]);
}
?>
