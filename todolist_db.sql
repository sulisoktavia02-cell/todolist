-- Database: todolist_db
-- Buat database terlebih dahulu

CREATE DATABASE IF NOT EXISTS todolist_db;
USE todolist_db;

-- Tabel tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    deadline DATE NULL,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data (optional)
INSERT INTO tasks (title, deadline, status) VALUES
('Belajar PHP REST API', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'pending'),
('Membuat To-Do List', CURDATE(), 'pending'),
('Deploy ke server', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'pending');
