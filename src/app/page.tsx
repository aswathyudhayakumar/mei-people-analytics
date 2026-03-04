"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Metric } from "./components/DetailPanel";
import DetailPanel from "./components/DetailPanel";
import MetricBubble from "./components/MetricBubble";
import SectorFilter, { type Sector } from "./components/SectorFilter";

/* ====== Group mapping ====== */
type PetalGroup = "self" | "home" | "team" | "org";

const PETAL_CONFIG: {
  key: PetalGroup;
  label: string;
  className: string;
}[] = [
  { key: "self", label: "The Self", className: "petal--self" },
  { key: "team", label: "The Manager\u2019s Team", className: "petal--team" },
  { key: "home", label: "The Home", className: "petal--home" },
  { key: "org", label: "The Organization and Culture", className: "petal--org" },
];

function normalizeGroup(group: string): PetalGroup {
  const g = group.toLowerCase();
  if (g.includes("self")) return "self";
  if (g.includes("home")) return "home";
  if (g.includes("team")) return "team";
  if (g.includes("organization") || g.includes("culture")) return "org";
  return "org";
}

/* ====== Sector matching ====== */
const SECTOR_KEYWORDS: Record<Sector, string[]> = {
  Tech: ["tech", "technology", "software", "engineering", "knowledge work"],
  Healthcare: ["health", "healthcare", "clinical", "medical", "hospital"],
  Finance: ["finance", "financial", "banking", "investment"],
  "Public Sector": ["public sector", "government", "public service"],
};

function metricMatchesSectors(m: Metric, sectors: Sector[]): boolean {
  if (sectors.length === 0) return true;
  const searchText = `${m.SourcesBubble} ${m.SectorAndSampleBubble}`.toLowerCase();
  return sectors.some((s) =>
    SECTOR_KEYWORDS[s].some((kw) => searchText.includes(kw))
  );
}

export default function Home() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<Sector[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);

  /* Fetch data */
  useEffect(() => {
    fetch("/metrics.json")
      .then((r) => r.json())
      .then((data: Metric[]) => setMetrics(data))
      .catch(() => setMetrics([]));
  }, []);

  /* Filtered metrics */
  const filtered = useMemo(() => {
    let result = metrics;
    if (selectedSectors.length > 0) {
      result = result.filter((m) => metricMatchesSectors(m, selectedSectors));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((m) => m.MetricName.toLowerCase().includes(q));
    }
    return result;
  }, [metrics, selectedSectors, search]);

  /* Group by petal */
  const grouped = useMemo(() => {
    const map: Record<PetalGroup, Metric[]> = {
      self: [],
      home: [],
      team: [],
      org: [],
    };
    for (const m of filtered) {
      map[normalizeGroup(m.Group)].push(m);
    }
    return map;
  }, [filtered]);

  const handleOpen = useCallback((m: Metric) => setSelectedMetric(m), []);
  const handleClose = useCallback(() => setSelectedMetric(null), []);

  return (
    <>
      {/* Top bar */}
      <header className="topbar">
        <h1 className="topbar-title">
          Theoretical framework for measuring manager effectiveness
        </h1>
        <div className="topbar-controls">
          <input
            className="search-input"
            type="search"
            placeholder="Search metrics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search metrics"
          />
          <SectorFilter
            selected={selectedSectors}
            onChange={setSelectedSectors}
          />
        </div>
      </header>

      {/* Visualization */}
      <main className="viz-container">
        <div className="viz-grid">
          {/* Top-left: The Self */}
          {PETAL_CONFIG.map((petal) => (
            <section
              key={petal.key}
              className={`petal ${petal.className}`}
              aria-label={`${petal.label} metrics`}
            >
              <h2 className="petal-title">{petal.label}</h2>
              <div className="petal-metrics">
                {grouped[petal.key].length === 0 ? (
                  <p className="empty-state">No metrics match</p>
                ) : (
                  grouped[petal.key].map((m) => (
                    <MetricBubble
                      key={m.MetricID}
                      metric={m}
                      onClick={handleOpen}
                    />
                  ))
                )}
              </div>
            </section>
          ))}

          {/* Center node */}
          <div className="center-node" aria-hidden="true">
            The Manager
          </div>
        </div>
      </main>

      {/* Detail panel */}
      {selectedMetric && (
        <DetailPanel metric={selectedMetric} onClose={handleClose} />
      )}
    </>
  );
}
