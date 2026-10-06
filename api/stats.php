<?php
// ================================================
// api/stats.php — Dashboard Statistics
// UIU TA Management System
// ================================================

// 1. Start session and set headers
session_start();
header('Content-Type: application/json');

// 2. Include database connection
require_once 'db.php';

// 3. Get optional role or student_id filter
$role       = $_GET['role']       ?? 'all';    // 'student', 'faculty', 'admin', 'all'
$student_id = $_GET['student_id'] ?? null;

// ── Student-specific stats ────────────────────────────────────────
if ($role === 'student' && $student_id) {
    $sid = (int)$student_id;

    // Total applications submitted by this student
    $totalApps = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE student_id = ?");
    $totalApps->execute([$sid]);
    $totalApps = (int)$totalApps->fetchColumn();

    // Pending applications
    $pending = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'Pending'");
    $pending->execute([$sid]);
    $pending = (int)$pending->fetchColumn();

    // Shortlisted
    $shortlisted = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'Shortlisted'");
    $shortlisted->execute([$sid]);
    $shortlisted = (int)$shortlisted->fetchColumn();

    // Interview Scheduled
    $interviews = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'Interview Scheduled'");
    $interviews->execute([$sid]);
    $interviews = (int)$interviews->fetchColumn();

    // Selected / Accepted
    $selected = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'Selected'");
    $selected->execute([$sid]);
    $selected = (int)$selected->fetchColumn();

    // Assigned tasks
    $tasks = $pdo->prepare("SELECT COUNT(*) FROM assigned_tasks WHERE student_id = ?");
    $tasks->execute([$sid]);
    $totalTasks = (int)$tasks->fetchColumn();

    // Available positions (open vacancies)
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

// ── Global / Faculty / Admin stats ───────────────────────────────
// Total vacancies
$totalVacancies = $pdo->query("SELECT COUNT(*) FROM vacancies")->fetchColumn();
$openVacancies  = $pdo->query("SELECT COUNT(*) FROM vacancies WHERE status = 'Open'")->fetchColumn();

// Applications
$totalApplicants = $pdo->query("SELECT COUNT(*) FROM applications")->fetchColumn();
$pendingApps     = $pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'Pending'")->fetchColumn();
$shortlisted     = $pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'Shortlisted'")->fetchColumn();
$selected        = $pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'Selected'")->fetchColumn();
$rejected        = $pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'Rejected'")->fetchColumn();

// Interviews
$totalInterviews    = $pdo->query("SELECT COUNT(*) FROM interviews")->fetchColumn();
$scheduledInterviews = $pdo->query("SELECT COUNT(*) FROM interviews WHERE status = 'Scheduled'")->fetchColumn();

// Tasks
$totalTasks    = $pdo->query("SELECT COUNT(*) FROM assigned_tasks")->fetchColumn();
$completedTasks = $pdo->query("SELECT COUNT(*) FROM assigned_tasks WHERE status = 'Completed'")->fetchColumn();

// Letters
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
        "interviews_today"    => (int)$scheduledInterviews,   // alias for dashboard card
        "total_tasks"         => (int)$totalTasks,
        "completed_tasks"     => (int)$completedTasks,
        "appointment_letters" => (int)$totalLetters,
        "assigned_tas"        => (int)$totalLetters,          // alias
    ]
]);
?>
