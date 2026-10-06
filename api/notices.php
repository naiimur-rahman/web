<?php

session_start();
header('Content-Type: application/json');

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $limit = (int)($_GET['limit'] ?? 20);
    if ($limit < 1 || $limit > 100) $limit = 20;

    $stmt = $pdo->prepare("SELECT * FROM notices ORDER BY created_at DESC LIMIT ?");
    $stmt->execute([$limit]);
    $notices = $stmt->fetchAll();

    echo json_encode(["success" => true, "notices" => $notices]);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $title       = trim($data['title']       ?? '');
    $description = trim($data['description'] ?? '');
    $badge_text  = trim($data['badge_text']  ?? 'Info');
    $badge_class = trim($data['badge_class'] ?? 'status-open');
    $icon        = trim($data['icon']        ?? '📢');

    if (empty($title) || empty($description)) {
        echo json_encode(["success" => false, "message" => "Title and description are required"]);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO notices (title, description, badge_text, badge_class, icon) VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([$title, $description, $badge_text, $badge_class, $icon]);

    echo json_encode([
        "success" => true,
        "message" => "Notice created successfully",
        "id"      => $pdo->lastInsertId()
    ]);
    exit;
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Notice ID is required"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM notices WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true, "message" => "Notice deleted"]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request method"]);
?>

