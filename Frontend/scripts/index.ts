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

export function setupProjects(token: string) {
  const createProjectBtn = document.getElementById(
    "create-project-btn"
  ) as HTMLButtonElement;
  const createProjectModal = document.getElementById(
    "create-project-modal"
  ) as HTMLDivElement;
  const closeModal = document.querySelector(".close") as HTMLSpanElement;
  const createProjectForm = document.getElementById(
    "create-project-form"
  ) as HTMLFormElement;
  const projectsList = document.getElementById(
    "projects-list"
  ) as HTMLDivElement;

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
  createProjectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = (document.getElementById("project-title") as HTMLInputElement)
      .value;
    const description = (
      document.getElementById("project-description") as HTMLTextAreaElement
    ).value;
    const duedate = (
      document.getElementById("project-duedate") as HTMLInputElement
    ).value;

    try {
      const response = await fetch(
        `http://localhost:3000/project?userEmail=${localStorage.getItem(
          "userEmail"
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description, duedate }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      createProjectModal.classList.add("hidden");
      createProjectForm.reset();
      loadProjects(token);
    } catch (error) {
      alert("Failed to create project");
      console.error(error);
    }
  });
}

async function loadProjects(token: string) {
  try {
    const response = await fetch(
      `http://localhost:3000/project?userEmail=${localStorage.getItem(
        "userEmail"
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load projects");
    }

    const data = await response.json();
    const projectsList = document.getElementById(
      "projects-list"
    ) as HTMLDivElement;
    const totalProjects = document.getElementById(
      "total-projects"
    ) as HTMLParagraphElement;
    const activeProjects = document.getElementById(
      "active-projects"
    ) as HTMLParagraphElement;

    // Update stats
    totalProjects.textContent = data.data.length.toString();
    const activeCount = data.data.filter((p: any) => !p.completed).length;
    activeProjects.textContent = activeCount.toString();

    // Render projects
    projectsList.innerHTML = "";
    data.data.forEach((project: any) => {
      const projectCard = document.createElement("div");
      projectCard.className = "project-card";

      projectCard.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p class="due-date">Due: ${new Date(
          project.duedate
        ).toLocaleDateString()}</p>
        <span class="status ${
          project.completed ? "status-completed" : "status-in-progress"
        }">
          ${project.completed ? "Completed" : "In Progress"}
        </span>
      `;

      projectsList.appendChild(projectCard);
    });
  } catch (error) {
    console.error("Error loading projects:", error);
  }
}


export function setupUsers(token: string) {
  const usersTable = document.getElementById("users-table") as HTMLTableElement;

  loadUsers(token);
}

async function loadUsers(token: string) {
  const usersTable = document.getElementById("users-table") as HTMLTableElement;

  try {
    const response = await fetch("http://localhost:3000/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load users");
    }

    const users = await response.json();
    const tbody = usersTable.querySelector("tbody") as HTMLTableSectionElement;

    tbody.innerHTML = "";
    users.forEach((user: any) => {
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
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

export function setupAuth() {
  const loginForm = document.getElementById("login-form") as HTMLFormElement;
  const registerForm = document.getElementById(
    "register-form"
  ) as HTMLFormElement;
  const showRegisterLink = document.getElementById(
    "show-register"
  ) as HTMLAnchorElement;
  const showLoginLink = document.getElementById(
    "show-login"
  ) as HTMLAnchorElement;

  // Toggle between login and register forms
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("login-section")?.classList.add("hidden");
    document.getElementById("register-section")?.classList.remove("hidden");
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("register-section")?.classList.add("hidden");
    document.getElementById("login-section")?.classList.remove("hidden");
  });

  // Login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Get user info
      const userResponse = await fetch("http://localhost:3000/auth/me", {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userName", userData.name);
        window.location.reload();
      }
    } catch (error) {
      alert("Login failed. Please check your credentials.");
      console.error(error);
    }
  });

  // Register form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (document.getElementById("reg-name") as HTMLInputElement)
      .value;
    const email = (document.getElementById("reg-email") as HTMLInputElement)
      .value;
    const password = (
      document.getElementById("reg-password") as HTMLInputElement
    ).value;
    const confirmPassword = (
      document.getElementById("reg-confirm-password") as HTMLInputElement
    ).value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userRole", "USER");
      localStorage.setItem("userName", name);

      window.location.reload();
    } catch (error) {
      alert("Registration failed. Please try again.");
      console.error(error);
    }
  });
}