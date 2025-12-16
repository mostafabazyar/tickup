# Quick Start - Form to Database Connection

## What We Created

This implementation connects your React form (`NewObjectiveForm.tsx`) to a MySQL database via:
1. **Prisma ORM** - Database abstraction layer
2. **Express API** - Backend server with REST endpoints
3. **API Client** - Frontend service for making HTTP requests

## Form Fields & Database Schema

When you fill the objective creation form, these fields map to the database:

| Form Input | Database Field | Type | Required | Notes |
|-----------|----------------|------|----------|-------|
| Title | `Objective.title` | String | Yes | Main objective name |
| Description | `Objective.description` | Text | No | Optional details |
| Category | `Objective.category` | String | Yes | Enum: BUSINESS_GROWTH, CUSTOMER_MARKET, etc. |
| Owner/Assignee | `Objective.ownerId` | String (FK) | Yes | References User.id |
| Color | `Objective.color` | String | Yes | Color picker value |
| Quarter | `Objective.quarter` | String | No | Format: "1404-Q1" |
| End Date | `Objective.endDate` | DateTime | No | Optional deadline |
| Parent Objective | `Objective.parentId` | String (FK) | No | For hierarchy (optional) |

## Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Create MySQL Database
```sql
CREATE DATABASE tickup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Setup Database Schema
```bash
cd backend
npx prisma migrate dev --name init
```

This:
- Creates all tables in MySQL
- Seeds test data (4 users)
- Generates Prisma Client

### Step 4: Start Backend Server
```bash
cd backend
npm run dev
```

Output should be:
```
✓ Server running at http://localhost:5000
```

### Step 5: Start Frontend
```bash
cd frontend
npm run dev
```

## File Overview

### Backend Files Created

1. **`backend/prisma/schema.prisma`** (150 lines)
   - Database schema definition
   - Models: User, Objective, KeyResult, CheckIn, Comment
   - Relationships and indexes

2. **`backend/src/index.ts`** (60 lines)
   - Express server setup
   - CORS configuration
   - Routes registration

3. **`backend/src/routes/objectives.ts`** (185 lines)
   - GET /api/objectives (list all)
   - GET /api/objectives/:id (get one)
   - POST /api/objectives (create)
   - PUT /api/objectives/:id (update)
   - DELETE /api/objectives/:id (soft delete)
   - GET /api/objectives/:id/key-results (child key results)

4. **`backend/src/routes/users.ts`** (60 lines)
   - GET /api/users (list all)
   - GET /api/users/:id (get one)
   - POST /api/users (create)

5. **`backend/package.json`**
   - Dependencies: Express, Prisma, TypeScript, CORS
   - Scripts: dev, build, prisma:migrate, prisma:seed

6. **`backend/prisma/seed.ts`**
   - Creates 4 test users
   - Creates 1 sample objective
   - Seeds initial data

7. **`backend/.env`**
   - Database URL connection string
   - Port configuration

8. **`backend/tsconfig.json`**
   - TypeScript compilation settings

### Frontend Files Modified

1. **`frontend/services/api.ts`** (New)
   - API client class with methods:
     - `apiClient.objectives.list()`
     - `apiClient.objectives.create(data)`
     - `apiClient.objectives.update(id, data)`
     - `apiClient.objectives.delete(id)`
     - `apiClient.users.list()`
     - `apiClient.users.get(id)`

2. **`frontend/App.tsx`** (Modified)
   - Added import: `import { apiClient } from './services/api'`
   - Updated `handleSaveObjective()` to call API
   - Falls back to local state if API fails

3. **`frontend/.env`** (Modified)
   - Added: `VITE_API_URL=http://localhost:5000/api`

## Database Schema Diagram

```
┌──────────────┐
│    User      │
├──────────────┤
│ id (PK)      │
│ name         │
│ email (UQ)   │
│ avatar       │
│ createdAt    │
└──────────────┘
       │
       │ (owns)
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Objective   │  │  KeyResult   │  │   CheckIn    │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ title        │  │ title        │  │ value        │
│ description  │  │ description  │  │ confidence   │
│ category     │  │ category     │  │ notes        │
│ color        │  │ type         │  │ createdBy(FK)│
│ quarter      │  │ startValue   │  │ keyResult(FK)│
│ endDate      │  │ currentValue │  │ createdAt    │
│ owner(FK)    │  │ targetValue  │  └──────────────┘
│ parent(FK)   │  │ status       │
│ isArchived   │  │ owner(FK)    │
│ createdAt    │  │ objective(FK)│
└──────────────┘  │ isArchived   │
       │          │ createdAt    │
       │          └──────────────┘
       │                 │
       │ (hierarchical)  │ (has)
       │                 │
       └─────────────────┘
```

## How Data Flows

### Creating an Objective

