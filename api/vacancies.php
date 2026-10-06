<?php

session_start();
header('Content-Type: application/json');

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id     = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? null;

    if ($id) {

        $stmt = $pdo->prepare("SELECT * FROM vacancies WHERE id = ?");
        $stmt->execute([$id]);
        $vacancy = $stmt->fetch();
        if ($vacancy) {
            echo json_encode(["success" => true, "vacancy" => $vacancy]);
        } else {
            echo json_encode(["success" => false, "message" => "Vacancy not found"]);
        }
    } else {

        if ($status) {
            $stmt = $pdo->prepare("SELECT * FROM vacancies WHERE status = ? ORDER BY deadline ASC");
            $stmt->execute([$status]);
        } else {
            $stmt = $pdo->query("SELECT * FROM vacancies ORDER BY deadline ASC");
        }
        $vacancies = $stmt->fetchAll();
        echo json_encode(["success" => true, "vacancies" => $vacancies]);
    }
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $course_code  = trim($data['course_code']  ?? '');
    $course_title = trim($data['course_title'] ?? '');
    $instructor   = trim($data['instructor_name'] ?? 'Dr. Ayesha Karim');
    $term         = trim($data['term']         ?? 'Fall 2026');
    $positions    = (int)($data['positions']   ?? 2);
    $hours        = (int)($data['weekly_hours']?? 10);
    $stipend      = (float)($data['stipend']   ?? 8000);
    $min_cgpa     = (float)($data['min_cgpa']  ?? 3.50);
    $min_year     = trim($data['min_year']     ?? '2nd year');
    $prereq       = isset($data['prereq']) ? (int)$data['prereq'] : 1;
    $priority     = isset($data['priority']) ? (int)$data['priority'] : 0;
    $responsibilities = trim($data['responsibilities'] ?? '');
    $deadline     = trim($data['deadline']     ?? date('Y-m-d', strtotime('+30 days')));
    $start_date   = trim($data['start_date']   ?? date('Y-m-d', strtotime('+45 days')));
    $status       = trim($data['status']       ?? 'Open');

    if (empty($course_code) || empty($course_title)) {
        echo json_encode(["success" => false, "message" => "Course code and title are required"]);
        exit;
    }

    if ($deadline < date('Y-m-d')) {

    }

    $stmt = $pdo->prepare(
        "INSERT INTO vacancies
         (course_code, course_title, instructor_name, term, positions, weekly_hours,
          stipend, min_cgpa, min_year, prereq, priority, responsibilities, deadline, start_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $course_code, $course_title, $instructor, $term,
        $positions, $hours, $stipend, $min_cgpa,
        $min_year, $prereq, $priority, $responsibilities,
        $deadline, $start_date, $status
    ]);

    $newId = $pdo->lastInsertId();
    echo json_encode([
        "success" => true,
        "message" => "Vacancy created successfully",
        "id"      => $newId
    ]);
    exit;
}

if ($method === 'PUT' || $method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id     = $data['id']     ?? null;
    $status = $data['status'] ?? null;

    if (!$id || !$status) {
        echo json_encode(["success" => false, "message" => "ID and status are required"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE vacancies SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    echo json_encode(["success" => true, "message" => "Vacancy updated"]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request method"]);
?>

