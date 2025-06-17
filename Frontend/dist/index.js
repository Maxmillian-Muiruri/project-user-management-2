"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupProjects = setupProjects;
exports.setupUsers = setupUsers;
exports.setupAuth = setupAuth;
document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    // Setup navigation
    setupNavigation(token, userRole);
    // Setup auth forms
    setupAuth();
    // Setup projects section
    if (token) {
        setupProjects(token);
    }
    // Setup users section (admin only)
    if (token && userRole === "ADMIN") {
        setupUsers(token);
    }
});
function setupNavigation(token, userRole) {
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const dashboardLink = document.getElementById("dashboard-link");
    const projectsLink = document.getElementById("projects-link");
    const usersLink = document.getElementById("users-link");
    // Show/hide elements based on auth status
    if (token) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "block";
        dashboardLink.style.display = "block";
        projectsLink.style.display = "block";
        if (userRole === "ADMIN") {
            usersLink.style.display = "block";
        }
        // Show dashboard by default
        showSection("dashboard");
    }
    else {
        loginBtn.style.display = "block";
        logoutBtn.style.display = "none";
        dashboardLink.style.display = "none";
        projectsLink.style.display = "none";
        usersLink.style.display = "none";
        // Show login by default
        showSection("login-section");
    }
    // Navigation click handlers
    dashboardLink.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("dashboard");
    });
    projectsLink.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("projects-section");
    });
    usersLink.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("users-section");
    });
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        window.location.reload();
    });
}
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('main > div[id$="-section"], #dashboard, #users-section');
    sections.forEach((section) => {
        section.classList.add("hidden");
    });
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove("hidden");
    }
}
function setupProjects(token) {
    const createProjectBtn = document.getElementById("create-project-btn");
    const createProjectModal = document.getElementById("create-project-modal");
    const closeModal = document.querySelector(".close");
    const createProjectForm = document.getElementById("create-project-form");
    const projectsList = document.getElementById("projects-list");
    // Load projects
    loadProjects(token);
    // Modal handling
    createProjectBtn.addEventListener("click", () => {
        createProjectModal.classList.remove("hidden");
    });
    closeModal.addEventListener("click", () => {
        createProjectModal.classList.add("hidden");
    });
    window.addEventListener("click", (e) => {
        if (e.target === createProjectModal) {
            createProjectModal.classList.add("hidden");
        }
    });
    // Create project form
    createProjectForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const title = document.getElementById("project-title")
            .value;
        const description = document.getElementById("project-description").value;
        const duedate = document.getElementById("project-duedate").value;
        try {
            const response = yield fetch(`http://localhost:3000/project?userEmail=${localStorage.getItem("userEmail")}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description, duedate }),
            });
            if (!response.ok) {
                throw new Error("Failed to create project");
            }
            createProjectModal.classList.add("hidden");
            createProjectForm.reset();
            loadProjects(token);
        }
        catch (error) {
            alert("Failed to create project");
            console.error(error);
        }
    }));
}
function loadProjects(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`http://localhost:3000/project?userEmail=${localStorage.getItem("userEmail")}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to load projects");
            }
            const data = yield response.json();
            const projectsList = document.getElementById("projects-list");
            const totalProjects = document.getElementById("total-projects");
            const activeProjects = document.getElementById("active-projects");
            // Update stats
            totalProjects.textContent = data.data.length.toString();
            const activeCount = data.data.filter((p) => !p.completed).length;
            activeProjects.textContent = activeCount.toString();
            // Render projects
            projectsList.innerHTML = "";
            data.data.forEach((project) => {
                const projectCard = document.createElement("div");
                projectCard.className = "project-card";
                projectCard.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p class="due-date">Due: ${new Date(project.duedate).toLocaleDateString()}</p>
        <span class="status ${project.completed ? "status-completed" : "status-in-progress"}">
          ${project.completed ? "Completed" : "In Progress"}
        </span>
      `;
                projectsList.appendChild(projectCard);
            });
        }
        catch (error) {
            console.error("Error loading projects:", error);
        }
    });
}
function setupUsers(token) {
    const usersTable = document.getElementById("users-table");
    loadUsers(token);
}
function loadUsers(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const usersTable = document.getElementById("users-table");
        try {
            const response = yield fetch("http://localhost:3000/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to load users");
            }
            const users = yield response.json();
            const tbody = usersTable.querySelector("tbody");
            tbody.innerHTML = "";
            users.forEach((user) => {
                const row = document.createElement("tr");
                row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>
          <button class="btn btn-sm">Edit</button>
          <button class="btn btn-sm btn-outline">Delete</button>
        </td>
      `;
                tbody.appendChild(row);
            });
        }
        catch (error) {
            console.error("Error loading users:", error);
        }
    });
}
function setupAuth() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const showRegisterLink = document.getElementById("show-register");
    const showLoginLink = document.getElementById("show-login");
    // Toggle between login and register forms
    showRegisterLink.addEventListener("click", (e) => {
        var _a, _b;
        e.preventDefault();
        (_a = document.getElementById("login-section")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        (_b = document.getElementById("register-section")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    });
    showLoginLink.addEventListener("click", (e) => {
        var _a, _b;
        e.preventDefault();
        (_a = document.getElementById("register-section")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        (_b = document.getElementById("login-section")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    });
    // Login form submission
    loginForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password")
            .value;
        try {
            const response = yield fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                throw new Error("Login failed");
            }
            const data = yield response.json();
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            // Get user info
            const userResponse = yield fetch("http://localhost:3000/auth/me", {
                headers: {
                    Authorization: `Bearer ${data.accessToken}`,
                },
            });
            if (userResponse.ok) {
                const userData = yield userResponse.json();
                localStorage.setItem("userRole", userData.role);
                localStorage.setItem("userName", userData.name);
                window.location.reload();
            }
        }
        catch (error) {
            alert("Login failed. Please check your credentials.");
            console.error(error);
        }
    }));
    // Register form submission
    registerForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const name = document.getElementById("reg-name")
            .value;
        const email = document.getElementById("reg-email")
            .value;
        const password = document.getElementById("reg-password").value;
        const confirmPassword = document.getElementById("reg-confirm-password").value;
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            const response = yield fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, confirmPassword }),
            });
            if (!response.ok) {
                throw new Error("Registration failed");
            }
            const data = yield response.json();
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("userRole", "USER");
            localStorage.setItem("userName", name);
            window.location.reload();
        }
        catch (error) {
            alert("Registration failed. Please try again.");
            console.error(error);
        }
    }));
}
