// Task Management System JavaScript
// Application state
let tasks = [];
let filteredTasks = [];
let currentPage = 1;
let tasksPerPage = 12;
let currentView = 'grid';
let currentTask = null;
let editingTask = null;

// Category and priority configurations
const categories = {
    personal: { label: 'Personal', icon: 'fas fa-user', color: '#8b5cf6' },
    work: { label: 'Work', icon: 'fas fa-briefcase', color: '#3b82f6' },
    study: { label: 'Study', icon: 'fas fa-graduation-cap', color: '#06b6d4' },
    health: { label: 'Health', icon: 'fas fa-heartbeat', color: '#ef4444' },
    finance: { label: 'Finance', icon: 'fas fa-dollar-sign', color: '#22c55e' },
    other: { label: 'Other', icon: 'fas fa-ellipsis-h', color: '#94a3b8' }
};

const priorities = {
    low: { label: 'Low', color: '#22c55e', value: 1 },
    medium: { label: 'Medium', color: '#f59e0b', value: 2 },
    high: { label: 'High', color: '#ef4444', value: 3 },
    urgent: { label: 'Urgent', color: '#dc2626', value: 4 }
};

// DOM elements
const taskForm = document.getElementById('taskForm');
const editTaskForm = document.getElementById('editTaskForm');
const tasksContainer = document.getElementById('tasksContainer');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const priorityFilter = document.getElementById('priorityFilter');
const statusFilter = document.getElementById('statusFilter');
const sortBy = document.getElementById('sortBy');
const taskModal = document.getElementById('taskModal');
const editModal = document.getElementById('editModal');
const emptyState = document.getElementById('emptyState');
const paginationContainer = document.getElementById('paginationContainer');
const notificationContainer = document.getElementById('notificationContainer');

// Statistics elements
const totalTasksElement = document.getElementById('totalTasks');
const pendingTasksElement = document.getElementById('pendingTasks');
const completedTasksElement = document.getElementById('completedTasks');
const tasksTitle = document.getElementById('tasksTitle');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setupEventListeners();
    updateStatistics();
    renderTasks();
    setupMinDateTime();
});

