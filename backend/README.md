# TickUp OKR Management System - Backend Setup Guide

## Project Structure

```
tickup-backend/
├── prisma/
│   ├── schema.prisma       # Prisma database schema
│   ├── seed.ts             # Seed script for test data
│   └── migrations/         # Database migrations
├── src/
│   ├── index.ts            # Main Express server
│   └── routes/
│       ├── objectives.ts   # Objectives API endpoints
│       └── users.ts        # Users API endpoints
├── .env                    # Environment variables
├── package.json
└── tsconfig.json
```

## Prerequisites

- **Node.js** (v18+)
- **MySQL** database server (via PHPMyAdmin or direct installation)
- **npm** or **yarn**

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- Express.js (server framework)
- Prisma (ORM)
- TypeScript
- CORS (for frontend communication)
- dotenv (environment configuration)

### 2. Configure Database Connection

Edit `backend/.env` with your MySQL credentials:

```env
# For local MySQL via XAMPP/WampServer/Docker
DATABASE_URL="mysql://root:password@localhost:3306/tickup_db?schema=public"

# Or via PHPMyAdmin connection string
DATABASE_URL="mysql://username:password@phpmyadmin-host:3306/tickup_db?schema=public"

PORT=5000
NODE_ENV=development
```

**Database Setup:**
1. Create a new MySQL database named `tickup_db`:
   ```sql
   CREATE DATABASE tickup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Or use PHPMyAdmin:
   - Go to http://localhost/phpmyadmin (or your PHPMyAdmin URL)
   - Click "New" → Enter database name `tickup_db`
   - Click "Create"

### 3. Setup Prisma & Create Database Schema

```bash
cd backend
npx prisma migrate dev --name init
```

This command will:
- Create tables in MySQL based on `schema.prisma`
- Generate Prisma Client
- Run seed script to populate test data

### 4. Seed Test Data (Optional)

Test data is automatically seeded by the migration. To reseed:

```bash
cd backend
npm run prisma:seed
```

This creates:
- 4 test users (u-akbari, u-hosseini, u-rezaei, u-mohammadi)
- 1 sample objective
- 1 sample key result

### 5. Start the Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
✓ Server running at http://localhost:5000
✓ Database connected
```

## Database Schema

### Core Models

#### User
```
id: String (CUID)
name: String
email: String (unique)
avatar: String? (optional)
createdAt: DateTime
updatedAt: DateTime
```

#### Objective
```
id: String (CUID)
title: String
description: String? (LongText)
category: String (enum: BUSINESS_GROWTH, CUSTOMER_MARKET, etc.)
color: String (hex or name, default: "gray")
quarter: String? (format: "1404-Q1", "1404-Q2", etc.)
endDate: DateTime?
isArchived: Boolean
parentId: String? (for hierarchical objectives)
ownerId: String (foreign key → User.id)
createdAt: DateTime
updatedAt: DateTime
```

#### KeyResult
```
id: String (CUID)
title: String
description: String? (LongText)
category: String (STANDARD | STRETCH | BINARY | ASSIGNMENT)
type: String (NUMBER | PERCENTAGE | CURRENCY, default: "NUMBER")
unit: String? (%, $, units, etc.)
startValue: Float (default: 0)
currentValue: Float (default: 0)
targetValue: Float (default: 0)
startDate: DateTime?
endDate: DateTime?
status: String? (ON_TRACK | NEEDS_ATTENTION | OFF_TRACK | CHALLENGE)
reportFrequency: String? (DAILY | WEEKLY)
isArchived: Boolean
objectiveId: String (foreign key → Objective.id)
ownerId: String (foreign key → User.id)
createdAt: DateTime
updatedAt: DateTime
```

#### CheckIn
```
id: String (CUID)
value: Float
confidence: Int? (1-10 scale)
notes: String? (LongText)
keyResultId: String (foreign key → KeyResult.id)
createdById: String (foreign key → User.id)
createdAt: DateTime
updatedAt: DateTime
```

#### Comment
```
id: String (CUID)
content: String (LongText)
objectiveId: String? (foreign key → Objective.id, nullable)
keyResultId: String? (foreign key → KeyResult.id, nullable)
createdById: String (foreign key → User.id)
createdAt: DateTime
updatedAt: DateTime
```

## API Endpoints

### Objectives

#### List all objectives
```
GET /api/objectives
```

Response:
```json
[
  {
    "id": "obj-123",
    "title": "Example Objective",
    "description": "...",
    "category": "BUSINESS_GROWTH",
    "color": "green",
    "quarter": "1404-Q1",
    "ownerId": "u-akbari",
    "owner": { "id": "u-akbari", "name": "علی اکبری", "email": "..." },
    "keyResults": [...],
    "createdAt": "2025-12-10T...",
    "updatedAt": "2025-12-10T..."
  }
]
```

#### Get objective by ID
```
GET /api/objectives/:id
```

