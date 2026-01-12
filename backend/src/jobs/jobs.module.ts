import { Module } from '@nestjs/common';
import { TasksProcessor } from './tasks.processor';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    // Queue is registered in TasksModule, we just import it here
    // This eliminates the duplicate queue registration anti-pattern
    TasksModule,
  ],
  providers: [TasksProcessor],
})
export class JobsModule {}
