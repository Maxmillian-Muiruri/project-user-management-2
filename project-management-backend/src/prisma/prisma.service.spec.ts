/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    console.log('connected to the database via prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
