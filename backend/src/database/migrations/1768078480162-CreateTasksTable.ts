import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTasksTable1768078480162 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension first (required for uuid_generate_v4())
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create enum types
    await queryRunner.query(`
            CREATE TYPE task_status_enum AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
        `);

    await queryRunner.query(`
            CREATE TYPE task_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
        `);

    // Create tasks table
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'task_status_enum',
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'priority',
            type: 'task_priority_enum',
            default: "'MEDIUM'",
            isNullable: false,
          },
          {
            name: 'dueDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'processedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for better query performance
    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_TASK_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_TASK_PRIORITY',
        columnNames: ['priority'],
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_TASK_DELETED_AT',
        columnNames: ['deletedAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('tasks', 'IDX_TASK_DELETED_AT');
    await queryRunner.dropIndex('tasks', 'IDX_TASK_PRIORITY');
    await queryRunner.dropIndex('tasks', 'IDX_TASK_STATUS');

    // Drop table
    await queryRunner.dropTable('tasks');

    // Drop enum types
    await queryRunner.query(`DROP TYPE task_priority_enum;`);
    await queryRunner.query(`DROP TYPE task_status_enum;`);
  }
}
