# Architecture & Visual Diagrams

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        TICKUP OKR SYSTEM                             │
│                                                                       │
│  ┌─────────────────────────────┐         ┌──────────────────────┐   │
│  │   FRONTEND (React)          │         │  BACKEND (Express)   │   │
│  │                             │         │                      │   │
│  │  ┌─────────────────────┐    │         │  ┌────────────────┐  │   │
│  │  │ DashboardPage.tsx   │    │         │  │ Routes         │  │   │
│  │  │                     │    │         │  │ - objectives   │  │   │
│  │  │ New Objective Form  │    │         │  │ - users        │  │   │
│  │  │ ┌─────────────────┐ │    │         │  │ - keyresults   │  │   │
│  │  │ │ Title Input     │ │    │         │  │ - checkins     │  │   │
│  │  │ │ Description     │ │    │         │  │ - comments     │  │   │
│  │  │ │ Category Select │ │    │         │  └────────────────┘  │   │
│  │  │ │ Owner Select    │ │    │         │                      │   │
│  │  │ │ Color Picker    │ │    │         │  ┌────────────────┐  │   │
│  │  │ │ Quarter Select  │ │    │         │  │ Prisma ORM     │  │   │
│  │  │ │ Date Picker     │ │    │         │  │                │  │   │
│  │  │ │ Parent Selector │ │    │         │  │ - Create       │  │   │
│  │  │ └─────────────────┘ │    │         │  │ - Read         │  │   │
│  │  └─────────────────────┘    │         │  │ - Update       │  │   │
│  │           │                 │         │  │ - Delete       │  │   │
│  │           ▼                 │         │  │ - Relations    │  │   │
│  │  ┌─────────────────────┐    │         │  └────────────────┘  │   │
│  │  │ App.tsx             │    │         │                      │   │
│  │  │ handleSaveObjective │    │         │  ┌────────────────┐  │   │
│  │  └─────────────────────┘    │         │  │ schema.prisma  │  │   │
│  │           │                 │         │  │                │  │   │
│  │           ▼                 │         │  │ - Objective    │  │   │
│  │  ┌─────────────────────┐    │         │  │ - KeyResult    │  │   │
│  │  │ API Client Service  │    │         │  │ - User         │  │   │
│  │  │ (services/api.ts)   │    │         │  │ - CheckIn      │  │   │
│  │  │                     │    │         │  │ - Comment      │  │   │
│  │  │ apiClient.          │    │         │  │ - Relationships│  │   │
│  │  │ objectives.create() │    │         │  └────────────────┘  │   │
│  │  └─────────────────────┘    │         └──────────────────────┘   │
│  │           │                 │                                    │
│  └───────────┼─────────────────┘                                    │
│              │                                                      │
│              │ HTTP POST                                            │
│              │ /api/objectives                                      │
│              │ { title, description, ... }                          │
│              │                                                      │
│              └──────────────────────────────────────────────────┐   │
│                                                                 │   │
│  ┌──────────────────────────────────────────────────────────────┘   │
│  │                                                                   │
│  │  ┌─────────────────────────────────────────────────────────┐    │
│  │  │              MySQL Database                             │    │
│  │  │                                                          │    │
│  │  │  objectives table                                        │    │
│  │  │  ┌─────────┬──────────────────────────────────────────┐ │    │
│  │  │  │ id      │ title      │ category │ owner │ ... │    │ │    │
│  │  │  ├─────────┼────────────┼──────────┼───────┼─────┤    │ │    │
│  │  │  │ obj-123 │ My Obj     │ BUSINESS │ u-abc │ ... │    │ │    │
│  │  │  │ obj-124 │ New Obj    │ QUALITY  │ u-def │ ... │    │ │    │
│  │  │  └─────────┴────────────┴──────────┴───────┴─────┘    │ │    │
│  │  │                                                          │    │
│  │  │  users table                                             │    │
│  │  │  ┌──────────┬────────────┬─────────────────────────┐    │    │
│  │  │  │ id       │ name       │ email                   │    │    │
│  │  │  ├──────────┼────────────┼─────────────────────────┤    │    │
│  │  │  │ u-akbari │ علی اکبری    │ akbari@example.com      │    │    │
│  │  │  └──────────┴────────────┴─────────────────────────┘    │    │
│  │  │                                                          │    │
│  │  │  keyresults table, checkins table, comments table       │    │
│  │  │  (similar structure)                                    │    │
│  │  └─────────────────────────────────────────────────────────┘    │
│  │                                                                   │
│  └───────────────────────────────────────────────────────────────────┘
│
└──────────────────────────────────────────────────────────────────────┘
```

## Form Submission Flow

```
┌─────────────────────────────┐
│  User Fills Form            │
│  - Title: "My Objective"    │
│  - Category: BUSINESS_GROW  │
│  - Owner: u-akbari          │
│  - Color: green             │
│  - Quarter: 1404-Q1         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  User Clicks Submit         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│  React Form State Updated                   │
│  formData = {                               │
│    title: "My Objective",                   │
│    category: "BUSINESS_GROWTH",             │
│    ...                                      │
│  }                                          │
└──────────┬──────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────┐
│  handleSaveObjective() Called               │
│  - Validates input                         │
│  - Calls API                               │
└──────────┬─────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────┐
│  apiClient.objectives.create(data)         │
│  - Formats data                            │
│  - Calls fetch()                           │
└──────────┬─────────────────────────────────┘
           │
           ▼
   ╔═══════════════════════════════════════╗
   ║  HTTP Request                         ║
   ║  POST http://localhost:5000/api/      ║
   ║       objectives                      ║
   ║  Content-Type: application/json       ║
   ║                                       ║
   ║  {                                    ║
   ║    "title": "My Objective",           ║
   ║    "category": "BUSINESS_GROWTH",     ║
   ║    "ownerId": "u-akbari",             ║
   ║    ...                                ║
   ║  }                                    ║
   ╚═══════════════════════════════════════╝
           │
           ▼ (over HTTP)
