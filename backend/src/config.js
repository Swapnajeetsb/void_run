require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT || 8080),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/void_run",
  jwtSecret: process.env.JWT_SECRET || "development-secret-change-me",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  registrationFee: Number(process.env.REGISTRATION_FEE || 100),
  upiId: process.env.UPI_ID || "yourupi@bank",
  upiName: process.env.UPI_NAME || "VOID RUN CSE",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.MAIL_FROM || process.env.SMTP_USER || ""
  }
};
