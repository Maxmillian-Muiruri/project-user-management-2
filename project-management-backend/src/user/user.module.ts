import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';

// Import necessary modules and services
@Module({
  imports: [PrismaModule], // Import PrismaModule for database access
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export for use in other modules (like Auth)
})
export class UserModule {}

// This module defines the UserModule, which includes the UserController and UserService.
// It exports the UserService so that it can be used in other modules, such as an authentication module.
// The UserController handles user-related requests, while the UserService contains the business logic for managing users.
// This structure allows for a clean separation of concerns, making the codebase modular and maintainable.
// The UserModule can be imported into the main application module or any other module that requires user management functionality.
// The UserModule is a core part of the application, managing user-related operations such as creation, retrieval, and updates.
// This module can be extended with additional features like user authentication, role management, and more as the application grows.
