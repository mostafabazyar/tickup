# Form Fields & Database Schema Mapping

## NewObjectiveForm Input Fields → Database Schema

### Complete Field Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│            FORM INPUT (React Component)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  NewObjectiveForm.tsx                                    │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  1. Title Input (text)                                   │   │
│  │     └─ State: formData.title                             │   │
│  │                                                           │   │
│  │  2. Description Input (textarea)                         │   │
│  │     └─ State: formData.description                       │   │
│  │                                                           │   │
│  │  3. Category Dropdown (select)                           │   │
│  │     └─ State: formData.category                          │   │
│  │     └─ Options: 12 objective categories                 │   │
│  │                                                           │   │
│  │  4. Owner Selector (autocomplete/select)                 │   │
│  │     └─ State: formData.ownerId                           │   │
│  │     └─ Fetches from: GET /api/users                      │   │
│  │                                                           │   │
│  │  5. Color Picker (color input)                           │   │
│  │     └─ State: formData.color                             │   │
│  │     └─ Values: 8 predefined colors                       │   │
│  │                                                           │   │
│  │  6. Quarter Dropdown (select)                            │   │
│  │     └─ State: formData.quarter                           │   │
│  │     └─ Format: "1404-Q1", "1404-Q2", "1404-Q3", "1404-Q4" │  │
│  │                                                           │   │
│  │  7. End Date Picker (date input)                         │   │
│  │     └─ State: formData.endDate                           │   │
│  │     └─ Format: ISO string (YYYY-MM-DD)                  │   │
│  │                                                           │   │
│  │  8. Parent Objective Selector (optional)                 │   │
│  │     └─ State: formData.parentId                          │   │
│  │     └─ Fetches from: GET /api/objectives                 │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
                          Form Validation
                                ↓
        ┌───────────────────────────────────────────┐
        │   handleSaveObjective() in App.tsx        │
        │                                            │
        │   - Validate required fields               │
        │   - Format dates                           │
        │   - Call API:                              │
        │     apiClient.objectives.create({...})    │
        └───────────────────────────────────────────┘
                                ↓
                        HTTP POST Request
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                  EXPRESS BACKEND API                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/objectives                                            │
│  ├─ Validate request body                                        │
│  ├─ Check required fields (title, ownerId)                       │
│  ├─ Parse dates                                                  │
│  └─ Call Prisma ORM                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
                     Prisma ORM (src/routes/objectives.ts)
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE SCHEMA (Prisma Models)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  model Objective {                                               │
│    id          String   @id @default(cuid())                     │
│    title       String     ←── Form: Title Input                  │
│    description String?    ←── Form: Description Input            │
│    category    String     ←── Form: Category Dropdown            │
│    color       String     ←── Form: Color Picker                 │
│    quarter     String?    ←── Form: Quarter Dropdown             │
│    endDate     DateTime?  ←── Form: End Date Picker              │
│    isArchived  Boolean    @default(false)                        │
│    createdAt   DateTime   @default(now())                        │
│    updatedAt   DateTime   @updatedAt                             │
│                                                                   │
│    // Relations                                                  │
│    ownerId     String     ←── Form: Owner Selector               │
│    owner       User       @relation(...)                         │
│                                                                   │
│    parentId    String?    ←── Form: Parent Objective             │
│    parent      Objective? @relation(...)                         │
│    children    Objective[]                                       │
│                                                                   │
│    // Child relations                                            │
│    keyResults  KeyResult[]                                       │
│    comments    Comment[]                                         │
│  }                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
                        MySQL Database
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                  MySQL Tables Created                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  objectives table                                                │
│  ┌────────┬──────────────────────────────────────┐              │
│  │ Column │ Type         │ Example Value          │              │
│  ├────────┼──────────────┼────────────────────────┤              │
│  │ id     │ CHAR(25)     │ cl9yx1234567890abc...  │              │
│  │ title  │ VARCHAR(255) │ افزایش کیفیت             │              │
│  │ desc   │ LONGTEXT     │ بهینه سازی تولید...    │              │
│  │ categ  │ VARCHAR(50)  │ QUALITY_STANDARDS      │              │
│  │ color  │ VARCHAR(10)  │ green                  │              │
│  │ quarter│ VARCHAR(10)  │ 1404-Q1                │              │
│  │ endDat │ DATETIME     │ 2025-12-31 00:00:00    │              │
│  │ owner  │ VARCHAR(25)  │ u-akbari               │              │
│  │ parent │ VARCHAR(25)  │ NULL                   │              │
│  │ archiv │ TINYINT      │ 0 (false)              │              │
│  │ creatd │ DATETIME     │ 2025-12-10 14:30:00    │              │
│  │ updatd │ DATETIME     │ 2025-12-10 14:30:00    │              │
│  └────────┴──────────────┴────────────────────────┘              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
                    API Response (JSON)
                                ↓
                 Frontend Updates State
                                ↓
                    Objective Appears
                        in UI List
