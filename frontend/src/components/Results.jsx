import React from "react";
import "./Results.css";

const qualifiedTeams = [
  // इथे नंतर actual qualified teams टाकायच्या
  // उदाहरण:
  // {
  //   rank: 1,
  //   teamName: "Team Alpha",
  //   members: "Member 1, Member 2"
  // }
];

export default function Results() {
  return (
    <section className="results-section" id="results">
      <div className="results-container">

        <div className="results-heading">
          <span>VOID RUN</span>
          <h2>Results</h2>
          <p>
            Teams qualified for the next level will be announced here.
          </p>
        </div>

        {qualifiedTeams.length === 0 ? (
          <div className="results-empty">
            <div className="results-icon">⚡</div>

            <h3>Results Coming Soon</h3>

            <p>
              The qualified teams for the next level will be displayed here
              after the round is completed.
            </p>
          </div>
        ) : (
          <div className="qualified-list">

            {qualifiedTeams.map((team) => (
              <div className="qualified-card" key={team.rank}>

                <div className="qualified-rank">
                  #{team.rank}
                </div>

                <div className="qualified-info">
                  <h3>{team.teamName}</h3>
                  <p>{team.members}</p>
                </div>

                <div className="qualified-status">
                  QUALIFIED
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </section>
  );
}