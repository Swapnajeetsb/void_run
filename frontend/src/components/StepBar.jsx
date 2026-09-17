import React from "react";
export default function StepBar({ step }) {
  const labels = ["Team & Members", "Payment", "Complete"];
  return (
    <div className="steps">
      {labels.map((label, i) => {
        const n = i + 1;
        return (
          <React.Fragment key={label}>
            <div className={`step ${step >= n ? "active" : ""}`}>
              <span>{step > n ? "✓" : n}</span>
              <small>{label}</small>
            </div>
            {n < labels.length && <div className={`step-line ${step > n ? "active" : ""}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
