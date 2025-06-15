// import {
//   Injectable,
//   ConflictException,
//   NotFoundException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Project } from './interface/project.interface';

// @Injectable()
// export class ProjectService {
//   private projects: Project[] = [];
//   private readonly adminEmail = 'admin@example.com'; // Only one admin

//   // Helper to check admin
//   private isAdmin(userEmail: string): boolean {
//     return userEmail === this.adminEmail;
//   }

//   // Admin: Create a project
//   createProject(data: Project, userEmail: string): Project {
//     if (!this.isAdmin(userEmail)) {
//       throw new ForbiddenException('Only admin can create projects');
//     }
//     const existing = this.projects.find((p) => p.title === data.title);
//     if (existing) {
//       throw new ConflictException(
//         `Project with title ${data.title} already exists`,
//       );
//     }
//     const newProject: Project = {
//       ...data,
//       completed: typeof data.completed === 'boolean' ? data.completed : false,
//       assignedUserId: undefined,
//     };
//     this.projects.push(newProject);
//     return newProject;
//   }

//   // Admin: Get all projects
//   getAllProjects(userEmail: string): Project[] {
//     if (!this.isAdmin(userEmail)) {
//       throw new ForbiddenException('Only admin can view all projects');
//     }
//     if (this.projects.length === 0) {
//       throw new ConflictException('No projects found');
//     }
//     return this.projects;
//   }

//   // Admin: Assign a project to a user (one project per user)
//   assignProjectToUser(
//     projectTitle: string,
//     userId: string,
//     userEmail: string,
//   ): string {
//     if (!this.isAdmin(userEmail)) {
//       throw new ForbiddenException('Only admin can assign projects');
//     }
//     const project = this.projects.find((p) => p.title === projectTitle);
//     if (!project) throw new NotFoundException('Project not found');
//     if (project.assignedUserId)
//       throw new ConflictException('Project already assigned');
//     const alreadyAssigned = this.projects.find(
//       (p) => p.assignedUserId === userId,
//     );
//     if (alreadyAssigned)
//       throw new ConflictException('User already assigned to a project');
//     project.assignedUserId = userId;
//     // TODO: Send email to user about assignment
//     return `Project '${projectTitle}' assigned to user '${userId}'`;
//   }

//   // Admin: Delete a project
//   deleteProject(projectTitle: string, userEmail: string): { message: string } {
//     if (!this.isAdmin(userEmail)) {
//       throw new ForbiddenException('Only admin can delete projects');
//     }
//     const idx = this.projects.findIndex((p) => p.title === projectTitle);
//     if (idx === -1) throw new NotFoundException('Project not found');
//     this.projects.splice(idx, 1);
//     return { message: `Project '${projectTitle}' deleted` };
//   }

//   // User: View assigned project
//   getUserAssignedProject(userId: string): Project | { message: string } {
//     const project = this.projects.find((p) => p.assignedUserId === userId);
//     if (!project) return { message: 'No project assigned' };
//     return project;
//   }

//   // User: Mark project as completed, admin gets notified
//   completeProject(userId: string): { message: string } {
//     const project = this.projects.find((p) => p.assignedUserId === userId);
//     if (!project) throw new NotFoundException('No project assigned');
//     project.completed = true;
//     // TODO: Send email to admin about completion
//     return {
//       message: `Project '${project.title}' marked as completed. Admin notified.`,
//     };
//   }
// }


import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Project } from './interface/project.interface';
import { MailerService } from '../mailer/mailer.service'; //Import custom MailerService

@Injectable()
export class ProjectService {
  private projects: Project[] = [];
  private readonly adminEmail = 'admin@example.com'; // Only one admin

  constructor(private readonly mailerService: MailerService) {} // Inject mailer

  private isAdmin(userEmail: string): boolean {
    return userEmail === this.adminEmail;
  }

  createProject(data: Project, userEmail: string): Project {
    if (!this.isAdmin(userEmail)) {
      throw new ForbiddenException('Only admin can create projects');
    }
    const existing = this.projects.find((p) => p.title === data.title);
    if (existing) {
      throw new ConflictException(
        `Project with title ${data.title} already exists`,
      );
    }
    const newProject: Project = {
      ...data,
      completed: typeof data.completed === 'boolean' ? data.completed : false,
      assignedUserId: undefined,
    };
    this.projects.push(newProject);
    return newProject;
  }

  getAllProjects(userEmail: string): Project[] {
    if (!this.isAdmin(userEmail)) {
      throw new ForbiddenException('Only admin can view all projects');
    }
    if (this.projects.length === 0) {
      throw new ConflictException('No projects found');
    }
    return this.projects;
  }

  async assignProjectToUser(
    projectTitle: string,
    userId: string,
    userEmail: string,
  ): Promise<string> {
    if (!this.isAdmin(userEmail)) {
      throw new ForbiddenException('Only admin can assign projects');
    }
    const project = this.projects.find((p) => p.title === projectTitle);
    if (!project) throw new NotFoundException('Project not found');
    if (project.assignedUserId)
      throw new ConflictException('Project already assigned');
    const alreadyAssigned = this.projects.find(
      (p) => p.assignedUserId === userId,
    );
    if (alreadyAssigned)
      throw new ConflictException('User already assigned to a project');
    project.assignedUserId = userId;

    // Send email to user 
    await this.mailerService.sendAssignmentEmail(userId, projectTitle);

    return `Project '${projectTitle}' assigned to user '${userId}'`;
  }

  deleteProject(projectTitle: string, userEmail: string): { message: string } {
    if (!this.isAdmin(userEmail)) {
      throw new ForbiddenException('Only admin can delete projects');
    }
    const idx = this.projects.findIndex((p) => p.title === projectTitle);
    if (idx === -1) throw new NotFoundException('Project not found');
    this.projects.splice(idx, 1);
    return { message: `Project '${projectTitle}' deleted` };
  }

  getUserAssignedProject(userId: string): Project | { message: string } {
    const project = this.projects.find((p) => p.assignedUserId === userId);
    if (!project) return { message: 'No project assigned' };
    return project;
  }

  async completeProject(userId: string): Promise<{ message: string }> {
    const project = this.projects.find((p) => p.assignedUserId === userId);
    if (!project) throw new NotFoundException('No project assigned');
    project.completed = true;

    // Notify admin
    await this.mailerService.notifyAdminOnCompletion(
      this.adminEmail,
      project.title,
      userId,
    );

    return {
      message: `Project '${project.title}' marked as completed. Admin notified.`,
    };
  }
}
