<?php
header('Content-Type: application/json');
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?");
$stmt->execute([$username, $username, $password]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    $redirect = '../kazol/index.html';
    if ($user['role'] == 'student') {
        $redirect = '../tanjim/student_dashboard.html';
    } else if ($user['role'] == 'faculty') {
        $redirect = '../naimur/dashboard.html';
    } else if ($user['role'] == 'admin') {
        $redirect = '../bappy/admin-dashboard.html';
    }

    echo json_encode([
        "success" => true,
        "user" => $user,
        "redirect" => $redirect
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Invalid username or password"
    ]);
}
?>
