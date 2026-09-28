import React from "react";
import "./Rules.css";

const rules = [
  {
    number: "01",
    title: "Team Format",
    description:
      "Each team must consist of a minimum of 1 member and a maximum of 2 members."
  },
  {
    number: "02",
    title: "System / Laptop Requirement",
    description:
      "Participants should bring their own laptop to perform the games and activities conducted during the event."
  },
  {
    number: "03",
    title: "AI & Internet Usage",
    description:
      "The use of AI tools and the Internet is allowed during the Starting Round. Further usage will be subject to the rules announced for the respective round."
  },
  {
    number: "04",
    title: "Fair Play",
    description:
      "Teams are strictly prohibited from tampering with game files, the LAN network, event systems, or another team's system. Any attempt to gain an unfair advantage may result in disqualification."
  },
  {
    number: "05",
    title: "Winner Decision",
    description:
      "The winners will be decided based on the final Leaderboard standings. The team or player with the highest score will be ranked accordingly."
  }
];

export default function Rules() {
  return (
    <section className="rules-section" id="rules">
      <div className="rules-container">

        <div className="rules-heading">
          <span>VOID RUN</span>
          <h2>Rules & Regulations</h2>
          <p>
            Read the rules carefully before participating in the event.
          </p>
        </div>

        <div className="rules-grid">
          {rules.map((rule) => (
            <div className="rule-card" key={rule.number}>

              <div className="rule-number">
                {rule.number}
              </div>

              <div className="rule-content">
                <h3>{rule.title}</h3>
                <p>{rule.description}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}