// Simple Codex Application - Pure HTML/CSS/JS
var CodexApp = {
    storage: {
        documents: [],
        collections: [],
        isInitialized: false
    },
    
    currentView: 'home',
    currentDocument: null,
    isAuthenticated: false,
    
    // User credentials - change these to your preferred login
    credentials: {
        username: 'narain1010',
        password: 'narain1010@'
    },
    
    // Available fonts
    fonts: [
        { name: 'Inter', family: 'Inter, sans-serif', label: 'Inter (Default)' },
        { name: 'Roboto', family: 'Roboto, sans-serif', label: 'Roboto' },
        { name: 'Open Sans', family: '"Open Sans", sans-serif', label: 'Open Sans' },
        { name: 'Lato', family: 'Lato, sans-serif', label: 'Lato' },
        { name: 'Source Sans Pro', family: '"Source Sans Pro", sans-serif', label: 'Source Sans Pro' },
        { name: 'Poppins', family: 'Poppins, sans-serif', label: 'Poppins' },
        { name: 'Montserrat', family: 'Montserrat, sans-serif', label: 'Montserrat' }
    ],
    
    // Initialize the application
    init: function() {
        console.log('Initializing Codex app...');
        
        // Check authentication first
        if (!this.checkAuthentication()) {
            this.showLogin();
            return;
        }
        
        this.loadData();
        this.setupEventListeners();
        this.setupTheme();
        this.initFont();
        this.hideLoading();
        this.showHome();
        this.renderSidebar();
        
        // Initialize feather icons
        if (window.feather) {
            feather.replace();
        }
        
        console.log('Codex app initialized successfully');
    },
    
    // Load data from localStorage or create default
    loadData: function() {
        try {
            var savedDocs = localStorage.getItem('codex_documents');
            var savedCols = localStorage.getItem('codex_collections');
            
            if (savedDocs) {
                this.storage.documents = JSON.parse(savedDocs);
            }
            
            if (savedCols) {
                this.storage.collections = JSON.parse(savedCols);
            }
            
            // Create default data if none exists
            if (this.storage.documents.length === 0) {
                this.createDefaultData();
            }
            
            this.storage.isInitialized = true;
        } catch (error) {
            console.error('Failed to load data:', error);
            this.createDefaultData();
        }
    },
    
    // Save data to localStorage
    saveData: function() {
        try {
            localStorage.setItem('codex_documents', JSON.stringify(this.storage.documents));
            localStorage.setItem('codex_collections', JSON.stringify(this.storage.collections));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    },
    
    // Create default data
    createDefaultData: function() {
        var now = new Date().toISOString();
        
        // Default collection
        var defaultCollection = {
            id: 'getting-started',
            name: 'Getting Started',
            description: 'Essential documents to get you started',
            color: '#0066cc',
            createdAt: now,
            updatedAt: now,
            documentCount: 2
        };
        
        this.storage.collections = [defaultCollection];
        
        // Default documents
        var welcomeDoc = {
            id: 'welcome',
            title: 'Welcome to Codex',
            content: this.getWelcomeContent(),
            excerpt: 'Welcome to your team\'s knowledge base.',
            collectionId: 'getting-started',
            tags: ['welcome', 'introduction'],
            author: 'System',
            createdAt: now,
            updatedAt: now,
            isPublic: false,
            views: 0
        };
        
        var guideDoc = {
            id: 'guide',
            title: 'Getting Started Guide',
            content: this.getGuideContent(),
            excerpt: 'Learn how to use Outline effectively.',
            collectionId: 'getting-started',
            tags: ['guide', 'help'],
            author: 'System',
            createdAt: now,
            updatedAt: now,
            isPublic: false,
            views: 0
        };
        
        this.storage.documents = [welcomeDoc, guideDoc];
        this.saveData();
    },
    
    // Get welcome content
    getWelcomeContent: function() {
        return '# Welcome to Codex\n\n' +
               'Your team\'s knowledge base is ready!\n\n' +
               '## What is Codex?\n\n' +
               'Codex is a modern team knowledge base that makes it easy to create, organize, and share your team\'s documentation.\n\n' +
               '## Key Features\n\n' +
               '- **Beautiful Editor**: Write with a clean, distraction-free editor\n' +
               '- **Team Collaboration**: Share documents with your team\n' +
               '- **Powerful Search**: Find what you need instantly\n' +
               '- **Collections**: Organize documents into logical collections\n\n' +
               '## Getting Started\n\n' +
               '1. **Create your first document** - Click the "New Document" button\n' +
               '2. **Organize with collections** - Group related documents together\n' +
               '3. **Search everything** - Use the search bar to find documents\n\n' +
               'Ready to build your knowledge base? Let\'s get started!';
    },
    
    // Get guide content  
    getGuideContent: function() {
        return '# Getting Started Guide\n\n' +
               'This guide will help you get up and running with Codex quickly.\n\n' +
               '## Creating Documents\n\n' +
               'Click the "New Document" button to create a new document. You can write in Markdown format for rich formatting.\n\n' +
               '## Organizing Content\n\n' +
               '- Use clear titles for your documents\n' +
               '- Add tags for easy discovery\n' +
               '- Place documents in appropriate collections\n\n' +
               '## Searching\n\n' +
               'Use the search bar in the header to quickly find any document. Search works across titles, content, and tags.\n\n' +
               '## Tips\n\n' +
               '- Keep documents focused and well-organized\n' +
               '- Use consistent naming conventions\n' +
               '- Review and update documents regularly';
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        var self = this;
        
        // Theme toggle
        document.getElementById('theme-toggle').onclick = function() {
            self.toggleTheme();
        };
        
        // Font selector
        var fontSelector = document.getElementById('font-selector');
        if (fontSelector) {
            fontSelector.onclick = function() {
                self.showFontSelector();
            };
        }
        
        // New document button
        document.getElementById('new-document').onclick = function() {
            self.showEditor(null);
        };
        
        // Sidebar toggle for mobile
        document.getElementById('sidebar-toggle').onclick = function() {
            var sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('open');
        };
        
        // Search functionality
        var searchInput = document.getElementById('global-search');
        searchInput.oninput = function() {
            self.handleSearch(this.value);
        };
        
        // Close search when clicking outside
        document.onclick = function(e) {
            if (!e.target.closest('.search-container')) {
                self.hideSearchResults();
            }
        };
        
        // Additional buttons
        var createFirstDoc = document.getElementById('create-first-doc');
        if (createFirstDoc) {
            createFirstDoc.onclick = function() {
                self.showEditor(null);
            };
        }
        
        var quickNewDoc = document.getElementById('quick-new-doc');
        if (quickNewDoc) {
            quickNewDoc.onclick = function() {
                self.showEditor(null);
            };
        }
        
        var quickNewCollection = document.getElementById('quick-new-collection');
        if (quickNewCollection) {
            quickNewCollection.onclick = function() {
                self.createNewCollection();
            };
        }
        
        var quickSearch = document.getElementById('quick-search');
        if (quickSearch) {
            quickSearch.onclick = function() {
                document.getElementById('global-search').focus();
            };
        }
        
        var newCollection = document.getElementById('new-collection');
        if (newCollection) {
            newCollection.onclick = function() {
                self.createNewCollection();
            };
        }
        
        var editDocument = document.getElementById('edit-document');
        if (editDocument) {
            editDocument.onclick = function() {
                if (self.currentDocument) {
                    self.showEditor(self.currentDocument.id);
                }
            };
        }
        
        var shareDocument = document.getElementById('share-document');
        if (shareDocument) {
            shareDocument.onclick = function() {
                if (self.currentDocument) {
                    self.shareDocument();
                }
            };
        }
        
        var deleteDocument = document.getElementById('delete-document');
        if (deleteDocument) {
            deleteDocument.onclick = function() {
                if (self.currentDocument) {
                    self.deleteDocument(self.currentDocument.id);
                }
            };
        }
        
        // Logout button
        var logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = function() {
                self.logout();
            };
        }
    },
    
    // Setup theme
    setupTheme: function() {
        var savedTheme = localStorage.getItem('codex_theme') || 'light';
        this.setTheme(savedTheme);
    },
    
    // Set theme
    setTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('codex_theme', theme);
        
        var themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.setAttribute('data-feather', theme === 'dark' ? 'sun' : 'moon');
            if (window.feather) feather.replace();
        }
    },
    
    // Toggle theme
    toggleTheme: function() {
        var currentTheme = document.documentElement.getAttribute('data-theme');
        this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    },
    
    // Hide loading screen
    hideLoading: function() {
        var loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    },
    
    // Show font selector modal
    showFontSelector: function() {
        var self = this;
        var app = document.getElementById('app');
        
        // Create modal HTML
        var modalHTML = '<div class="modal-overlay font-modal-overlay">' +
            '<div class="modal font-modal">' +
                '<div class="modal-header">' +
                    '<h3>Choose Font</h3>' +
                    '<button class="modal-close" onclick="CodexApp.closeFontModal()">&times;</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<div class="font-options">';
        
        // Add font options
        var currentFont = localStorage.getItem('codex_font') || 'Inter';
        for (var i = 0; i < this.fonts.length; i++) {
            var font = this.fonts[i];
            var isSelected = font.name === currentFont ? ' selected' : '';
            modalHTML += '<div class="font-option' + isSelected + '" data-font="' + font.name + '" data-family="' + font.family + '">' +
                '<span class="font-preview" style="font-family: ' + font.family + '">Sample Text</span>' +
                '<span class="font-label">' + font.label + '</span>' +
            '</div>';
        }
        
        modalHTML += '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
        
        // Add to page
        app.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners to font options
        var fontOptions = document.querySelectorAll('.font-option');
        for (var i = 0; i < fontOptions.length; i++) {
            fontOptions[i].onclick = function() {
                var fontName = this.getAttribute('data-font');
                var fontFamily = this.getAttribute('data-family');
                self.changeFont(fontName, fontFamily);
                self.closeFontModal();
            };
        }
    },
    
    // Close font selector modal
    closeFontModal: function() {
        var modal = document.querySelector('.font-modal-overlay');
        if (modal) {
            modal.remove();
        }
    },
    
    // Change application font
    changeFont: function(fontName, fontFamily) {
        document.body.style.fontFamily = fontFamily;
        localStorage.setItem('codex_font', fontName);
        localStorage.setItem('codex_font_family', fontFamily);
    },
    
    // Initialize font from storage
    initFont: function() {
        var savedFont = localStorage.getItem('codex_font_family');
        if (savedFont) {
            document.body.style.fontFamily = savedFont;
        }
    },
    
    // Check authentication
    checkAuthentication: function() {
        var isLoggedIn = localStorage.getItem('codex_authenticated');
        this.isAuthenticated = isLoggedIn === 'true';
        return this.isAuthenticated;
    },
    
    // Show login page
    showLogin: function() {
        this.hideLoading();
        var app = document.getElementById('app');
        app.innerHTML = `
            <div class="login-container">
                <div class="login-box">
                    <div class="login-header">
                        <div class="logo">
                            <span class="logo-icon">📚</span>
                            <span class="logo-text">Codex</span>
                        </div>
                        <h2>Welcome Back</h2>
                        <p>Sign in to access your knowledge base</p>
                    </div>
                    
                    <form id="login-form" class="login-form">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" required 
                                   placeholder="Enter your username" autocomplete="username">
                        </div>
                        
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" required 
                                   placeholder="Enter your password" autocomplete="current-password">
                        </div>
                        
                        <div id="login-error" class="login-error hidden"></div>
                        
                        <button type="submit" class="btn btn-primary btn-large">
                            Sign In
                        </button>
                    </form>
                    
                    <div class="auth-switch">
                        <p>Don't have an account? <a href="#" id="show-register">Create Account</a></p>
                    </div>
                    
                    <div class="login-footer">
                        <p>Team Knowledge Base • Secure Access</p>
                    </div>
                </div>
            </div>
        `;
        
        this.setupLoginEvents();
    },
    
    // Show register page
    showRegister: function() {
        var app = document.getElementById('app');
        app.innerHTML = `
            <div class="login-container">
                <div class="login-box">
                    <div class="login-header">
                        <div class="logo">
                            <span class="logo-icon">📚</span>
                            <span class="logo-text">Codex</span>
                        </div>
                        <h2>Create Account</h2>
                        <p>Join your team's knowledge base</p>
                    </div>
                    
                    <form id="register-form" class="login-form">
                        <div class="form-group">
                            <label for="reg-name">Full Name</label>
                            <input type="text" id="reg-name" name="name" required 
                                   placeholder="Enter your full name" autocomplete="name">
                        </div>
                        
                        <div class="form-group">
                            <label for="reg-username">Username</label>
                            <input type="text" id="reg-username" name="username" required 
                                   placeholder="Choose a username" autocomplete="username">
                        </div>
                        
                        <div class="form-group">
                            <label for="reg-password">Password</label>
                            <input type="password" id="reg-password" name="password" required 
                                   placeholder="Create a password" autocomplete="new-password">
                        </div>
                        
                        <div id="register-error" class="login-error hidden"></div>
                        
                        <button type="submit" class="btn btn-primary btn-large">
                            Create Account
                        </button>
                    </form>
                    
                    <div class="auth-switch">
                        <p>Already have an account? <a href="#" id="show-login">Sign In</a></p>
                    </div>
                    
                    <div class="login-footer">
                        <p>Team Knowledge Base • Secure Access</p>
                    </div>
                </div>
            </div>
        `;
        
        this.setupRegisterEvents();
    },
    
    // Setup login event handlers
    setupLoginEvents: function() {
        var self = this;
        var loginForm = document.getElementById('login-form');
        
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            
            var username = document.getElementById('username').value.trim();
            var password = document.getElementById('password').value;
            var errorDiv = document.getElementById('login-error');
            
            // Check against default credentials or registered users
            var isValidUser = false;
            var currentUser = null;
            
            // Check default credentials
            if (username === self.credentials.username && password === self.credentials.password) {
                isValidUser = true;
                currentUser = { name: 'Admin User', username: username };
            } else {
                // Check registered users
                var users = JSON.parse(localStorage.getItem('codex_users') || '[]');
                var foundUser = users.find(function(user) {
                    return user.username === username && user.password === password;
                });
                
                if (foundUser) {
                    isValidUser = true;
                    currentUser = foundUser;
                }
            }
            
            if (isValidUser) {
                // Successful login
                localStorage.setItem('codex_authenticated', 'true');
                localStorage.setItem('codex_current_user', JSON.stringify(currentUser));
                self.isAuthenticated = true;
                
                // Reload the main application
                location.reload();
            } else {
                // Failed login
                errorDiv.textContent = 'Invalid username or password';
                errorDiv.classList.remove('hidden');
                
                // Clear password field
                document.getElementById('password').value = '';
                document.getElementById('password').focus();
            }
        };
        
        // Focus username field
        document.getElementById('username').focus();
        
        // Handle register link
        var showRegisterLink = document.getElementById('show-register');
        if (showRegisterLink) {
            showRegisterLink.onclick = function(e) {
                e.preventDefault();
                self.showRegister();
            };
        }
    },
    
    // Setup register event handlers
    setupRegisterEvents: function() {
        var self = this;
        var registerForm = document.getElementById('register-form');
        
        registerForm.onsubmit = function(e) {
            e.preventDefault();
            
            var name = document.getElementById('reg-name').value.trim();
            var username = document.getElementById('reg-username').value.trim();
            var password = document.getElementById('reg-password').value;
            var errorDiv = document.getElementById('register-error');
            
            // Basic validation
            if (!name || !username || !password) {
                errorDiv.textContent = 'All fields are required';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            if (username.length < 3) {
                errorDiv.textContent = 'Username must be at least 3 characters';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            if (password.length < 6) {
                errorDiv.textContent = 'Password must be at least 6 characters';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            // Check if username already exists (simple check against current credentials)
            if (username === self.credentials.username) {
                errorDiv.textContent = 'Username already exists';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            // Store new user data
            var userData = {
                name: name,
                username: username,
                password: password,
                createdAt: new Date().toISOString()
            };
            
            // Save to localStorage (in a real app, this would go to a backend)
            var users = JSON.parse(localStorage.getItem('codex_users') || '[]');
            users.push(userData);
            localStorage.setItem('codex_users', JSON.stringify(users));
            
            // Update credentials to allow login with new account
            self.credentials.username = username;
            self.credentials.password = password;
            
            // Auto-login the new user
            localStorage.setItem('codex_authenticated', 'true');
            localStorage.setItem('codex_current_user', JSON.stringify(userData));
            self.isAuthenticated = true;
            
            // Show success and reload
            alert('Account created successfully! Welcome to Codex, ' + name + '!');
            location.reload();
        };
        
        // Focus name field
        document.getElementById('reg-name').focus();
        
        // Handle login link
        var showLoginLink = document.getElementById('show-login');
        if (showLoginLink) {
            showLoginLink.onclick = function(e) {
                e.preventDefault();
                self.showLogin();
            };
        }
    },
    
    // Logout function
    logout: function() {
        if (confirm('Are you sure you want to sign out?')) {
            localStorage.removeItem('codex_authenticated');
            this.isAuthenticated = false;
            location.reload();
        }
    },
    

    
    // Show home view
    showHome: function() {
        this.currentView = 'home';
        this.hideAllViews();
        document.getElementById('home-view').classList.add('active');
        this.renderHomeContent();
    },
    
    // Show document view
    showDocument: function(docId) {
        var doc = this.getDocument(docId);
        if (!doc) return;
        
        this.currentView = 'document';
        this.currentDocument = doc;
        this.hideAllViews();
        document.getElementById('document-view').classList.add('active');
        this.renderDocumentContent(doc);
        
        // Increment view count
        doc.views = (doc.views || 0) + 1;
        this.saveData();
    },
    
    // Show editor
    showEditor: function(docId) {
        this.currentView = 'editor';
        this.hideAllViews();
        document.getElementById('editor-view').classList.add('active');
        this.setupEditor(docId);
    },
    
    // Hide all views
    hideAllViews: function() {
        var views = document.querySelectorAll('.view');
        for (var i = 0; i < views.length; i++) {
            views[i].classList.remove('active');
        }
    },
    
    // Render home content
    renderHomeContent: function() {
        var recentDocs = this.getRecentDocuments(6);
        var recentActivity = document.getElementById('recent-activity');
        
        if (recentDocs.length === 0) {
            recentActivity.innerHTML = 
                '<div class="empty-state">' +
                '<div class="empty-state-icon"><i data-feather="file-text"></i></div>' +
                '<div class="empty-state-title">No documents yet</div>' +
                '<div class="empty-state-message">Create your first document to get started</div>' +
                '<button class="btn btn-primary" onclick="CodexApp.showEditor(null)">' +
                '<i data-feather="plus"></i> Create Document</button>' +
                '</div>';
        } else {
            var html = '';
            for (var i = 0; i < recentDocs.length; i++) {
                html += this.createDocumentCard(recentDocs[i]);
            }
            recentActivity.innerHTML = html;
        }
        
        if (window.feather) feather.replace();
    },
    
    // Create document card HTML
    createDocumentCard: function(doc) {
        var collection = this.getCollection(doc.collectionId);
        var collectionName = collection ? collection.name : 'Uncategorized';
        
        return '<div class="document-card" onclick="CodexApp.showDocument(\'' + doc.id + '\')">' +
               '<div class="document-card-header">' +
               '<i data-feather="file-text" class="document-card-icon"></i>' +
               '</div>' +
               '<div class="document-card-title">' + this.escapeHtml(doc.title) + '</div>' +
               '<div class="document-card-excerpt">' + this.escapeHtml(doc.excerpt || '') + '</div>' +
               '<div class="document-card-meta">' +
               '<span class="document-collection">' + this.escapeHtml(collectionName) + '</span>' +
               '<span class="document-date">' + this.formatDate(doc.updatedAt) + '</span>' +
               '</div>' +
               '</div>';
    },
    
    // Render document content
    renderDocumentContent: function(doc) {
        var breadcrumb = document.getElementById('breadcrumb-path');
        var content = document.getElementById('document-content');
        
        var collection = this.getCollection(doc.collectionId);
        var collectionName = collection ? collection.name : 'Uncategorized';
        breadcrumb.textContent = collectionName + ' / ' + doc.title;
        
        // Simple markdown rendering
        content.innerHTML = this.renderMarkdown(doc.content);
    },
    
    // Setup editor
    setupEditor: function(docId) {
        var doc = docId ? this.getDocument(docId) : null;
        var titleInput = document.getElementById('document-title');
        var contentArea = document.getElementById('markdown-editor');
        var saveBtn = document.getElementById('save-document');
        var cancelBtn = document.getElementById('cancel-edit');
        
        if (doc) {
            titleInput.value = doc.title;
            contentArea.value = doc.content;
        } else {
            titleInput.value = '';
            contentArea.value = '';
        }
        
        // Save button
        saveBtn.onclick = function() {
            CodexApp.saveDocument(docId);
        };
        
        // Cancel button
        cancelBtn.onclick = function() {
            CodexApp.showHome();
        };
        
        titleInput.focus();
    },
    
    // Save document
    saveDocument: function(docId) {
        var title = document.getElementById('document-title').value.trim();
        var content = document.getElementById('markdown-editor').value.trim();
        
        if (!title) {
            alert('Please enter a document title');
            return;
        }
        
        var now = new Date().toISOString();
        
        if (docId) {
            // Update existing document
            var doc = this.getDocument(docId);
            if (doc) {
                doc.title = title;
                doc.content = content;
                doc.excerpt = this.generateExcerpt(content);
                doc.updatedAt = now;
            }
        } else {
            // Create new document
            var newDoc = {
                id: 'doc_' + Date.now(),
                title: title,
                content: content,
                excerpt: this.generateExcerpt(content),
                collectionId: 'getting-started',
                tags: [],
                author: 'User',
                createdAt: now,
                updatedAt: now,
                isPublic: false,
                views: 0
            };
            this.storage.documents.push(newDoc);
        }
        
        this.saveData();
        this.showHome();
        this.renderSidebar();
    },
    
    // Render sidebar
    renderSidebar: function() {
        this.renderCollections();
        this.renderRecentDocuments();
    },
    
    // Render collections
    renderCollections: function() {
        var collectionsList = document.getElementById('collections-list');
        var collections = this.storage.collections;
        
        if (collections.length === 0) {
            collectionsList.innerHTML = '<div class="empty-collections">No collections yet</div>';
        } else {
            var html = '';
            for (var i = 0; i < collections.length; i++) {
                var col = collections[i];
                html += '<div class="collection-item">' +
                       '<i data-feather="folder" class="collection-icon"></i>' +
                       '<span class="collection-name">' + this.escapeHtml(col.name) + '</span>' +
                       '<span class="collection-count">' + (col.documentCount || 0) + '</span>' +
                       '</div>';
            }
            collectionsList.innerHTML = html;
        }
        
        if (window.feather) feather.replace();
    },
    
    // Render recent documents
    renderRecentDocuments: function() {
        var recentDocs = this.getRecentDocuments(5);
        var recentDocuments = document.getElementById('recent-documents');
        
        if (recentDocs.length === 0) {
            recentDocuments.innerHTML = '<div class="empty-recent">No recent documents</div>';
        } else {
            var html = '';
            for (var i = 0; i < recentDocs.length; i++) {
                var doc = recentDocs[i];
                html += '<div class="recent-document" onclick="CodexApp.showDocument(\'' + doc.id + '\')">' +
                       '<i data-feather="file-text" class="recent-document-icon"></i>' +
                       '<div class="recent-document-info">' +
                       '<div class="recent-document-title">' + this.escapeHtml(doc.title) + '</div>' +
                       '<div class="recent-document-meta">' + this.getRelativeTime(doc.updatedAt) + '</div>' +
                       '</div>' +
                       '</div>';
            }
            recentDocuments.innerHTML = html;
        }
        
        if (window.feather) feather.replace();
    },
    
    // Search functionality
    handleSearch: function(query) {
        if (!query.trim()) {
            this.hideSearchResults();
            return;
        }
        
        var results = this.searchDocuments(query);
        this.showSearchResults(results, query);
    },
    
    // Search documents
    searchDocuments: function(query) {
        var results = [];
        var searchTerm = query.toLowerCase();
        
        for (var i = 0; i < this.storage.documents.length; i++) {
            var doc = this.storage.documents[i];
            var score = 0;
            
            if (doc.title.toLowerCase().indexOf(searchTerm) !== -1) score += 10;
            if (doc.content.toLowerCase().indexOf(searchTerm) !== -1) score += 5;
            
            if (score > 0) {
                results.push({
                    document: doc,
                    score: score
                });
            }
        }
        
        results.sort(function(a, b) { return b.score - a.score; });
        return results.slice(0, 10);
    },
    
    // Show search results
    showSearchResults: function(results, query) {
        var searchResults = document.getElementById('search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No results found for "' + this.escapeHtml(query) + '"</div>';
        } else {
            var html = '';
            for (var i = 0; i < results.length; i++) {
                var doc = results[i].document;
                html += '<div class="search-result-item" onclick="CodexApp.showDocument(\'' + doc.id + '\'); CodexApp.hideSearchResults();">' +
                       '<div class="search-result-title">' + this.escapeHtml(doc.title) + '</div>' +
                       '<div class="search-result-excerpt">' + this.escapeHtml(doc.excerpt || '') + '</div>' +
                       '</div>';
            }
            searchResults.innerHTML = html;
        }
        
        searchResults.classList.remove('hidden');
    },
    
    // Hide search results
    hideSearchResults: function() {
        document.getElementById('search-results').classList.add('hidden');
    },
    
    // Utility functions
    getDocument: function(id) {
        for (var i = 0; i < this.storage.documents.length; i++) {
            if (this.storage.documents[i].id === id) {
                return this.storage.documents[i];
            }
        }
        return null;
    },
    
    getCollection: function(id) {
        for (var i = 0; i < this.storage.collections.length; i++) {
            if (this.storage.collections[i].id === id) {
                return this.storage.collections[i];
            }
        }
        return null;
    },
    
    getRecentDocuments: function(limit) {
        var docs = this.storage.documents.slice();
        docs.sort(function(a, b) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        return docs.slice(0, limit || 5);
    },
    
    generateExcerpt: function(content) {
        if (!content) return '';
        var plainText = content.replace(/[#*`\[\]]/g, '').substring(0, 150);
        return plainText + (content.length > 150 ? '...' : '');
    },
    
    escapeHtml: function(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatDate: function(dateStr) {
        var date = new Date(dateStr);
        var now = new Date();
        var diff = now - date;
        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return days + ' days ago';
        return date.toLocaleDateString();
    },
    
    getRelativeTime: function(dateStr) {
        var date = new Date(dateStr);
        var now = new Date();
        var diff = now - date;
        var minutes = Math.floor(diff / (1000 * 60));
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);
        
        if (minutes < 60) return minutes + 'm ago';
        if (hours < 24) return hours + 'h ago';
        return days + 'd ago';
    },
    
    renderMarkdown: function(content) {
        // Simple markdown rendering
        return content
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    },
    
    // Create new collection
    createNewCollection: function() {
        var name = prompt('Enter collection name:');
        if (!name || !name.trim()) return;
        
        var now = new Date().toISOString();
        var newCollection = {
            id: 'col_' + Date.now(),
            name: name.trim(),
            description: '',
            color: '#0066cc',
            createdAt: now,
            updatedAt: now,
            documentCount: 0
        };
        
        this.storage.collections.push(newCollection);
        this.saveData();
        this.renderSidebar();
    },
    
    // Share document
    shareDocument: function() {
        if (!this.currentDocument) return;
        
        var url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: this.currentDocument.title,
                text: this.currentDocument.excerpt,
                url: url
            });
        } else {
            // Fallback - copy to clipboard
            var textArea = document.createElement('textarea');
            textArea.value = this.currentDocument.title + '\n' + url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Document link copied to clipboard!');
        }
    },
    
    // Delete document
    deleteDocument: function(docId) {
        if (!confirm('Are you sure you want to delete this document?')) return;
        
        this.storage.documents = this.storage.documents.filter(function(doc) {
            return doc.id !== docId;
        });
        
        this.saveData();
        this.showHome();
        this.renderSidebar();
    },
    
    // Setup editor
    setupEditor: function(docId) {
        var self = this;
        var doc = docId ? this.getDocument(docId) : null;
        var isEditing = !!doc;
        
        // Populate collection dropdown
        var collectionSelect = document.getElementById('document-collection');
        if (collectionSelect) {
            collectionSelect.innerHTML = '<option value="">Select collection...</option>';
            for (var i = 0; i < this.storage.collections.length; i++) {
                var collection = this.storage.collections[i];
                var option = document.createElement('option');
                option.value = collection.id;
                option.textContent = collection.name;
                if (doc && doc.collectionId === collection.id) {
                    option.selected = true;
                }
                collectionSelect.appendChild(option);
            }
        }
        
        // Populate form fields
        var titleInput = document.getElementById('document-title');
        var tagsInput = document.getElementById('document-tags');
        var editor = document.getElementById('markdown-editor');
        
        if (titleInput) titleInput.value = doc ? doc.title : '';
        if (tagsInput) tagsInput.value = doc ? doc.tags.join(', ') : '';
        if (editor) editor.value = doc ? doc.content : '';
        
        // Setup editor events
        this.setupEditorEvents(doc);
        
        // Focus title field
        if (titleInput) titleInput.focus();
    },
    
    // Setup editor events
    setupEditorEvents: function(doc) {
        var self = this;
        
        // Save button
        var saveBtn = document.getElementById('save-document');
        if (saveBtn) {
            saveBtn.onclick = function() {
                self.saveDocument(doc);
            };
        }
        
        // Cancel button
        var cancelBtn = document.getElementById('cancel-edit');
        if (cancelBtn) {
            cancelBtn.onclick = function() {
                if (doc) {
                    self.showDocument(doc.id);
                } else {
                    self.showHome();
                }
            };
        }
        
        // Tab switching
        var editTab = document.getElementById('edit-tab');
        var previewTab = document.getElementById('preview-tab');
        var editorText = document.getElementById('editor-text');
        var editorPreview = document.getElementById('editor-preview');
        
        if (editTab) {
            editTab.onclick = function() {
                editTab.classList.add('active');
                previewTab.classList.remove('active');
                editorText.classList.remove('hidden');
                editorPreview.classList.add('hidden');
            };
        }
        
        if (previewTab) {
            previewTab.onclick = function() {
                previewTab.classList.add('active');
                editTab.classList.remove('active');
                editorPreview.classList.remove('hidden');
                editorText.classList.add('hidden');
                
                // Update preview
                var editor = document.getElementById('markdown-editor');
                var previewContent = document.getElementById('preview-content');
                if (editor && previewContent) {
                    previewContent.innerHTML = self.renderMarkdown(editor.value);
                }
            };
        }
        
        // Setup toolbar buttons
        this.setupToolbarEvents();
    },
    
    // Save document
    saveDocument: function(existingDoc) {
        var title = document.getElementById('document-title').value.trim();
        var collectionId = document.getElementById('document-collection').value;
        var tags = document.getElementById('document-tags').value.split(',').map(function(tag) {
            return tag.trim();
        }).filter(function(tag) {
            return tag.length > 0;
        });
        var content = document.getElementById('markdown-editor').value;
        
        if (!title) {
            alert('Please enter a document title');
            return;
        }
        
        var now = new Date().toISOString();
        
        if (existingDoc) {
            // Update existing document
            existingDoc.title = title;
            existingDoc.collectionId = collectionId;
            existingDoc.tags = tags;
            existingDoc.content = content;
            existingDoc.excerpt = this.generateExcerpt(content);
            existingDoc.updatedAt = now;
        } else {
            // Create new document
            var newDoc = {
                id: 'doc_' + Date.now(),
                title: title,
                content: content,
                excerpt: this.generateExcerpt(content),
                collectionId: collectionId,
                tags: tags,
                author: 'Demo User',
                createdAt: now,
                updatedAt: now,
                isPublic: false,
                views: 0
            };
            
            this.storage.documents.push(newDoc);
            existingDoc = newDoc;
        }
        
        // Update collection document count
        this.updateCollectionCounts();
        
        this.saveData();
        this.showDocument(existingDoc.id);
        this.renderSidebar();
    },
    
    // Update collection document counts
    updateCollectionCounts: function() {
        for (var i = 0; i < this.storage.collections.length; i++) {
            var collection = this.storage.collections[i];
            collection.documentCount = this.storage.documents.filter(function(doc) {
                return doc.collectionId === collection.id;
            }).length;
        }
    },
    
    // Render sidebar
    renderSidebar: function() {
        var collectionsDiv = document.getElementById('collections-list');
        var recentDiv = document.getElementById('recent-documents');
        
        if (collectionsDiv) {
            collectionsDiv.innerHTML = '';
            for (var i = 0; i < this.storage.collections.length; i++) {
                var collection = this.storage.collections[i];
                var collectionEl = document.createElement('div');
                collectionEl.className = 'collection-item';
                collectionEl.innerHTML = 
                    '<div class="collection-name">' + this.escapeHtml(collection.name) + '</div>' +
                    '<div class="collection-count">' + collection.documentCount + ' docs</div>';
                collectionsDiv.appendChild(collectionEl);
            }
        }
        
        if (recentDiv) {
            var recentDocs = this.getRecentDocuments(5);
            recentDiv.innerHTML = '';
            for (var i = 0; i < recentDocs.length; i++) {
                var doc = recentDocs[i];
                var docEl = document.createElement('div');
                docEl.className = 'recent-doc-item';
                docEl.innerHTML = 
                    '<div class="recent-doc-title">' + this.escapeHtml(doc.title) + '</div>' +
                    '<div class="recent-doc-time">' + this.getRelativeTime(doc.updatedAt) + '</div>';
                
                // Add click handler
                var self = this;
                docEl.onclick = (function(docId) {
                    return function() {
                        self.showDocument(docId);
                    };
                })(doc.id);
                
                recentDiv.appendChild(docEl);
            }
        }
    },
    
    // Render document content
    renderDocumentContent: function(doc) {
        var contentDiv = document.getElementById('document-content');
        var breadcrumb = document.getElementById('breadcrumb-path');
        
        if (breadcrumb) {
            var collection = this.getCollection(doc.collectionId);
            breadcrumb.textContent = collection ? collection.name + ' / ' + doc.title : doc.title;
        }
        
        if (contentDiv) {
            contentDiv.innerHTML = 
                '<header class="document-header-content">' +
                '<h1>' + this.escapeHtml(doc.title) + '</h1>' +
                '<div class="document-meta">' +
                '<span>By ' + this.escapeHtml(doc.author) + '</span>' +
                '<span>•</span>' +
                '<span>' + this.formatDate(doc.updatedAt) + '</span>' +
                '<span>•</span>' +
                '<span>' + doc.views + ' views</span>' +
                '</div>' +
                '</header>' +
                '<div class="document-body">' + this.renderMarkdown(doc.content) + '</div>';
        }
    },
    
    // Handle search
    handleSearch: function(query) {
        var searchResults = document.getElementById('search-results');
        
        if (!query.trim()) {
            this.hideSearchResults();
            return;
        }
        
        var results = this.searchDocuments(query);
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No documents found</div>';
        } else {
            var html = '';
            for (var i = 0; i < Math.min(results.length, 5); i++) {
                var doc = results[i];
                var collection = this.getCollection(doc.collectionId);
                html += 
                    '<div class="search-result-item" data-doc-id="' + doc.id + '">' +
                    '<div class="search-result-title">' + this.escapeHtml(doc.title) + '</div>' +
                    '<div class="search-result-meta">' + 
                    (collection ? collection.name + ' • ' : '') + 
                    this.formatDate(doc.updatedAt) + '</div>' +
                    '<div class="search-result-excerpt">' + this.escapeHtml(doc.excerpt) + '</div>' +
                    '</div>';
            }
            searchResults.innerHTML = html;
            
            // Add click handlers
            var self = this;
            var resultItems = searchResults.querySelectorAll('.search-result-item');
            for (var i = 0; i < resultItems.length; i++) {
                resultItems[i].onclick = function() {
                    var docId = this.getAttribute('data-doc-id');
                    self.showDocument(docId);
                    self.hideSearchResults();
                };
            }
        }
        
        searchResults.classList.remove('hidden');
    },
    
    // Search documents
    searchDocuments: function(query) {
        var searchTerm = query.toLowerCase();
        var results = [];
        
        for (var i = 0; i < this.storage.documents.length; i++) {
            var doc = this.storage.documents[i];
            var score = 0;
            
            // Search in title (higher weight)
            if (doc.title.toLowerCase().indexOf(searchTerm) !== -1) {
                score += 3;
            }
            
            // Search in content
            if (doc.content.toLowerCase().indexOf(searchTerm) !== -1) {
                score += 2;
            }
            
            // Search in tags
            for (var j = 0; j < doc.tags.length; j++) {
                if (doc.tags[j].toLowerCase().indexOf(searchTerm) !== -1) {
                    score += 1;
                }
            }
            
            if (score > 0) {
                results.push({ doc: doc, score: score });
            }
        }
        
        // Sort by score
        results.sort(function(a, b) {
            return b.score - a.score;
        });
        
        return results.map(function(result) {
            return result.doc;
        });
    },
    
    // Hide search results
    hideSearchResults: function() {
        var searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.classList.add('hidden');
        }
    },
    
    // Setup toolbar events
    setupToolbarEvents: function() {
        var self = this;
        var toolbarButtons = document.querySelectorAll('.toolbar-btn');
        
        for (var i = 0; i < toolbarButtons.length; i++) {
            var button = toolbarButtons[i];
            var action = button.getAttribute('data-action');
            
            button.onclick = (function(actionType) {
                return function() {
                    self.insertMarkdown(actionType);
                };
            })(action);
        }
    },
    
    // Insert markdown formatting
    insertMarkdown: function(type) {
        var editor = document.getElementById('markdown-editor');
        if (!editor) return;
        
        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        var selectedText = editor.value.substring(start, end);
        var beforeText = editor.value.substring(0, start);
        var afterText = editor.value.substring(end);
        var newText = '';
        var newCursorPos = start;
        
        switch (type) {
            case 'bold':
                if (selectedText) {
                    newText = '**' + selectedText + '**';
                    newCursorPos = start + newText.length;
                } else {
                    newText = '**bold text**';
                    newCursorPos = start + 2;
                }
                break;
                
            case 'italic':
                if (selectedText) {
                    newText = '*' + selectedText + '*';
                    newCursorPos = start + newText.length;
                } else {
                    newText = '*italic text*';
                    newCursorPos = start + 1;
                }
                break;
                
            case 'heading':
                var lines = (beforeText + selectedText + afterText).split('\n');
                var currentLineIndex = beforeText.split('\n').length - 1;
                var currentLine = lines[currentLineIndex];
                
                if (currentLine.startsWith('### ')) {
                    lines[currentLineIndex] = currentLine.replace(/^### /, '');
                } else if (currentLine.startsWith('## ')) {
                    lines[currentLineIndex] = '### ' + currentLine.replace(/^## /, '');
                } else if (currentLine.startsWith('# ')) {
                    lines[currentLineIndex] = '## ' + currentLine.replace(/^# /, '');
                } else {
                    lines[currentLineIndex] = '# ' + currentLine;
                }
                
                editor.value = lines.join('\n');
                newCursorPos = end + 2;
                break;
                
            case 'link':
                if (selectedText) {
                    newText = '[' + selectedText + '](url)';
                    newCursorPos = start + selectedText.length + 3;
                } else {
                    newText = '[link text](url)';
                    newCursorPos = start + 1;
                }
                break;
                
            case 'code':
                if (selectedText) {
                    if (selectedText.includes('\n')) {
                        newText = '```\n' + selectedText + '\n```';
                        newCursorPos = start + newText.length;
                    } else {
                        newText = '`' + selectedText + '`';
                        newCursorPos = start + newText.length;
                    }
                } else {
                    newText = '`code`';
                    newCursorPos = start + 1;
                }
                break;
                
            case 'list':
                var lines = (beforeText + selectedText + afterText).split('\n');
                var startLineIndex = beforeText.split('\n').length - 1;
                var endLineIndex = startLineIndex + selectedText.split('\n').length - 1;
                
                for (var i = startLineIndex; i <= endLineIndex; i++) {
                    if (lines[i].trim()) {
                        if (lines[i].startsWith('- ')) {
                            lines[i] = lines[i].replace(/^- /, '');
                        } else {
                            lines[i] = '- ' + lines[i];
                        }
                    }
                }
                
                editor.value = lines.join('\n');
                newCursorPos = end + 2;
                break;
                
            default:
                return;
        }
        
        if (type !== 'heading' && type !== 'list') {
            editor.value = beforeText + newText + afterText;
        }
        
        editor.focus();
        editor.setSelectionRange(newCursorPos, newCursorPos);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Codex app...');
    CodexApp.init();
});