// Setup event listeners
function setupEventListeners() {
    // Form submissions
    taskForm.addEventListener('submit', handleTaskSubmit);
    editTaskForm.addEventListener('submit', handleEditSubmit);
    
    // Search and filters
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    categoryFilter.addEventListener('change', handleFilters);
    priorityFilter.addEventListener('change', handleFilters);
    statusFilter.addEventListener('change', handleFilters);
    sortBy.addEventListener('change', handleFilters);
    
    // Modal event listeners
    taskModal.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    editModal.addEventListener('click', function(e) {
        if (e.target === this) closeEditModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // File input for import
    document.getElementById('importFileInput').addEventListener('change', handleFileImport);
}

// Set minimum date time for due date inputs
function setupMinDateTime() {
    const now = new Date();
    const minDateTime = now.toISOString().slice(0, 16);
    document.getElementById('taskDueDate').min = minDateTime;
    document.getElementById('editTaskDueDate').min = minDateTime;
}

// Task class definition
class Task {
    constructor(title, description, category, priority, dueDate) {
        this.id = Date.now() + Math.random().toString(36).substr(2, 9);
        this.title = title.trim();
        this.description = description.trim();
        this.category = category;
        this.priority = priority;
        this.dueDate = dueDate;
        this.completed = false;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        this.completedAt = null;
    }
    
    markCompleted() {
        this.completed = true;
        this.completedAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
    
    markPending() {
        this.completed = false;
        this.completedAt = null;
        this.updatedAt = new Date().toISOString();
    }
    
    update(data) {
        this.title = data.title.trim();
        this.description = data.description.trim();
        this.category = data.category;
        this.priority = data.priority;
        this.dueDate = data.dueDate;
        this.updatedAt = new Date().toISOString();
    }
    
    isOverdue() {
        if (!this.dueDate || this.completed) return false;
        return new Date(this.dueDate) < new Date();
    }
    
    getStatus() {
        if (this.completed) return 'completed';
        if (this.isOverdue()) return 'overdue';
        return 'pending';
    }
}

// Handle task form submission
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(taskForm);
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const priority = formData.get('priority');
    const dueDate = formData.get('dueDate');
    
    // Validation
    if (!validateTaskData(title, description)) {
        return;
    }
    
    // Create new task
    const task = new Task(title, description, category, priority, dueDate);
    tasks.unshift(task);
    
    // Save and update UI
    saveTasks();
    updateStatistics();
    applyFiltersAndSort();
    clearForm();
    
    showNotification('Task created successfully!', 'success');
    
    // Add animation
    setTimeout(() => {
        const firstTaskCard = document.querySelector('.task-card');
        if (firstTaskCard) {
            firstTaskCard.classList.add('fade-in-up');
        }
    }, 100);
}

// Handle edit form submission
function handleEditSubmit(e) {
    e.preventDefault();
    
    if (!editingTask) return;
    
    const formData = new FormData(editTaskForm);
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const priority = formData.get('priority');
    const dueDate = formData.get('dueDate');
    
    // Validation
    if (!validateTaskData(title, description)) {
        return;
    }
    
    // Update task
    editingTask.update({
        title,
        description,
        category,
        priority,
        dueDate
    });
    
    // Save and update UI
    saveTasks();
    updateStatistics();
    applyFiltersAndSort();
    closeEditModal();
    
    showNotification('Task updated successfully!', 'success');
}

// Validate task data
function validateTaskData(title, description) {
    clearValidationErrors();
    
    let isValid = true;
    
    if (!title || title.trim().length < 3) {
        showValidationError('titleError', 'Title must be at least 3 characters long');
        isValid = false;
    }
    
    if (title && title.trim().length > 100) {
        showValidationError('titleError', 'Title must be less than 100 characters');
        isValid = false;
    }
    
    if (description && description.trim().length > 500) {
        showValidationError('descriptionError', 'Description must be less than 500 characters');
        isValid = false;
    }
    
    return isValid;
}

// Show validation error
function showValidationError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Clear validation errors
function clearValidationErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
        element.textContent = '';
    });
}

// Search functionality
function handleSearch() {
    applyFiltersAndSort();
}

// Handle filters and sorting
function handleFilters() {
    applyFiltersAndSort();
}

// Apply filters and sorting
function applyFiltersAndSort() {
    let filtered = [...tasks];
    
    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    const categoryValue = categoryFilter.value;
    if (categoryValue !== 'all') {
        filtered = filtered.filter(task => task.category === categoryValue);
    }
    
    // Apply priority filter
    const priorityValue = priorityFilter.value;
    if (priorityValue !== 'all') {
        filtered = filtered.filter(task => task.priority === priorityValue);
    }
    
    // Apply status filter
    const statusValue = statusFilter.value;
    if (statusValue !== 'all') {
        filtered = filtered.filter(task => task.getStatus() === statusValue);
    }
    
    // Apply sorting
    const sortValue = sortBy.value;
    filtered = sortTasks(filtered, sortValue);
    
    filteredTasks = filtered;
    currentPage = 1;
    renderTasks();
    updateFilterTitle();
}

