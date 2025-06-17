// Import other TS files
import { setupAuth } from "./auth.js";
import { setupProjects } from "./projects.js";
import { setupUsers } from "./users.js";

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded successfully");

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

function setupNavigation(token: string | null, userRole: string | null) {
  const loginBtn = document.getElementById("login-btn") as HTMLButtonElement;
  const logoutBtn = document.getElementById("logout-btn") as HTMLButtonElement;
  const dashboardLink = document.getElementById(
    "dashboard-link"
  ) as HTMLAnchorElement;
  const projectsLink = document.getElementById(
    "projects-link"
  ) as HTMLAnchorElement;
  const usersLink = document.getElementById("users-link") as HTMLAnchorElement;

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
  } else {
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

function showSection(sectionId: string) {
  // Hide all sections
  const sections = document.querySelectorAll(
    'main > div[id$="-section"], #dashboard, #users-section'
  );
  sections.forEach((section) => {
    (section as HTMLElement).classList.add("hidden");
  });

  // Show the requested section
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.remove("hidden");
  }
}
