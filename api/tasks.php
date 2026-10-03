<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? ($data['action'] ?? '');

    if ($action == 'toggle') {
        $taskId = $data['task_id'] ?? 0;
        $status = $data['status'] ?? 'Completed';
        $stmt = $pdo->prepare("UPDATE assigned_tasks SET status = ? WHERE id = ?");
        $stmt->execute([$status, $taskId]);
        echo json_encode(["success" => true]);
    } else {
        $student_id = $data['student_id'] ?? 1;
        $course_code = $data['course_code'] ?? 'CSE 4141';
        $title = $data['title'] ?? '';
        $desc = $data['description'] ?? '';
        $deadline = $data['deadline'] ?? 'Sep 10, 2026';

        $stmt = $pdo->prepare("INSERT INTO assigned_tasks (student_id, course_code, task_number, title, description, deadline, status) VALUES (?, ?, 1, ?, ?, ?, 'Pending')");
        $stmt->execute([$student_id, $course_code, $title, $desc, $deadline]);
        echo json_encode(["success" => true]);
    }
} else {
    $student_id = $_GET['student_id'] ?? 1;
    $stmt = $pdo->prepare("SELECT * FROM assigned_tasks WHERE student_id = ? ORDER BY id ASC");
    $stmt->execute([$student_id]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "tasks" => $tasks]);
}
?>
