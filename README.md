# WareFlow

WareFlow is a warehouse and business management system inspired by Odoo. The project is being developed to simplify inventory management, product management, customer handling, sales, purchasing, and other day-to-day business operations through a modern web application.

The goal of this project is to learn how enterprise ERP systems work while building a scalable full-stack application using modern web technologies.

---

## Project Status

🚧 This project is currently under active development.

The core application structure, backend modules, database design, and major business workflows have been implemented. Additional ERP features, dashboards, reporting, and deployment will be added as the project continues to evolve.

---

## Key Features

- Inventory Management
- Product Management
- Customer Management
- Vendor Management
- Sales Order Management
- Purchase Order Management
- Category Management
- User Management
- Authentication & Authorization
- Modern Responsive Dashboard
- ERP-inspired Business Workflow
- Scalable Modular Architecture

---

## Tech Stack

### Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

### Development Tools

- Git
- GitHub
- Visual Studio Code

---

## Project Structure

```text
WareFlow/
│
├── backend/
│   ├── prisma/
│   └── src/
│       ├── auth/
│       ├── categories/
│       ├── customers/
│       ├── inventory/
│       ├── products/
│       ├── purchase-orders/
│       ├── sales-orders/
│       ├── users/
│       ├── vendors/
│       ├── app.controller.ts
│       ├── app.module.ts
│       ├── app.service.ts
│       └── main.ts
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── customers/
│       │   ├── inventory/
│       │   ├── products/
│       │   ├── purchase-orders/
│       │   ├── reports/
│       │   ├── sales-orders/
│       │   ├── settings/
│       │   └── vendors/
│       │
│       ├── components/
│       └── public/
│
└── README.md
```

---

## Getting Started

### Backend Setup

```bash
cd backend
npm install
```

Configure the PostgreSQL database connection inside the `.env` file.

```env
DATABASE_URL=your_postgresql_connection_string
```

Synchronize the database schema.

```bash
npx prisma db push
```

Start the backend server.

```bash
npm run start:dev
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open your browser and visit:

```
http://localhost:3000
```

---

## Architecture Highlights

- Full-stack monorepo architecture
- Modular backend built with NestJS
- PostgreSQL database using Prisma ORM
- Strongly typed development with TypeScript
- Modern UI developed with Next.js and Tailwind CSS
- Reusable components using Shadcn UI
- Smooth user experience with Framer Motion
- JWT-based authentication architecture

---

## Future Roadmap

- Dashboard Analytics
- Inventory Reports
- Supplier Management
- Invoice Management
- Barcode & QR Code Support
- Notifications
- Role-Based Access Control
- Docker Support
- Cloud Deployment
- Mobile Companion Application

---

## License

This project was developed as part of my learning journey to understand enterprise software development and modern ERP system architecture.
