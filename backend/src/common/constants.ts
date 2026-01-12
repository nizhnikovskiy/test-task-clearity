/**
 * Shared constants for the backend application
 */

// Queue names
export const TASKS_QUEUE = 'tasks';
export const PROCESS_TASK_JOB = 'process-task';

// BullMQ priority mapping (lower number = higher priority)
export const PRIORITY_MAP: Record<string, number> = {
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

// Processing delay mapping in milliseconds
export const PROCESSING_DELAY_MAP: Record<string, number> = {
  URGENT: 5000,
  HIGH: 10000,
  MEDIUM: 15000,
  LOW: 20000,
};

// Default processing delay
export const DEFAULT_PROCESSING_DELAY = 15000;

// Pagination limits
export const MAX_PAGE_LIMIT = 100;
export const DEFAULT_PAGE_LIMIT = 10;
