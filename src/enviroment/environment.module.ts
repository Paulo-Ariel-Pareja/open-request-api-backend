import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';
import { Environment, EnvironmentSchema } from './entities/enviroment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Environment.name, schema: EnvironmentSchema },
    ]),
  ],
  controllers: [EnvironmentController],
  providers: [EnvironmentService],
})
export class EnvironmentModule {}
