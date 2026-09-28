import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  LogOut,
  Users,
  Building2,
  GraduationCap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const empty = {
  teamName: "",

  collegeName: "",
  department: "",

  amount: 100,
  notes: "",

  member1: {
    name: "",
    email: "",
    mobile: ""
  },

  member2: {
    name: "",
    email: "",
    mobile: ""
  }
};

export default function CoordinatorOffline() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("voidrun_user") || "{}"
  );

  function setM(member, key, value) {
    setForm((f) => ({
      ...f,
      [member]: {
        ...f[member],
        [key]: value
      }
    }));
  }

  async function submit(e) {
    e.preventDefault();

    setError("");
    setSuccess(null);

    // Basic validation
    if (!form.teamName.trim()) {
      return setError("Please enter team name.");
    }

    if (!form.collegeName.trim()) {
      return setError("Please enter college name.");
    }

    if (!form.department.trim()) {
      return setError("Please enter department.");
    }

    if (!form.member1.name.trim()) {
      return setError("Member 1 name is required.");
    }

    if (!form.member1.email.trim()) {
      return setError("Member 1 email is required.");
    }

    if (!form.member1.mobile.trim()) {
      return setError("Member 1 mobile is required.");
    }

    if (!form.member2.name.trim()) {
      return setError("Member 2 name is required.");
    }

    if (!form.member2.email.trim()) {
      return setError("Member 2 email is required.");
    }

    if (!form.member2.mobile.trim()) {
      return setError("Member 2 mobile is required.");
    }

    try {
      const { data } = await api.post(
        "/admin/offline-registration",
        form
      );

      setSuccess(data.registration);

      setForm({
        ...empty,
        amount: 100
      });

    } catch (e) {
      setError(
        e.response?.data?.message ||
        "Could not create offline registration."
      );
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="site dark-page admin-page">

      <AdminTop
        user={user}
        logout={logout}
      />

      <main className="admin-content">

        <div className="page-head">
          <div>
            <div className="eyebrow">
              COORDINATOR DESK
            </div>

            <h1>
              Offline Payment Registration
            </h1>

            <p>
              Record a team after collecting the registration fee.
            </p>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <motion.div
            className="error-box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* SUCCESS */}

        {success && (
          <motion.div
            className="success-banner"
            initial={{
              opacity: 0,
              y: -10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
          >
            <CheckCircle2 />

            <div>
              <b>
                Registration created:{" "}
                {success.registrationId}
              </b>

              <span>
                Confirmation code:{" "}
                <strong>
                  {success.confirmationCode}
                </strong>
                {" — "}
                email attempted for{" "}
                {success.member1?.email}
              </span>
            </div>
          </motion.div>
        )}

        {/* FORM */}

        <form
          className="admin-form-card"
          onSubmit={submit}
        >

          {/* TEAM */}

          <label>
            Team Name

            <input
              value={form.teamName}
              onChange={(e) =>
                setForm({
                  ...form,
                  teamName: e.target.value
                })
              }
              placeholder="Enter team name"
            />
          </label>


          {/* COLLEGE + DEPARTMENT */}

          <div className="admin-two">

            <label>
              <span>
                College Name
              </span>

              <div className="input-with-icon">
                <Building2 size={18} />

                <input
                  value={form.collegeName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      collegeName: e.target.value
                    })
                  }
                  placeholder="Enter college name"
                />
              </div>
            </label>


            <label>
              <span>
                Department
              </span>

              <div className="input-with-icon">
                <GraduationCap size={18} />

                <input
                  value={form.department}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      department: e.target.value
                    })
                  }
                  placeholder="e.g. Computer Science & Engineering"
                />
              </div>
            </label>

          </div>


          {/* MEMBERS */}

          <div className="member-grid">

            <MiniMember
              title="Member 1"
              member={form.member1}
              setMember={(k, v) =>
                setM("member1", k, v)
              }
            />

            <MiniMember
              title="Member 2"
              member={form.member2}
              setMember={(k, v) =>
                setM("member2", k, v)
              }
            />

          </div>


          {/* PAYMENT */}

          <div className="admin-two">

            <label>
              Amount Received (₹)

              <input
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value
                  })
                }
              />
            </label>


            <label>
              Notes

              <input
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value
                  })
                }
                placeholder="Cash / coordinator notes"
              />
            </label>

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className="btn btn-primary"
          >
            <CheckCircle2 />

            Confirm Offline Registration & Email Code
          </button>

        </form>

      </main>

    </div>
  );
}


function MiniMember({
  title,
  member,
  setMember
}) {

  return (
    <div className="member-card">

      <div className="member-head">
        <Users size={17} />
        <b>{title}</b>
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


function AdminTop({
  user,
  logout
}) {

  return (
    <header className="admin-top">

      <div className="admin-brand">

        <img
          src="/assets/aitrc-logo.png"
          alt="AITRC"
        />

        <div>
          <b>VOID RUN</b>
          <span>STAFF CONSOLE</span>
        </div>

      </div>


      <div className="admin-user">

        <span>
          {user.name} · {user.role}
        </span>

        <button onClick={logout}>
          <LogOut size={17} />
        </button>

      </div>

    </header>
  );
}