# 🎶 Turnekörens hemsida

Web application for managing and presenting content related to the choir. Built with a modern full-stack setup using Node.js, Prisma, and deployed on Vercel.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repo-url>
cd turnekor
```

### 2. Environment variables
Populate your `.env` file using values from the Vercel deployment settings.

```bash
cp .env.example .env
```

_(If no `.env.example` exists, copy manually from Vercel dashboard.)_

---

## 📦 Installation

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

---

## 🧑‍💻 Development

Run the development server:

```bash
npm run dev
```

---

## 🏗️ Build & Test

Ensure the project builds successfully:

```bash
npm run build
```

_(This acts as the primary “test” to verify that everything compiles correctly.)_

---

## 🗄️ Database

### Update schema

After making changes to the Prisma schema:

```bash
npx prisma generate
npx prisma db push
```

### Notes
- `db push` is used instead of migrations (good for rapid iteration, but be careful in production environments).
- Ensure your database connection string is correctly set in `.env`.

---

## ⚙️ Tech Stack

- **Frontend / Backend:** Node.js
- **ORM:** Prisma
- **Database:** PostgreSQL (via Prisma)
- **Deployment:** Vercel
