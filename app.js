const API_URL = 'api/tasks.php';
let currentFilter = 'all';
let editModal;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    editModal = new bootstrap.Modal(document.getElementById('editModal'));
    
    loadTasks();
    
    // Add task form
    document.getElementById('addTaskForm').addEventListener('submit', addTask);
    
    // Filter navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.dataset.filter) {
                e.preventDefault();
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                loadTasks();
            }
        });
    });
    
    // Save edit button
    document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
    
    // Filter navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.dataset.filter) {
                e.preventDefault();
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                loadTasks();
            }
        });
    });
    
    // Set min date for deadline to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDeadline').setAttribute('min', today);
    document.getElementById('editTaskDeadline').setAttribute('min', today);
});

// Load tasks from API
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            displayTasks(data.data);
            updateStatistics(data.data);
        } else {
            showNotification(data.message || 'Gagal memuat tugas', 'error');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Gagal memuat tugas. Pastikan database sudah terkonfigurasi.', 'error');
    }
}

// Display tasks
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    // Filter tasks
    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => task.status === 'pending');
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.status === 'completed');
    } else if (currentFilter === 'today') {
        filteredTasks = tasks.filter(task => task.is_deadline_today);
    }
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <p>Tidak ada tugas</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = filteredTasks.map(task => {
        let deadlineClass = '';
        let deadlineBadge = '';
        
        if (task.deadline) {
            if (task.is_deadline_today) {
                deadlineClass = 'deadline-today';
                deadlineBadge = '<span class="badge bg-warning text-dark ms-2"><i class="bi bi-exclamation-triangle"></i> Deadline Hari Ini!</span>';
            } else if (task.is_overdue) {
                deadlineClass = 'overdue';
                deadlineBadge = '<span class="badge bg-danger ms-2"><i class="bi bi-x-circle"></i> Terlambat</span>';
            } else {
                deadlineBadge = `<span class="badge bg-info ms-2"><i class="bi bi-calendar"></i> ${formatDate(task.deadline)}</span>`;
            }
        }
        
        return `
            <div class="task-item ${task.status === 'completed' ? 'completed' : ''} ${deadlineClass}" data-id="${task.id}">
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" 
                        ${task.status === 'completed' ? 'checked' : ''} 
                        onchange="toggleTask(${task.id})">
                    <div>
                        <span class="task-title">${escapeHtml(task.title)}</span>
                        ${deadlineBadge}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-action btn-edit" onclick='editTask(${JSON.stringify(task)})'>
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteTask(${task.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

// Update statistics
function updateStatistics(tasks) {
    const total = tasks.length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('completedTasks').textContent = completed;
}

// Add new task
async function addTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const deadline = document.getElementById('taskDeadline').value;
    
    if (!title) return;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, deadline: deadline || null })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDeadline').value = '';
            loadTasks();
            showNotification('Tugas berhasil ditambahkan', 'success');
        } else {
            showNotification(data.message || 'Gagal menambahkan tugas', 'error');
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('Gagal menambahkan tugas', 'error');
    }
}

// Toggle task status
async function toggleTask(id) {
    try {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'toggle' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadTasks();
            showNotification('Status tugas diperbarui', 'success');
        }
    } catch (error) {
        console.error('Error toggling task:', error);
        showNotification('Gagal memperbarui status', 'error');
    }
}

// Edit task
function editTask(task) {
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDeadline').value = task.deadline || '';
    editModal.show();
}

// Save edit
async function saveEdit() {
    const id = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value.trim();
    const deadline = document.getElementById('editTaskDeadline').value;
    
    if (!title) return;
    
    try {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'update', title, deadline: deadline || null })
        });
        
        const data = await response.json();
        
        if (data.success) {
            editModal.hide();
            loadTasks();
            showNotification('Tugas berhasil diperbarui', 'success');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Gagal memperbarui tugas', 'error');
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
    
    try {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadTasks();
            showNotification('Tugas berhasil dihapus', 'success');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Gagal menghapus tugas', 'error');
    }
}

// Show notification
function showNotification(message, type) {
    let alertClass = 'alert-success';
    if (type === 'error') alertClass = 'alert-danger';
    if (type === 'info') alertClass = 'alert-info';
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alert.style.zIndex = '9999';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
