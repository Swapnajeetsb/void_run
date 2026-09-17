import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, Mail, Smartphone, UserRound, UsersRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import LogoBar from "../components/LogoBar";
import StepBar from "../components/StepBar";
import { api } from "../api";

const initial = {
  teamName: "",
  member1: { name: "", email: "", mobile: "" },
  member2: { name: "", email: "", mobile: "" },
  paymentMode: "online",
  paymentConfirmed: false,
  utrId: "",
  amount: 100
};

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initial);
  const [config, setConfig] = useState({ registrationFee: 100, upiId: "", upiName: "VOID RUN CSE" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("/registrations/config")
      .then(({ data }) => {
        setConfig({ registrationFee: data.registrationFee, upiId: data.upiId, upiName: data.upiName });
        setForm((f) => ({ ...f, amount: data.registrationFee }));
      })
      .catch(() => {});
  }, []);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setMember = (member, key, value) =>
    setForm((f) => ({ ...f, [member]: { ...f[member], [key]: value } }));

  const upiUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: config.upiId || "yourupi@bank",
      pn: config.upiName || "VOID RUN CSE",
      am: String(config.registrationFee || 100),
      cu: "INR",
      tn: `VOID RUN ${form.teamName || "TEAM"}`
    });
    return `upi://pay?${params.toString()}`;
  }, [config, form.teamName]);

  function validateStep1() {
    if (!form.teamName.trim()) return "Please enter a team name.";
    for (const [label, m] of [["Member 1", form.member1], ["Member 2", form.member2]]) {
      if (!m.name.trim()) return `${label} name is required.`;
      if (!/^\S+@\S+\.\S+$/.test(m.email)) return `${label} email is invalid.`;
      if (!/^\d{10}$/.test(m.mobile.replace(/\D/g, ""))) return `${label} mobile must be 10 digits.`;
    }
    if (form.member1.email.toLowerCase() === form.member2.email.toLowerCase()) {
      return "Member 1 and Member 2 should use different email addresses.";
    }
    return "";
  }

  function next() {
    setError("");
    const msg = validateStep1();
    if (msg) return setError(msg);
    setStep(2);
  }

  async function submit() {
    setError("");
    if (form.paymentMode === "online") {
      if (!form.paymentConfirmed) return setError("Please tick 'I have completed the payment'.");
      if (!/^[A-Za-z0-9]{8,35}$/.test(form.utrId.trim())) {
        return setError("Enter a valid UTR ID (8–35 letters/numbers).");
      }
    }

    setLoading(true);
    try {
      const { data } = await api.post("/registrations", form);
      setResult(data.registration);
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="site dark-page register-page">
        <LogoBar />
        <div className="success-wrap">
          <motion.div
            className="success-card"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="success-icon"><CheckCircle2 size={48}/></div>
            <div className="eyebrow">REGISTRATION SUCCESSFUL</div>
            <h1>Welcome to the VOID.</h1>
            <p>Your team has been registered. Keep these details safe.</p>
            <div className="result-grid">
              <div><span>Registration ID</span><b>{result.registrationId}</b></div>
              <div><span>Team</span><b>{result.teamName}</b></div>
              <div><span>Confirmation Code</span><b>{result.confirmationCode}</b></div>
              <div><span>Payment</span><b>{result.paymentMode.toUpperCase()}</b></div>
            </div>
            <div className="notice"><Mail size={18}/> {result.paymentMode === "online" ? `A confirmation email was attempted for ${result.email}.` : "Your offline request is recorded. The coordinator will send the final confirmation code by email after collecting the fee."}</div>
            {result.paymentMode === "offline" && (
              <div className="offline-note">
                Meet the event coordinator and pay the registration fee. The coordinator's offline desk will complete the payment record and email your confirmation code.
              </div>
            )}
            <Link to="/" className="btn btn-primary">Back to VOID RUN</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="site dark-page register-page">
      <LogoBar />
      <main className="form-shell">
        <div className="form-heading">
          <div>
            <div className="eyebrow">TEAM REGISTRATION</div>
            <h1>Register for <span>VOID RUN</span></h1>
            <p>Two members. One team. Complete the details below.</p>
          </div>
          <Link to="/" className="back-link"><ArrowLeft size={17}/> Home</Link>
        </div>

        <StepBar step={step}/>

        {error && <motion.div className="error-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}

        {step === 1 && (
          <motion.div className="form-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="form-card-title"><UsersRound/><div><h2>Team & Members</h2><p>All fields are required.</p></div></div>

            <label>Team Name<input value={form.teamName} onChange={e => setField("teamName", e.target.value)} placeholder="e.g. Cipher Titans"/></label>

            <div className="member-grid">
              <MemberForm number="01" member={form.member1} setMember={(k,v)=>setMember("member1",k,v)}/>
              <MemberForm number="02" member={form.member2} setMember={(k,v)=>setMember("member2",k,v)}/>
            </div>

            <div className="form-actions end"><button className="btn btn-primary" onClick={next}>Next: Payment <ArrowRight/></button></div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div className="form-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="form-card-title"><CreditCard/><div><h2>Payment</h2><p>Registration fee: <b>₹{config.registrationFee}</b></p></div></div>

            <div className="payment-switch">
              <button className={form.paymentMode === "online" ? "selected" : ""} onClick={() => setField("paymentMode", "online")}><Smartphone/> Online / UPI</button>
              <button className={form.paymentMode === "offline" ? "selected" : ""} onClick={() => setField("paymentMode", "offline")}><UsersRound/> Offline</button>
            </div>

            {form.paymentMode === "online" ? (
              <div className="payment-area">
                <div className="qr-card">
                  <div className="qr-glow"><QRCodeSVG value={upiUrl} size={220} bgColor="#ffffff" fgColor="#070a12" includeMargin /></div>
                  <p>Scan with GPay / PhonePe / Paytm / UPI app</p>
                  <small>Pay ₹{config.registrationFee} to <b>{config.upiId || "UPI ID will appear after setup"}</b></small>
                </div>

                <div className="payment-fields">
                  <div className="paid-check" onClick={() => setField("paymentConfirmed", !form.paymentConfirmed)}>
                    <div className={`fake-check ${form.paymentConfirmed ? "checked" : ""}`}>{form.paymentConfirmed ? "✓" : ""}</div>
                    <div><b>I have completed the payment</b><span>Tick this only after paying the displayed amount.</span></div>
                  </div>

                  <label>UTR / Transaction ID<input value={form.utrId} onChange={e => setField("utrId", e.target.value.replace(/\s/g, ""))} placeholder="Enter UTR / transaction reference"/></label>
                  <div className="info-box">UTR validation checks the format and duplicate entries. Final payment verification is controlled by the admin/coordinator.</div>
                </div>
              </div>
            ) : (
              <div className="offline-payment">
                <div className="offline-icon"><UsersRound size={34}/></div>
                <h3>Offline Payment</h3>
                <p>Please meet the event coordinator, pay the registration fee, and ask the coordinator to confirm your registration.</p>
                <div className="info-box">After you submit this form, the coordinator can complete the offline payment record and send your confirmation code by email.</div>
              </div>
            )}

            <div className="form-actions between">
              <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft/> Back</button>
              <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? "Submitting..." : "Submit Registration"} <CheckCircle2/></button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function MemberForm({ number, member, setMember }) {
  return (
    <div className="member-card">
      <div className="member-head"><span>{number}</span><b>Member {number === "01" ? "1" : "2"}</b></div>
      <label>Name<input value={member.name} onChange={e=>setMember("name",e.target.value)} placeholder="Full name"/></label>
      <label>Email<input value={member.email} onChange={e=>setMember("email",e.target.value)} placeholder="name@example.com"/></label>
      <label>Mobile<input value={member.mobile} onChange={e=>setMember("mobile",e.target.value)} placeholder="10-digit mobile"/></label>
    </div>
  );
}
