import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet, LogOut, Plus, Search, ShieldCheck, Users, XCircle, CheckCircle2, Clock3, CreditCard, UserPlus, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, API } from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("voidrun_user") || "{}");
  const [stats, setStats] = useState({});
  const [rows, setRows] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("");
  const [showCoord, setShowCoord] = useState(false);
  const [coord, setCoord] = useState({name:"",email:"",password:""});
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const [d, r] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/registrations", { params: { q, paymentMode: mode, paymentStatus: status }})
      ]);
      setStats(d.data.stats);
      setRows(r.data.registrations);
      if (user.role === "admin") {
        const c = await api.get("/admin/coordinators");
        setCoordinators(c.data.coordinators);
      }
    } catch (e) {
      if (e.response?.status === 401) logout();
    }
  }

  useEffect(() => { load(); }, [q, mode, status]);

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  async function updatePayment(id, nextStatus) {
    try {
      await api.patch(`/admin/registrations/${id}/payment`, { status: nextStatus });
      setNotice("Payment status updated.");
      load();
    } catch (e) {
      setNotice(e.response?.data?.message || "Could not update status.");
    }
  }

  async function addCoordinator(e) {
    e.preventDefault();
    try {
      await api.post("/admin/coordinators", coord);
      setNotice("Coordinator added.");
      setCoord({name:"",email:"",password:""});
      setShowCoord(false);
      load();
    } catch (e) {
      setNotice(e.response?.data?.message || "Could not add coordinator.");
    }
  }

  async function downloadExcel() {
    const token = localStorage.getItem("voidrun_token");
    const response = await fetch(`${API}/admin/export`, { headers: { Authorization: `Bearer ${token}` }});
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "void-run-registrations.xlsx"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="site dark-page admin-page">
      <header className="admin-top">
        <div className="admin-brand"><img src="/assets/aitrc-logo.png"/><div><b>VOID RUN</b><span>ADMIN CONSOLE</span></div></div>
        <div className="admin-actions">
          {user.role === "admin" && <button className="top-btn" onClick={()=>setShowCoord(true)}><UserPlus/> Add Coordinator</button>}
          <button className="top-btn" onClick={()=>navigate("/coordinator/offline")}><ClipboardList/> Offline Desk</button>
          <span className="staff-name">{user.name} · {user.role}</span>
          <button className="icon-btn" onClick={logout}><LogOut/></button>
        </div>
      </header>

      <main className="admin-content">
        <div className="page-head">
          <div><div className="eyebrow">CONTROL CENTER</div><h1>Registration Dashboard</h1><p>Monitor teams, payments, coordinators and exports.</p></div>
          <button className="btn btn-primary" onClick={downloadExcel}><FileSpreadsheet/> Download Excel</button>
        </div>

        {notice && <div className="notice-banner">{notice}<button onClick={()=>setNotice("")}>×</button></div>}

        <div className="stat-grid">
          <Stat icon={Users} label="Total Teams" value={stats.total ?? 0}/>
          <Stat icon={CreditCard} label="Online" value={stats.online ?? 0}/>
          <Stat icon={ClipboardList} label="Offline" value={stats.offline ?? 0}/>
          <Stat icon={Clock3} label="Pending" value={stats.pending ?? 0}/>
          <Stat icon={CheckCircle2} label="Verified / Paid" value={stats.verified ?? 0}/>
          <Stat icon={ShieldCheck} label="Coordinators" value={stats.coordinators ?? 0}/>
        </div>

        <div className="table-card">
          <div className="table-toolbar">
            <div className="search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search team, registration ID, member..."/></div>
            <select value={mode} onChange={e=>setMode(e.target.value)}><option value="">All payment modes</option><option value="online">Online</option><option value="offline">Offline</option></select>
            <select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="submitted">Submitted</option><option value="verified">Verified</option><option value="offline-paid">Offline Paid</option><option value="rejected">Rejected</option></select>
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Team</th><th>Members</th><th>Payment</th><th>UTR</th><th>Status</th><th>Registered</th><th>Action</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r._id}>
                    <td><b>{r.teamName}</b><small>{r.registrationId}</small></td>
                    <td><div>{r.member1.name}</div><div>{r.member2.name}</div></td>
                    <td><span className="mode-chip">{r.paymentMode}</span><small>₹{r.amount}</small></td>
                    <td>{r.utrId || "—"}</td>
                    <td><Status status={r.paymentStatus}/></td>
                    <td>{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                    <td>
                      <select className="status-select" value={r.paymentStatus} onChange={e=>updatePayment(r._id,e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="verified">Verified</option>
                        <option value="offline-paid">Offline Paid</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan="7" className="empty">No registrations found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {user.role === "admin" && (
          <section className="coordinator-section">
            <div><div className="eyebrow">STAFF</div><h2>Coordinators</h2></div>
            <div className="coord-grid">
              {coordinators.map(c => <div className="coord-card" key={c._id}><ShieldCheck/><div><b>{c.name}</b><span>{c.email}</span></div><small>{c.active ? "Active" : "Inactive"}</small></div>)}
            </div>
          </section>
        )}
      </main>

      {showCoord && (
        <div className="modal-backdrop" onMouseDown={()=>setShowCoord(false)}>
          <motion.form className="modal" onSubmit={addCoordinator} onMouseDown={e=>e.stopPropagation()} initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}}>
            <button type="button" className="modal-close" onClick={()=>setShowCoord(false)}><XCircle/></button>
            <div className="eyebrow">ADMIN ONLY</div>
            <h2>Add Coordinator</h2>
            <p>Give a coordinator secure staff access.</p>
            <label>Name<input required value={coord.name} onChange={e=>setCoord({...coord,name:e.target.value})}/></label>
            <label>Email<input required type="email" value={coord.email} onChange={e=>setCoord({...coord,email:e.target.value})}/></label>
            <label>Password<input required minLength="6" type="password" value={coord.password} onChange={e=>setCoord({...coord,password:e.target.value})}/></label>
            <button className="btn btn-primary full"><UserPlus/> Create Coordinator</button>
          </motion.form>
        </div>
      )}
    </div>
  );
}

function Stat({icon:Icon,label,value}) {
  return <motion.div className="stat-card" whileHover={{y:-4}}><div className="stat-icon"><Icon/></div><span>{label}</span><strong>{value}</strong></motion.div>
}
function Status({status}) {
  const map = {pending:"Pending",submitted:"UTR Submitted",verified:"Verified","offline-paid": "Offline Paid",rejected:"Rejected"};
  return <span className={`status ${status}`}>{map[status] || status}</span>
}