// Sort tasks
function sortTasks(tasks, sortBy) {
    return tasks.sort((a, b) => {
        switch (sortBy) {
            case 'dueDate':
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            
            case 'priority':
                return priorities[b.priority].value - priorities[a.priority].value;
            
            case 'title':
                return a.title.localeCompare(b.title);
            
            case 'created':
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });
}

// Update filter title
function updateFilterTitle() {
    let title = 'All Tasks';
    const activeFilters = [];
    
    if (searchInput.value.trim()) {
        activeFilters.push(`Search: "${searchInput.value.trim()}"`);
    }
    
    if (categoryFilter.value !== 'all') {
        activeFilters.push(`Category: ${categories[categoryFilter.value].label}`);
    }
    
    if (priorityFilter.value !== 'all') {
        activeFilters.push(`Priority: ${priorities[priorityFilter.value].label}`);
    }
    
    if (statusFilter.value !== 'all') {
        activeFilters.push(`Status: ${statusFilter.value.charAt(0).toUpperCase() + statusFilter.value.slice(1)}`);
    }
    
    if (activeFilters.length > 0) {
        title = `Filtered Tasks (${activeFilters.join(', ')})`;
    }
    
    tasksTitle.textContent = title;
}

// Render tasks
function renderTasks() {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const tasksToShow = filteredTasks.slice(startIndex, endIndex);
    
    if (filteredTasks.length === 0) {
        showEmptyState();
        hidePagination();
        return;
    }
    
    hideEmptyState();
    
    const containerClass = currentView === 'grid' ? 'tasks-grid' : 'tasks-list';
    tasksContainer.className = containerClass;
    
    tasksContainer.innerHTML = tasksToShow.map(task => createTaskCard(task)).join('');
    
    // Add event listeners to task cards
    addTaskCardEventListeners();
    
    // Update pagination
    updatePagination();
    
    // Add animations
    setTimeout(() => {
        document.querySelectorAll('.task-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in-up');
            }, index * 50);
        });
    }, 50);
}

// Create task card HTML
function createTaskCard(task) {
    const status = task.getStatus();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const createdDate = new Date(task.createdAt);
    
    return `
        <div class="task-card priority-${task.priority} ${task.completed ? 'completed' : ''}" 
             data-task-id="${task.id}" onclick="openTaskModal('${task.id}')">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <div class="task-badges">
                        <span class="category-badge">${categories[task.category].label}</span>
                        <span class="priority-badge ${task.priority}">${priorities[task.priority].label}</span>
                        <span class="status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </div>
                </div>
            </div>
            
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            
            <div class="task-meta">
                <span><i class="fas fa-calendar-plus"></i> ${formatDate(createdDate)}</span>
                ${dueDate ? `<span><i class="fas fa-calendar-alt"></i> Due: ${formatDate(dueDate)}</span>` : ''}
            </div>
            
            <div class="task-actions" onclick="event.stopPropagation()">
                <button class="task-action-btn complete" onclick="toggleTaskStatus('${task.id}')" 
                        title="${task.completed ? 'Mark as Pending' : 'Mark as Complete'}">
                    <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                </button>
                <button class="task-action-btn edit" onclick="openEditModal('${task.id}')" title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete" onclick="deleteTask('${task.id}')" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Add event listeners to task cards
function addTaskCardEventListeners() {
    document.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Toggle task completion status
function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (task.completed) {
        task.markPending();
        showNotification('Task marked as pending', 'info');
    } else {
        task.markCompleted();
        showNotification('Task completed!', 'success');
    }
    
    saveTasks();
    updateStatistics();
    applyFiltersAndSort();
}

// Delete task
function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        return;
    }
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    
    saveTasks();
    updateStatistics();
    applyFiltersAndSort();
    
    showNotification('Task deleted successfully', 'info');
}

// Open task details modal
function openTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    currentTask = task;
    
    const status = task.getStatus();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const createdDate = new Date(task.createdAt);
    
    // Populate modal
    document.getElementById('modalTaskTitle').textContent = task.title;
    document.getElementById('modalTaskCategory').textContent = categories[task.category].label;
    document.getElementById('modalTaskCategory').className = 'category-badge';
    document.getElementById('modalTaskPriority').textContent = priorities[task.priority].label;
    document.getElementById('modalTaskPriority').className = `priority-badge ${task.priority}`;
    document.getElementById('modalTaskCreated').textContent = formatDateTime(createdDate);
    document.getElementById('modalTaskDue').textContent = dueDate ? formatDateTime(dueDate) : 'No due date';
    document.getElementById('modalTaskStatus').textContent = status.charAt(0).toUpperCase() + status.slice(1);
    document.getElementById('modalTaskStatus').className = `status-badge ${status}`;
    document.getElementById('modalTaskDescription').textContent = task.description || 'No description available.';
    
    // Update action buttons
    const completeBtn = document.getElementById('modalCompleteBtn');
    if (task.completed) {
        completeBtn.innerHTML = '<i class="fas fa-undo"></i> Mark Pending';
        completeBtn.className = 'btn btn-warning';
    } else {
        completeBtn.innerHTML = '<i class="fas fa-check"></i> Complete';
        completeBtn.className = 'btn btn-success';
    }
    
    taskModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close task modal
function closeModal() {
    taskModal.classList.remove('active');
    document.body.style.overflow = '';
    currentTask = null;
}

// Open edit modal
function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    editingTask = task;
    
    // Populate edit form
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description;
    document.getElementById('editTaskCategory').value = task.category;
    document.getElementById('editTaskPriority').value = task.priority;
    
    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        document.getElementById('editTaskDueDate').value = dueDate.toISOString().slice(0, 16);
    }
    
    editModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close edit modal
function closeEditModal() {
    editModal.classList.remove('active');
    document.body.style.overflow = '';
    editingTask = null;
    clearValidationErrors();
}

// Edit task from modal
function editTask() {
    if (!currentTask) return;
    closeModal();
    openEditModal(currentTask.id);
}

// Toggle task status from modal
function toggleTaskStatus() {
    if (!currentTask) return;
    toggleTaskStatus(currentTask.id);
    closeModal();
}

// Delete task from modal
function deleteTaskFromModal() {
    if (!currentTask) return;
    closeModal();
    deleteTask(currentTask.id);
}

// Toggle view (grid/list)
function toggleView(view) {
    currentView = view;
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    renderTasks();
}

// Clear form
function clearForm() {
    taskForm.reset();
    clearValidationErrors();
    
    // Reset to default values
    document.getElementById('taskCategory').value = 'personal';
    document.getElementById('taskPriority').value = 'medium';
}

// Clear all filters
function clearFilters() {
    searchInput.value = '';
    categoryFilter.value = 'all';
    priorityFilter.value = 'all';
    statusFilter.value = 'all';
    sortBy.value = 'created';
    
    applyFiltersAndSort();
    showNotification('Filters cleared', 'info');
}

// Clear all tasks
function clearAllTasks() {
    if (tasks.length === 0) {
        showNotification('No tasks to clear', 'info');
        return;
    }
    
    if (!confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
        return;
    }
    
    tasks = [];
    filteredTasks = [];
    saveTasks();
    updateStatistics();
    renderTasks();
    
    showNotification('All tasks cleared', 'info');
}

// Export tasks
function exportTasks() {
    if (tasks.length === 0) {
        showNotification('No tasks to export', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `tasks_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Tasks exported successfully', 'success');
}

