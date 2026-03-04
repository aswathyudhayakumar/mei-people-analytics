"use client";

import { useEffect, useRef, useState } from "react";

export interface Metric {
  Group: string;
  MetricID: string;
  MetricName: string;
  LeadingOrLagging: string;
  BehaviourOrOutcome: string;
  PrimaryLevel: string;
  GroundTruthData: string;
  TheoreticalBasisBubble: string;
  EvidenceAndValidationBubble: string;
  SectorAndSampleBubble: string;
  TechApplicabilityBubble: string;
  CalculationBubble: string;
  KnownBiasesBubble: string;
  SourcesBubble: string;
  YearOfKeySource: string;
  CitationCountStatus: string;
}

type TabKey = "theoretical" | "measured" | "biases";

const TABS: { key: TabKey; label: string }[] = [
  { key: "theoretical", label: "Theoretical basis" },
  { key: "measured", label: "How it is measured" },
  { key: "biases", label: "Known biases" },
];

export default function DetailPanel({
  metric,
  onClose,
}: {
  metric: Metric;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("theoretical");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Focus trap and ESC */
  useEffect(() => {
    closeRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function toBullets(text: string): string[] {
    return text
      .split(/;\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return (
    <>
      <div
        className="detail-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="detail-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${metric.MetricName}`}
      >
        <div className="detail-header">
          <h2 className="detail-title">{metric.MetricName}</h2>
          <button
            className="detail-close"
            onClick={onClose}
            ref={closeRef}
            aria-label="Close detail panel"
          >
            {"×"}
          </button>
        </div>

        {/* Tag chips */}
        <div className="metric-chips" style={{ marginBottom: "0.75rem" }}>
          <span className="chip">{metric.LeadingOrLagging}</span>
          <span className="chip">{metric.BehaviourOrOutcome}</span>
          <span className="chip">{metric.PrimaryLevel}</span>
        </div>

        {/* Tabs */}
        <div className="tab-row" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`tab-chip ${activeTab === tab.key ? "tab-chip--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="tab-content" role="tabpanel">
          {activeTab === "theoretical" && (
            <>
              <div className="detail-label">Theoretical Basis</div>
              <ul>
                {toBullets(metric.TheoreticalBasisBubble).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <div className="detail-label">Evidence &amp; Validation</div>
              <ul>
                {toBullets(metric.EvidenceAndValidationBubble).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <div className="detail-label">Sources</div>
              <div className="detail-value">{metric.SourcesBubble}</div>
              <div className="detail-meta-row">
                <div className="detail-meta-item">
                  <span className="detail-label" style={{ marginTop: 0 }}>
                    Year
                  </span>
                  <span className="detail-value">
                    {metric.YearOfKeySource}
                  </span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-label" style={{ marginTop: 0 }}>
                    Citation Status
                  </span>
                  <span className="detail-value">
                    {metric.CitationCountStatus}
                  </span>
                </div>
              </div>
            </>
          )}
          {activeTab === "measured" && (
            <>
              <div className="detail-label">Ground Truth Data</div>
              <div className="detail-value">{metric.GroundTruthData}</div>
              <div className="detail-label">Calculation</div>
              <ul>
                {toBullets(metric.CalculationBubble).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </>
          )}
          {activeTab === "biases" && (
            <>
              <div className="detail-label">Known Biases</div>
              <ul>
                {toBullets(metric.KnownBiasesBubble).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
}
