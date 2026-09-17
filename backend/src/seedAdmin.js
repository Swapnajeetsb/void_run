require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./db");
const User = require("./models/User");

(async () => {
  try {
    await connectDB();

    const email = String(process.env.ADMIN_EMAIL || "admin@voidrun.local").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const name = process.env.ADMIN_NAME || "VOID RUN Admin";

    const exists = await User.findOne({ email });

    if (exists) {
      console.log(`Admin already exists: ${email}`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash, role: "admin" });

    console.log("Admin created.");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
