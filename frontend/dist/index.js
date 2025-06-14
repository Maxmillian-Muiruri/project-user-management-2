"use strict";
const adminEmail = "admin@example.com";
const admin = {
    id: "0",
    email: adminEmail,
    password: "admin123",
    role: "admin",
};
let currentUser = null;
let users = [admin];
let projects = [];
// Elements
const authForm = document.getElementById("auth-form");
const authMessage = document.getElementById("auth-message");
const loginSection = document.getElementById("login-section");
const adminDashboard = document.getElementById("admin-dashboard");
const userDashboard = document.getElementById("user-dashboard");
const assignedProject = document.getElementById("assigned-project");
const updateSection = document.getElementById("update-section");
const projectForm = document.getElementById("project-form");
const assignForm = document.getElementById("assign-form");
const deleteBtn = document.getElementById("delete-btn");
const userSelect = document.getElementById("user-select");
const projectSelect = document.getElementById("project-select");
const deleteSelect = document.getElementById("delete-project-select");
const completeBtn = document.getElementById("complete-project");
const registerBtn = document.getElementById("register-btn");
const loginBtn = document.getElementById("login-btn");
const userList = document.getElementById("user-list");
const completedSection = document.createElement("section");
completedSection.innerHTML = `<h3>Completed Projects</h3><ul id="completed-list"></ul>`;
adminDashboard.appendChild(completedSection);
const completedList = completedSection.querySelector("#completed-list");
// Auth logic
loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.toLowerCase();
    const password = document.getElementById("password")
        .value;
    const user = users.find((u) => u.email.toLowerCase() === email && u.password === password);
    if (!user)
        return (authMessage.textContent = "Invalid credentials.");
    currentUser = user;
    user.role === "admin" ? showAdminDashboard() : showUserDashboard();
});
registerBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.toLowerCase();
    const password = document.getElementById("password")
        .value;
    if (users.find((u) => u.email === email)) {
        authMessage.textContent = "User already registered.";
        return;
    }
    const newUser = {
        id: crypto.randomUUID(),
        email,
        password,
        role: "user",
    };
    users.push(newUser);
    authMessage.textContent = "Registration successful. You can now login.";
    renderUserList();
    populateUserSelect();
});
function showAdminDashboard() {
    loginSection.style.display = "none";
    adminDashboard.style.display = "block";
    populateUserSelect();
    populateProjectSelects();
    renderUserList();
    displayCompletedProjects();
}
function showUserDashboard() {
    loginSection.style.display = "none";
    userDashboard.style.display = "block";
    const assigned = projects.find((p) => p.assignedUserId === (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id));
    if (assigned) {
        assignedProject.innerHTML = `<p><strong>${assigned.name}</strong><br>${assigned.description}</p>`;
        updateSection.style.display = assigned.completed ? "none" : "block";
    }
    else {
        assignedProject.innerHTML = "<p>You have no assigned project.</p>";
        updateSection.style.display = "none";
    }
}
projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("project-name")
        .value;
    const description = document.getElementById("project-desc").value;
    const endDate = document.getElementById("project-end")
        .value;
    const newProject = {
        id: crypto.randomUUID(),
        name,
        description,
        endDate,
    };
    projects.push(newProject);
    populateProjectSelects();
    alert("Project added successfully!");
    projectForm.reset();
});
assignForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userId = userSelect.value;
    const projectId = projectSelect.value;
    const user = users.find((u) => u.id === userId);
    const project = projects.find((p) => p.id === projectId);
    if (user && project) {
        if (projects.some((p) => p.assignedUserId === userId)) {
            alert("User already has a project assigned.");
            return;
        }
        project.assignedUserId = userId;
        user.assignedProjectId = projectId;
        alert(`Project assigned to ${user.email}`);
    }
});
deleteBtn.addEventListener("click", () => {
    const projectId = deleteSelect.value;
    projects = projects.filter((p) => p.id !== projectId);
    populateProjectSelects();
    alert("Project deleted.");
    displayCompletedProjects();
});
completeBtn.addEventListener("click", () => {
    const project = projects.find((p) => p.assignedUserId === (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id));
    if (project && !project.completed) {
        project.completed = true;
        updateSection.style.display = "none";
        alert("Project marked as completed. Admin notified.");
        displayCompletedProjects();
    }
});
function populateUserSelect() {
    userSelect.innerHTML = users
        .filter((u) => u.role === "user")
        .map((u) => `<option value="${u.id}">${u.email}</option>`) // Only users
        .join("");
}
function populateProjectSelects() {
    const projectOptions = projects
        .map((p) => `<option value="${p.id}">${p.name}</option>`)
        .join("");
    projectSelect.innerHTML = projectOptions;
    deleteSelect.innerHTML = projectOptions;
}
function displayCompletedProjects() {
    const completed = projects.filter((p) => p.completed);
    completedList.innerHTML = completed.length
        ? completed
            .map((p) => `<li><strong>${p.name}</strong> - ${p.description}</li>`)
            .join("")
        : "<li>No completed projects yet.</li>";
}
function renderUserList() {
    const listItems = users
        .filter((u) => u.role === "user")
        .map((u) => `<li>${u.email}</li>`)
        .join("");
    userList.innerHTML = listItems || "<li>No users registered yet.</li>";
}
const logoutBtnAdmin = document.getElementById("logout-btn");
const logoutBtnUser = document.getElementById("logout-btn-user");
function logout() {
    currentUser = null;
    loginSection.style.display = "block";
    adminDashboard.style.display = "none";
    userDashboard.style.display = "none";
    authMessage.textContent = "You have logged out.";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    assignedProject.innerHTML = "";
    updateSection.style.display = "none";
}
logoutBtnAdmin === null || logoutBtnAdmin === void 0 ? void 0 : logoutBtnAdmin.addEventListener("click", logout);
logoutBtnUser === null || logoutBtnUser === void 0 ? void 0 : logoutBtnUser.addEventListener("click", logout);