```

## Form Submission Flow Detailed

### 1. User Fills Form & Clicks Submit

```typescript
// Form State in React
const formData = {
  title: "افزایش کیفیت و بهینه‌سازی تولید",           // Required
  description: "رسیدن به بالاترین استانداردهای کیفی",  // Optional
  category: "QUALITY_STANDARDS",                    // Required
  ownerId: "u-akbari",                              // Required
  color: "green",                                   // Required
  quarter: "1404-Q1",                               // Optional
  endDate: "2025-12-31",                            // Optional
  parentId: undefined                               // Optional
}
```

### 2. handleSaveObjective() Processes & Calls API

```typescript
// In App.tsx
const handleSaveObjective = async (objectiveData, keyResultsData) => {
  try {
    const createdObjective = await apiClient.objectives.create({
      title: "افزایش کیفیت و بهینه‌سازی تولید",
      description: "رسیدن به بالاترین استانداردهای کیفی",
      category: "QUALITY_STANDARDS",
      color: "green",
      quarter: "1404-Q1",
      endDate: "2025-12-31",
      ownerId: "u-akbari",
      parentId: undefined
    });
    // Update state with response
    setObjectives(prev => [...prev, createdObjective]);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 3. API Client Makes HTTP POST Request

```typescript
// In frontend/services/api.ts
apiClient.objectives.create(data) 
  // Becomes HTTP request:
  // POST http://localhost:5000/api/objectives
  // Content-Type: application/json
  // Body: { title, description, category, color, ... }
```

### 4. Backend Route Receives & Processes

```typescript
// In backend/src/routes/objectives.ts
router.post("/", async (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    color,
    quarter,
    endDate,
    ownerId,
    parentId
  } = req.body;

  // Validate
  if (!title || !ownerId) return error;

  // Create in database
  const objective = await prisma.objective.create({
    data: {
      title,
      description: description || null,
      category: category || "BUSINESS_GROWTH",
      color: color || "gray",
      quarter: quarter || null,
      endDate: endDate ? new Date(endDate) : null,
      ownerId,
      parentId: parentId || null
    }
  });

  return res.status(201).json(objective);
});
```

### 5. Prisma ORM Generates SQL Query

```sql
-- What Prisma generates internally:
INSERT INTO objectives (
  id,
  title,
  description,
  category,
  color,
  quarter,
  endDate,
  ownerId,
  parentId,
  isArchived,
  createdAt,
  updatedAt
) VALUES (
  'cl9yx1234567890abcdef',
  'افزایش کیفیت و بهینه‌سازی تولید',
  'رسیدن به بالاترین استانداردهای کیفی',
  'QUALITY_STANDARDS',
  'green',
  '1404-Q1',
  '2025-12-31',
  'u-akbari',
  NULL,
  0,
  '2025-12-10 14:30:00',
  '2025-12-10 14:30:00'
);
```

### 6. MySQL Stores Data

```
Row inserted into objectives table:
┌────────────────────┬──────────────────────────────────────┐
│ id                 │ cl9yx1234567890abcdef                │
│ title              │ افزایش کیفیت و بهینه‌سازی تولید         │
│ description        │ رسیدن به بالاترین استانداردهای کیفی  │
│ category           │ QUALITY_STANDARDS                    │
│ color              │ green                                │
│ quarter            │ 1404-Q1                              │
│ endDate            │ 2025-12-31 00:00:00                  │
│ ownerId            │ u-akbari                             │
│ parentId           │ NULL                                 │
│ isArchived         │ 0                                    │
│ createdAt          │ 2025-12-10 14:30:00                  │
│ updatedAt          │ 2025-12-10 14:30:00                  │
└────────────────────┴──────────────────────────────────────┘
```

### 7. API Returns Response

```json
{
  "id": "cl9yx1234567890abcdef",
  "title": "افزایش کیفیت و بهینه‌سازی تولید",
  "description": "رسیدن به بالاترین استانداردهای کیفی",
  "category": "QUALITY_STANDARDS",
  "color": "green",
  "quarter": "1404-Q1",
  "endDate": "2025-12-31T00:00:00.000Z",
  "isArchived": false,
  "ownerId": "u-akbari",
  "parentId": null,
  "createdAt": "2025-12-10T14:30:00.000Z",
  "updatedAt": "2025-12-10T14:30:00.000Z",
  "owner": {
    "id": "u-akbari",
    "name": "علی اکبری",
    "email": "akbari@example.com"
  },
  "keyResults": []
}
```

### 8. Frontend Updates State & UI

```typescript
// Frontend receives response and updates state
setObjectives(prev => [...prev, createdObjective]);

// Component re-renders
// Objective appears in DashboardPage list view
```

## Database Relationships

```
User (1) ──→ (Many) Objective
  │
  ├─ ownerId references User.id
  └─ Display owner name in list


Objective (1) ──→ (Many) KeyResult
  │
  ├─ Each Objective has 0 or more KeyResults
  └─ Fetch with: GET /api/objectives/:id/key-results


Objective (1) ──→ (0 or 1) Objective (Parent)
  │
  ├─ parentId creates hierarchical relationship
  ├─ Can be NULL (top-level objective)
  └─ Support for objective nesting


Objective (1) ──→ (Many) Comment
  │
  └─ Discussion threads on objectives


KeyResult (1) ──→ (Many) CheckIn
  │
  ├─ Track progress updates
  └─ Store historical values


KeyResult (1) ──→ (Many) Comment
  │
  └─ Discussion threads on key results
```

## Field Validation Rules

| Field | Type | Validation | Error Message |
|-------|------|-----------|----------------|
| title | String | Required, max 255 chars | "Title is required" |
| description | String | Optional, max 5000 chars | N/A |
| category | String | Required, must be enum | "Invalid category" |
| ownerId | String | Required, must exist in users | "Owner not found" |
| color | String | Required, valid hex or name | "Invalid color" |
| quarter | String | Optional, format "YYYY-Q[1-4]" | "Invalid quarter format" |
| endDate | DateTime | Optional, future date | "Date must be in future" |
| parentId | String | Optional, must exist in objectives | "Parent not found" |

## Data Types Mapping

| Prisma Type | MySQL Type | JavaScript Type | Example |
|-------------|-----------|-----------------|---------|
| String | VARCHAR(255) | string | "My Objective" |
| String? | VARCHAR(255) NULL | string \| null | null or "text" |
| String (LongText) | LONGTEXT | string | Long descriptions |
| DateTime | DATETIME | Date | 2025-12-10T14:30:00Z |
| DateTime? | DATETIME NULL | Date \| null | null or Date |
| Boolean | TINYINT(1) | boolean | true \| false |
| Float | DECIMAL(10,2) | number | 123.45 |
| Int | INT | number | 100 |

---

## Quick Reference - What Gets Stored

When form is submitted, these values are permanently stored in MySQL:

```sql
Objective Record Example:
{
  id: "auto-generated-CUID",
  title: "User Input",
  description: "User Input (optional)",
  category: "Selected from dropdown",
  color: "Selected from color picker",
  quarter: "Selected from dropdown",
  endDate: "Selected from date picker",
  ownerId: "Selected from user list",
  parentId: "NULL (unless hierarchical)",
  isArchived: false (default),
  createdAt: "Current timestamp",
  updatedAt: "Current timestamp"
}
```

---

**Reference Document**: Form to Database Mapping  
**Created**: 2025-12-10  
**Status**: ✅ Complete