┌────────────────────────────────────────┐
│  Express Route Handler                 │
│  (backend/src/routes/objectives.ts)    │
│  - Receives request                    │
│  - Validates input                     │
│  - Checks required fields              │
└──────────┬───────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  Prisma ORM                            │
│  prisma.objective.create({             │
│    data: {                             │
│      title, description, category,     │
│      color, quarter, endDate,          │
│      ownerId, parentId                 │
│    },                                  │
│    include: { owner: true }            │
│  })                                    │
└──────────┬───────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  Prisma Generates SQL Query            │
│                                        │
│  INSERT INTO objectives (              │
│    id, title, description,             │
│    category, color, quarter,           │
│    endDate, ownerId, parentId,         │
│    isArchived, createdAt, updatedAt    │
│  ) VALUES (                            │
│    'cl9yx1234...', 'My Objective',     │
│    'BUSINESS_GROWTH', 'green',         │
│    '1404-Q1', '2025-12-31', 'u-akb..  │
│    false, NOW(), NOW()                 │
│  )                                     │
└──────────┬───────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  MySQL Database                        │
│  Executes INSERT statement             │
│  Stores record in objectives table     │
│  Returns generated ID                  │
└──────────┬───────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  Prisma Returns Created Record         │
│  {                                     │
│    id: "cl9yx1234567890abc",           │
│    title: "My Objective",              │
│    category: "BUSINESS_GROWTH",        │
│    color: "green",                     │
│    quarter: "1404-Q1",                 │
│    endDate: "2025-12-31T00:00:00Z",    │
│    ownerId: "u-akbari",                │
│    owner: {                            │
│      id: "u-akbari",                   │
│      name: "علی اکبری",                 │
│      email: "akbari@example.com"       │
│    },                                  │
│    createdAt: "2025-12-10T14:30:00Z",  │
│    updatedAt: "2025-12-10T14:30:00Z",  │
│    isArchived: false,                  │
│    keyResults: [],                     │
│    parentId: null                      │
│  }                                     │
└──────────┬───────────────────────────────┘
           │
           ▼
   ╔═══════════════════════════════════════╗
   ║  HTTP Response 201 Created            ║
   ║  Content-Type: application/json       ║
   ║  Body: { ... created objective ... }  ║
   ╚═══════════════════════════════════════╝
           │
           ▼ (over HTTP)
