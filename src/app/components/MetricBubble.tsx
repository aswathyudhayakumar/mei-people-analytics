"use client";

import type { Metric } from "./DetailPanel";

export default function MetricBubble({
  metric,
  onClick,
}: {
  metric: Metric;
  onClick: (m: Metric) => void;
}) {
  const chips = [
    metric.LeadingOrLagging,
    metric.BehaviourOrOutcome,
    metric.PrimaryLevel,
  ];
  const maxVisible = 3;
  const visible = chips.slice(0, maxVisible);
  const remaining = chips.length - maxVisible;

  return (
    <button
      className="metric-bubble"
      onClick={() => onClick(metric)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(metric);
        }
      }}
      aria-label={`View details for ${metric.MetricName}`}
    >
      <div className="metric-bubble-name">{metric.MetricName}</div>
      <div className="metric-chips">
        {visible.map((c, i) => (
          <span key={i} className="chip">
            {c}
          </span>
        ))}
        {remaining > 0 && (
          <span className="chip chip--more">{`+${remaining}`}</span>
        )}
      </div>
    </button>
  );
}
