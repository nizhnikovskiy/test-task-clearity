import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import {
  TASKS_QUEUE,
  PROCESS_TASK_JOB,
  PRIORITY_MAP,
  MAX_PAGE_LIMIT,
} from '../common/constants';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectQueue(TASKS_QUEUE)
    private readonly tasksQueue: Queue,
  ) { }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // NOTE: This operation is not wrapped in a transaction. If queue enqueuing fails,
    // the task will remain in PENDING status for manual retry. For future production use,
    // consider implementing a saga pattern or outbox pattern for guaranteed job enqueuing.
    const task = this.taskRepository.create(createTaskDto);
    const savedTask = await this.taskRepository.save(task);

    try {
      // Enqueue background job for processing with priority
      await this.tasksQueue.add(
        PROCESS_TASK_JOB,
        {
          taskId: savedTask.id,
        },
        {
          priority: PRIORITY_MAP[savedTask.priority] || PRIORITY_MAP.MEDIUM,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );
    } catch (error) {
      // Log the error but don't fail the request - task can be requeued manually
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to enqueue task ${savedTask.id}: ${errorMessage}`,
        errorStack,
      );
      // Update task status to indicate queue failure for manual retry
      await this.taskRepository.update(savedTask.id, {
        status: TaskStatus.PENDING,
      });
    }

    return savedTask;
  }

  async findAll(filterDto: TaskFilterDto) {
    const {
      status,
      priority,
      search,
      page = 1,
      includeDeleted = false,
    } = filterDto;
    // Enforce max page limit
    const limit = Math.min(filterDto.limit || 10, MAX_PAGE_LIMIT);

    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    // Include soft-deleted tasks if requested
    if (includeDeleted) {
      queryBuilder.withDeleted();
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit).orderBy('task.createdAt', 'DESC');

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Find a task by ID, returns null if not found (no exception)
   * Useful for processors that need to handle missing tasks gracefully
   */
  async findOneOrNull(id: string): Promise<Task | null> {
    return this.taskRepository.findOne({ where: { id } });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    Object.assign(task, updateTaskDto);

    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.taskRepository.softDelete(id);
  }

  /**
   * Atomically complete a task - sets both processedAt and status in a single update
   * This prevents race conditions where one update succeeds but the other fails
   */
  async completeTask(id: string): Promise<Task> {
    const task = await this.findOne(id);
    task.processedAt = new Date();
    task.status = TaskStatus.COMPLETED;
    return this.taskRepository.save(task);
  }



  async cancel(id: string): Promise<Task> {
    const task = await this.findOne(id);
    task.status = TaskStatus.CANCELLED;
    return this.taskRepository.save(task);
  }
}