┌────────────────────────────────────────┐
│  Frontend Receives Response             │
│  apiClient returns created objective    │
└──────────┬───────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  App.tsx Updates State                 │
│  setObjectives(prev =>                 │
│    [...prev, createdObjective]         │
│  )                                     │
└──────────┬───────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  React Re-renders Components           │
│  DashboardPage receives new objectives │
│  ObjectiveRow renders new entry        │
└──────────┬───────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  ✅ Success!                            │
│  New Objective Visible in UI List      │
│  Data Persisted in MySQL Database      │
└────────────────────────────────────────┘
```

## Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                    Entity Relationships                      │
└──────────────────────────────────────────────────────────────┘

                           User
                    ┌─────────────┐
                    │   id (PK)   │
                    │   name      │
                    │   email     │
                    │   avatar    │
                    └─────────────┘
                    ▲       │       ▲
                    │       │       │
          (owner)   │       │       │ (createdBy)
                    │       │       │
        ┌───────────┤       │       ├───────────┐
        │           │       │       │           │
        │           │       ▼       │           │
        │           │   ┌──────────────────┐   │
        │           │   │  Comment         │   │
        │           │   ├──────────────────┤   │
        │           │   │ id (PK)          │   │
        │           │   │ content          │   │
        │           │   │ createdById (FK) │   │
        │           │   │ createdAt        │   │
        │           │   └──────────────────┘   │
        │           │   ▲       ▲              │
        │           │   │ ref   │ ref          │
        │           │   │       │              │
    ┌───┴────────┐  │   │   ┌───┴──────────────┘
    │            │  │   │   │
    │  Objective │──┤   │   │
    │  ┌────────┐│  │   │   │
    │  │id (PK)││  │   │   │
    │  │title  ││  │   │   │
    │  │descr..││  │   │   │
    │  │catego.││  │   │   │
    │  │color  ││  │   │   │
    │  │quarter││  │   │   │
    │  │endDt..││  │   │   │
    │  │owner..│├──┘   │   │
    │  │parent.││◄─┐   │   │
    │  │isArch.││  │   │   │
    │  │created││  │   │   │
    │  │updated││  │   │   │
    │  └────────┘│  │   │   │
    │            │  │   │   │
    └────────────┘  │   │   │
    ▲           │   │   │   │
    │(parent)   │   │   │   │
    │           │   │   │   │
    │(children) │   │   │   │
    │           ▼   │   │   │
    └─────────────┐ │   │   │
            │     │ │   │   │
            │     ▼ ▼   │   │
            │    ┌─────────────────┐
            │    │  KeyResult      │
            │    ├─────────────────┤
            │    │ id (PK)         │
            │    │ title           │
            │    │ description     │
            │    │ category        │
            │    │ type            │
            │    │ unit            │
            │    │ startValue      │
            │    │ currentValue    │
            │    │ targetValue     │
            │    │ status          │
            │    │ objective(FK)   │
            │    │ owner(FK)───┐   │
            │    │ isArchived  │   │
            │    │ created/upd.│   │
            │    └─────────────┘   │
            │        ▲              │
            │        │              │
            │        │ (owner)      │
            │        │              │
            │        │ ┌────────────┴─────────┐
            │        │ │                      │
            │        │ ▼                      │
            │    ┌──────────────┐             │
            │    │  CheckIn     │             │
            │    ├──────────────┤             │
            │    │ id (PK)      │             │
            │    │ value        │             │
            │    │ confidence   │             │
            │    │ notes        │             │
            │    │ kr(FK)       │             │
            │    │ createdBy..  │─────────────┘
            │    │ created/upd..│
            │    └──────────────┘
            │
            └─ (hierarchical parent-child)
```

## Data State Flow

```
┌─────────────────────────────────────────────────────┐
│  Frontend Component State                           │
└─────────────────────────────────────────────────────┘

  Browser Memory
  ┌──────────────────────────────────────────────┐
  │ React State (App.tsx)                        │
  │                                              │
  │ objectives: Objective[] = [                  │
  │   {                                          │
  │     id: "obj-123",                           │
  │     title: "My Objective",                   │
  │     ownerId: "u-akbari",                     │
  │     keyResults: [...]                        │
  │   },                                         │
  │   ... more objectives ...                    │
  │ ]                                            │
  │                                              │
  │ users: User[] = [                            │
  │   { id: "u-akbari", name: "علی اکبری" },   │
  │   ...                                        │
  │ ]                                            │
  └──────────────────────────────────────────────┘
           │
           │ (component prop passing)
           │
           ▼
  ┌──────────────────────────────────────────────┐
  │ DashboardPage Component                      │
  │ - Shows objectives list                      │
  │ - Renders for each objective:                │
  │   * ObjectiveRow component                   │
  │   * KeyResult rows (if expanded)             │
  └──────────────────────────────────────────────┘


┌─────────────────────────────────────────────────┐
│  Network/API Layer                              │
└─────────────────────────────────────────────────┘

  apiClient.objectives
  ├─ .list() → GET /api/objectives
  ├─ .get(id) → GET /api/objectives/:id
  ├─ .create(data) → POST /api/objectives
  ├─ .update(id, data) → PUT /api/objectives/:id
  ├─ .delete(id) → DELETE /api/objectives/:id
  └─ .getKeyResults(id) → GET /api/objectives/:id/key-results

  HTTP Requests ←→ Express Backend


┌─────────────────────────────────────────────────┐
│  Backend Memory (Node.js Process)               │
└─────────────────────────────────────────────────┘

  Prisma Client Instance
  ├─ Maintains database connection pool
  ├─ Generates SQL queries
  ├─ Maps database rows to JavaScript objects
  └─ Handles relationships (includes)


┌─────────────────────────────────────────────────┐
│  Database Layer (MySQL)                         │
└─────────────────────────────────────────────────┘

  objectives table
  ├─ Row 1: { id: "...", title: "...", ... }
  ├─ Row 2: { id: "...", title: "...", ... }
  └─ ... more rows ...

  users table
  ├─ Row 1: { id: "u-akbari", name: "علی اکبری", ... }
  ├─ Row 2: { id: "u-hosseini", name: "حسین حسینی", ... }
  └─ ... more rows ...

  key_results table (linked to objectives)
  checks_in table (linked to key_results)
  comments table (linked to objectives or key_results)
```

