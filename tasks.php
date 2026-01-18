<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight requests
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Route requests
switch ($method) {
    case 'GET':
        getTasks();
        break;
    case 'POST':
        createTask();
        break;
    case 'PUT':
        updateTask();
        break;
    case 'DELETE':
        deleteTask();
        break;
    default:
        sendResponse(false, 'Method not allowed', null, 405);
}

// Get all tasks
function getTasks() {
    global $conn;
    
    $sql = "SELECT * FROM tasks ORDER BY deadline ASC, created_at DESC";
    $result = $conn->query($sql);
    
    $tasks = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $isDeadlineToday = false;
            $isOverdue = false;
            
            if ($row['deadline']) {
                $deadline = new DateTime($row['deadline']);
                $today = new DateTime('today');
                $isDeadlineToday = $deadline->format('Y-m-d') === $today->format('Y-m-d');
                $isOverdue = $deadline < $today && $row['status'] === 'pending';
            }
            
            $tasks[] = [
                'id' => (int)$row['id'],
                'title' => $row['title'],
                'deadline' => $row['deadline'],
                'status' => $row['status'],
                'is_deadline_today' => $isDeadlineToday,
                'is_overdue' => $isOverdue,
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            ];
        }
    }
    
    sendResponse(true, 'Tasks retrieved successfully', $tasks);
}

// Create new task
function createTask() {
    global $conn;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['title']) || empty(trim($input['title']))) {
        sendResponse(false, 'Title is required', null, 400);
        return;
    }
    
    $title = $conn->real_escape_string(trim($input['title']));
    $deadline = isset($input['deadline']) && !empty($input['deadline']) 
        ? "'" . $conn->real_escape_string($input['deadline']) . "'" 
        : 'NULL';
    
    $sql = "INSERT INTO tasks (title, deadline, status, created_at, updated_at) 
            VALUES ('$title', $deadline, 'pending', NOW(), NOW())";
    
    if ($conn->query($sql) === TRUE) {
        $newTask = [
            'id' => $conn->insert_id,
            'title' => $title,
            'deadline' => $input['deadline'] ?? null,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        sendResponse(true, 'Task created successfully', $newTask, 201);
    } else {
        sendResponse(false, 'Failed to create task', null, 500);
    }
}

// Update task
function updateTask() {
    global $conn;
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($id === 0) {
        sendResponse(false, 'Invalid task ID', null, 400);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $action = isset($input['action']) ? $input['action'] : 'update';
    
    if ($action === 'toggle') {
        // Toggle status
        $sql = "UPDATE tasks SET 
                status = CASE WHEN status = 'pending' THEN 'completed' ELSE 'pending' END,
                updated_at = NOW()
                WHERE id = $id";
    } else {
        // Update title and deadline
        if (!isset($input['title']) || empty(trim($input['title']))) {
            sendResponse(false, 'Title is required', null, 400);
            return;
        }
        $title = $conn->real_escape_string(trim($input['title']));
        $deadline = isset($input['deadline']) && !empty($input['deadline']) 
            ? "'" . $conn->real_escape_string($input['deadline']) . "'" 
            : 'NULL';
        $sql = "UPDATE tasks SET title = '$title', deadline = $deadline, updated_at = NOW() WHERE id = $id";
    }
    
    if ($conn->query($sql) === TRUE) {
        if ($conn->affected_rows > 0) {
            // Get updated task
            $result = $conn->query("SELECT * FROM tasks WHERE id = $id");
            $task = $result->fetch_assoc();
            sendResponse(true, 'Task updated successfully', $task);
        } else {
            sendResponse(false, 'Task not found', null, 404);
        }
    } else {
        sendResponse(false, 'Failed to update task', null, 500);
    }
}

// Delete task
function deleteTask() {
    global $conn;
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($id === 0) {
        sendResponse(false, 'Invalid task ID', null, 400);
        return;
    }
    
    $sql = "DELETE FROM tasks WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        if ($conn->affected_rows > 0) {
            sendResponse(true, 'Task deleted successfully');
        } else {
            sendResponse(false, 'Task not found', null, 404);
        }
    } else {
        sendResponse(false, 'Failed to delete task', null, 500);
    }
}

// Helper function
function sendResponse($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}
