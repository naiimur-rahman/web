<?php
// api/profile.php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT id, username, name, email, role, university_id, department, cgpa, phone, completed_credits, semester, profile_picture, address, program FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo json_encode(["success" => true, "profile" => $user]);
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
    exit;
}

if ($method === 'POST') {
    // If multipart/form-data for image upload
    if (isset($_FILES['profile_picture'])) {
        $file = $_FILES['profile_picture'];
        
        $allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!in_array($file['type'], $allowed_types)) {
            echo json_encode(["success" => false, "message" => "Invalid file type. Only JPG, PNG, WEBP allowed."]);
            exit;
        }
        
        if ($file['size'] > 2 * 1024 * 1024) { // 2MB max
            echo json_encode(["success" => false, "message" => "File too large. Max 2MB."]);
            exit;
        }
        
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'profile_' . $user_id . '_' . time() . '.' . $ext;
        $upload_dir = '../uploads/profiles/';
        
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        
        $dest = $upload_dir . $filename;
        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $stmt = $pdo->prepare("UPDATE users SET profile_picture = ? WHERE id = ?");
            $stmt->execute([$filename, $user_id]);
            
            $_SESSION['profile_picture'] = $filename;
            
            echo json_encode(["success" => true, "message" => "Profile picture updated.", "profile_picture" => $filename]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to move uploaded file."]);
        }
        exit;
    }
    
    // Otherwise, text fields update (JSON)
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) $data = $_POST; // Fallback
    
    $name = trim($data['name'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $department = trim($data['department'] ?? '');
    $address = trim($data['address'] ?? '');
    $program = trim($data['program'] ?? '');
    $email = trim($data['email'] ?? '');
    $university_id = trim($data['university_id'] ?? '');
    $semester = trim($data['semester'] ?? '');
    $cgpa = isset($data['cgpa']) ? floatval($data['cgpa']) : null;
    
    if (empty($name) || empty($email)) {
        echo json_encode(["success" => false, "message" => "Name and Email cannot be empty."]);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ?, department = ?, address = ?, program = ?, email = ?, university_id = ?, semester = ?, cgpa = ? WHERE id = ?");
        $stmt->execute([$name, $phone, $department, $address, $program, $email, $university_id, $semester, $cgpa, $user_id]);
        
        $_SESSION['name'] = $name;
        
        // Also get the full updated user object to return
        $stmt2 = $pdo->prepare("SELECT id, username, name, email, role, university_id, department, cgpa, phone, completed_credits, semester, profile_picture, address, program FROM users WHERE id = ?");
        $stmt2->execute([$user_id]);
        $user = $stmt2->fetch();
        
        echo json_encode(["success" => true, "message" => "Profile updated successfully.", "profile" => $user]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error updating profile. Email or ID might already be in use."]);
    }
    exit;
}
?>
