# 🌱 EcoLedger AI

An AI-powered ESG and Carbon Accounting Platform that enables organizations to automatically extract sustainability data from invoices and operational documents, calculate carbon emissions, maintain an audit trail, and generate ESG reports.

---

## 🚀 Features

### Authentication
- JWT Authentication
- User-specific dashboard
- Secure APIs

### AI Invoice Processing
- Upload PDF invoices
- AI-powered invoice understanding using Google Gemini
- Automatic extraction of:
  - Activity
  - Quantity
  - Category
  - Unit

### Carbon Accounting
- Emission factor lookup
- Automatic CO₂e calculation
- Carbon ledger

### ESG Dashboard
- Analytics
- Carbon trends
- Category-wise emissions
- Compliance insights

### Audit Trail
- Stores uploaded document
- Extracted invoice text
- Gemini AI output
- Carbon calculation details

### Reports
- ESG Report Generation
- PDF Export

---

## 🛠 Tech Stack

### Frontend

- React
- Tailwind CSS
- Chart.js

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### AI

- Google Gemini API
- PdfReader

---

## 📂 Project Structure
EcoLedger-AI
│
├── frontend
│ ├── src
│ ├── public
│ └── package.json
│
├── backend
│ ├── config
│ ├── middleware
│ ├── models
│ ├── routes
│ ├── services
│ ├── uploads
│ ├── server.js
│ └── package.json
│
└── README.md

## Run commands

## Backend
cd backend

npm install

npm run dev
## Frontend
cd frontend

npm install

npm run dev


## 🔑 Environment Variables

Create:

backend/.env


PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

GEMINI_API_KEY=YOUR_GEMINI_KEY


## 📌 Future Improvements
AI ESG Assistant
RAG-based sustainability knowledge base
OCR support
Multi-format document ingestion
Company benchmarking
Multi-tenant deployment
## 👩‍💻 Author

Vanisha Rathore

B.Tech Electronics & Communication Engineering

Netaji Subhas University of Technology (NSUT)