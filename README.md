# Task Management System

A fullstack task management application with background job processing built with NestJS, PostgreSQL, Next.js 15, and BullMQ.

## Features

- ✅ Create, read, update, and delete tasks (CRUD operations)
- ✅ Filter tasks by status and priority
- ✅ Search tasks by title and description
- ✅ Pagination for task lists
- ✅ Background job processing with BullMQ and Redis
- ✅ Soft delete functionality
- ✅ Real-time task processing timestamps
- ✅ Responsive UI with Tailwind CSS v4
- ✅ API documentation with Swagger
- ✅ Form validation on both frontend and backend

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for database operations
- **PostgreSQL 16** - Relational database
- **BullMQ** - Background job queue with Redis
- **Swagger** - API documentation

### Frontend
- **Next.js 15** - React framework with App Router
- **React Query** - Data fetching and caching
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Hook Form** - Form validation and management
- **Axios** - HTTP client

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Redis 7** - In-memory data store for job queue

## Prerequisites

- **Node.js** 20+ and npm
- **Docker Desktop** (for PostgreSQL and Redis)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd test-task-clearity
```

### 2. Start Docker Services

Start PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker ps
```

You should see `postgres` and `redis` containers running.

### 3. Setup Backend

```bash
cd backend
npm install
```

Run database migrations:

```bash
npm run migration:run
```

Start the backend server:

```bash
npm run start:dev
```

Backend will be available at:
- API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api

### 4. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: http://localhost:3001

## Project Structure

```
test-task-clearity/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── tasks/              # Task module (entity, DTOs, service, controller)
│   │   ├── jobs/               # Background job processor
│   │   ├── database/           # Database config and migrations
│   │   ├── app.module.ts       # Main app module
│   │   └── main.ts             # Entry point
│   └── package.json
├── frontend/                   # Next.js Frontend
│   ├── app/                    # Next.js App directory
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── TaskForm.tsx        # Create/Edit form
│   │   ├── TaskList.tsx        # Task list with edit/delete
│   │   ├── Filters.tsx         # Search and filter controls
│   │   ├── Pagination.tsx      # Pagination component
│   │   └── providers.tsx       # React Query provider
│   ├── lib/                    # API client and hooks
│   │   ├── api.ts              # Axios client and types
│   │   └── queries.ts          # React Query hooks
│   └── package.json
├── docker-compose.yml          # PostgreSQL + Redis
└── README.md
```

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks with filtering & pagination |
| GET | `/tasks/:id` | Get single task |
| POST | `/tasks` | Create new task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Soft delete task |

### Query Parameters (for GET /tasks)

- `status` - Filter by status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `search` - Search in title and description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Example API Call

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive README",
    "priority": "HIGH",
    "dueDate": "2026-01-15"
  }'

# Get tasks with filters
curl "http://localhost:3000/tasks?status=PENDING&priority=HIGH&page=1&limit=10"
```

## Environment Variables

### Backend (backend/.env)

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=taskmanager

REDIS_HOST=localhost
REDIS_PORT=6379

BACKEND_PORT=3000
NODE_ENV=development

FRONTEND_URL=http://localhost:3001
```

### Frontend (frontend/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Technical Decisions

### Architecture

**Why separate NestJS backend instead of Next.js API Routes?**
- BullMQ and background job processing work better in a traditional Node.js environment
- Demonstrates backend architecture skills including dependency injection and modular design
- Easier to scale backend and frontend independently in production
- Aligns with the recommended stack in the assignment

### Database Design

- **UUID Primary Keys**: Better for distributed systems and security
- **Enum Types**: Type-safe status and priority values stored at database level
- **Soft Deletes**: Preserves data for auditing (`deletedAt` column)
- **Indexes**: On `status`, `priority`, and `deletedAt` for efficient filtering

### Background Jobs

- Jobs are triggered automatically when a task is created
- Simulates processing time (2-5 seconds)
- Updates `processedAt` timestamp upon completion
- Implements retry logic with exponential backoff on failures

### Frontend State Management

- React Query manages server state with automatic caching and invalidation
- Optimistic updates for better UX
- Debounced search (300ms) to reduce API calls
- Loading skeletons and error states for better UX

## Stopping the Application

```bash
# Stop backend (Ctrl+C in backend terminal)

# Stop frontend (Ctrl+C in frontend terminal)

# Stop Docker services
docker-compose down

# Stop Docker services and remove volumes (caution: deletes data)
docker-compose down -v
```

## Development Workflow

1. Make sure Docker services are running: `docker-compose up -d`
2. Run backend: `cd backend && npm run start:dev`
3. Run frontend: `cd frontend && npm run dev`
4. Access Swagger docs: http://localhost:3000/api
5. Access application: http://localhost:3001

## Future Enhancements

- User authentication and authorization
- Task assignments to users
- Task comments and attachments
- Real-time updates with WebSockets
- Email notifications
- Advanced filtering (date ranges, tags)
- Task analytics dashboard
- Unit and E2E tests

## License

This project is for demonstration purposes as part of a technical assessment.