#### Create new objective
```
POST /api/objectives
Content-Type: application/json

{
  "title": "افزایش کیفیت",
  "description": "بهینه‌سازی تولید",
  "category": "QUALITY_STANDARDS",
  "color": "green",
  "quarter": "1404-Q1",
  "endDate": "2025-12-31",
  "ownerId": "u-akbari",
  "parentId": null
}
```

Response: `201 Created`

#### Update objective
```
PUT /api/objectives/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "isArchived": false,
  ...
}
```

#### Delete objective (soft delete - archives it)
```
DELETE /api/objectives/:id
```

#### Get key results for objective
```
GET /api/objectives/:id/key-results
```

### Users

#### List all users
```
GET /api/users
```

#### Get user by ID
```
GET /api/users/:id
```

#### Create new user
```
POST /api/users
Content-Type: application/json

{
  "id": "u-new-user",
  "name": "نام کاربر",
  "email": "user@example.com",
  "avatar": "https://..."
}
```

## Frontend Integration

### Setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Update `.env` to connect to backend:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start frontend:
```bash
npm run dev
```

### API Client Usage

The frontend API client is in `frontend/services/api.ts`:

```typescript
import { apiClient } from './services/api';

// Create objective
const newObjective = await apiClient.objectives.create({
  title: 'My Objective',
  description: 'Description',
  category: 'BUSINESS_GROWTH',
  color: 'blue',
  quarter: '1404-Q1',
  ownerId: 'u-akbari'
});

// List objectives
const objectives = await apiClient.objectives.list();

// Get users for dropdown
const users = await apiClient.users.list();

// Update objective
await apiClient.objectives.update('obj-123', {
  title: 'Updated Title',
  isArchived: false
});

// Delete objective
await apiClient.objectives.delete('obj-123');
```

## Testing the Full Workflow

### 1. Start MySQL
```bash
# If using XAMPP
# Start Apache + MySQL from XAMPP Control Panel

# Or if using command line
mysql -u root -p
# Enter password (usually blank for local installation)
```

### 2. Create Database
```sql
CREATE DATABASE tickup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Run Backend Migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Start Backend Server
```bash
cd backend
npm run dev
```

Should output:
```
✓ Server running at http://localhost:5000
✓ Database connected
```

### 5. Start Frontend (in another terminal)
```bash
cd frontend
npm run dev
```

### 6. Test the Form

1. Open http://localhost:5173 (frontend URL)
2. Click "ایجاد" (Create) button
3. Fill the form:
   - **Title**: "تست هدف جدید"
   - **Description**: "این یک تست است"
   - **Category**: Select any category
   - **Owner**: Select a user (u-akbari, u-hosseini, etc.)
   - **Color**: Pick a color
   - **Quarter**: Select "1404-Q1"
   - **End Date**: Select a date
4. Click "ثبت" (Save)
5. The objective should appear in the list

### 7. Verify in Database

```bash
cd backend
npm run prisma:studio
```

This opens Prisma Studio at http://localhost:5555 where you can:
- View all objectives in the database
- View all users
- View key results
- Edit/delete records visually

## Troubleshooting

### "Cannot connect to database"
- Check MySQL is running
- Verify DATABASE_URL in `.env`
- Ensure database name matches

### "Port 5000 already in use"
- Change PORT in `.env`
- Or kill existing process: `lsof -i :5000` then `kill -9 <PID>`

### "Module not found"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

### Clear database and start fresh
```bash
cd backend
npx prisma migrate reset --force
```

## Architecture Overview

```
Frontend (React) ←→ Express API ←→ Prisma ORM ←→ MySQL
   |
   └─ Service: api.ts (API calls)
   └─ Component: NewObjectiveForm (form UI)
   └─ State: App.tsx (handleSaveObjective)

Backend (Node.js)
   |
   └─ Routes: objectives.ts, users.ts (endpoints)
   └─ Prisma Client (database queries)
   └─ schema.prisma (database models)
```

## Next Steps

1. **Add Key Results API**: Create POST endpoint for adding key results
2. **Add Check-ins**: Create endpoint for check-in submissions
3. **Add Filtering**: Implement quarter/category filtering in API
4. **Authentication**: Add JWT token-based auth
5. **Pagination**: Add limit/offset for large datasets
6. **Error Handling**: Improve error messages and validation

## Useful Commands

```bash
# Watch mode (auto-restart on changes)
npm run dev

# Build for production
npm run build
npm start

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio

# Check migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name describe_changes_here

# Reset database (WARNING: deletes all data)
npx prisma migrate reset --force

# Generate Prisma Client
npx prisma generate
```

## Environment Variables Reference

```env
# Database
DATABASE_URL=mysql://[user]:[password]@[host]:[port]/[database]?schema=public

# Server
PORT=5000
NODE_ENV=development|production
```

---

**Created**: 2025-12-10
**Status**: ✅ Ready for testing
