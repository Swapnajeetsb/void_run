const { validationResult } = require("express-validator");
const Registration = require("../models/Registration");
const { registrationFee } = require("../config");
const { registrationId, shortCode } = require("../utils/codes");
const { sendRegistrationEmail } = require("../services/mailer");

function normalizeMobile(v) {
  return String(v || "").replace(/\D/g, "");
}

function validUTR(utr) {
  return /^[A-Za-z0-9]{8,35}$/.test(String(utr || "").trim());
}

async function createRegistration(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const body = req.body;

    const paymentMode =
      body.paymentMode === "offline"
        ? "offline"
        : "online";

    // =========================================================
    // ONLINE PAYMENT VALIDATION
    // =========================================================

    if (paymentMode === "online") {
      if (!body.paymentConfirmed) {
        return res.status(400).json({
          success: false,
          message:
            "Please confirm that you completed the online payment."
        });
      }

      if (!validUTR(body.utrId)) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid UTR ID (8–35 letters/numbers)."
        });
      }

      const cleanUTR = body.utrId.trim();

      const duplicate = await Registration.findOne({
        utrId: cleanUTR
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "This UTR ID has already been used."
        });
      }
    }

    // =========================================================
    // REGISTRATION DATA
    // =========================================================

    const registrationData = {
      registrationId: registrationId(),

      teamName: body.teamName.trim(),

      member1: {
        name: body.member1.name.trim(),
        email: body.member1.email.trim().toLowerCase(),
        mobile: normalizeMobile(body.member1.mobile)
      },

      member2: {
        name: body.member2.name.trim(),
        email: body.member2.email.trim().toLowerCase(),
        mobile: normalizeMobile(body.member2.mobile)
      },

      paymentMode,

      amount: Number(
        body.amount || registrationFee
      ),

      paymentStatus:
        paymentMode === "online"
          ? "submitted"
          : "pending",

      paidAt:
        paymentMode === "online"
          ? new Date()
          : null,

      confirmationCode: shortCode("VOID"),

      notes:
        paymentMode === "offline"
          ? "Participant requested offline payment."
          : ""
    };

    // =========================================================
    // UTR ONLY FOR ONLINE PAYMENT
    // =========================================================

    if (paymentMode === "online") {
      registrationData.utrId = body.utrId.trim();
    }

    // =========================================================
    // CREATE REGISTRATION
    // =========================================================

    const reg = await Registration.create(
      registrationData
    );

    // =========================================================
    // EMAIL
    // =========================================================

    const emailTo = reg.member1.email;

    // =========================================================
    // OFFLINE PAYMENT
    // =========================================================

   if (paymentMode === "offline") {
  return res.status(201).json({
    success: true,
    message:
      "Offline registration request submitted successfully. Meet the coordinator and pay the registration fee.",
    registration: {
      registrationId: reg.registrationId,
      teamName: reg.teamName,
      confirmationCode: reg.confirmationCode,
      paymentMode: reg.paymentMode,
      paymentStatus: reg.paymentStatus,
      email: emailTo
    },
    email: {
      sent: false,
      status: "coordinator_confirmation_required"
    }
  });
}
    // =========================================================
    // ONLINE PAYMENT
    // =========================================================
    // IMPORTANT:
    // Email ला await करत नाही.
    // Registration response लगेच user ला मिळेल.
    // Email background मध्ये send होईल.
    // =========================================================

    sendRegistrationEmail({
      registration: reg,
      recipient: reg.member1.name,
      to: emailTo,
      type: "success"
    })
      .then(async (emailResult) => {

        if (emailResult?.sent) {

          reg.confirmationSentAt = new Date();

          await reg.save();

          console.log(
            `📧 Confirmation email sent to ${emailTo}`
          );

        } else {

          console.log(
            `⚠️ Email not sent to ${emailTo}:`,
            emailResult?.reason || "Unknown reason"
          );
        }

      })
      .catch((mailError) => {

        console.error(
          `❌ Background email failed for ${emailTo}:`,
          mailError.message
        );

      });

    // =========================================================
    // IMMEDIATE RESPONSE
    // =========================================================

    return res.status(201).json({

      success: true,

      message:
        "Registration submitted successfully.",

      registration: {

        registrationId:
          reg.registrationId,

        teamName:
          reg.teamName,

        confirmationCode:
          reg.confirmationCode,

        paymentMode:
          reg.paymentMode,

        paymentStatus:
          reg.paymentStatus,

        email:
          emailTo
      },

      email: {
        sent: false,
        status: "processing"
      }
    });

  } catch (error) {

    // =========================================================
    // DUPLICATE UTR SAFETY
    // =========================================================

    if (
      error?.code === 11000 &&
      error?.keyPattern?.utrId
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This UTR ID has already been used."
      });
    }

    console.error(
      "Registration Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  createRegistration
};