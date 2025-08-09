// Master Panel Application
var MasterApp = {
    // Admin credentials
    adminCredentials: {
        username: 'admin',
        password: 'narain1010@'
    },
    
    // Application state
    isAuthenticated: false,
    currentEditingUser: null,
    users: [],
    
    // Initialize the application
    init: function() {
        console.log('Initializing Master Panel...');
        
        // Check if already authenticated
        if (sessionStorage.getItem('master_authenticated') === 'true') {
            this.isAuthenticated = true;
            this.showDashboard();
        } else {
            this.showLogin();
        }
        
        this.loadUsers();
        this.setupEventListeners();
        this.setupTheme();
        
        // Initialize feather icons
        if (window.feather) {
            feather.replace();
        }
        
        console.log('Master Panel initialized successfully');
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        var self = this;
        
        // Admin login form
        var loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                self.handleAdminLogin();
            });
        }
        
        // Master logout
        var logoutBtn = document.getElementById('master-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                self.logout();
            });
        }
        
        // Theme toggle
        var themeToggle = document.getElementById('theme-toggle-master');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                self.toggleTheme();
            });
        }
        
        // Add user button
        var addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', function() {
                self.showUserModal();
            });
        }
        
        // User form
        var userForm = document.getElementById('user-form');
        if (userForm) {
            userForm.addEventListener('submit', function(e) {
                e.preventDefault();
                self.saveUser();
            });
        }
        
        // Modal close buttons
        var closeModal = document.getElementById('close-modal');
        var cancelUser = document.getElementById('cancel-user');
        if (closeModal) closeModal.addEventListener('click', function() { self.hideUserModal(); });
        if (cancelUser) cancelUser.addEventListener('click', function() { self.hideUserModal(); });
        
        // Delete modal
        var closeDeleteModal = document.getElementById('close-delete-modal');
        var cancelDelete = document.getElementById('cancel-delete');
        var confirmDelete = document.getElementById('confirm-delete');
        if (closeDeleteModal) closeDeleteModal.addEventListener('click', function() { self.hideDeleteModal(); });
        if (cancelDelete) cancelDelete.addEventListener('click', function() { self.hideDeleteModal(); });
        if (confirmDelete) confirmDelete.addEventListener('click', function() { self.deleteUser(); });
        
        // Modal overlay clicks
        var modals = document.querySelectorAll('.modal');
        modals.forEach(function(modal) {
            modal.addEventListener('click', function(e) {
                if (e.target.classList.contains('modal-overlay')) {
                    modal.classList.add('hidden');
                }
            });
        });
    },
    
    // Handle admin login
    handleAdminLogin: function() {
        var username = document.getElementById('admin-username').value.trim();
        var password = document.getElementById('admin-password').value;
        var errorDiv = document.getElementById('admin-login-error');
        
        if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
            this.isAuthenticated = true;
            sessionStorage.setItem('master_authenticated', 'true');
            this.showDashboard();
            errorDiv.classList.add('hidden');
        } else {
            errorDiv.textContent = 'Invalid admin credentials. Please try again.';
            errorDiv.classList.remove('hidden');
            
            // Clear password field
            document.getElementById('admin-password').value = '';
        }
    },
    
    // Show login screen
    showLogin: function() {
        document.getElementById('admin-login-screen').classList.remove('hidden');
        document.getElementById('master-dashboard').classList.add('hidden');
    },
    
    // Show dashboard
    showDashboard: function() {
        document.getElementById('admin-login-screen').classList.add('hidden');
        document.getElementById('master-dashboard').classList.remove('hidden');
        this.renderUsersTable();
    },
    
    // Logout
    logout: function() {
        this.isAuthenticated = false;
        sessionStorage.removeItem('master_authenticated');
        this.showLogin();
        
        // Clear login form
        document.getElementById('admin-username').value = '';
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-login-error').classList.add('hidden');
    },
    
    // Load users from localStorage
    loadUsers: function() {
        try {
            var savedUsers = localStorage.getItem('codex_users');
            if (savedUsers) {
                this.users = JSON.parse(savedUsers);
            } else {
                this.users = [];
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = [];
        }
    },
    
    // Save users to localStorage
    saveUsers: function() {
        try {
            localStorage.setItem('codex_users', JSON.stringify(this.users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    },
    
    // Render users table
    renderUsersTable: function() {
        var tbody = document.getElementById('users-table-body');
        var noUsers = document.getElementById('no-users');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (this.users.length === 0) {
            noUsers.classList.remove('hidden');
            document.querySelector('.users-table-container').style.display = 'none';
        } else {
            noUsers.classList.add('hidden');
            document.querySelector('.users-table-container').style.display = 'block';
            
            this.users.forEach(function(user, index) {
                var row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.username}</td>
                    <td><span class="password-field">${user.password}</span></td>
                    <td>${user.created ? new Date(user.created).toLocaleDateString() : 'N/A'}</td>
                    <td>
                        <div class="user-actions">
                            <button class="btn-icon edit" onclick="MasterApp.editUser(${index})" title="Edit User">
                                <i data-feather="edit-2"></i>
                            </button>
                            <button class="btn-icon delete" onclick="MasterApp.confirmDeleteUser(${index})" title="Delete User">
                                <i data-feather="trash-2"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // Re-initialize feather icons
            if (window.feather) {
                feather.replace();
            }
        }
    },
    
    // Show user modal
    showUserModal: function(user, index) {
        var modal = document.getElementById('user-modal');
        var title = document.getElementById('modal-title');
        var form = document.getElementById('user-form');
        
        if (user) {
            title.textContent = 'Edit User';
            document.getElementById('user-name').value = user.name || '';
            document.getElementById('user-username').value = user.username || '';
            document.getElementById('user-password').value = user.password || '';
            this.currentEditingUser = index;
        } else {
            title.textContent = 'Add New User';
            form.reset();
            this.currentEditingUser = null;
        }
        
        modal.classList.remove('hidden');
        document.getElementById('user-name').focus();
    },
    
    // Hide user modal
    hideUserModal: function() {
        var modal = document.getElementById('user-modal');
        modal.classList.add('hidden');
        this.currentEditingUser = null;
    },
    
    // Save user
    saveUser: function() {
        var name = document.getElementById('user-name').value.trim();
        var username = document.getElementById('user-username').value.trim();
        var password = document.getElementById('user-password').value.trim();
        
        if (!name || !username || !password) {
            alert('Please fill in all fields.');
            return;
        }
        
        // Check for duplicate username (except when editing the same user)
        var existingUserIndex = this.users.findIndex(function(user) {
            return user.username === username;
        });
        
        if (existingUserIndex !== -1 && existingUserIndex !== this.currentEditingUser) {
            alert('Username already exists. Please choose a different username.');
            return;
        }
        
        var userData = {
            name: name,
            username: username,
            password: password,
            created: this.currentEditingUser !== null ? this.users[this.currentEditingUser].created : new Date().toISOString()
        };
        
        if (this.currentEditingUser !== null) {
            // Update existing user
            this.users[this.currentEditingUser] = userData;
        } else {
            // Add new user
            this.users.push(userData);
        }
        
        this.saveUsers();
        this.renderUsersTable();
        this.hideUserModal();
        
        // Show success message
        this.showMessage('User saved successfully!', 'success');
    },
    
    // Edit user
    editUser: function(index) {
        if (index >= 0 && index < this.users.length) {
            this.showUserModal(this.users[index], index);
        }
    },
    
    // Confirm delete user
    confirmDeleteUser: function(index) {
        if (index >= 0 && index < this.users.length) {
            var user = this.users[index];
            document.getElementById('delete-user-name').textContent = user.name + ' (' + user.username + ')';
            this.currentEditingUser = index;
            document.getElementById('delete-modal').classList.remove('hidden');
        }
    },
    
    // Delete user
    deleteUser: function() {
        if (this.currentEditingUser !== null && this.currentEditingUser >= 0 && this.currentEditingUser < this.users.length) {
            this.users.splice(this.currentEditingUser, 1);
            this.saveUsers();
            this.renderUsersTable();
            this.hideDeleteModal();
            this.showMessage('User deleted successfully!', 'success');
        }
    },
    
    // Hide delete modal
    hideDeleteModal: function() {
        document.getElementById('delete-modal').classList.add('hidden');
        this.currentEditingUser = null;
    },
    
    // Setup theme
    setupTheme: function() {
        var savedTheme = localStorage.getItem('codex_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon();
    },
    
    // Toggle theme
    toggleTheme: function() {
        var currentTheme = document.documentElement.getAttribute('data-theme');
        var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('codex_theme', newTheme);
        this.updateThemeIcon();
    },
    
    // Update theme icon
    updateThemeIcon: function() {
        var themeToggle = document.getElementById('theme-toggle-master');
        if (themeToggle) {
            var icon = themeToggle.querySelector('i');
            var currentTheme = document.documentElement.getAttribute('data-theme');
            
            if (icon) {
                icon.setAttribute('data-feather', currentTheme === 'dark' ? 'sun' : 'moon');
                if (window.feather) {
                    feather.replace();
                }
            }
        }
    },
    
    // Show message
    showMessage: function(message, type) {
        // Create message element
        var messageDiv = document.createElement('div');
        messageDiv.className = (type === 'success' ? 'success-message' : 'error-message');
        messageDiv.textContent = message;
        
        // Insert at top of main content
        var mainContent = document.querySelector('.master-main');
        if (mainContent) {
            mainContent.insertBefore(messageDiv, mainContent.firstChild);
            
            // Auto-remove after 3 seconds
            setTimeout(function() {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 3000);
        }
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    MasterApp.init();
});

// Make MasterApp available globally for inline event handlers
window.MasterApp = MasterApp;