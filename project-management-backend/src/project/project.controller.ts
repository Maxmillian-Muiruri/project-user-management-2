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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('project')
@UsePipes(new ValidationPipe())
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() data: CreateProjectDto,
    @Query('userEmail') userEmail: string,
  ) {
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

  @Get()
  async getAll(@Query('userEmail') userEmail: string) {
    try {
      const projects = await this.projectService.getAllProjects(userEmail);
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

  @Post('assign')
  async assign(
    @Query('userEmail') userEmail: string,
    @Body() body: { projectTitle: string; userId: string },
  ) {
    try {
      const result = await this.projectService.assignProjectToUser(
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

  @Delete(':title')
  async delete(
    @Param('title') title: string,
    @Query('userEmail') userEmail: string,
  ) {
    try {
      const result = await this.projectService.deleteProject(title, userEmail);
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
