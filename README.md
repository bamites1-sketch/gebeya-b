# ገበያ-B | Gebeya-B

Ethiopian Cultural Marketplace — a full-stack e-commerce platform for traditional Ethiopian goods.

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, React Router, Context API, i18next
- **Backend**: Node.js + Express, Prisma ORM, JWT Auth
- **Database**: MySQL

## Supported Languages

- 🇬🇧 English
- 🇪🇹 Amharic (አማርኛ)
- ትግርኛ (Tigrigna)
- Afan Oromo

## Getting Started

### 1. Database Setup

Create a MySQL database:
```sql
CREATE DATABASE gebeya_b;
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Create Admin User

After registering a user, update their role in MySQL:
```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | User |
| GET | /api/products | Public |
| GET | /api/products/:id | Public |
| POST | /api/products | Admin |
| PUT | /api/products/:id | Admin |
| DELETE | /api/products/:id | Admin |
| GET | /api/cart | User |
| POST | /api/cart | User |
| GET | /api/wishlist | User |
| POST | /api/wishlist/:productId | User |
| POST | /api/orders | User |
| GET | /api/admin/stats | Admin |

## Project Structure

```
gebeya-b/
├── frontend/
│   └── src/
│       ├── components/    # Reusable UI + layout + product components
│       ├── context/       # Auth, Cart, Wishlist, Theme contexts
│       ├── locales/       # en, am, ti, om translation files
│       ├── pages/         # All page components
│       └── services/      # Axios API client
└── backend/
    ├── controllers/       # Business logic
    ├── routes/            # Express routes
    ├── middleware/        # Auth, error, upload
    └── prisma/            # Schema + migrations
```
