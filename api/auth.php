<?php
// ================================================
// api/auth.php — Login & Logout Authentication
// UIU TA Management System
// ================================================

// 1. Start session and set JSON header
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 2. Include database connection
require_once 'db.php';

// 3. Handle logout (GET request with action=logout)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'logout') {
        // Destroy the session and redirect to login
        session_unset();
        session_destroy();
        echo json_encode(["success" => true, "message" => "Logged out successfully"]);
        exit;
    }

    // Return current session user info
    if (isset($_SESSION['user'])) {
        echo json_encode(["success" => true, "user" => $_SESSION['user']]);
    } else {
        echo json_encode(["success" => false, "message" => "Not logged in"]);
    }
    exit;
}

// 4. Handle login (POST request)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $identifier = trim($data['username'] ?? '');
    $password   = trim($data['password'] ?? '');

    // 5. Validate input
    if (empty($identifier) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Please enter username and password"]);
        exit;
    }

    // 6. Query database — match by username OR email
    $stmt = $pdo->prepare(
        "SELECT * FROM users WHERE (username = ? OR email = ?) LIMIT 1"
    );
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch();

    // 7. Verify credentials
    // Support both plain-text passwords (legacy demo) and hashed passwords
    $passwordValid = false;
    if ($user) {
        // Check if password is hashed (starts with $2y$ = bcrypt)
        if (substr($user['password'], 0, 4) === '$2y$') {
            $passwordValid = password_verify($password, $user['password']);
        } else {
            // Plain-text comparison for existing demo accounts
            $passwordValid = ($user['password'] === $password);
        }
    }

    if (!$user || !$passwordValid) {
        echo json_encode(["success" => false, "message" => "Invalid username or password"]);
        exit;
    }

    // 8. Store user info in session (exclude password)
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
    $_SESSION['user_id'] = $user['id']; // Used by profile.php for authorization

    // 9. Determine redirect URL based on role
    $redirect = '../kazol/index.html';
    if ($user['role'] === 'student') {
        $redirect = '../tanjim/student_dashboard.html';
    } elseif ($user['role'] === 'faculty') {
        $redirect = '../naimur/dashboard.html';
    } elseif ($user['role'] === 'admin') {
        $redirect = '../bappy/admin-dashboard.html';
    }

    // 10. Return success response with user data and redirect
    echo json_encode([
        "success"  => true,
        "message"  => "Login successful",
        "user"     => $sessionUser,
        "redirect" => $redirect
    ]);
    exit;
}

// Handle unknown methods
echo json_encode(["success" => false, "message" => "Invalid request method"]);
?>
