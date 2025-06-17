/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dtos';
import { User as PrismaUser } from '@prisma/client';
import { Role } from '@prisma/client';

type UserResponse = Omit<PrismaUser, 'password'>;
@Injectable()
export class UserService {
  // prisma = new PrismaClient();
  constructor(private readonly prisma: PrismaService) {}

  private exclude<T extends Record<string, any>, Key extends keyof T>(
    user: T,
    keys: Key[],
  ): Omit<T, Key> {
    return Object.fromEntries(
      Object.entries(user).filter(([key]) => !keys.includes(key as Key)),
    ) as Omit<T, Key>;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: Role[createUserDto.role],
      },
    });

    const { password: _password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.prisma.user.findMany();
    return users.map(({ password: _password, ...user }) => user);
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    let hashedPassword = user.password;
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    const { password: _password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
  }

               //buffer_for_mailer
               //buffer_for_mailer
               //buffer_for_mailer



  async getUserById(id: string): Promise<PrismaUser | null> {
  return this.prisma.user.findUnique({ where: { id } });
}

}