```
User fills form in browser
         ↓
Form calls handleSaveObjective()
         ↓
apiClient.objectives.create({...})  ← Sends HTTP POST
         ↓
Backend Express server receives request
         ↓
Route handler validates data
         ↓
Prisma creates record in MySQL
         ↓
Returns created objective (with ID)
         ↓
Frontend updates local state
         ↓
Objective appears in list
```

### Data Storage

```
React Component → Form State
                    ↓ (on submit)
                API Client
                    ↓ (HTTP POST)
                Express Route
                    ↓ (validate)
                Prisma ORM
                    ↓ (SQL query)
                MySQL Database (persistent)
```

## API Response Examples

### Create Objective Request
```bash
curl -X POST http://localhost:5000/api/objectives \
  -H "Content-Type: application/json" \
  -d '{
    "title": "افزایش کیفیت",
    "description": "بهینه سازی تولید",
    "category": "QUALITY_STANDARDS",
    "color": "green",
    "quarter": "1404-Q1",
    "endDate": "2025-12-31",
    "ownerId": "u-akbari"
  }'
```

### Create Objective Response
```json
{
  "id": "cl9yx1234567890abcdef",
  "title": "افزایش کیفیت",
  "description": "بهینه سازی تولید",
  "category": "QUALITY_STANDARDS",
  "color": "green",
  "quarter": "1404-Q1",
  "endDate": "2025-12-31T00:00:00.000Z",
  "ownerId": "u-akbari",
  "parentId": null,
  "isArchived": false,
  "createdAt": "2025-12-10T14:30:00.000Z",
  "updatedAt": "2025-12-10T14:30:00.000Z",
  "owner": {
    "id": "u-akbari",
    "name": "علی اکبری",
    "email": "akbari@example.com",
    "avatar": null,
    "createdAt": "2025-12-10T14:00:00.000Z",
    "updatedAt": "2025-12-10T14:00:00.000Z"
  },
  "keyResults": []
}
```

## Objective Categories (12 types)

```
BUSINESS_GROWTH          (رشد و توسعه کسب‌وکار)
CUSTOMER_MARKET          (مشتری و بازار)
PRODUCT_INNOVATION       (محصول و نوآوری)
PROCESS_EFFICIENCY       (فرآیندها و بهره‌وری)
HR_CULTURE              (منابع انسانی و فرهنگ سازمانی)
FINANCE_PROFITABILITY   (مالی و سودآوری)
SALES                   (فروش)
LEGAL_COMPLIANCE        (حقوقی و انطباق)
SUSTAINABILITY          (پایداری و مسئولیت اجتماعی)
QUALITY_STANDARDS       (کیفیت و استانداردها)
TECH_DIGITALIZATION     (فناوری و دیجیتال‌سازی)
COMMUNICATION_BRANDING  (ارتباطات و برندینگ)
```

## Test Users (Pre-seeded)

| ID | Name | Email |
|----|----|---|
| u-akbari | علی اکبری | akbari@example.com |
| u-hosseini | حسین حسینی | hosseini@example.com |
| u-rezaei | رضا رضایی | rezaei@example.com |
| u-mohammadi | محمد محمدی | mohammadi@example.com |

## Common Issues & Solutions

### "Cannot GET /api/objectives"
- Backend not running? Run `npm run dev` in backend folder
- Wrong URL? Check `VITE_API_URL` in frontend `.env`

### "Cannot connect to database"
- MySQL not running? Start your MySQL server
- Wrong credentials? Update `DATABASE_URL` in backend `.env`

### Form submits but nothing happens
- Check browser console for errors (F12)
- Check backend console for error messages
- Ensure backend is running on port 5000

### "Module not found" errors
- Run `npm install` in both backend and frontend folders
- Delete `node_modules` and run `npm install` again

## Next Enhancements

1. **Add Key Results form** - Create endpoint and form for adding KRs
2. **Add Check-ins** - Form to log progress updates
3. **Add Comments** - Discussion thread functionality
4. **Add Filtering** - Filter by quarter, category, owner
5. **Add Pagination** - Limit results per page
6. **Add Search** - Full-text search for objectives
7. **Add Sorting** - Sort by date, progress, owner
8. **Add Authentication** - JWT tokens instead of no auth
9. **Add Validation** - Better input validation and error messages
10. **Add Tests** - Unit and integration tests

## Verification Checklist

- [ ] MySQL database created and running
- [ ] Backend dependencies installed (`npm install`)
- [ ] Prisma migration ran successfully (`npx prisma migrate dev --name init`)
- [ ] Backend server starts without errors (`npm run dev`)
- [ ] Server logs show "✓ Server running at http://localhost:5000"
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] API client imports work in frontend
- [ ] Form submission sends data to backend
- [ ] Objective appears in database (view in Prisma Studio)
- [ ] List view refreshes with new objective

## Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Status**: ✅ Complete and ready to test  
**Created**: 2025-12-10
