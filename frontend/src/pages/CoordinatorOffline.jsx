import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, IndianRupee, LogOut, Mail, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const empty = {
  teamName: "",
  amount: 100,
  notes: "",
  member1: { name: "", email: "", mobile: "" },
  member2: { name: "", email: "", mobile: "" }
};

export default function CoordinatorOffline() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("voidrun_user") || "{}");

  function setM(member, key, value) {
    setForm(f => ({...f, [member]: {...f[member], [key]: value}}));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/admin/offline-registration", form);
      setSuccess(data.registration);
      setForm(empty);
    } catch (e) {
      setError(e.response?.data?.message || "Could not create offline registration.");
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="site dark-page admin-page">
      <AdminTop user={user} logout={logout}/>
      <main className="admin-content">
        <div className="page-head">
          <div><div className="eyebrow">COORDINATOR DESK</div><h1>Offline Payment Registration</h1><p>Record a team after collecting the registration fee.</p></div>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && (
          <motion.div className="success-banner" initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
            <CheckCircle2/>
            <div><b>Registration created: {success.registrationId}</b><span>Confirmation code: <strong>{success.confirmationCode}</strong> — email attempted for {success.member1.email}</span></div>
          </motion.div>
        )}

        <form className="admin-form-card" onSubmit={submit}>
          <label>Team Name<input value={form.teamName} onChange={e=>setForm({...form,teamName:e.target.value})}/></label>
          <div className="member-grid">
            <MiniMember title="Member 1" member={form.member1} setMember={(k,v)=>setM("member1",k,v)}/>
            <MiniMember title="Member 2" member={form.member2} setMember={(k,v)=>setM("member2",k,v)}/>
          </div>
          <div className="admin-two">
            <label>Amount Received (₹)<input type="number" min="0" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label>
            <label>Notes<input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Cash / coordinator notes"/></label>
          </div>
          <button className="btn btn-primary"><CheckCircle2/> Confirm Offline Registration & Email Code</button>
        </form>
      </main>
    </div>
  );
}

function MiniMember({title,member,setMember}) {
  return <div className="member-card">
    <div className="member-head"><Users size={17}/><b>{title}</b></div>
    <label>Name<input value={member.name} onChange={e=>setMember("name",e.target.value)}/></label>
    <label>Email<input type="email" value={member.email} onChange={e=>setMember("email",e.target.value)}/></label>
    <label>Mobile<input value={member.mobile} onChange={e=>setMember("mobile",e.target.value)}/></label>
  </div>
}

function AdminTop({user,logout}) {
  return <header className="admin-top">
    <div className="admin-brand"><img src="/assets/aitrc-logo.png"/><div><b>VOID RUN</b><span>STAFF CONSOLE</span></div></div>
    <div className="admin-user"><span>{user.name} · {user.role}</span><button onClick={logout}><LogOut size={17}/></button></div>
  </header>
}
