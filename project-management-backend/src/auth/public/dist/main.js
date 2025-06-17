"use strict";
class App {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.sections = {};
        this.navLinks = {};
        this.loginBtn = null;
        this.logoutBtn = null;
        this.showLoginLink = null;
        this.showRegisterLink = null;
        this.projectsList = null;
        this.userNameSpan = null;
        this.usersTableBody = null;
        this.createProjectBtn = null;
        this.createProjectModal = null;
        this.createProjectForm = null;
        this.createProjectModalClose = null;
        this.initDummyData();
        this.cacheElements();
        this.bindEvents();
        this.showSection('login');
        this.updateAuthButtons();
    }
    initDummyData() {
        const project1 = {
            id: 1,
            title: 'Project Alpha',
            description: 'Description for Project Alpha',
            dueDate: '2024-12-31',
            status: 'in-progress',
        };
        const project2 = {
            id: 2,
            title: 'Project Beta',
            description: 'Description for Project Beta',
            dueDate: '2024-11-30',
            status: 'completed',
        };
        this.users = [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                assignedProjects: [project1, project2],
            },
            {
                id: 2,
                name: 'Regular User',
                email: 'user@example.com',
                role: 'user',
                assignedProjects: [project1],
            },
        ];
    }
    cacheElements() {
        var _a;
        this.sections = {
            login: document.getElementById('login-section'),
            register: document.getElementById('register-section'),
            dashboard: document.getElementById('dashboard'),
            projects: document.getElementById('projects-section'),
            users: document.getElementById('users-section'),
        };
        this.navLinks = {
            dashboard: document.getElementById('dashboard-link'),
            projects: document.getElementById('projects-link'),
            users: document.getElementById('users-link'),
        };
        this.loginBtn = document.getElementById('login-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.showLoginLink = document.getElementById('show-login');
        this.showRegisterLink = document.getElementById('show-register');
        this.projectsList = document.getElementById('projects-list');
        this.userNameSpan = document.getElementById('user-name');
        this.usersTableBody = document.querySelector('#users-table tbody');
        this.createProjectBtn = document.getElementById('create-project-btn');
        this.createProjectModal = document.getElementById('create-project-modal');
        this.createProjectForm = document.getElementById('create-project-form');
        this.createProjectModalClose =
            ((_a = this.createProjectModal) === null || _a === void 0 ? void 0 : _a.querySelector('.close')) || null;
    }
    bindEvents() {
        var _a, _b, _c, _d, _e, _f, _g;
        this.navLinks.dashboard.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('dashboard');
        });
        this.navLinks.projects.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('projects');
            this.renderProjects();
        });
        this.navLinks.users.addEventListener('click', (e) => {
            var _a;
            e.preventDefault();
            if (((_a = this.currentUser) === null || _a === void 0 ? void 0 : _a.role) === 'admin') {
                this.showSection('users');
                this.renderUsers();
            }
            else {
                alert('Access denied: Admins only');
            }
        });
        (_a = this.showRegisterLink) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('register');
        });
        (_b = this.showLoginLink) === null || _b === void 0 ? void 0 : _b.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('login');
        });
        (_c = this.loginBtn) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.handleLogin();
        });
        (_d = this.logoutBtn) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.handleLogout();
        });
        // Register form submission
        const registerForm = document.getElementById('register-form');
        registerForm === null || registerForm === void 0 ? void 0 : registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(registerForm);
        });
        // Login form submission
        const loginForm = document.getElementById('login-form');
        loginForm === null || loginForm === void 0 ? void 0 : loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        // Create project button click
        (_e = this.createProjectBtn) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            this.showCreateProjectModal();
        });
        // Create project modal close button
        (_f = this.createProjectModalClose) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
            this.hideCreateProjectModal();
        });
        // Create project form submission
        (_g = this.createProjectForm) === null || _g === void 0 ? void 0 : _g.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateProject();
        });
    }
    showSection(sectionName) {
        Object.values(this.sections).forEach((section) => section.classList.add('hidden'));
        this.sections[sectionName].classList.remove('hidden');
    }
    showCreateProjectModal() {
        var _a;
        (_a = this.createProjectModal) === null || _a === void 0 ? void 0 : _a.classList.remove('hidden');
    }
    hideCreateProjectModal() {
        var _a, _b;
        (_a = this.createProjectModal) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
        (_b = this.createProjectForm) === null || _b === void 0 ? void 0 : _b.reset();
    }
    updateAuthButtons() {
        var _a, _b, _c, _d;
        if (this.currentUser) {
            (_a = this.loginBtn) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
            (_b = this.logoutBtn) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
            this.userNameSpan.textContent = this.currentUser.name;
            // Show admin-only links if user is admin
            if (this.currentUser.role === 'admin') {
                document
                    .querySelectorAll('.admin-only')
                    .forEach((el) => el.classList.remove('hidden'));
            }
            else {
                document
                    .querySelectorAll('.admin-only')
                    .forEach((el) => el.classList.add('hidden'));
            }
        }
        else {
            (_c = this.loginBtn) === null || _c === void 0 ? void 0 : _c.classList.remove('hidden');
            (_d = this.logoutBtn) === null || _d === void 0 ? void 0 : _d.classList.add('hidden');
            this.userNameSpan.textContent = '';
            document
                .querySelectorAll('.admin-only')
                .forEach((el) => el.classList.add('hidden'));
        }
    }
    handleCreateProject() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            alert('Access denied: Admins only');
            return;
        }
        if (!this.createProjectForm)
            return;
        const titleInput = this.createProjectForm.querySelector('#project-title');
        const descriptionInput = this.createProjectForm.querySelector('#project-description');
        const dueDateInput = this.createProjectForm.querySelector('#project-duedate');
        if (!titleInput || !descriptionInput || !dueDateInput) {
            alert('Please fill in all required fields.');
            return;
        }
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const dueDate = dueDateInput.value;
        if (!title || !description || !dueDate) {
            alert('Please fill in all required fields.');
            return;
        }
        // Create new project
        const newProject = {
            id: Date.now(),
            title,
            description,
            dueDate,
            status: 'in-progress',
        };
        // Assign project to the currently logged-in user (not admin)
        if (this.currentUser.role === 'admin') {
            // Assign project to the admin's assigned projects
            this.currentUser.assignedProjects.push(newProject);
            alert(`Project "${title}" created and assigned to you (admin).`);
        }
        else {
            alert('Only admin can create projects.');
            return;
        }
        this.hideCreateProjectModal();
        // Refresh projects list if current user is assigned user or admin
        this.renderProjects();
    }
    handleLogin() {
        const emailInput = document.getElementById('email').value.trim();
        const passwordInput = document.getElementById('password').value.trim();
        // Dummy authentication: check if email matches a user
        const user = this.users.find((u) => u.email === emailInput);
        if (user) {
            this.currentUser = user;
            alert(`Welcome, ${user.name}!`);
            this.showSection('dashboard');
            this.updateAuthButtons();
            this.renderProjects();
        }
        else {
            alert('Invalid email or password');
        }
    }
    handleLogout() {
        this.currentUser = null;
        alert('Logged out');
        this.showSection('login');
        this.updateAuthButtons();
    }
    handleRegister(form) {
        const name = form.querySelector('#reg-name').value.trim();
        const email = form.querySelector('#reg-email').value.trim();
        const password = form.querySelector('#reg-password').value.trim();
        const confirmPassword = form.querySelector('#reg-confirm-password').value.trim();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        // Check if email already exists
        if (this.users.some((u) => u.email === email)) {
            alert('Email already registered');
            return;
        }
        const newUser = {
            id: this.users.length + 1,
            name,
            email,
            role: 'user',
            assignedProjects: [],
        };
        this.users.push(newUser);
        alert('Registration successful! Please login.');
        form.reset();
        this.showSection('login');
    }
    renderProjects() {
        if (!this.projectsList)
            return;
        this.projectsList.innerHTML = '';
        if (!this.currentUser) {
            this.projectsList.innerHTML = '<p>Please login to see your projects.</p>';
            return;
        }
        if (this.currentUser.assignedProjects.length === 0) {
            this.projectsList.innerHTML = '<p>No projects assigned.</p>';
            return;
        }
        this.currentUser.assignedProjects.forEach((project) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p class="due-date">Due: ${project.dueDate}</p>
        <span class="status ${project.status === 'completed' ? 'status-completed' : 'status-in-progress'}">
          ${project.status === 'completed' ? 'Completed' : 'In Progress'}
        </span>
      `;
            this.projectsList.appendChild(projectCard);
        });
    }
    renderUsers() {
        if (!this.usersTableBody)
            return;
        this.usersTableBody.innerHTML = '';
        this.users.forEach((user) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>
          <button class="btn btn-outline btn-delete" data-user-id="${user.id}">Delete</button>
        </td>
      `;
            this.usersTableBody.appendChild(tr);
        });
        // Add event listeners for delete buttons
        this.usersTableBody.querySelectorAll('.btn-delete').forEach((button) => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const userId = Number(target.getAttribute('data-user-id'));
                this.deleteUser(userId);
            });
        });
    }
    deleteUser(userId) {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            alert('Access denied: Admins only');
            return;
        }
        this.users = this.users.filter((u) => u.id !== userId);
        this.renderUsers();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
