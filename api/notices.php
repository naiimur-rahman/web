<?php
header('Content-Type: application/json');
include 'db.php';

$stmt = $pdo->query("SELECT * FROM notices ORDER BY id DESC");
$notices = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "notices" => $notices
]);
?>
