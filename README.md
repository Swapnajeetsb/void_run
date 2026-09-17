# VOID RUN — CSE Department Competition Registration System

A full-stack registration and administration system for the **VOID RUN** puzzle competition at:

**Adarsh Institute of Technology and Research Center, Vita**  
Computer Science & Engineering Department

## Stack
- Frontend: React + Vite + Framer Motion + Lucide React
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt
- Email: Nodemailer
- Excel export: SheetJS (`xlsx`)
- Payment display: UPI QR using `qrcode.react`
- Validation: `express-validator`

## Main features

### Participant
1. Multi-step registration.
2. Team name + Member 1 + Member 2.
3. Name, email and mobile for both members.
4. Online payment:
   - UPI QR scanner.
   - "I have paid" confirmation.
   - UTR ID entry.
   - Server validates UTR format and blocks duplicate UTRs.
5. Offline payment:
   - Participant submits an offline request.
   - Message tells them to meet the coordinator and pay the fee.
6. Registration confirmation email after successful online/offline registration.
7. Registration ID and coupon/confirmation code in the email.

### Coordinator
- Login is available only to admin/coordinator accounts.
- Offline Registration form.
- Coordinator enters team, members, amount received and payment details.
- System generates a unique confirmation coupon/code.
- Coupon is emailed to the participant.

### Admin
- Dashboard.
- View/search/filter all teams.
- Payment status.
- Online/offline payment details.
- Download registrations as Excel.
- Add coordinators.
- See registration statistics.
- Update payment status for registrations.
- Logout.

## Important payment note
The application can validate:
- required UTR,
- UTR format,
- duplicate UTR in your database.

It **cannot independently prove that a UPI/bank payment actually happened** just from a UTR. For automatic bank-side verification, connect a payment gateway or bank/payment provider API. Until then, admin/coordinator verification is required.

## Run locally

### 1. Backend
```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

### 2. Frontend
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```

Open:
`http://localhost:5173`

## MongoDB
Local:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/void_run
```

Or MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/void_run
```

## Seed first admin
From `backend`:
```powershell
npm run seed:admin
```

Default credentials come from `.env`.

## Email
For Gmail, use an **App Password**, not your normal Gmail password.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourcollegeemail@gmail.com
SMTP_PASS=your-16-character-app-password
MAIL_FROM="VOID RUN | CSE Department <yourcollegeemail@gmail.com>"
```

## UPI
Set:
```env
UPI_ID=yourupi@bank
UPI_NAME=VOID RUN CSE
REGISTRATION_FEE=100
```

The frontend automatically builds the QR payment payload from the UPI ID and fee.

## Production checklist
- Change JWT secret.
- Change default admin password.
- Use MongoDB Atlas.
- Use HTTPS.
- Use a real domain.
- Configure SMTP.
- Configure the real UPI ID.
- Verify payment manually or integrate a payment gateway.
- Restrict admin/coordinator routes behind HTTPS.
