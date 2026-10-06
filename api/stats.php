<?php

session_start();
header('Content-Type: application/json');

require_once 'db.php';

$role       = $_GET['role']       ?? 'all';
$student_id = $_GET['student_id'] ?? null;

if ($role === 'student' && $student_id) {
    $sid = (int)$student_id;

    $totalApps = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE student_id = ?");
    $totalApps->execute([$sid]);
    $totalApps = (int)$totalApps->fetchColumn();

    $pending = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'Pending'");
    $pending->execute([$sid]);
    $pending = (int)$pending->fetchColumn();

    $shortlisted = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'Shortlisted'");
    $shortlisted->execute([$sid]);
    $shortlisted = (int)$shortlisted->fetchColumn();

    $interviews = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'Interview Scheduled'");
    $interviews->execute([$sid]);
    $interviews = (int)$interviews->fetchColumn();

    $selected = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'Selected'");
    $selected->execute([$sid]);
    $selected = (int)$selected->fetchColumn();

    $tasks = $pdo->prepare("SELECT COUNT(*) FROM assigned_tasks WHERE student_id = ?");
    $tasks->execute([$sid]);
    $totalTasks = (int)$tasks->fetchColumn();

    $openVac = $pdo->query("SELECT COUNT(*) FROM vacancies WHERE status = 'Open'")->fetchColumn();

    echo json_encode([
        "success" => true,
        "stats" => [
            "total_applications" => $totalApps,
            "pending"            => $pending,
            "shortlisted"        => $shortlisted,
            "interviews"         => $interviews,
            "selected"           => $selected,
            "assigned_tasks"     => $totalTasks,
            "open_vacancies"     => (int)$openVac,
        ]
    ]);
    exit;
}

$totalVacancies = $pdo->query("SELECT COUNT(*) FROM vacancies")->fetchColumn();
$openVacancies  = $pdo->query("SELECT COUNT(*) FROM vacancies WHERE status = 'Open'")->fetchColumn();

$totalApplicants = $pdo->query("SELECT COUNT(*) FROM applications")->fetchColumn();
$pendingApps     = $pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'Pending'")->fetchColumn();
$shortlisted     = $pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'Shortlisted'")->fetchColumn();
$selected        = $pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'Selected'")->fetchColumn();
$rejected        = $pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'Rejected'")->fetchColumn();

$totalInterviews    = $pdo->query("SELECT COUNT(*) FROM interviews")->fetchColumn();
$scheduledInterviews = $pdo->query("SELECT COUNT(*) FROM interviews WHERE status = 'Scheduled'")->fetchColumn();

$totalTasks    = $pdo->query("SELECT COUNT(*) FROM assigned_tasks")->fetchColumn();
$completedTasks = $pdo->query("SELECT COUNT(*) FROM assigned_tasks WHERE status = 'Completed'")->fetchColumn();

$totalLetters = $pdo->query("SELECT COUNT(*) FROM appointment_letters")->fetchColumn();

echo json_encode([
    "success" => true,
    "stats" => [
        "total_vacancies"     => (int)$totalVacancies,
        "open_vacancies"      => (int)$openVacancies,
        "total_applicants"    => (int)$totalApplicants,
        "pending_apps"        => (int)$pendingApps,
        "shortlisted"         => (int)$shortlisted,
        "selected"            => (int)$selected,
        "rejected"            => (int)$rejected,
        "total_interviews"    => (int)$totalInterviews,
        "scheduled_interviews"=> (int)$scheduledInterviews,
        "interviews_today"    => (int)$scheduledInterviews,
        "total_tasks"         => (int)$totalTasks,
        "completed_tasks"     => (int)$completedTasks,
        "appointment_letters" => (int)$totalLetters,
        "assigned_tas"        => (int)$totalLetters,
    ]
]);
?>

