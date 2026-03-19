# Multi-Tenant Invoice Processing SaaS with Asynchronous Job Queue

A full-stack invoice processing platform with async job handling.

## 🚀 Features

- PDF upload & validation
- Async processing using BullMQ + Redis
- Background worker for invoice parsing
- Multi-tenant architecture (JWT-based auth)
- Real-time document status tracking
- Dashboard analytics

## 🧠 Architecture

Frontend (React)
→ Express API
→ PostgreSQL
→ Redis Queue (BullMQ)
→ Worker
→ Invoice Parser

## ⚙️ Tech Stack

- Node.js, Express
- PostgreSQL
- Redis + BullMQ
- React (Vite)

## 📦 Setup

### Backend
npm install  
npm run dev  

### Worker
node workers/documentWorker.js  

### Frontend
cd frontend/invoice-dashboard  
npm install  
npm run dev  

## 🔥 Highlights

- Queue-based async processing (production-style)
- Retry + failure handling
- Clean separation of API, queue, and worker
