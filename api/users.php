<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admin only.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $role = $_GET['role'] ?? 'student';
    $status = $_GET['status'] ?? 'all';

    $query = 'SELECT id, username, name, email, university_id, department, cgpa, phone, is_verified, created_at FROM users WHERE role = ?';
    $params = [$role];

    if ($status === 'unverified') {
        $query .= ' AND is_verified = 0';
    } elseif ($status === 'verified') {
        $query .= ' AND is_verified = 1';
    }

    $query .= ' ORDER BY created_at DESC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $users = $stmt->fetchAll();

    echo json_encode(['success' => true, 'users' => $users]);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? ($data['action'] ?? '');

    if ($action === 'verify') {
        $user_id = $data['user_id'] ?? null;
        $cgpa = isset($data['cgpa']) ? floatval($data['cgpa']) : null;

        if (!$user_id) {
            echo json_encode(['success' => false, 'message' => 'User ID required']);
            exit;
        }

        $stmt = $pdo->prepare('UPDATE users SET is_verified = 1, cgpa = ? WHERE id = ?');
        $stmt->execute([$cgpa, $user_id]);

        echo json_encode(['success' => true, 'message' => 'Student verified and CGPA updated successfully']);
        exit;
    }
}

echo json_encode(['success' => false, 'message' => 'Invalid request method']);
?>

