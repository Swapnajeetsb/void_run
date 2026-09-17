const nodemailer = require("nodemailer");
const { smtp } = require("../config");

let transporter = null;

// ============================================================
// CREATE SMTP CONNECTION ONCE
// ============================================================

function getTransporter() {
  if (!smtp.host || !smtp.user || !smtp.pass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,

      auth: {
        user: smtp.user,
        pass: smtp.pass
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
  }

  return transporter;
}

// ============================================================
// EMAIL TEMPLATE
// ============================================================

function registrationEmail({
  registration,
  recipient,
  type = "success"
}) {

  const subject =
    type === "offline"
      ? "VOID RUN — Offline Registration Confirmed"
      : "VOID RUN — Registration Successful";

  const paymentLine =
    registration.paymentMode === "online"
      ? `Online payment submitted. UTR: ${registration.utrId}`
      : "Offline payment recorded by the coordinator.";

  const html = `
  <div style="
    font-family:Arial,sans-serif;
    background:#080b14;
    padding:30px;
    color:#fff;
  ">

    <div style="
      max-width:650px;
      margin:auto;
      background:#111827;
      border:1px solid #26334d;
      border-radius:20px;
      padding:30px;
    ">

      <h1 style="
        margin:0;
        color:#f97316;
        letter-spacing:2px;
      ">
        VOID RUN
      </h1>

      <p style="color:#94a3b8">
        CSE Department Competition
      </p>

      <h2>
        Registration Successful 🎉
      </h2>

      <p>
        Hello ${recipient || registration.member1.name},
      </p>

      <p>
        Your team registration has been recorded successfully.
      </p>

      <div style="
        background:#0b1220;
        border-radius:14px;
        padding:18px;
      ">

        <p>
          <b>Registration ID:</b>
          ${registration.registrationId}
        </p>

        <p>
          <b>Team:</b>
          ${registration.teamName}
        </p>

        <p>
          <b>Confirmation Code:</b>
          ${registration.confirmationCode}
        </p>

        <p>
          <b>Amount:</b>
          ₹${registration.amount}
        </p>

        <p>
          <b>Payment:</b>
          ${paymentLine}
        </p>

      </div>

      <p style="margin-top:22px">
        Keep this confirmation code safely for the event.
      </p>

      <p style="color:#94a3b8">
        Adarsh Institute of Technology and Research Center, Vita
        <br/>
        Computer Science & Engineering Department
      </p>

    </div>

  </div>
  `;

  return {
    subject,
    html
  };
}

// ============================================================
// SEND EMAIL
// ============================================================

async function sendRegistrationEmail(args) {

  const transporter = getTransporter();

  if (!transporter) {

    console.warn(
      "⚠️ SMTP is not configured."
    );

    return {
      sent: false,
      reason: "SMTP not configured"
    };
  }

  const mail = registrationEmail(args);

  try {

    const info = await transporter.sendMail({

      from: smtp.from,

      to: args.to,

      subject: mail.subject,

      html: mail.html
    });

    console.log(
      `📧 Email accepted by SMTP: ${args.to}`
    );

    return {
      sent: true,
      messageId: info.messageId
    };

  } catch (error) {

    console.error(
      `❌ Email error for ${args.to}:`,
      error.message
    );

    return {
      sent: false,
      reason: error.message
    };
  }
}
// ============================================================
// SMTP TEST
// ============================================================



// ============================================================
// EXPORT
// ============================================================

module.exports = {
  sendRegistrationEmail
};