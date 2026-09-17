const bcrypt = require("bcryptjs");

const Registration = require("../models/Registration");
const User = require("../models/User");

const XLSX = require("xlsx");

const {
  sendRegistrationEmail
} = require("../services/mailer");

const {
  shortCode,
  registrationId
} = require("../utils/codes");


// ============================================================
// DASHBOARD
// ============================================================

async function dashboard(req, res) {

  try {

    const [
      total,
      online,
      offline,
      pending,
      verified,
      rejected,
      coordinators
    ] = await Promise.all([

      Registration.countDocuments(),

      Registration.countDocuments({
        paymentMode: "online"
      }),

      Registration.countDocuments({
        paymentMode: "offline"
      }),

      Registration.countDocuments({
        paymentStatus: {
          $in: ["pending", "submitted"]
        }
      }),

      Registration.countDocuments({
        paymentStatus: {
          $in: ["verified", "offline-paid"]
        }
      }),

      Registration.countDocuments({
        paymentStatus: "rejected"
      }),

      User.countDocuments({
        role: "coordinator",
        active: true
      })

    ]);


    res.json({
      success: true,

      stats: {
        total,
        online,
        offline,
        pending,
        verified,
        rejected,
        coordinators
      }
    });

  } catch (error) {

    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

}


// ============================================================
// LIST REGISTRATIONS
// ============================================================

async function listRegistrations(req, res) {

  try {

    const q = String(
      req.query.q || ""
    ).trim();

    const paymentMode =
      req.query.paymentMode;

    const paymentStatus =
      req.query.paymentStatus;


    const filter = {};


    if (q) {

      filter.$or = [

        {
          teamName: {
            $regex: q,
            $options: "i"
          }
        },

        {
          registrationId: {
            $regex: q,
            $options: "i"
          }
        },

        {
          "member1.name": {
            $regex: q,
            $options: "i"
          }
        },

        {
          "member2.name": {
            $regex: q,
            $options: "i"
          }
        },

        {
          "member1.email": {
            $regex: q,
            $options: "i"
          }
        },

        {
          "member2.email": {
            $regex: q,
            $options: "i"
          }
        }

      ];

    }


    if (
      ["online", "offline"].includes(
        paymentMode
      )
    ) {

      filter.paymentMode =
        paymentMode;

    }


    if (
      [
        "pending",
        "submitted",
        "verified",
        "rejected",
        "offline-paid"
      ].includes(paymentStatus)
    ) {

      filter.paymentStatus =
        paymentStatus;

    }


    const registrations =
      await Registration
        .find(filter)
        .sort({
          createdAt: -1
        })
        .populate(
          "coordinatorId",
          "name email"
        );


    res.json({
      success: true,
      registrations
    });

  } catch (error) {

    console.error(
      "List Registrations Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

}


// ============================================================
// UPDATE PAYMENT
// ============================================================
// IMPORTANT:
// Coordinator/Admin clicks "Offline Paid"
// → paymentStatus = offline-paid
// → paidAt = current time
// → coordinatorId = logged-in user
// → confirmation email sent
// ============================================================

async function updatePayment(req, res) {

  try {

    const allowed = [
      "pending",
      "submitted",
      "verified",
      "rejected",
      "offline-paid"
    ];


    const status =
      String(
        req.body.status || ""
      ).trim();


    if (!allowed.includes(status)) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid payment status"

      });

    }


    // ========================================================
    // FIND REGISTRATION FIRST
    // ========================================================

    const reg =
      await Registration.findById(
        req.params.id
      );


    if (!reg) {

      return res.status(404).json({

        success: false,

        message:
          "Registration not found"

      });

    }


    // ========================================================
    // CHECK OLD STATUS
    // ========================================================

    const oldStatus =
      reg.paymentStatus;


    // ========================================================
    // UPDATE PAYMENT STATUS
    // ========================================================

    reg.paymentStatus =
      status;


    // ========================================================
    // PAID TIME
    // ========================================================

    if (
      status === "verified" ||
      status === "offline-paid"
    ) {

      reg.paidAt =
        new Date();

    }


    // ========================================================
    // COORDINATOR / ADMIN ID
    // ========================================================

    if (
      status === "offline-paid" &&
      req.user &&
      req.user._id
    ) {

      reg.coordinatorId =
        req.user._id;

    }


    // ========================================================
    // OFFLINE PAID EMAIL
    // ========================================================

    let email = {
      sent: false,
      status: "not_required"
    };


    if (
      status === "offline-paid"
    ) {

      // ------------------------------------------------------
      // IMPORTANT:
      // Existing participant registration वर
      // पहिल्यांदाच Offline Paid झाल्यावरच email.
      // ------------------------------------------------------

      if (!reg.confirmationSentAt) {

        try {

          email =
            await sendRegistrationEmail({

              registration: reg,

              recipient:
                reg.member1.name,

              to:
                reg.member1.email,

              type:
                "offline"

            });


            // ------------------------------------------------
            // EMAIL SUCCESS
            // ------------------------------------------------

            if (email?.sent) {

              reg.confirmationSentAt =
                new Date();

              console.log(
                `📧 Offline confirmation email sent to ${reg.member1.email}`
              );

            } else {

              console.log(
                `⚠️ Offline confirmation email was not sent to ${reg.member1.email}:`,
                email?.reason ||
                "Unknown reason"
              );

            }

        } catch (mailError) {

          console.error(
            `❌ Offline confirmation email failed for ${reg.member1.email}:`,
            mailError.message
          );


          email = {

            sent: false,

            reason:
              mailError.message

          };

        }

      } else {

        // ----------------------------------------------------
        // EMAIL ALREADY SENT
        // ----------------------------------------------------

        email = {

          sent: true,

          status:
            "already_sent",

          message:
            "Confirmation email was already sent."

        };

      }

    }


    // ========================================================
    // SAVE EVERYTHING
    // ========================================================

    await reg.save();


    // ========================================================
    // RESPONSE MESSAGE
    // ========================================================

    let message =
      "Payment status updated successfully.";


    if (
      status === "offline-paid"
    ) {

      if (
        email.sent &&
        email.status !== "already_sent"
      ) {

        message =
          "Offline payment marked as paid and confirmation email sent successfully.";

      } else if (
        email.status === "already_sent"
      ) {

        message =
          "Offline payment is already confirmed and confirmation email was already sent.";

      } else {

        message =
          "Offline payment marked as paid, but confirmation email could not be sent.";

      }

    }


    // ========================================================
    // FINAL RESPONSE
    // ========================================================

    return res.json({

      success: true,

      message,

      registration: reg,

      email

    });


  } catch (error) {

    console.error(
      "Update Payment Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

}


// ============================================================
// ADD COORDINATOR
// ============================================================

async function addCoordinator(req, res) {

  try {

    const {
      name,
      email,
      password
    } = req.body;


    if (
      !name ||
      !email ||
      !password ||
      password.length < 6
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Name, email and password (6+ chars) are required."

      });

    }


    const normalized =
      email
        .trim()
        .toLowerCase();


    if (
      await User.findOne({
        email: normalized
      })
    ) {

      return res.status(409).json({

        success: false,

        message:
          "An account with this email already exists."

      });

    }


    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );


    const user =
      await User.create({

        name:
          name.trim(),

        email:
          normalized,

        passwordHash,

        role:
          "coordinator"

      });


    res.status(201).json({

      success: true,

      message:
        "Coordinator added successfully.",

      coordinator: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role

      }

    });

  } catch (error) {

    console.error(
      "Add Coordinator Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

}


// ============================================================
// LIST COORDINATORS
// ============================================================

async function listCoordinators(req, res) {

  try {

    const users =
      await User
        .find({
          role: "coordinator"
        })
        .select(
          "name email active createdAt"
        )
        .sort({
          createdAt: -1
        });


    res.json({

      success: true,

      coordinators:
        users

    });

  } catch (error) {

    console.error(
      "List Coordinators Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

}


// ============================================================
// CREATE OFFLINE REGISTRATION BY COORDINATOR
// ============================================================

async function createOfflineRegistration(req, res) {

  try {

    const b =
      req.body;


    if (
      !b.teamName ||
      !b.member1?.name ||
      !b.member1?.email ||
      !b.member1?.mobile ||
      !b.member2?.name ||
      !b.member2?.email ||
      !b.member2?.mobile ||
      !b.amount
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Complete team, member and amount details are required."

      });

    }


    const reg =
      await Registration.create({

        registrationId:
          registrationId(),

        teamName:
          b.teamName.trim(),

        member1: {

          name:
            b.member1.name.trim(),

          email:
            b.member1.email
              .trim()
              .toLowerCase(),

          mobile:
            b.member1.mobile

        },

        member2: {

          name:
            b.member2.name.trim(),

          email:
            b.member2.email
              .trim()
              .toLowerCase(),

          mobile:
            b.member2.mobile

        },

        paymentMode:
          "offline",

        amount:
          Number(b.amount),

        paymentStatus:
          "offline-paid",

        paidAt:
          new Date(),

        confirmationCode:
          shortCode("OFF"),

        coordinatorId:
          req.user._id,

        notes:
          b.notes || ""

      });


    // ========================================================
    // EMAIL
    // ========================================================

    let email = {
      sent: false
    };


    try {

      email =
        await sendRegistrationEmail({

          registration:
            reg,

          recipient:
            reg.member1.name,

          to:
            reg.member1.email,

          type:
            "offline"

        });


      if (email.sent) {

        reg.confirmationSentAt =
          new Date();

        await reg.save();

      }

    } catch (e) {

      email = {

        sent: false,

        reason:
          e.message

      };

    }


    res.status(201).json({

      success: true,

      message:
        "Offline registration created. Confirmation code generated and email attempted.",

      registration:
        reg,

      email

    });

  } catch (error) {

    console.error(
      "Create Offline Registration Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

}


// ============================================================
// EXPORT EXCEL
// ============================================================

async function exportExcel(req, res) {

  try {

    const rows =
      await Registration
        .find()
        .sort({
          createdAt: -1
        })
        .lean();


    const data =
      rows.map((r) => ({

        "Registration ID":
          r.registrationId,

        "Team Name":
          r.teamName,

        "Member 1 Name":
          r.member1.name,

        "Member 1 Email":
          r.member1.email,

        "Member 1 Mobile":
          r.member1.mobile,

        "Member 2 Name":
          r.member2.name,

        "Member 2 Email":
          r.member2.email,

        "Member 2 Mobile":
          r.member2.mobile,

        "Payment Mode":
          r.paymentMode,

        "Amount":
          r.amount,

        "Payment Status":
          r.paymentStatus,

        "UTR ID":
          r.utrId || "",

        "Confirmation Code":
          r.confirmationCode,

        "Created At":
          new Date(
            r.createdAt
          ).toLocaleString(
            "en-IN"
          )

      }));


    const workbook =
      XLSX.utils.book_new();


    const sheet =
      XLSX.utils.json_to_sheet(
        data
      );


    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      "Registrations"
    );


    const buffer =
      XLSX.write(
        workbook,
        {
          type: "buffer",
          bookType: "xlsx"
        }
      );


    res.setHeader(
      "Content-Disposition",
      'attachment; filename="void-run-registrations.xlsx"'
    );


    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );


    res.send(buffer);

  } catch (error) {

    console.error(
      "Export Excel Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  dashboard,

  listRegistrations,

  updatePayment,

  addCoordinator,

  listCoordinators,

  createOfflineRegistration,

  exportExcel

};