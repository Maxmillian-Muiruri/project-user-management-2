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
