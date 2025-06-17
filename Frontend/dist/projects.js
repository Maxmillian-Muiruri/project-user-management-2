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
