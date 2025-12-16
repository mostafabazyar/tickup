# Quick Reference Card

## 🚀 60-Second Setup

```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE tickup_db;

# 2. Setup backend
cd backend
npm install
npx prisma migrate dev --name init

# 3. Start backend (terminal 1)
npm run dev

# 4. Start frontend (terminal 2)
cd frontend
npm run dev
```

Done! Form now saves to MySQL at `http://localhost:5173`

---

## 📝 Form Fields Reference

```
Title           → Objective.title (required)
Description     → Objective.description (optional)
Category        → Objective.category (12 options)
Owner           → Objective.ownerId (required, FK)
Color           → Objective.color (color picker)
Quarter         → Objective.quarter (1404-Q1, etc.)
End Date        → Objective.endDate (date picker)
Parent          → Objective.parentId (hierarchy, optional)
```

---

## 🗄️ Database Tables

```
objectives
├─ id, title, description, category, color
├─ quarter, endDate, ownerId, parentId
└─ isArchived, createdAt, updatedAt

key_results
├─ id, title, category, type, unit
├─ startValue, currentValue, targetValue, status
└─ objectiveId, ownerId, isArchived, timestamps

users
├─ id, name, email, avatar
└─ timestamps

check_ins
├─ id, value, confidence, notes
└─ keyResultId, createdById, timestamps

comments
├─ id, content, objectiveId, keyResultId
└─ createdById, timestamps
```

---

## 🔌 API Endpoints

```
POST   /api/objectives              Create objective
GET    /api/objectives              List all
GET    /api/objectives/:id          Get one
PUT    /api/objectives/:id          Update
DELETE /api/objectives/:id          Delete
GET    /api/objectives/:id/key-results  Get KRs

GET    /api/users                   List users
POST   /api/users                   Create user
```

---

## 💻 File Locations

```
Backend Code:
├── backend/src/index.ts            Express server
├── backend/src/routes/objectives.ts API endpoints
├── backend/prisma/schema.prisma    Database schema

Frontend Code:
├── frontend/services/api.ts        API client (NEW)
├── frontend/App.tsx                Modified
├── frontend/.env                   Updated

Documentation:
├── README.md                       This index
├── SETUP_GUIDE.md                  5-minute guide
├── ARCHITECTURE_DIAGRAMS.md        Visual docs
└── backend/README.md               Detailed backend
```

---

## ⚙️ Environment Variables

**backend/.env**
```env
DATABASE_URL=mysql://root:password@localhost:3306/tickup_db
PORT=5000
NODE_ENV=development
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Common Commands

```bash
# Backend
npm run dev                    Start dev server
npm run build                  Build for prod
npm run prisma:migrate         Run migrations
npm run prisma:seed           Seed test data
npm run prisma:studio         Open DB UI

# Frontend
npm run dev                    Start dev server
npm run build                  Build for prod
```

---

## 🧪 Test API with curl

```bash
# Get all users (for dropdown)
curl http://localhost:5000/api/users

# Create objective
curl -X POST http://localhost:5000/api/objectives \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Objective",
    "category":"BUSINESS_GROWTH",
    "color":"blue",
    "ownerId":"u-akbari"
  }'

# Get all objectives
curl http://localhost:5000/api/objectives

# Update objective
curl -X PUT http://localhost:5000/api/objectives/obj-id \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Delete objective (archive)
curl -X DELETE http://localhost:5000/api/objectives/obj-id
```

---

## 📊 Objective Categories

```
BUSINESS_GROWTH         (رشد و توسعه)
CUSTOMER_MARKET         (مشتری و بازار)
PRODUCT_INNOVATION      (محصول و نوآوری)
PROCESS_EFFICIENCY      (بهره‌وری)
HR_CULTURE             (منابع انسانی)
FINANCE_PROFITABILITY  (سودآوری)
SALES                  (فروش)
LEGAL_COMPLIANCE       (حقوقی)
SUSTAINABILITY         (پایداری)
QUALITY_STANDARDS      (کیفیت)
TECH_DIGITALIZATION    (فناوری)
COMMUNICATION_BRANDING (برندینگ)
```

---

## 📅 Quarter Format

```
1404-Q1  (بهار - Spring)
1404-Q2  (تابستان - Summer)
1404-Q3  (پاییز - Autumn)
1404-Q4  (زمستان - Winter)
```

---

## 👥 Test Users

```
u-akbari       → علی اکبری        (akbari@example.com)
u-hosseini     → حسین حسینی       (hosseini@example.com)
u-rezaei       → رضا رضایی        (rezaei@example.com)
u-mohammadi    → محمد محمدی       (mohammadi@example.com)
```

---

## ❌ Error Messages

| Error | Solution |
|-------|----------|
| Cannot connect to database | Check MySQL is running, verify DATABASE_URL |
| Port 5000 in use | Change PORT in .env or kill process |
| Module not found | Run npm install again |
| Prisma Client not generated | Run `npx prisma generate` |
| Form doesn't submit | Check browser console (F12) and backend logs |

---

## 🔍 Debugging Tips

```javascript
// Check API client works
import { apiClient } from './services/api';
apiClient.users.list().then(console.log);

