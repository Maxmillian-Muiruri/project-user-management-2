/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);
  private readonly adminEmail = 'admin@example.com';

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

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

    // Only DB operations inside the transaction
    await this.prisma.$transaction(async (prisma) => {
      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Assigned user does not exist');
      }

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

    // Send email OUTSIDE the transaction
    try {
      const email: SendEmailDto = {
        to: `${userId}@example.com`, // In real app, get email from user record
        subject: 'Project Assignment',
        text: `You have been assigned to project: ${projectTitle}`,
      };
      await this.mailerService.sendMail(email);
    } catch (emailError) {
      this.logger.error(
        `Failed to send assignment email: ${emailError.message}`,
      );
      // Don't fail the operation if email fails
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
    return this.prisma.$transaction(
      async (prisma: {
        project: {
          findFirst: (arg0: { where: { assignedUserId: string } }) => any;
          update: (arg0: {
            where: { id: any };
            data: { completed: boolean; updatedAt: Date };
          }) => any;
        };
      }) => {
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
      },
    );
  }
}
