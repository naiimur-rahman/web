<?php

session_start();
header('Content-Type: application/json');
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $role = $data['role'] ?? 'student';

    if ($role === 'admin') {
        echo json_encode(["success" => false, "message" => "Admin registration is not allowed."]);
        exit;
    }

    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $identifier = trim($data['identifier'] ?? '');

    if (empty($email) || empty($password) || empty($identifier)) {
        echo json_encode(["success" => false, "message" => "Required fields (Email, ID, Password) missing."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format."]);
        exit;
    }

    if (strlen($password) < 4) {
        echo json_encode(["success" => false, "message" => "Password must be at least 4 characters."]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "An account with this email already exists."]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE university_id = ?");
    $stmt->execute([$identifier]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "This ID is already registered."]);
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $name = trim($data['name'] ?? 'New User');
    if (empty($name)) $name = 'New User';

    $phone = trim($data['phone'] ?? null);
    $department = trim($data['department'] ?? 'Computer Science & Engineering');
    $cgpa = isset($data['cgpa']) ? floatval($data['cgpa']) : null;

    $stmt = $pdo->prepare("INSERT INTO users (username, password, name, email, role, university_id, department, phone, cgpa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $username = strtolower($identifier);

    try {
        $stmt->execute([$username, $hashed_password, $name, $email, $role, $identifier, $department, $phone, $cgpa]);
        echo json_encode(["success" => true, "message" => "Registration successful. You can now log in."]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Registration failed: " . $e->getMessage()]);
    }
    exit;
}
echo json_encode(["success" => false, "message" => "Invalid method."]);
?>