// Import tasks
function importTasks() {
    document.getElementById('importFileInput').click();
}

// Handle file import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json') {
        showNotification('Please select a valid JSON file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedTasks)) {
                throw new Error('Invalid file format');
            }
            
            // Validate tasks structure
            const validTasks = importedTasks.filter(task => 
                task.id && task.title && task.category && task.priority
            );
            
            if (validTasks.length === 0) {
                showNotification('No valid tasks found in file', 'error');
                return;
            }
            
            // Confirm import
            if (!confirm(`Import ${validTasks.length} tasks? This will add to your existing tasks.`)) {
                return;
            }
            
            // Add unique IDs to avoid conflicts
            validTasks.forEach(task => {
                task.id = Date.now() + Math.random().toString(36).substr(2, 9);
            });
            
            tasks = [...tasks, ...validTasks];
            saveTasks();
            updateStatistics();
            applyFiltersAndSort();
            
            showNotification(`Successfully imported ${validTasks.length} tasks`, 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Error importing tasks. Please check file format.', 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Pagination
function changePage(direction) {
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTasks();
        
        // Scroll to top of tasks section
        document.querySelector('.tasks-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    
    if (totalPages <= 1) {
        hidePagination();
        return;
    }
    
    showPagination();
    
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function showPagination() {
    paginationContainer.style.display = 'flex';
}

function hidePagination() {
    paginationContainer.style.display = 'none';
}

// Show/hide empty state
function showEmptyState() {
    emptyState.style.display = 'block';
    tasksContainer.innerHTML = '';
}

function hideEmptyState() {
    emptyState.style.display = 'none';
}

// Update statistics
function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    totalTasksElement.textContent = total;
    pendingTasksElement.textContent = pending;
    completedTasksElement.textContent = completed;
    
    // Animate number changes
    animateNumberChange(totalTasksElement);
    animateNumberChange(pendingTasksElement);
    animateNumberChange(completedTasksElement);
}

// Animate number changes
function animateNumberChange(element) {
    element.style.transform = 'scale(1.1)';
    element.style.color = '#3b82f6';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 200);
}

// Local storage functions
function saveTasks() {
    try {
        localStorage.setItem('taskmaster_tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
        showNotification('Error saving tasks to storage', 'error');
    }
}

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('taskmaster_tasks');
        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);
            tasks = parsedTasks.map(taskData => {
                const task = Object.assign(new Task(), taskData);
                return task;
            });
        }
        filteredTasks = [...tasks];
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Error loading tasks from storage', 'error');
        tasks = [];
        filteredTasks = [];
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notificationContainer.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notificationContainer.removeChild(notification);
            }
        }, 300);
    });
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        case 'info': 
        default: return 'fas fa-info-circle';
    }
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + N: New task (focus on title input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        document.getElementById('taskTitle').focus();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        if (taskModal.classList.contains('active')) {
            closeModal();
        }
        if (editModal.classList.contains('active')) {
            closeEditModal();
        }
    }
    
    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Ctrl/Cmd + E: Export tasks
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportTasks();
    }
}

