# Code Citations

## License: unknown

https://github.com/kir-dev/tanfolyam/tree/c5ca0ed9393728af02a6d95c2a15cdf82b61eec0/2023-tavasz/node-tanfolyam/slides-node-2.html

```
'@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.
```

## License: MIT

https://github.com/nestjs/nest/tree/ecdd86f688462ae717a621ee2c7be7b7ef53797d/sample/22-graphql-prisma/src/prisma/prisma.service.ts

```
';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close
```

## License: unknown

https://github.com/solitasroh/todo-backend/tree/158cc5ca76dea278fa57478ca918894b3c6b02ad/src/services/prisma.service.ts

```
Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(
```
