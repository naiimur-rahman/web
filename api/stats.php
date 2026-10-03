<?php
header('Content-Type: application/json');
include 'db.php';

$vacancies = $pdo->query("SELECT COUNT(*) FROM vacancies")->fetchColumn();
$applicants = $pdo->query("SELECT COUNT(*) FROM applications")->fetchColumn();
$shortlisted = $pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'Shortlisted'")->fetchColumn();
$interviews = $pdo->query("SELECT COUNT(*) FROM interviews")->fetchColumn();
$letters = $pdo->query("SELECT COUNT(*) FROM appointment_letters")->fetchColumn();

echo json_encode([
    "success" => true,
    "stats" => [
        "open_vacancies" => (int)$vacancies,
        "total_applicants" => (int)$applicants,
        "shortlisted" => (int)$shortlisted,
        "interviews_today" => (int)$interviews,
        "appointment_letters" => (int)$letters,
        "assigned_tas" => (int)$letters
    ]
]);
?>
