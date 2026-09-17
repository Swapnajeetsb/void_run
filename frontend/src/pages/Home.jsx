import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Clock3, Puzzle, ShieldCheck, Sparkles, Users } from "lucide-react";
import LogoBar from "../components/LogoBar";
import AnimatedBackground from "../components/AnimatedBackground";
import SectionTitle from "../components/SectionTitle";

export default function Home() {
  return (
    <div className="site dark-page">
      <AnimatedBackground />
      <LogoBar />

      <main>
        <section className="hero">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />

          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="pill"><Sparkles size={15}/> CSE DEPARTMENT PRESENTS</div>
            <h1>
              <span>VOID</span> RUN
            </h1>
            <div className="glitch-sub">THINK • DECODE • ESCAPE</div>
            <p>
              A high-energy puzzle competition where logic, teamwork and
              speed collide. Find the hidden path before the clock finds you.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">
                Register Your Team <ArrowRight size={19}/>
              </Link>
              <a href="#details" className="btn btn-ghost">Explore Event</a>
            </div>

            <div className="mini-stats">
              <div><Clock3/><span>Timed Challenge</span></div>
              <div><Users/><span>2 Members / Team</span></div>
              <div><Puzzle/><span>Logic + Puzzles</span></div>
            </div>
          </motion.div>

          <motion.div
            className="terminal-card"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
          >
            <div className="terminal-top">
              <div className="terminal-dots"><i/><i/><i/></div>
              <span>void_run.exe</span>
              <span className="live">LIVE</span>
            </div>
            <div className="terminal-body">
              <p><b>$</b> initialize_void_run()</p>
              <p className="dim">Scanning participants...</p>
              <p className="green">✓ Team channel ready</p>
              <p className="green">✓ Puzzle engine online</p>
              <p className="orange">! Time is running...</p>
              <div className="terminal-big">WHO<br/>WILL<br/><em>ESCAPE?</em></div>
              <div className="scanline" />
            </div>
          </motion.div>
        </section>

        <section id="details" className="section">
          <SectionTitle
            eyebrow="THE MISSION"
            title="One team. One run. Endless possibilities."
            text="VOID RUN is designed by the Computer Science & Engineering Department for students who love solving problems under pressure."
          />

          <div className="feature-grid">
            {[
              [BrainCircuit, "Decode", "Crack layered clues, patterns and logic challenges."],
              [Users, "Team Up", "Two minds. One strategy. Communicate and move fast."],
              [ShieldCheck, "Compete", "A structured competition with registration tracking and verified payment records."]
            ].map(([Icon, title, text], i) => (
              <motion.div
                className="feature-card"
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="icon-box"><Icon size={24}/></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section registration-banner">
          <div>
            <div className="eyebrow">READY?</div>
            <h2>Enter the VOID.</h2>
            <p>Complete your two-member team registration in a few steps.</p>
          </div>
          <Link to="/register" className="btn btn-primary">Start Registration <ArrowRight/></Link>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>VOID RUN</strong>
          <span>Adarsh Institute of Technology and Research Center, Vita</span>
        </div>
        <span>Computer Science & Engineering Department</span>
      </footer>
    </div>
  );
}