// Check backend running
curl http://localhost:5000/health

// View database
npm run prisma:studio  // Opens http://localhost:5555

// Check logs
// Backend: Terminal where npm run dev is running
// Frontend: Browser console (F12)
```

---

## 🔐 Security Note

⚠️ This is for testing only. For production:
- Add authentication (JWT)
- Add input validation
- Add rate limiting
- Enable HTTPS
- Restrict CORS
- Use secrets management

---

## 📚 Documentation Map

```
README.md (you are here)
├─ Quick Start → SETUP_GUIDE.md
├─ Architecture → ARCHITECTURE_DIAGRAMS.md
├─ Field Mapping → FORM_TO_DATABASE_MAPPING.md
├─ Complete Details → IMPLEMENTATION_SUMMARY.md
└─ Backend Details → backend/README.md
```

---

## ✅ Verification Checklist

- [ ] MySQL database `tickup_db` created
- [ ] `backend/.env` DATABASE_URL configured
- [ ] `npm install` completed in backend folder
- [ ] `npx prisma migrate dev --name init` successful
- [ ] `npm run dev` runs without errors
- [ ] Backend shows "✓ Server running at http://localhost:5000"
- [ ] `npm run dev` in frontend folder works
- [ ] Can open http://localhost:5173 in browser
- [ ] Form loads and has all 8 input fields
- [ ] Can fill and submit form
- [ ] Objective appears in list immediately
- [ ] No errors in browser console (F12)
- [ ] `npm run prisma:studio` shows data in database

---

## 🆘 Quick Troubleshooting

**Problem**: "Cannot GET /api/objectives"
**Solution**: Backend not running? `npm run dev` in backend folder

**Problem**: "Cannot connect to database"
**Solution**: Check MySQL running, verify DATABASE_URL in .env

**Problem**: Form submits but nothing appears
**Solution**: Check browser console (F12) for errors

**Problem**: "Module not found" error
**Solution**: Run `npm install` again in affected folder

**Problem**: Prisma error about migrations
**Solution**: Run `npx prisma migrate reset --force` (warning: deletes data)

---

## 🚀 Next Features to Add

1. **Key Results CRUD** - Add form for creating/editing KRs
2. **Check-ins** - Track progress updates
3. **Comments** - Add discussion threads
4. **Search** - Find objectives quickly
5. **Filtering** - By quarter, category, owner
6. **Pagination** - Handle large datasets
7. **Export** - Download as PDF/Excel
8. **Authentication** - User login/roles

---

## 📖 How Data Flows

```
User fills form
      ↓
Click Save button
      ↓
handleSaveObjective() in App.tsx
      ↓
apiClient.objectives.create(data)
      ↓
HTTP POST to /api/objectives
      ↓
Express route receives & validates
      ↓
Prisma creates record in MySQL
      ↓
Returns new objective (with ID)
      ↓
Frontend updates state
      ↓
Component re-renders
      ↓
Objective appears in list
```

---

## 🎯 Test Workflow

1. Open http://localhost:5173 in browser
2. Click "ایجاد" (Create) button
3. Fill form:
   - Title: "Test Objective"
   - Category: Any
   - Owner: u-akbari
   - Color: green
   - Click Save
4. Verify objective appears in list
5. Open Prisma Studio: `npm run prisma:studio`
6. Check data in `objectives` table

---

## 💡 Tips & Tricks

- Use `npm run prisma:studio` to visually edit database
- Check backend logs in terminal for detailed errors
- Use browser DevTools (F12) to see network requests
- Test API endpoints with curl before debugging frontend
- Use `NODE_ENV=production` in .env for optimized builds
- Keep frontend `.env` and backend `.env` synchronized

---

## 📞 Getting Help

1. **For setup issues** → Check SETUP_GUIDE.md
2. **For architecture questions** → See ARCHITECTURE_DIAGRAMS.md
3. **For API details** → See backend/README.md
4. **For implementation details** → See IMPLEMENTATION_SUMMARY.md
5. **For field mapping** → See FORM_TO_DATABASE_MAPPING.md

---

## 🎉 Summary

You have:
- ✅ Prisma ORM schema (5 models, relationships)
- ✅ Express API (10 endpoints)
- ✅ Frontend API client (all methods)
- ✅ Form connected to backend
- ✅ MySQL database integration
- ✅ Comprehensive documentation
- ✅ Test data seeding
- ✅ Error handling & fallbacks

**Status**: Ready to test! Start with SETUP_GUIDE.md

---

**Quick Reference Card v1.0**  
Created: 2025-12-10  
All systems go! 🚀
