import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Mail,
  Smartphone,
  UsersRound
} from "lucide-react";
import LogoBar from "../components/LogoBar";
import StepBar from "../components/StepBar";
import { api } from "../api";

const initial = {
  teamName: "",

  collegeName: "",

  department: "",

  member1: {
    name: "",
    email: "",
    mobile: ""
  },

  member2: {
    name: "",
    email: "",
    mobile: ""
  },

  paymentMode: "online",

  paymentConfirmed: false,

  utrId: "",

  amount: 100
};

export default function Register() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState(initial);

  const [config, setConfig] = useState({
    registrationFee: 100,
    upiId: "kadam yash0102-1@okhdfcbank",
    upiName: "Yash Kadam"
  });

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  // ============================================================
  // LOAD REGISTRATION CONFIG
  // ============================================================

  useEffect(() => {
    api
      .get("/registrations/config")
      .then(({ data }) => {
        setConfig({
          registrationFee: data.registrationFee || 100,
          upiId:
            data.upiId ||
            "kadam yash0102-1@okhdfcbank",
          upiName:
            data.upiName ||
            "Yash Kadam"
        });

        setForm((f) => ({
          ...f,
          amount: data.registrationFee || 100
        }));
      })
      .catch(() => {
        // Keep default payment configuration
      });
  }, []);

  // ============================================================
  // COMMON FIELD
  // ============================================================

  const setField = (key, value) => {
    setForm((f) => ({
      ...f,
      [key]: value
    }));
  };

  // ============================================================
  // MEMBER FIELD
  // ============================================================

  const setMember = (member, key, value) => {
    setForm((f) => ({
      ...f,
      [member]: {
        ...f[member],
        [key]: value
      }
    }));
  };

  // ============================================================
  // STEP 1 VALIDATION
  // ============================================================

  function validateStep1() {
    if (!form.teamName.trim()) {
      return "Please enter a team name.";
    }

    if (!form.collegeName.trim()) {
      return "Please enter your college name.";
    }

    if (!form.department.trim()) {
      return "Please enter your department.";
    }

    for (const [label, m] of [
      ["Member 1", form.member1],
      ["Member 2", form.member2]
    ]) {
      if (!m.name.trim()) {
        return `${label} name is required.`;
      }

      if (!/^\S+@\S+\.\S+$/.test(m.email)) {
        return `${label} email is invalid.`;
      }

      if (
        !/^\d{10}$/.test(
          m.mobile.replace(/\D/g, "")
        )
      ) {
        return `${label} mobile must be 10 digits.`;
      }
    }

    if (
      form.member1.email.toLowerCase() ===
      form.member2.email.toLowerCase()
    ) {
      return "Member 1 and Member 2 should use different email addresses.";
    }

    return "";
  }

  // ============================================================
  // NEXT STEP
  // ============================================================

  function next() {
    setError("");

    const msg = validateStep1();

    if (msg) {
      return setError(msg);
    }

    setStep(2);
  }

  // ============================================================
  // SUBMIT REGISTRATION
  // ============================================================

  async function submit() {
    setError("");

    if (form.paymentMode === "online") {
      if (!form.paymentConfirmed) {
        return setError(
          "Please tick 'I have completed the payment'."
        );
      }

      if (
        !/^[A-Za-z0-9]{8,35}$/.test(
          form.utrId.trim()
        )
      ) {
        return setError(
          "Enter a valid UTR ID (8–35 letters/numbers)."
        );
      }
    }

    setLoading(true);

    try {
      const { data } = await api.post(
        "/registrations",
        form
      );

      setResult(data.registration);

      setStep(3);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  if (result) {
    return (
      <div className="site dark-page register-page">

        <LogoBar />

        <div className="success-wrap">

          <motion.div
            className="success-card"
            initial={{
              scale: 0.92,
              opacity: 0
            }}
            animate={{
              scale: 1,
              opacity: 1
            }}
          >

            <div className="success-icon">
              <CheckCircle2 size={48} />
            </div>

            <div className="eyebrow">
              REGISTRATION SUCCESSFUL
            </div>

            <h1>
              Welcome to the VOID.
            </h1>

            <p>
              Your team has been registered.
              Keep these details safe.
            </p>

            <div className="result-grid">

              <div>
                <span>Registration ID</span>
                <b>
                  {result.registrationId}
                </b>
              </div>

              <div>
                <span>Team</span>
                <b>
                  {result.teamName}
                </b>
              </div>

              <div>
                <span>College</span>
                <b>
                  {result.collegeName}
                </b>
              </div>

              <div>
                <span>Department</span>
                <b>
                  {result.department}
                </b>
              </div>

              <div>
                <span>
                  Confirmation Code
                </span>

                <b>
                  {result.confirmationCode}
                </b>
              </div>

              <div>
                <span>Payment</span>

                <b>
                  {result.paymentMode.toUpperCase()}
                </b>
              </div>

            </div>

            <div className="notice">

              <Mail size={18} />

              {result.paymentMode ===
              "online"
                ? `A confirmation email was attempted for ${result.email}.`
                : "Your offline request is recorded. The coordinator will send the final confirmation email after collecting the fee."}

            </div>

            {result.paymentMode ===
              "offline" && (
              <div className="offline-note">

                Meet the event coordinator and
                pay the registration fee.

                The coordinator's offline desk
                will complete the payment record
                and email your confirmation.

              </div>
            )}

            <Link
              to="/"
              className="btn btn-primary"
            >
              Back to VOID RUN
            </Link>

          </motion.div>

        </div>

      </div>
    );
  }

  // ============================================================
  // MAIN REGISTRATION PAGE
  // ============================================================

  return (
    <div className="site dark-page register-page">

      <LogoBar />

      <main className="form-shell">

        <div className="form-heading">

          <div>

            <div className="eyebrow">
              TEAM REGISTRATION
            </div>

            <h1>
              Register for{" "}
              <span>VOID RUN</span>
            </h1>

            <p>
              Two members. One team.
              Complete the details below.
            </p>

          </div>

          <Link
            to="/"
            className="back-link"
          >
            <ArrowLeft size={17} />
            Home
          </Link>

        </div>

        <StepBar step={step} />

        {error && (
          <motion.div
            className="error-box"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
          >
            {error}
          </motion.div>
        )}

        {/* =====================================================
            STEP 1
        ===================================================== */}

        {step === 1 && (
          <motion.div
            className="form-card"
            initial={{
              opacity: 0,
              x: -20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
          >

            <div className="form-card-title">

              <UsersRound />

              <div>

                <h2>
                  Team & Members
                </h2>

                <p>
                  All fields are required.
                </p>

              </div>

            </div>

            {/* TEAM NAME */}

            <label>
              Team Name

              <input
                value={form.teamName}
                onChange={(e) =>
                  setField(
                    "teamName",
                    e.target.value
                  )
                }
                placeholder="e.g. Cipher Titans"
              />

            </label>

            {/* COLLEGE + DEPARTMENT */}

            <div
              className="member-grid"
              style={{
                marginBottom: "24px"
              }}
            >

              <label>
                College Name

                <input
                  value={form.collegeName}
                  onChange={(e) =>
                    setField(
                      "collegeName",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Adarsh Institute of Technology"
                />

              </label>

              <label>
                Department

                <input
                  value={form.department}
                  onChange={(e) =>
                    setField(
                      "department",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Computer Science & Engineering"
                />

              </label>

            </div>

            {/* MEMBERS */}

            <div className="member-grid">

              <MemberForm
                number="01"
                member={form.member1}
                setMember={(k, v) =>
                  setMember(
                    "member1",
                    k,
                    v
                  )
                }
              />

              <MemberForm
                number="02"
                member={form.member2}
                setMember={(k, v) =>
                  setMember(
                    "member2",
                    k,
                    v
                  )
                }
              />

            </div>

            <div className="form-actions end">

              <button
                className="btn btn-primary"
                onClick={next}
              >
                Next: Payment
                <ArrowRight size={19} />
              </button>

            </div>

          </motion.div>
        )}

        {/* =====================================================
            STEP 2
        ===================================================== */}

        {step === 2 && (
          <motion.div
            className="form-card"
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
          >

            <div className="form-card-title">

              <CreditCard />

              <div>

                <h2>
                  Payment
                </h2>

                <p>
                  Registration fee:{" "}
                  <b>
                    ₹{config.registrationFee}
                  </b>
                </p>

              </div>

            </div>

            {/* PAYMENT SWITCH */}

            <div className="payment-switch">

              <button
                type="button"
                className={
                  form.paymentMode ===
                  "online"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setField(
                    "paymentMode",
                    "online"
                  )
                }
              >
                <Smartphone />
                Online / UPI
              </button>

              <button
                type="button"
                className={
                  form.paymentMode ===
                  "offline"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setField(
                    "paymentMode",
                    "offline"
                  )
                }
              >
                <UsersRound />
                Offline
              </button>

            </div>

            {/* =================================================
                ONLINE PAYMENT
            ================================================= */}

            {form.paymentMode ===
            "online" ? (
              <div className="payment-area">

                {/* QR CARD */}

                <div className="qr-card">

                  <div
                    className="qr-glow"
                    style={{
                      background: "#ffffff",
                      padding: "12px",
                      borderRadius: "20px",
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >

                    <img
                      src="/payment-qr.jpeg"
                      alt="VOID RUN Payment QR"
                      style={{
                        width: "280px",
                        maxWidth: "100%",
                        height: "auto",
                        display: "block",
                        borderRadius: "12px"
                      }}
                    />

                  </div>

                  <p>
                    Scan this QR with
                    GPay / PhonePe /
                    Paytm / any UPI app
                  </p>

                  <small>
                    Pay{" "}
                    <b>
                      ₹{config.registrationFee}
                    </b>
                    {" "}to{" "}
                    <b>
                      {config.upiName}
                    </b>
                  </small>

                  <small
                    style={{
                      display: "block",
                      marginTop: "6px",
                      wordBreak: "break-all"
                    }}
                  >
                    UPI ID:{" "}
                    <b>
                      {config.upiId}
                    </b>
                  </small>

                </div>

                {/* PAYMENT FIELDS */}

                <div className="payment-fields">

                  <div
                    className="paid-check"
                    onClick={() =>
                      setField(
                        "paymentConfirmed",
                        !form.paymentConfirmed
                      )
                    }
                  >

                    <div
                      className={`fake-check ${
                        form.paymentConfirmed
                          ? "checked"
                          : ""
                      }`}
                    >
                      {form.paymentConfirmed
                        ? "✓"
                        : ""}
                    </div>

                    <div>

                      <b>
                        I have completed
                        the payment
                      </b>

                      <span>
                        Tick this only
                        after paying
                        ₹{config.registrationFee}.
                      </span>

                    </div>

                  </div>

                  <label>
                    UTR / Transaction ID

                    <input
                      value={form.utrId}
                      onChange={(e) =>
                        setField(
                          "utrId",
                          e.target.value.replace(
                            /\s/g,
                            ""
                          )
                        )
                      }
                      placeholder="Enter UTR / transaction reference"
                    />

                  </label>

                  <div className="info-box">

                    After payment, enter
                    the UTR / Transaction ID
                    shown in your UPI app.

                    <br />
                    <br />

                    UTR validation checks
                    the format and
                    duplicate entries.
                    Final payment
                    verification is
                    controlled by the
                    admin/coordinator.

                  </div>

                </div>

              </div>
            ) : (

              /* =================================================
                 OFFLINE PAYMENT
              ================================================= */

              <div className="offline-payment">

                <div className="offline-icon">

                  <UsersRound
                    size={34}
                  />

                </div>

                <h3>
                  Offline Payment
                </h3>

                <p>

                  Please meet the event
                  coordinator, pay the
                  registration fee, and
                  ask the coordinator to
                  confirm your registration.

                </p>

                <div className="info-box">

                  After you submit this
                  form, the coordinator
                  can complete the
                  offline payment record
                  and send your confirmation
                  email.

                </div>

              </div>

            )}

            {/* ACTIONS */}

            <div className="form-actions between">

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  setStep(1)
                }
              >
                <ArrowLeft />
                Back
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={submit}
                disabled={loading}
              >

                {loading
                  ? "Submitting..."
                  : "Submit Registration"}

                <CheckCircle2 />

              </button>

            </div>

          </motion.div>
        )}

      </main>

    </div>
  );
}

// ============================================================
// MEMBER FORM
// ============================================================

function MemberForm({
  number,
  member,
  setMember
}) {
  return (
    <div className="member-card">

      <div className="member-head">

        <span>
          {number}
        </span>

        <b>
          Member{" "}
          {number === "01"
            ? "1"
            : "2"}
        </b>

      </div>

      <label>
        Name

        <input
          value={member.name}
          onChange={(e) =>
            setMember(
              "name",
              e.target.value
            )
          }
          placeholder="Full name"
        />

      </label>

      <label>
        Email

        <input
          type="email"
          value={member.email}
          onChange={(e) =>
            setMember(
              "email",
              e.target.value
            )
          }
          placeholder="name@example.com"
        />

      </label>

      <label>
        Mobile

        <input
          type="tel"
          value={member.mobile}
          onChange={(e) =>
            setMember(
              "mobile",
              e.target.value
            )
          }
          placeholder="10-digit mobile"
        />

      </label>

    </div>
  );
}