## API Response Structure

```
HTTP 201 Created Response from POST /api/objectives

{
  "id": "cl9yx1234567890abcdefg",
  "title": "افزایش کیفیت و بهینه‌سازی تولید",
  "description": "رسیدن به بالاترین استانداردهای کیفی",
  "category": "QUALITY_STANDARDS",
  "color": "green",
  "quarter": "1404-Q1",
  "endDate": "2025-12-31T00:00:00.000Z",
  "isArchived": false,
  "createdAt": "2025-12-10T14:30:45.123Z",
  "updatedAt": "2025-12-10T14:30:45.123Z",
  "ownerId": "u-akbari",
  
  "owner": {
    "id": "u-akbari",
    "name": "علی اکبری",
    "email": "akbari@example.com",
    "avatar": null,
    "createdAt": "2025-12-10T12:00:00.000Z",
    "updatedAt": "2025-12-10T12:00:00.000Z"
  },
  
  "parentId": null,
  
  "keyResults": [
    {
      "id": "kr-1",
      "title": "کاهش نرخ ناخالصی",
      "category": "STANDARD",
      "type": "PERCENTAGE",
      "unit": "%",
      "startValue": 0.5,
      "currentValue": 0.2,
      "targetValue": 0.1,
      "status": "ON_TRACK",
      "objectiveId": "cl9yx1234567890abcdefg",
      "ownerId": "u-hosseini"
    }
  ]
}
```

## Error Flow

```
┌──────────────────────────┐
│  Error Occurs at Any Point
└──────────────────────────┘
           │
           ▼
  ┌────────────────────┐
  │ Form Validation?   │
  │ (Frontend)         │
  ├────────────────────┤
  │ YES → Show to user │
  │       in form      │
  │ NO ↓ Continue     │
  └──────────────────┘
           │
           ▼
  ┌────────────────────┐
  │ API Error?         │
  │ (HTTP/Network)     │
  ├────────────────────┤
  │ YES → Log error    │
  │       to console   │
  │       Fallback to  │
  │       localStorage │
  │ NO ↓ Continue     │
  └──────────────────┘
           │
           ▼
  ┌────────────────────┐
  │ Database Error?    │
  │ (Backend)          │
  ├────────────────────┤
  │ YES → Return error │
  │       message      │
  │       with HTTP    │
  │       status code  │
  │ NO ↓ Success      │
  └──────────────────┘
           │
           ▼
  ┌────────────────────┐
  │ ✅ Return Success  │
  │    Response        │
  └────────────────────┘
```

## Directory Structure

```
test/
├── backend/
│   ├── src/
│   │   ├── index.ts                  (Express server)
│   │   └── routes/
│   │       ├── objectives.ts         (CRUD endpoints)
│   │       └── users.ts              (User endpoints)
│   │
│   ├── prisma/
│   │   ├── schema.prisma             (Database schema)
│   │   ├── seed.ts                   (Seed script)
│   │   └── migrations/               (Generated by Prisma)
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                          (Configuration)
│   └── README.md                     (Backend docs)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── NewObjectiveForm.tsx
│   │   │   └── ... (other components)
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts                (API client)
│   │   │   └── geminiService.ts
│   │   │
│   │   ├── App.tsx                   (Modified)
│   │   ├── types.ts
│   │   ├── mockData.ts
│   │   └── ... (other files)
│   │
│   ├── package.json
│   ├── .env                          (Configuration)
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
│
├── SETUP_GUIDE.md                    (Quick setup - 5 min)
├── FORM_TO_DATABASE_MAPPING.md       (Field mapping)
├── IMPLEMENTATION_SUMMARY.md         (This file)
└── ARCHITECTURE_DIAGRAMS.md          (Visual docs)
```

---

**Document**: Architecture & Visual Diagrams  
**Created**: 2025-12-10  
**Status**: ✅ Complete
