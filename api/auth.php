<?php

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'logout') {

        session_unset();
        session_destroy();
        echo json_encode(["success" => true, "message" => "Logged out successfully"]);
        exit;
    }

    if (isset($_SESSION['user'])) {
        echo json_encode(["success" => true, "user" => $_SESSION['user']]);
    } else {
        echo json_encode(["success" => false, "message" => "Not logged in"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $identifier = trim($data['username'] ?? '');
    $password   = trim($data['password'] ?? '');

    if (empty($identifier) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Please enter username and password"]);
        exit;
    }

    $stmt = $pdo->prepare(
        "SELECT * FROM users WHERE (username = ? OR email = ?) LIMIT 1"
    );
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch();

    $passwordValid = false;
    if ($user) {

        if (substr($user['password'], 0, 4) === '$2y$') {
            $passwordValid = password_verify($password, $user['password']);
        } else {

            $passwordValid = ($user['password'] === $password);
        }
    }

    if (!$user || !$passwordValid) {
        echo json_encode(["success" => false, "message" => "Invalid username or password"]);
        exit;
    }

    $sessionUser = [
        'id'           => $user['id'],
        'username'     => $user['username'],
        'name'         => $user['name'],
        'email'        => $user['email'],
        'role'         => $user['role'],
        'university_id'=> $user['university_id'],
        'department'   => $user['department'],
        'cgpa'         => $user['cgpa'],
        'phone'        => $user['phone'],
        'completed_credits' => $user['completed_credits'],
        'semester'     => $user['semester'],
        'profile_picture' => $user['profile_picture'] ?? 'default.png',
        'address'      => $user['address'] ?? '',
        'program'      => $user['program'] ?? '',
    ];
    $_SESSION['user'] = $sessionUser;
    $_SESSION['user_id'] = $user['id'];

    $redirect = '../kazol/index.html';
    if ($user['role'] === 'student') {
        $redirect = '../tanjim/student_dashboard.html';
    } elseif ($user['role'] === 'faculty') {
        $redirect = '../naimur/dashboard.html';
    } elseif ($user['role'] === 'admin') {
        $redirect = '../bappy/admin-dashboard.html';
    }

    echo json_encode([
        "success"  => true,
        "message"  => "Login successful",
        "user"     => $sessionUser,
        "redirect" => $redirect
    ]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request method"]);
?>

