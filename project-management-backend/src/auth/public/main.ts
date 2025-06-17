interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  assignedProjects: Project[];
}

interface Project {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: 'completed' | 'in-progress';
}

class App {
  private users: User[] = [];
  private currentUser: User | null = null;

  private sections: { [key: string]: HTMLElement } = {};
  private navLinks: { [key: string]: HTMLElement } = {};
  private loginBtn: HTMLElement | null = null;
  private logoutBtn: HTMLElement | null = null;
  private showLoginLink: HTMLElement | null = null;
  private showRegisterLink: HTMLElement | null = null;
  private projectsList: HTMLElement | null = null;
  private userNameSpan: HTMLElement | null = null;
  private usersTableBody: HTMLElement | null = null;

  private createProjectBtn: HTMLElement | null = null;
  private createProjectModal: HTMLElement | null = null;
  private createProjectForm: HTMLFormElement | null = null;
  private createProjectModalClose: HTMLElement | null = null;

  constructor() {
    this.initDummyData();
    this.cacheElements();
    this.bindEvents();
    this.showSection('login');
    this.updateAuthButtons();
  }

  private initDummyData() {
    const project1: Project = {
      id: 1,
      title: 'Project Alpha',
      description: 'Description for Project Alpha',
      dueDate: '2024-12-31',
      status: 'in-progress',
    };
    const project2: Project = {
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

  private cacheElements() {
    this.sections = {
      login: document.getElementById('login-section')!,
      register: document.getElementById('register-section')!,
      dashboard: document.getElementById('dashboard')!,
      projects: document.getElementById('projects-section')!,
      users: document.getElementById('users-section')!,
    };

    this.navLinks = {
      dashboard: document.getElementById('dashboard-link')!,
      projects: document.getElementById('projects-link')!,
      users: document.getElementById('users-link')!,
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
    this.createProjectForm = document.getElementById(
      'create-project-form',
    ) as HTMLFormElement | null;
    this.createProjectModalClose =
      this.createProjectModal?.querySelector('.close') || null;
  }

  private bindEvents() {
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
      e.preventDefault();
      if (this.currentUser?.role === 'admin') {
        this.showSection('users');
        this.renderUsers();
      } else {
        alert('Access denied: Admins only');
      }
    });

    this.showRegisterLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSection('register');
    });

    this.showLoginLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSection('login');
    });

    this.loginBtn?.addEventListener('click', () => {
      this.handleLogin();
    });

    this.logoutBtn?.addEventListener('click', () => {
      this.handleLogout();
    });

    // Register form submission
    const registerForm = document.getElementById(
      'register-form',
    ) as HTMLFormElement | null;
    registerForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister(registerForm);
    });

    // Login form submission
    const loginForm = document.getElementById(
      'login-form',
    ) as HTMLFormElement | null;
    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Create project button click
    this.createProjectBtn?.addEventListener('click', () => {
      this.showCreateProjectModal();
    });

    // Create project modal close button
    this.createProjectModalClose?.addEventListener('click', () => {
      this.hideCreateProjectModal();
    });

    // Create project form submission
    this.createProjectForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateProject();
    });
  }

  private showSection(sectionName: string) {
    Object.values(this.sections).forEach((section) =>
      section.classList.add('hidden'),
    );
    this.sections[sectionName].classList.remove('hidden');
  }

  private showCreateProjectModal() {
    this.createProjectModal?.classList.remove('hidden');
  }

  private hideCreateProjectModal() {
    this.createProjectModal?.classList.add('hidden');
    this.createProjectForm?.reset();
  }

  private updateAuthButtons() {
    if (this.currentUser) {
      this.loginBtn?.classList.add('hidden');
      this.logoutBtn?.classList.remove('hidden');
      this.userNameSpan!.textContent = this.currentUser.name;
      // Show admin-only links if user is admin
      if (this.currentUser.role === 'admin') {
        document
          .querySelectorAll('.admin-only')
          .forEach((el) => el.classList.remove('hidden'));
      } else {
        document
          .querySelectorAll('.admin-only')
          .forEach((el) => el.classList.add('hidden'));
      }
    } else {
      this.loginBtn?.classList.remove('hidden');
      this.logoutBtn?.classList.add('hidden');
      this.userNameSpan!.textContent = '';
      document
        .querySelectorAll('.admin-only')
        .forEach((el) => el.classList.add('hidden'));
    }
  }

  private handleCreateProject() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      alert('Access denied: Admins only');
      return;
    }

    if (!this.createProjectForm) return;

    const titleInput = this.createProjectForm.querySelector(
      '#project-title',
    ) as HTMLInputElement;
    const descriptionInput = this.createProjectForm.querySelector(
      '#project-description',
    ) as HTMLTextAreaElement;
    const dueDateInput = this.createProjectForm.querySelector(
      '#project-duedate',
    ) as HTMLInputElement;

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
    const newProject: Project = {
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
    } else {
      alert('Only admin can create projects.');
      return;
    }

    this.hideCreateProjectModal();

    // Refresh projects list if current user is assigned user or admin
    this.renderProjects();
  }

  private handleLogin() {
    const emailInput = (
      document.getElementById('email') as HTMLInputElement
    ).value.trim();
    const passwordInput = (
      document.getElementById('password') as HTMLInputElement
    ).value.trim();

    // Dummy authentication: check if email matches a user
    const user = this.users.find((u) => u.email === emailInput);
    if (user) {
      this.currentUser = user;
      alert(`Welcome, ${user.name}!`);
      this.showSection('dashboard');
      this.updateAuthButtons();
      this.renderProjects();
    } else {
      alert('Invalid email or password');
    }
  }

  private handleLogout() {
    this.currentUser = null;
    alert('Logged out');
    this.showSection('login');
    this.updateAuthButtons();
  }

  private handleRegister(form: HTMLFormElement) {
    const name = (
      form.querySelector('#reg-name') as HTMLInputElement
    ).value.trim();
    const email = (
      form.querySelector('#reg-email') as HTMLInputElement
    ).value.trim();
    const password = (
      form.querySelector('#reg-password') as HTMLInputElement
    ).value.trim();
    const confirmPassword = (
      form.querySelector('#reg-confirm-password') as HTMLInputElement
    ).value.trim();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Check if email already exists
    if (this.users.some((u) => u.email === email)) {
      alert('Email already registered');
      return;
    }

    const newUser: User = {
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

  private renderProjects() {
    if (!this.projectsList) return;
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

      this.projectsList!.appendChild(projectCard);
    });
  }

  private renderUsers() {
    if (!this.usersTableBody) return;
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

      this.usersTableBody!.appendChild(tr);
    });

    // Add event listeners for delete buttons
    this.usersTableBody.querySelectorAll('.btn-delete').forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const userId = Number(target.getAttribute('data-user-id'));
        this.deleteUser(userId);
      });
    });
  }

  private deleteUser(userId: number) {
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
