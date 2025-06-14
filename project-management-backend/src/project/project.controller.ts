import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from './interface/project.interface';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // Admin: Create a project
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Project, @Query('userEmail') userEmail: string) {
    try {
      const project = this.projectService.createProject(data, userEmail);
      return {
        success: true,
        message: 'Project created successfully',
        data: project,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create project',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Admin: Get all projects
  @Get()
  getAll(@Query('userEmail') userEmail: string) {
    try {
      const projects = this.projectService.getAllProjects(userEmail);
      return {
        success: true,
        message: `Retrieved ${projects.length} projects`,
        data: projects,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Admin: Assign a project to a user
  @Post('assign')
  assign(
    @Query('userEmail') userEmail: string,
    @Body() body: { projectTitle: string; userId: string },
  ) {
    try {
      const result = this.projectService.assignProjectToUser(
        body.projectTitle,
        body.userId,
        userEmail,
      );
      return {
        success: true,
        message: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to assign project',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Admin: Delete a project
  @Delete(':title')
  delete(@Param('title') title: string, @Query('userEmail') userEmail: string) {
    try {
      const result = this.projectService.deleteProject(title, userEmail);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete project',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
