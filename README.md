# FlowCore ERP

A modern, enterprise-grade ERP system tailored for scalability and robust order/inventory management.

## Project Structure

This is a monorepo consisting of:
- `backend/`: NestJS, Prisma, PostgreSQL
- `frontend/`: Next.js 15, Tailwind CSS, Framer Motion, Shadcn UI

## Setup Instructions

### Backend Setup
1. Navigate to `backend/`
2. Run `npm install`
3. Set your `DATABASE_URL` in `.env` (PostgreSQL)
4. Run `npx prisma db push` to synchronize the schema
5. Run `npm run start:dev`

### Frontend Setup
1. Navigate to `frontend/`
2. Run `npm install`
3. Run `npm run dev`
4. Access `http://localhost:3000`

## Architecture Highlights
- Fully typed using TypeScript
- Database ORM using Prisma
- Clean, module-based architecture with NestJS
- Premium, dark-mode first UI using Shadcn and Tailwind
- JWT Authentication ready (via schema and modules structure)
