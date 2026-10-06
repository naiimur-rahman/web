<?php
// ================================================
// api/db.php — Centralized Database Connection
// UIU TA Management System
// ================================================

// 1. Database configuration
$host     = "localhost";
$dbname   = "uiu_ta_management";
$username = "root";
$password = "";          // Change to "1234" if your MySQL root uses that password

// 2. Create PDO connection with error handling
try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Return JSON error instead of crashing with raw PHP error
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed. Please check your MySQL settings."
    ]);
    exit;
}
?>
