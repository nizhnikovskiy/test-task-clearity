import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TasksService } from '../tasks/tasks.service';
import { TaskStatus } from '../tasks/entities/task.entity';
import {
  TASKS_QUEUE,
  PROCESSING_DELAY_MAP,
  DEFAULT_PROCESSING_DELAY,
} from '../common/constants';

@Processor(TASKS_QUEUE)
export class TasksProcessor extends WorkerHost {
  private readonly logger = new Logger(TasksProcessor.name);

  constructor(private readonly tasksService: TasksService) {
    super();
  }

  async process(job: Job<{ taskId: string }>): Promise<void> {
    this.logger.log(`Processing job ${job.id} for task ${job.data.taskId}`);

    try {
      // Use findOneOrNull to handle missing tasks gracefully without wasting retries
      const task = await this.tasksService.findOneOrNull(job.data.taskId);

      if (!task) {
        this.logger.warn(`Task ${job.data.taskId} not found, skipping job`);
        return; // Don't retry - task doesn't exist
      }

      // If task is cancelled, skip processing
      if (task.status === TaskStatus.CANCELLED) {
        this.logger.log(
          `Task ${job.data.taskId} was cancelled, skipping processing`,
        );
        return;
      }

      // If task is already completed or in progress, skip
      if (
        task.status === TaskStatus.COMPLETED ||
        task.status === TaskStatus.IN_PROGRESS
      ) {
        this.logger.log(
          `Task ${job.data.taskId} is already ${task.status}, skipping`,
        );
        return;
      }

      // Update status to IN_PROGRESS
      await this.tasksService.update(job.data.taskId, {
        status: TaskStatus.IN_PROGRESS,
      });

      // Simulate background processing with priority-based execution time
      await this.simulateProcessing(task.priority);

      // Check again if task was cancelled during processing
      const updatedTask = await this.tasksService.findOneOrNull(
        job.data.taskId,
      );
      if (!updatedTask || updatedTask.status === TaskStatus.CANCELLED) {
        this.logger.log(
          `Task ${job.data.taskId} was cancelled during processing`,
        );
        return;
      }

      // Atomically complete the task (sets both processedAt and status)
      await this.tasksService.completeTask(job.data.taskId);

      this.logger.log(
        `Successfully processed job ${job.id} for task ${job.data.taskId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process job ${job.id} for task ${job.data.taskId}`,
        error,
      );
      throw error; // This will trigger BullMQ's retry mechanism
    }
  }

  private async simulateProcessing(priority: string): Promise<void> {
    const delay = PROCESSING_DELAY_MAP[priority] || DEFAULT_PROCESSING_DELAY;
    this.logger.log(`Processing with ${priority} priority (${delay}ms delay)`);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