// Initialize theme
function initializeTheme() {
    // Apply dark theme variables
    document.documentElement.style.setProperty('--primary-color', '#3b82f6');
    document.documentElement.style.setProperty('--secondary-color', '#8b5cf6');
    document.documentElement.style.setProperty('--success-color', '#22c55e');
    document.documentElement.style.setProperty('--warning-color', '#f59e0b');
    document.documentElement.style.setProperty('--error-color', '#ef4444');
    document.documentElement.style.setProperty('--info-color', '#0ea5e9');
}

// Performance optimization
function optimizePerformance() {
    // Implement virtual scrolling for large task lists
    if (tasks.length > 100) {
        tasksPerPage = 20;
    } else if (tasks.length > 50) {
        tasksPerPage = 15;
    } else {
        tasksPerPage = 12;
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('An unexpected error occurred. Please try again.', 'error');
});

// Auto-save on page unload
window.addEventListener('beforeunload', function(e) {
    saveTasks();
});

// Initialize theme and performance optimizations
initializeTheme();
optimizePerformance();

// Analytics tracking (placeholder for future integration)
function trackEvent(eventName, eventData) {
    console.log(`Analytics: ${eventName}`, eventData);
    // Future: Integrate with analytics service
}

// Track task creation
function trackTaskCreation(task) {
    trackEvent('task_created', {
        category: task.category,
        priority: task.priority,
        hasDueDate: !!task.dueDate
    });
}

// Track task completion
function trackTaskCompletion(task) {
    trackEvent('task_completed', {
        category: task.category,
        priority: task.priority,
        timeToComplete: task.completedAt ? new Date(task.completedAt) - new Date(task.createdAt) : null
    });
}

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Future: Register service worker for offline functionality
        console.log('Service worker support detected');
    });
}

// Data validation and sanitization
function sanitizeTaskData(data) {
    return {
        title: data.title.trim().substring(0, 100),
        description: data.description.trim().substring(0, 500),
        category: Object.keys(categories).includes(data.category) ? data.category : 'other',
        priority: Object.keys(priorities).includes(data.priority) ? data.priority : 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
    };
}

// Backup and restore functionality
function createBackup() {
    const backup = {
        tasks: tasks,
        version: '1.0',
        exportDate: new Date().toISOString(),
        totalTasks: tasks.length
    };
    
    return JSON.stringify(backup, null, 2);
}

function restoreFromBackup(backupData) {
    try {
        const backup = JSON.parse(backupData);
        
        if (backup.version && backup.tasks && Array.isArray(backup.tasks)) {
            tasks = backup.tasks;
            saveTasks();
            updateStatistics();
            applyFiltersAndSort();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Backup restore error:', error);
        return false;
    }
}
