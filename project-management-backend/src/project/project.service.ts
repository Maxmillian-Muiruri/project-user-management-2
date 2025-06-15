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

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { SendEmailDto } from '../mailer/dto/send-email.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);
  private readonly adminEmail = 'admin@example.com';

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
  ) {}

  // Helper to check admin
  private isAdmin(userEmail: string): boolean {
    return userEmail === this.adminEmail;
  }

  async createProject(data: CreateProjectDto, userEmail: string): Promise<any> {
    if (!this.isAdmin(userEmail)) {
      throw new ForbiddenException('Only admin can create projects');
    }

    try {
      const existing = await this.prisma.project.findUnique({
        where: { title: data.title },
      });
      if (existing) {
        throw new ConflictException(
          `Project with title ${data.title} already exists`,
        );
      }

      return await this.prisma.project.create({
        data: {
          ...data,
          completed: data.completed ?? false,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create project: ${error.message}`);
      throw error;
    }
  }

  async getAllProjects(userEmail: string): Promise<any[]> {
    if (!this.isAdmin(userEmail)) {
      throw new ForbiddenException('Only admin can view all projects');
    }

    const projects = await this.prisma.project.findMany();
    if (projects.length === 0) {
      throw new NotFoundException('No projects found');
    }
    return projects;
  }

  async assignProjectToUser(
    projectTitle: string,
    userId: string,
    userEmail: string,
  ): Promise<string> {
    if (!this.isAdmin(userEmail)) {
      throw new ForbiddenException('Only admin can assign projects');
    }

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Assigned user does not exist');
    }

    await this.prisma.$transaction(async (prisma) => {
      const project = await prisma.project.findUnique({
        where: { title: projectTitle },
        include: { assignedUser: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }
      if (project.assignedUserId) {
        throw new ConflictException('Project already assigned');
      }

      const userAssignment = await prisma.project.findFirst({
        where: { assignedUserId: userId },
      });
      if (userAssignment) {
        throw new ConflictException('User already assigned to a project');
      }

      await prisma.project.update({
        where: { title: projectTitle },
        data: { assignedUserId: userId, updatedAt: new Date() },
      });
    });

    try {
      await this.mailerService.sendProjectAssignedEmail(
        user.email,
        user.name,
        projectTitle,
      );
    } catch (emailError) {
      this.logger.error(
        `Failed to send assignment email: ${emailError.message}`,
      );
    }

    return `Project '${projectTitle}' assigned to user '${userId}'`;
  }

  async deleteProject(
    projectTitle: string,
    userEmail: string,
  ): Promise<{ message: string }> {
    if (!this.isAdmin(userEmail)) {
      throw new ForbiddenException('Only admin can delete projects');
    }

    const project = await this.prisma.project.findUnique({
      where: { title: projectTitle },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.delete({ where: { title: projectTitle } });
    return { message: `Project '${projectTitle}' deleted` };
  }

  async getUserAssignedProject(
    userId: string,
  ): Promise<any | { message: string }> {
    const project = await this.prisma.project.findFirst({
      where: { assignedUserId: userId },
      include: { assignedUser: true },
    });
    return project ?? { message: 'No project assigned' };
  }

  async completeProject(userId: string): Promise<{ message: string }> {
    return this.prisma.$transaction(async (prisma) => {
      const project = await prisma.project.findFirst({
        where: { assignedUserId: userId },
      });

      if (!project) {
        throw new NotFoundException('No project assigned');
      }

      const updatedProject = await prisma.project.update({
        where: { id: project.id },
        data: { completed: true, updatedAt: new Date() },
      });

      try {
        const email: SendEmailDto = {
          to: this.adminEmail,
          subject: 'Project Completed',
          text: `Project "${updatedProject.title}" completed by user ${userId}`,
          project: '',
          name: '',
        };
        await this.mailerService.sendMail(email);
      } catch (emailError) {
        this.logger.error(
          `Failed to send completion email: ${emailError.message}`,
        );
      }

      return {
        message: `Project '${updatedProject.title}' marked as completed. Admin notified.`,
      };
    });
  }
}
