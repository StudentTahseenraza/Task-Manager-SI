<div align="left">

# 🚀 TaskFlow – Task Management System

### 💼 Modern Full-Stack Productivity App with Role-Based Access

<img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,react,vite,tailwind,javascript" />

<br/>

<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge"/>
<img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge"/>
<img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge"/>

---

## 🔐 Demo Credentials

| Role       | Email                                               | Password    |
| ---------- | --------------------------------------------------- | ----------- |
|  Admin     | [admin@example.com](mailto:admin@example.com)       | Admin123     |


---

# 🚀 Features

### 🔹 Core Features

  * 🔐 JWT Authentication (Login/Register)
  * 📋 Full CRUD Task Management
  * 🔎 Search + Filters + Sorting
  * 📊 Analytics Dashboard
  * 🔄 Pagination & Performance Optimization
  * 👥 Role-Based Access Control

### 🔹 Advanced Features

* 🎨 Modern UI (Glass + Animations)
* 🌙 Dark Mode
* 📱 Fully Responsive
* 🔔 Toast Notifications
* ⚡ Fast UI with React Query

---

# 🛠️ Tech Stack

## ⚙️ Backend

| Technology        | Usage            |
| ----------------- | ---------------- |
| Node.js           | Runtime          |
| Express.js        | Server Framework |
| MongoDB           | Database         |
| Mongoose          | ODM              |
| JWT               | Authentication   |
| bcryptjs          | Password Hashing |
| Express Validator | Input Validation |

---

## 🎨 Frontend

| Technology    | Usage         |
| ------------- | ------------- |
| React         | UI Library    |
| Vite          | Build Tool    |
| Tailwind CSS  | Styling       |
| React Query   | Data Fetching |
| React Router  | Routing       |
| Recharts      | Charts        |
| Framer Motion | Animations    |

---

# 📦 Setup Instructions

## ⚙️ Backend Setup

```bash
git clone https://github.com/yourusername/task-management-system.git
cd task-management-backend
npm install
```

### 🔑 Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
```

### ▶️ Run Server

```bash
npm run dev
```

---

## 🎨 Frontend Setup

```bash
cd ../task-management-frontend
npm install
```

### 🔑 Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### ▶️ Run Frontend

```bash
npm run dev
```

---

# 📡 API Endpoints

## 🔐 Authentication APIs

| Method | Endpoint            | Description      | Access  |
| ------ | ------------------- | ---------------- | ------- |
| POST   | `/api/auth/signup`  | Register user    | Public  |
| POST   | `/api/auth/login`   | Login user       | Public  |
| GET    | `/api/auth/me`      | Get current user | Private |
| PUT    | `/api/auth/profile` | Update profile   | Private |

---

## 📋 Task APIs

| Method | Endpoint               | Description     | Access  |
| ------ | ---------------------- | --------------- | ------- |
| POST   | `/api/tasks`           | Create task     | Private |
| GET    | `/api/tasks`           | Get all tasks   | Private |
| GET    | `/api/tasks/analytics` | Task analytics  | Private |
| GET    | `/api/tasks/:id`       | Get single task | Private |
| PUT    | `/api/tasks/:id`       | Update task     | Private |
| DELETE | `/api/tasks/:id`       | Delete task     | Private |

---

## 👑 Admin APIs

| Method | Endpoint                    | Description   | Access |
| ------ | --------------------------- | ------------- | ------ |
| GET    | `/api/admin/users`          | Get all users | Admin  |
| PUT    | `/api/admin/users/:id/role` | Update role   | Admin  |
| DELETE | `/api/admin/users/:id`      | Delete user   | Admin  |

---

## 🔎 Query Parameters

| Parameter | Description        |
| --------- | ------------------ |
| status    | Filter by status   |
| priority  | Filter by priority |
| search    | Search by title    |
| sortBy    | Sort field         |
| sortOrder | asc / desc         |
| page      | Page number        |
| limit     | Items per page     |

---

# 🧠 Architecture Highlights

* 🏗️ Clean MVC Backend Structure
* 🔐 Secure JWT Auth System
* ⚡ Optimized Queries with Indexing
* 🎯 Role-Based Access Control
* 🔄 React Query State Management


